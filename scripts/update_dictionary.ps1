$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot -Parent
$dataSourceDir = Join-Path $projectRoot "data-source"
$dataFilePath = Join-Path $projectRoot "data.js"
$danFilePath = Join-Path $dataSourceDir "7.dan.txt"
$sansFilePath = Join-Path $dataSourceDir "1.sans.txt"

# Backup existing data.js
if (Test-Path $dataFilePath) {
    Copy-Item $dataFilePath "$dataFilePath.bak" -Force
}

function Parse-DanFile {
    param ($filePath)
    $lines = Get-Content $filePath -Encoding UTF8
    $data = [ordered]@{}
    $currentId = $null

    foreach ($line in $lines) {
        $trimmedLine = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmedLine)) { continue }

        if ($trimmedLine -match "^\d+-\d+$") {
            $currentId = $trimmedLine -replace '-', '.'
            $data[$currentId] = [ordered]@{}
        }
        elseif ($currentId) {
            $firstSpaceIndex = $trimmedLine.IndexOf(' ')
            if ($firstSpaceIndex -ne -1) {
                $word = $trimmedLine.Substring(0, $firstSpaceIndex).Trim()
                $meaning = $trimmedLine.Substring($firstSpaceIndex + 1).Trim()
                if ($word -and $meaning) {
                    $data[$currentId][$word] = $meaning
                }
            }
        }
    }
    return $data
}

function Parse-SansFile {
    param ($filePath)
    $lines = Get-Content $filePath -Encoding UTF8
    $data = [ordered]@{}
    $currentId = $null
    $state = 0 # 0: find ID, 1: find Sanskrit, 2: find Pronunciation

    foreach ($line in $lines) {
        $trimmedLine = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmedLine)) { continue }
        if ($trimmedLine.StartsWith("===")) { continue }

        if ($trimmedLine -match "^\d+-\d+$") {
            $currentId = $trimmedLine -replace '-', '.'
            $data[$currentId] = [ordered]@{ sanskrit = ""; pronunciation = "" }
            $state = 1
        }
        elseif ($currentId -and $state -eq 1) {
            $data[$currentId].sanskrit = $trimmedLine
            $state = 2
        }
        elseif ($currentId -and $state -eq 2) {
            $data[$currentId].pronunciation = $trimmedLine
            $state = 0 # Reset or wait for next ID
        }
    }
    return $data
}

function Parse-HanBalFile {
    param ($filePath)
    $lines = Get-Content $filePath -Encoding UTF8
    $data = @{}

    foreach ($line in $lines) {
        $trimmedLine = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmedLine)) { continue }
        
        # Match "ID remainder"
        # 1-1 아-타...
        if ($trimmedLine -match "^(\d+-\d+)\s+(.+)$") {
            $idStr = $matches[1]
            $content = $matches[2]
            $currentId = $idStr -replace '-', '.'
            $data[$currentId] = $content
        }
    }
    return $data
}

try {
    Write-Host "Reading files..."
    $danData = Parse-DanFile -filePath $danFilePath
    $sansData = Parse-SansFile -filePath $sansFilePath
    
    $hanBalFilePath = Join-Path $dataSourceDir "4.han bal.txt"
    
    if (Test-Path $hanBalFilePath) {
        $hanBalData = Parse-HanBalFile -filePath $hanBalFilePath
    }
    else {
        Write-Warning "4.han bal.txt not found at $hanBalFilePath"
        $hanBalData = @{}
    }

    $fileContent = Get-Content $dataFilePath -Raw -Encoding UTF8
    
    # Extract JSON
    $prefix = "const sutras = "
    $startIndex = $fileContent.IndexOf($prefix)
    if ($startIndex -eq -1) {
        throw "Could not find 'const sutras = ' in data.js"
    }

    $jsonWithSuffix = $fileContent.Substring($startIndex + $prefix.Length)
    # Remove trailing semicolon and potential whitespace
    $jsonString = $jsonWithSuffix.Trim().TrimEnd(';')

    # Parse JSON
    $sutras = $jsonString | ConvertFrom-Json

    $wordMeaningsUpdated = 0
    $sanskritUpdated = 0
    $pronunciationUpdated = 0
    $pronunciationKrUpdated = 0

    # Update Data
    for ($i = 0; $i -lt $sutras.Count; $i++) {
        $sutra = $sutras[$i]
        $id = $sutra.id

        if ($danData.ContainsKey($id)) {
            # Convert Hashtable to PSCustomObject for JSON serialization compatibility if needed, 
            # but ConvertTo-Json handles Hashtables. 
            # However, existing structure is likely an object.
            # Convert dictionary to object to ensure it serializes as "{}" not "[]" if empty, though unlikely.
            
            # Simple assignment: $sutra.word_meanings = $danData[$id] 
            # Note: In PowerShell, setting a property on a PSCustomObject from a hashtable might need care.
            
            # Create a clean OrderedDictionary or just pass the hashtable.
            # ConvertTo-Json treats hashtables as objects.
            $sutra | Add-Member -MemberType NoteProperty -Name "word_meanings" -Value $danData[$id] -Force
            $wordMeaningsUpdated++
        }

        if ($sansData.ContainsKey($id)) {
            $sutra.sanskrit = $sansData[$id].sanskrit
            $sanskritUpdated++
            
            if ($sansData[$id].pronunciation) {
                # Update Sanskrit pronunciation
                $sutra.pronunciation = $sansData[$id].pronunciation
                $pronunciationUpdated++
            }
        }

        if ($hanBalData.ContainsKey($id)) {
            # Update Korean pronunciation
            $arr = $hanBalData[$id] -split " " # Sometimes there might be multiple distinct parts, but here it seems to be one string
            # Re-join just in case or take as is. The regex took the whole remainder.
            $sutra.pronunciation_kr = $hanBalData[$id]
            $pronunciationKrUpdated++
        }
    }

    # Serialize back to JSON
    # Depth 10 to ensure nested objects are serialized
    # Prettify logic: ConvertTo-Json -Compress makes it one line. 
    # To make it readable like typical JS files, we might want multiline.
    # Standard ConvertTo-Json output is multiline but might be too verbose or different style.
    # original data.js was likely minified or standard. 
    # Let's use standard pretty print (omit -Compress).
    $newJson = $sutras | ConvertTo-Json -Depth 10

    $newFileContent = "$prefix$newJson;"
    
    # Write back
    Set-Content -Path $dataFilePath -Value $newFileContent -Encoding UTF8

    Write-Host "Successfully updated data.js"
    Write-Host "Sutras with updated meanings: $wordMeaningsUpdated"
    Write-Host "Sutras with updated Sanskrit: $sanskritUpdated"
    Write-Host "Sutras with updated Pronunciation: $pronunciationUpdated"
    Write-Host "Sutras with updated Pronunciation KR: $pronunciationKrUpdated"

}
catch {
    Write-Error $_
}
