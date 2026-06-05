# Antigravity CDP Setup Script (Optimized)
Write-Host "=== Antigravity CDP Setup (Enhanced) ===" -ForegroundColor Cyan
Write-Host "Searching for Antigravity shortcuts..." -ForegroundColor Yellow

# Define search locations
$searchLocations = @(
    [Environment]::GetFolderPath('Desktop'),
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\OneDrive\Desktop",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs",
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs",
    "$env:USERPROFILE\AppData\Roaming\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar"
)

$WshShell = New-Object -ComObject WScript.Shell
$foundPaths = New-Object System.Collections.Generic.HashSet[string]
$shortcutsToUpdate = @()

# 1. Search for existing shortcuts
foreach ($location in $searchLocations) {
    if (Test-Path $location) {
        Write-Host "Scanning: $location" -ForegroundColor Gray
        $shortcuts = Get-ChildItem -Path $location -Recurse -Filter "*Antigravity*.lnk" -ErrorAction SilentlyContinue
        foreach ($s in $shortcuts) {
            if ($foundPaths.Add($s.FullName.ToLower())) {
                $shortcutsToUpdate += $s
            }
        }
    }
}

# 2. Logic to update or create shortcut
$cdpArg = "--remote-debugging-port=9000"

if ($shortcutsToUpdate.Count -eq 0) {
    Write-Host "No shortcuts found. Checking installation path..." -ForegroundColor Yellow
    $exePath = "$env:LOCALAPPDATA\Programs\Antigravity\Antigravity.exe"

    if (Test-Path $exePath) {
        $desktopPath = [Environment]::GetFolderPath('Desktop')
        $targetLnk = Join-Path $desktopPath "Antigravity.lnk"
        
        try {
            $shortcut = $WshShell.CreateShortcut($targetLnk)
            $shortcut.TargetPath = $exePath
            $shortcut.Arguments = $cdpArg
            $shortcut.Save()
            Write-Host "SUCCESS: Created new shortcut: $targetLnk" -ForegroundColor Green
        } catch {
            Write-Host "ERROR: Failed to create shortcut. Check permissions." -ForegroundColor Red
        }
    } else {
        Write-Host "CRITICAL ERROR: Antigravity.exe not found at $exePath" -ForegroundColor Red
        Write-Host "Please install Antigravity first." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "Found $($shortcutsToUpdate.Count) unique shortcut(s)." -ForegroundColor Green
    foreach ($shortcutFile in $shortcutsToUpdate) {
        try {
            $shortcut = $WshShell.CreateShortcut($shortcutFile.FullName)
            $originalArgs = $shortcut.Arguments

            # Update or Add CDP port argument
            if ($originalArgs -match "--remote-debugging-port=\d+") {
                $shortcut.Arguments = $originalArgs -replace "--remote-debugging-port=\d+", $cdpArg
            } elseif ($originalArgs.Trim().Length -gt 0) {
                $shortcut.Arguments = "$cdpArg $originalArgs"
            } else {
                $shortcut.Arguments = $cdpArg
            }

            $shortcut.Save()
            Write-Host "UPDATED: $($shortcutFile.FullName)" -ForegroundColor Green
        } catch {
            Write-Host "FAIL: Could not update $($shortcutFile.Name). (Access Denied?)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "CRITICAL: Restart Antigravity completely for changes to take effect." -ForegroundColor Magenta
Write-Host "(Check Task Manager to ensure no 'Antigravity' processes are running)" -ForegroundColor Gray
