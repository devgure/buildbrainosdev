# PowerShell restart script for core services
param(
  [string[]] $Services = @('gateway','project-service','ai-service','auth-service','blueprint-agent','payment-service')
)
Set-StrictMode -Version Latest
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
foreach ($s in $Services) {
  Write-Host "Restarting $s..."
  docker compose restart $s -ErrorAction SilentlyContinue
}
Write-Host 'Done.'
Pop-Location
