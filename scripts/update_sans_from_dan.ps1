$projectRoot = Split-Path $PSScriptRoot -Parent
$dataSourceDir = Join-Path $projectRoot "data-source"
$danFile = Join-Path $dataSourceDir "7.dan.txt"
$sansFile = Join-Path $dataSourceDir "1.sans.txt"

# 1. Parse 7.dan.txt to get words for each sutra
$sutraWords = @{}
$currentId = $null
$words = @()

$lines = Get-Content $danFile -Encoding UTF8

foreach ($line in $lines) {
    if ($line -match '^\s*(\d+-\d+)\s*$') {
        if ($currentId) {
            $sutraWords[$currentId] = $words -join " "
        }
        $currentId = $matches[1]
        $words = @()
    }
    elseif ($line.Trim().Length -gt 0) {
        # Extract the first word (the key)
        $parts = $line.Trim() -split '\s+', 2
        if ($parts.Count -ge 1) {
            $words += $parts[0]
        }
    }
}
# Save the last one
if ($currentId) {
    $sutraWords[$currentId] = $words -join " "
}

Write-Host "Parsed $($sutraWords.Count) sutras from $danFile"

# 2. Update 1.sans.txt
$sansLines = Get-Content $sansFile -Encoding UTF8
$newSansLines = @()
$skipNext = 0

for ($i = 0; $i -lt $sansLines.Count; $i++) {
    $line = $sansLines[$i]
    $newSansLines += $line
    
    if ($line -match '^(\d+-\d+)$') {
        $id = $matches[1]
        if ($sutraWords.ContainsKey($id)) {
            # existing format:
            # Line i: ID
            # Line i+1: Sanskrit
            # Line i+2: Pronunciation (TARGET)
            
            # Ensure we have enough lines
            if ($i + 2 -lt $sansLines.Count) {
                # Add Sanskrit line (unchanged)
                $i++
                $newSansLines += $sansLines[$i]
                
                # Replace Pronunciation line
                $i++
                $newPronunciation = $sutraWords[$id]
                Write-Host ("Updating {0}: '{1}' -> '{2}'" -f $id, $sansLines[$i], $newPronunciation)
                
                # Capitalize first letter to match style (optional but nice)
                # Actually user wants exact match, usually keys are lowercase in 7.dan.txt?
                # 7.dan.txt has "atha", "yoga", "yogah". 
                # 1.sans.txt has "Atha", "Yoga...".
                # Let's keep it as is from 7.dan.txt because that's the key.
                # Use the exact words from 7.dan.txt.
                
                $newSansLines += $newPronunciation
            }
        }
    }
}

$newSansLines | Set-Content $sansFile -Encoding UTF8
Write-Host "Updated $sansFile"
