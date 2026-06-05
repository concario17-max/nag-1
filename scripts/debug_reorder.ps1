$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
$projectRoot = Split-Path $scriptDir -Parent
$dataSourceDir = Join-Path $projectRoot "data-source"
$danFilePath = Join-Path $dataSourceDir "7.dan.txt"
$dataFilePath = Join-Path $projectRoot "data.js"

function Normalize-Text {
    param ($text)
    if ([string]::IsNullOrWhiteSpace($text)) { return "" }
    return $text.ToLower() -replace '[^a-z0-9]', ''
}

# 1. Parse 7.dan.txt for 4-27
Write-Host "Parsing 7.dan.txt..."
$lines = Get-Content $danFilePath -Encoding UTF8
$sutraWords = @()
$capture = $false

foreach ($line in $lines) {
    if ($line.Trim() -eq "4-27") {
        $capture = $true
        continue
    }
    if ($capture) {
        if ($line.Trim() -match "^\d+-\d+") { break } # Next sutra
        
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }
        
        $firstSpace = $trimmed.IndexOf(' ')
        $word = if ($firstSpace -gt 0) { $trimmed.Substring(0, $firstSpace) } else { $trimmed }
        
        $norm = Normalize-Text $word
        Write-Host "Found word in 7.dan.txt: '$word' -> Normalized: '$norm'"
        $sutraWords += $norm
    }
}

Write-Host "Expected Order: $($sutraWords -join ', ')"

# 2. Read tokens from data.js for 4.27
Write-Host "`nReading data.js..."
$fileContent = Get-Content $dataFilePath -Raw -Encoding UTF8
$prefix = "const sutras = "
$startIndex = $fileContent.IndexOf($prefix)
$jsonString = $fileContent.Substring($startIndex + $prefix.Length).Trim().TrimEnd(';')
$sutras = $jsonString | ConvertFrom-Json

$sutra = $sutras | Where-Object { $_.id -eq "4.27" }

if ($sutra) {
    Write-Host "Found Sutra 4.27 in data.js"
    foreach ($token in $sutra.tokens) {
        $tWord = if ($token.surface) { Normalize-Text $token.surface } else { Normalize-Text $token.lemma }
        $idx = $sutraWords.IndexOf($tWord)
        Write-Host "Token: '$($token.surface)' -> Normalized: '$tWord' -> Index in expected: $idx"
    }
}
else {
    Write-Error "Sutra 4.27 not found in data.js"
}
