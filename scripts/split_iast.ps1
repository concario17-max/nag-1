
# encoding set to UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$projectRoot = Split-Path $PSScriptRoot -Parent
$dataSourceDir = Join-Path $projectRoot "data-source"
$sansFilePath = Join-Path $dataSourceDir "1.sans.txt"
$danFilePath = Join-Path $dataSourceDir "7.dan.txt"

# Backup existing 1.sans.txt
if (Test-Path $sansFilePath) {
    Copy-Item $sansFilePath "$sansFilePath.bak" -Force
}

# 1. Parse 7.dan.txt to get key words for each sutra
$sutraWords = [ordered]@{}
$lines = Get-Content $danFilePath -Encoding UTF8
$currentId = $null

foreach ($line in $lines) {
    if ($line -match "^(\d+)-(\d+)$") {
        $currentId = "$($Matches[1]).$($Matches[2])"
        $sutraWords[$currentId] = New-Object System.Collections.Generic.List[string]
        continue
    }
    if ($currentId -ne $null -and $line.Trim().Length -gt 0) {
        $parts = $line.Trim() -split ' ', 2
        $word = $parts[0]
        # Ignore korean lines if any
        if ($word -notmatch "[\uAC00-\uD7A3]") { 
            $sutraWords[$currentId].Add($word)
        }
    }
}

# 2. Process 1.sans.txt
$sansFile = $sansFilePath
$sansLines = Get-Content $sansFile -Encoding UTF8
$newSansLines = @()
$state = 0 # 0: ID, 1: Sanskrit, 2: Pronunciation
$currentId = $null

for ($i = 0; $i -lt $sansLines.Count; $i++) {
    $line = $sansLines[$i]
    
    if ($line -match "^(\d+)-(\d+)$") {
        $currentId = "$($Matches[1]).$($Matches[2])"
        $state = 1
        $newSansLines += $line
        continue
    }

    if ($state -eq 1 -and $currentId -ne $null) {
        # Sanskrit line, keep as is
        $newSansLines += $line
        # The next line should be pronunciation
        $state = 2
    }
    elseif ($state -eq 2 -and $currentId -ne $null) {
        # Pronunciation line
        $pronunciation = $line.Trim()
        
        # Check if it needs splitting (no spaces but multiple keys)
        $keys = $sutraWords[$currentId]
        if ($keys -and $keys.Count -gt 1 -and ($pronunciation.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries).Count -lt $keys.Count)) {
            Write-Host "Splitting Sutra $($currentId): '$pronunciation'"
            
            # Simple Greedy Splitting Strategy
            # We try to find each key in the pronunciation string sequentially
            $newPron = ""
            $remainder = $pronunciation
            $matchedCount = 0

            foreach ($key in $keys) {
                # Normalize for matching
                
                # Check if remainder starts with something resembling key
                # We interpret strict exact matching won't work due to Sandhi
                # So we take the length of the key as a strong hint
                
                # Heuristic: Take alignment length close to key length
                # This is risky. 
                # Let's try: Find best match of key in the first N chars of remainder?
                
                # ALTERNATIVE: Just assume the keys order corresponds to the string segments
                # And since we don't have a sandhi-splitter, we can't perfectly restore spaces.
                # BUT, if we just want "Connection", we could cheat and replace the pronunciation 
                # with the joined KEYS (space separated).
                # User asked to "Restore pronunciation symbols".
                # 1.sans.txt has the symbols. Keys don't.
                
                # Let's try simple character consumption.
                # Key: "tivra" (5 chars). Remainder: "Tīvra..." (5 chars).
                # Match! 
                # Key: "samveganam" (10). Remainder: "samvegānām..." (10).
                # Match!
                
                # Logic: Scan first K chars of remainder, compare to Key.
                # Allow some mismatch?
                
                # Improved Logic:
                # 1. Remove diacritics from remainder to compare with key.
                # 2. Find key in normalized remainder.
                
                $normRemainder = $remainder.Normalize("NFD") -replace "[\u0300-\u036f]", "" 
                $normRemainderLower = $normRemainder.ToLower()
                
                # Remove common ending 'h' 'm' from key for looser prefix matching
                $searchKey = $key.ToLower() -replace "[hm]$", "" 
                
                # Find searchKey at start of normRemainder
                # We iterate length from Key.Length down to 1 to find longest prefix match?
                # Or just take Key.Length?
                
                # Sandhi might fusion vowels, reducing length. 
                # e.g. a + a = a (1+1=1). length decreases.
                # So we might consume FEWER chars than key length?
                # Or MORE? (Double consonants?)
                
                # Let's look at 1.21: tivra (5) -> Tivra (5).
                # 1.22: mrdu (4) -> mrdu (4). madhya (6) -> madhya (6). adhi...
                
                # Conservative approach: 
                # Try to match the key (normalized) at the start of the remainder.
                # If match found, consume that part.
                
                # Hardcoded fix for the specific request (1.21-1.51) if general logic is too hard?
                # No, generally better.
                
                $matchlen = 0
                # Try lengths from Key.Length + 2 down to Key.Length - 1
                for ($len = $key.Length + 1; $len -ge $key.Length - 1; $len--) {
                    if ($len -le $normRemainderLower.Length) {
                        $sub = $normRemainderLower.Substring(0, $len)
                        if ($sub -eq $searchKey) {
                            $matchlen = $len
                            break
                        }
                        # Levenshtein-ish check?
                        if ($sub.StartsWith($searchKey)) {
                            $matchlen = $len
                            break
                        }
                    }
                }
                
                # Fallback: if no match, just take Key.Length?
                if ($matchlen -eq 0) { $matchlen = $key.Length }
                if ($matchlen -gt $remainder.Length) { $matchlen = $remainder.Length }
                
                $chunk = $remainder.Substring(0, $matchlen)
                $newPron += "$chunk "
                $remainder = $remainder.Substring($matchlen)
                $matchedCount++
            }
            
            # If any remainder left, append it to the last word
            if ($remainder.Length -gt 0) {
                $newPron = $newPron.TrimEnd() + $remainder
            }
            
            $newSansLines += $newPron.Trim()
        }
        else {
            $newSansLines += $line
        }
        $state = 0
    }
    else {
        # Should not happen based on structure
        $newSansLines += $line
    }
}

$newSansLines | Set-Content $sansFile -Encoding UTF8
Write-Host "Updated $sansFile with split pronunciations."
