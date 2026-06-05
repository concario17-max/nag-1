$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
$projectRoot = Split-Path $scriptDir -Parent
$dataSourceDir = Join-Path $projectRoot "data-source"
$danFilePath = Join-Path $dataSourceDir "7.dan.txt"
$dataFilePath = Join-Path $projectRoot "data.js"

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

# 1. Parse 7.dan.txt
Write-Host "Parsing 7.dan.txt..."
$lines = Get-Content $danFilePath -Encoding UTF8
$sutraOrderMap = @{}

$currentId = $null
$currentWords = @()

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }

    if ($trimmed -match "^(\d+)-(\d+)$") {
        if ($currentId -and $currentWords.Count -gt 0) {
            $sutraOrderMap[$currentId] = $currentWords
        }
        $currentId = "$($matches[1]).$($matches[2])"
        $currentWords = @()
    }
    elseif ($currentId) {
        $firstSpace = $trimmed.IndexOf(' ')
        $word = if ($firstSpace -gt 0) { $trimmed.Substring(0, $firstSpace) } else { $trimmed }
        $currentWords += (Normalize-Text $word)
    }
}
if ($currentId -and $currentWords.Count -gt 0) {
    $sutraOrderMap[$currentId] = $currentWords
}

# 2. Check data.js
Write-Host "Checking data.js for mismatches..."
$fileContent = Get-Content $dataFilePath -Raw -Encoding UTF8
$prefix = "const sutras = "
$startIndex = $fileContent.IndexOf($prefix)
$jsonString = $fileContent.Substring($startIndex + $prefix.Length).Trim().TrimEnd(';')
$sutras = $jsonString | ConvertFrom-Json

$mismatchCount = 0
$totalSutrasWithTokens = 0

foreach ($sutra in $sutras) {
    if ($sutra.tokens) {
        $totalSutrasWithTokens++
        if (-not $sutraOrderMap.ContainsKey($sutra.id)) {
            Write-Warning "Sutra $($sutra.id): No entry in 7.dan.txt map"
            continue
        }

        $expectedWords = $sutraOrderMap[$sutra.id]
        $unmatchedTokens = @()

        foreach ($token in $sutra.tokens) {
            $tWord = if ($token.surface) { Normalize-Text $token.surface } else { Normalize-Text $token.lemma }
            
            if ($expectedWords -notcontains $tWord) {
                $unmatchedTokens += $tWord
            }
        }

        if ($unmatchedTokens.Count -gt 0) {
            Write-Host "Sutra $($sutra.id): Unmatched tokens -> $($unmatchedTokens -join ', ')"
            $mismatchCount++
        }
    }
}

Write-Host "`nSummary:"
Write-Host "Total Sutras with Tokens: $totalSutrasWithTokens"
Write-Host "Sutras with Unmatched Tokens: $mismatchCount"
