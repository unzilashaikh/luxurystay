# Run: powershell -ExecutionPolicy Bypass -File scripts/atlas-fix.ps1
$ip = (Invoke-RestMethod -Uri "https://api.ipify.org?format=json").ip
Write-Host ""
Write-Host "Your CURRENT public IP: $ip" -ForegroundColor Cyan
Write-Host ""
Write-Host "Atlas fix (2 minutes):" -ForegroundColor Yellow
Write-Host "1. Browser will open MongoDB Atlas -> Network Access"
Write-Host "2. Click 'Add IP Address'"
Write-Host "3. Paste this IP: $ip"
Write-Host "   OR choose 'Allow Access from Anywhere' (0.0.0.0/0) so IP changes never break again"
Write-Host "4. Wait 1-2 minutes, then in backend folder run: npm start"
Write-Host "5. Console must show: DB mode: atlas"
Write-Host ""
Set-Clipboard -Value $ip
Write-Host "IP copied to clipboard." -ForegroundColor Green
Start-Process "https://cloud.mongodb.com/v2#/security/network/accessList"
