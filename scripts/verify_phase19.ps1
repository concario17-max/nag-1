$projectRoot = Split-Path $PSScriptRoot -Parent
$json = Get-Content (Join-Path $projectRoot "public/data.json") -Raw | ConvertFrom-Json
$range = 22..36
$results = $json | Where-Object { 
    $parts = $_.id.Split('.')
    $chap = [int]$parts[0]
    $sutra = [int]$parts[1]
    $chap -eq 3 -and $sutra -ge 22 -and $sutra -le 36
} | Select-Object id, '4.han bal', word_meanings

$results | ConvertTo-Json -Depth 5 | Out-File -FilePath (Join-Path $projectRoot "verify_phase19.json") -Encoding UTF8
