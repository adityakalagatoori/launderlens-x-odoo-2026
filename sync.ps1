# LaunderLens Sync Script
# This script automatically commits and pushes all changes to the GitHub repository.

Write-Host "Starting sync to GitHub..." -ForegroundColor Cyan

# Stage all changes
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Live update: $timestamp"
    Write-Host "Committing changes..." -ForegroundColor Green
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

# Push to main
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "Sync complete!" -ForegroundColor Green
