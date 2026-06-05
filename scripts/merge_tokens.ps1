$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
$projectRoot = Split-Path $scriptDir -Parent
$dataFilePath = Join-Path $projectRoot "data.js"
$hanJsonDir = Join-Path $projectRoot "data-source\han-json"

# Read data.js
Write-Host "Reading data.js..."
if (-not (Test-Path $dataFilePath)) {
    throw "data.js not found at $dataFilePath"
}

$fileContent = Get-Content $dataFilePath -Raw -Encoding UTF8

# Extract JSON from data.js
$prefix = "const sutras = "
$startIndex = $fileContent.IndexOf($prefix)
if ($startIndex -eq -1) {
    throw "Could not find 'const sutras = ' in data.js"
}

$jsonWithSuffix = $fileContent.Substring($startIndex + $prefix.Length)
$jsonString = $jsonWithSuffix.Trim().TrimEnd(';')
$sutras = $jsonString | ConvertFrom-Json

# Helper to find sutra in array
function Get-Sutra {
    param ($id)
    foreach ($s in $sutras) {
        if ($s.id -eq $id) { return $s }
    }
    return $null
}

# Process each chapter file
for ($ch = 1; $ch -le 4; $ch++) {
    $fileName = "yoga_sutra_ch${ch}_tokens_MATCHED_TO_datajs.json"
    $filePath = Join-Path $hanJsonDir $fileName
    
    if (Test-Path $filePath) {
        Write-Host "Processing Chapter $ch ($fileName)..."
        $jsonContent = Get-Content $filePath -Raw -Encoding UTF8 | ConvertFrom-Json
        
        foreach ($item in $jsonContent.sutras) {
            # Construct ID: "1.1", "1.2", etc.
            $sutraId = "$ch.$($item.sutra)"
            
            $targetSutra = Get-Sutra -id $sutraId
            
            if ($targetSutra) {
                # Add tokens field
                # Note: creating a new property or overwriting
                $targetSutra | Add-Member -MemberType NoteProperty -Name "tokens" -Value $item.tokens -Force
                
                # Optional: Add compound_tokens_original if it exists and is useful
                if ($item.compound_tokens_original) {
                    $targetSutra | Add-Member -MemberType NoteProperty -Name "compound_tokens_original" -Value $item.compound_tokens_original -Force
                }
                
                # Write-Host "Updated Sutra $sutraId"
            }
            else {
                Write-Warning "Sutra ID $sutraId not found in data.js"
            }
        }
    }
    else {
        Write-Warning "File not found: $filePath"
    }
}

# Serialize back to JSON
Write-Host "Saving updated data.js..."
$newJson = $sutras | ConvertTo-Json -Depth 10

$newFileContent = "$prefix$newJson;"
Set-Content -Path $dataFilePath -Value $newFileContent -Encoding UTF8

Write-Host "Done."
