# LaunderLens Live Watcher
# This script monitors the directory for changes and automatically pushes them to GitHub.

$path = Get-Location
$filter = "*.*"

$watcher = New-Object IO.FileSystemWatcher $path, $filter -Property @{
    IncludeSubdirectories = $true
    EnableRaisingEvents = $true
}

Write-Host "Lively Sync is ACTIVE. Monitoring changes in $path..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    Write-Host "Change detected: $path ($changeType) at $(Get-Date)" -ForegroundColor Magenta
    
    # Run the sync script
    & ".\sync.ps1"
}

Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

while ($true) {
    Start-Sleep -Seconds 1
}
