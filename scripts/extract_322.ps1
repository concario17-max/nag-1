$projectRoot = Split-Path $PSScriptRoot -Parent
$json = Get-Content (Join-Path $projectRoot "public/data.json") -Raw | ConvertFrom-Json
$item = $json | Where-Object { $_.id -eq "3.22" }
$item | ConvertTo-Json -Depth 10 | Out-File -FilePath (Join-Path $projectRoot "temp_322.json") -Encoding UTF8
