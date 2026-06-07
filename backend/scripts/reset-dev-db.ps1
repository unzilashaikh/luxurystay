# Stops dev Mongo lock, wipes local dev copy, restarts backend
Write-Host "Stopping processes on port 5000..."
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Get-Process mongod -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$dataDir = Join-Path $PSScriptRoot "..\.data\dev-mongo"
if (Test-Path $dataDir) {
  Remove-Item $dataDir -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Removed $dataDir"
}

Write-Host "Done. Run: npm start"
