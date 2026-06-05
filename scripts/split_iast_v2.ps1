
# encoding set to UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$projectRoot = Split-Path $PSScriptRoot -Parent
$dataSourceDir = Join-Path $projectRoot "data-source"
$danFilePath = Join-Path $dataSourceDir "7.dan.txt"
$sansFilePath = Join-Path $dataSourceDir "1.sans.txt"

# Levenshtein Distance Function
function Get-LevenshteinDistance {
    param ([string]$s, [string]$t)
    $n = $s.Length
    $m = $t.Length
    $d = New-Object 'int[,]' ($n + 1), ($m + 1)

    if ($n -eq 0) { return $m }
    if ($m -eq 0) { return $n }

    for ($i = 0; $i -le $n; $i++) { $d[$i, 0] = $i }
    for ($j = 0; $j -le $m; $j++) { $d[0, $j] = $j }

    for ($i = 1; $i -le $n; $i++) {
        for ($j = 1; $j -le $m; $j++) {
            $cost = if ($t[$j - 1] -eq $s[$i - 1]) { 0 } else { 1 }
            
            $val1 = $d[($i - 1), $j] + 1
            $val2 = $d[$i, ($j - 1)] + 1
            $val3 = $d[($i - 1), ($j - 1)] + $cost
            
            $d[$i, $j] = [Math]::Min($val1, [Math]::Min($val2, $val3))
        }
    }
    return $d[$n, $m]
}

# Normalize Function for Comparison (Remove diacritics, lowercase)
function Get-NormalizedString {
    param ([string]$s)
    if ([string]::IsNullOrEmpty($s)) { return "" }
    $s = $s.Normalize([System.Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder
    foreach ($c in $s.ToCharArray()) {
        if ([System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($c) -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$sb.Append($c)
        }
    }
    return $sb.ToString().ToLower().Replace("'", "a").Replace("-", "") # Handle avagraha as 'a', ignore hyphen
}

# 1. Parse 7.dan.txt to get key words
Write-Host "Reading 7.dan.txt..."
$sutraWords = @{}
$lines = Get-Content $danFilePath -Encoding UTF8
$currentId = $null

foreach ($line in $lines) {
    if ($line -match "^(\d+)-(\d+)$") {
        $currentId = "$($Matches[1]).$($Matches[2])"
        $sutraWords[$currentId] = @()
        continue
    }
    if ($currentId -ne $null -and $line.Trim().Length -gt 0) {
        $parts = $line.Trim() -split ' ', 2
        $word = $parts[0]
        # Ignore korean lines
        if ($word -notmatch "[\uAC00-\uD7A3]") {
            $sutraWords[$currentId] += $word
        }
    }
}

# 2. Process 1.sans.txt
Write-Host "Processing 1.sans.txt..."
$sansFile = $sansFilePath
$sansLines = Get-Content $sansFile -Encoding UTF8
$newSansLines = @()
$state = 0
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
        $newSansLines += $line
        $state = 2
    }
    elseif ($state -eq 2 -and $currentId -ne $null) {
        $pronunciation = $line.Trim()
        
        # Only process if we have keys and it looks like a joined/sandhi string or we want to fix previous bad splits
        # We'll re-process 1.21 onwards mainly
        $parts = $currentId.Split('.')
        $major = [int]$parts[0]
        $minor = [int]$parts[1]
        
        # Target 1.21 onwards and all subsequent chapters
        if (($major -eq 1 -and $minor -ge 21) -or $major -ge 2) {
            $keys = $sutraWords[$currentId]
            
            if ($keys) {
                Write-Host "Fixing Sutra $currentId..."
                
                # Remove spaces to start fresh (undo previous bad splits)
                $rawText = $pronunciation -replace " ", ""
                $newPron = ""
                $remainder = $rawText
                
                foreach ($key in $keys) {
                    $normKey = Get-NormalizedString $key
                    $bestSplit = 0
                    $bestDist = 1000
                    
                    # Search window: Look around the expected length of the key
                    $startLen = [Math]::Max(1, $key.Length - 3)
                    $endLen = [Math]::Min($remainder.Length, $key.Length + 4)
                    
                    for ($len = $startLen; $len -le $endLen; $len++) {
                        $candidate = $remainder.Substring(0, $len)
                        $normCand = Get-NormalizedString $candidate
                        $dist = Get-LevenshteinDistance $normCand $normKey
                        
                        # Bonus for exact start char match ? 
                        # No, just pure edit distance for now
                        
                        if ($dist -lt $bestDist) {
                            $bestDist = $dist
                            $bestSplit = $len
                        }
                    }
                    
                    # Take the best split
                    if ($bestSplit -gt 0) {
                        $chunk = $remainder.Substring(0, $bestSplit)
                        $newPron += "$chunk "
                        $remainder = $remainder.Substring($bestSplit)
                    }
                }
                
                # Append any leftover
                if ($remainder.Length -gt 0) {
                    $newPron += $remainder
                }
                
                $formatted = $newPron.Trim()
                # Check consistency
                $wordCount = $formatted.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries).Count
                if ($wordCount -ne $keys.Count) {
                    Write-Warning "Sutra $($currentId): Word count mismatch. Text: $wordCount, Keys: $($keys.Count). Result: $formatted"
                }
                else {
                    Write-Host "  -> $formatted"
                }
                
                $newSansLines += $formatted
            }
            else {
                $newSansLines += $line
            }
        }
        else {
            $newSansLines += $line
        }
        $state = 0
    }
    else {
        $newSansLines += $line
    }
}

$newSansLines | Set-Content $sansFile -Encoding UTF8
Write-Host "Done."
