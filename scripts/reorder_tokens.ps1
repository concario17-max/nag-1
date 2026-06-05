$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
$projectRoot = Split-Path $scriptDir -Parent
$dataSourceDir = Join-Path $projectRoot "data-source"
$dataFilePath = Join-Path $projectRoot "data.js"
$danFilePath = Join-Path $dataSourceDir "7.dan.txt"

# Helper to normalize text for comparison
function Normalize-Text {
    param ($text)
    if ([string]::IsNullOrWhiteSpace($text)) { return "" }
    
    # Normalize to FormD to decompose characters (e.g., ā -> a + macron)
    $normalized = $text.Normalize([System.Text.NormalizationForm]::FormD)
    
    # Lowercase, remove anything that isn't a letter or number
    $clean = $normalized.ToLower() -replace '[^a-z0-9]', ''
    
    # Remove trailing h, m, s, r (Sandhi endings) to improve matching stem forms
    return $clean -replace '[hmsr]$', ''
}

# Backup existing data.js
if (Test-Path $dataFilePath) {
    Copy-Item $dataFilePath "$dataFilePath.bak" -Force
}

# 1. Parse 7.dan.txt to get expected order
Write-Host "Reading 7.dan.txt..."
$lines = Get-Content $danFilePath -Encoding UTF8
$sutraOrderMap = [ordered]@{} # Key: "1.1", Value: [List of normalized words]

$currentId = $null
$currentWords = New-Object System.Collections.Generic.List[string]

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }

    if ($trimmed -match "^(\d+)-(\d+)$") {
        # Save previous
        if ($currentId -and $currentWords.Count -gt 0) {
            $sutraOrderMap[$currentId] = $currentWords.ToArray()
        }
        # Start new
        $currentId = "$($Matches[1]).$($Matches[2])" # 1-1 -> 1.1
        $currentWords.Clear()
    }
    elseif ($currentId) {
        # Line format: "word meaning..."
        # Extract first word
        $firstSpace = $trimmed.IndexOf(' ')
        if ($firstSpace -gt 0) {
            $word = $trimmed.Substring(0, $firstSpace)
            $currentWords.Add((Normalize-Text $word))
        }
        elseif ($firstSpace -eq -1) {
            $currentWords.Add((Normalize-Text $trimmed))
        }
    }
}
# Save last one
if ($currentId -and $currentWords.Count -gt 0) {
    $sutraOrderMap[$currentId] = $currentWords.ToArray()
}

# 2. Update data.js
Write-Host "Reading data.js..."
$fileContent = Get-Content $dataFilePath -Raw -Encoding UTF8

$prefix = "const sutras = "
$startIndex = $fileContent.IndexOf($prefix)
if ($startIndex -eq -1) { throw "Could not find 'const sutras = ' in data.js" }

$jsonWithSuffix = $fileContent.Substring($startIndex + $prefix.Length)
$jsonString = $jsonWithSuffix.Trim().TrimEnd(';')
$sutras = $jsonString | ConvertFrom-Json

$updatedCount = 0

foreach ($sutra in $sutras) {
    if ($sutra.tokens -and $sutraOrderMap.ContainsKey($sutra.id)) {
        $expectedOrder = $sutraOrderMap[$sutra.id] # Expected normalized words in order
        
        # Sort tokens
        # We need to map tokens to their index in expectedOrder
        # Token match: try surface, then lemma
        
        # PowerShell sort with script block
        $sortedTokens = $sutra.tokens | Sort-Object {
            $tWord = if ($_.surface) { Normalize-Text $_.surface } else { Normalize-Text $_.lemma }
            
            $idx = $expectedOrder.IndexOf($tWord)
            
            if ($idx -eq -1) {
                # Try partial match? Or just put at end
                # Some words might stem differently. 
                # Let's try checking if expected word starts with token word or vice versa?
                # For now, strict match failure -> end of list
                return 9999
            }
            return $idx
        }
        
        $sutra.tokens = $sortedTokens
        $updatedCount++
    }
}

# 3. Save
Write-Host "Saving data.js..."
$newJson = $sutras | ConvertTo-Json -Depth 10
$newFileContent = "$prefix$newJson;"
Set-Content -Path $dataFilePath -Value $newFileContent -Encoding UTF8

Write-Host "Updated $updatedCount sutras with sorted tokens."
