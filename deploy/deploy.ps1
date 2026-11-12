<#
  Deploys Local Hands & Feet from Git. Run it ON THE SERVER, in PowerShell, from anywhere:

      D:\localhandsandfeet-app\deploy\deploy.ps1                  # latest main
      D:\localhandsandfeet-app\deploy\deploy.ps1 -Ref v0.2.0      # a specific tag or commit (also how you roll back)

  It stops at the first problem and leaves the running site alone until the build has succeeded.
  Settings live in .env on the server. That file is never in Git and this script never touches it.
  Same pattern as the Trainers Portal deploy script.
#>
param(
  [string]$Branch  = 'main',
  [string]$Ref     = '',
  [string]$Service = 'LocalHandsAndFeet',
  [int]$Port       = 0
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

function Step($msg) { Write-Host "`n== $msg" -ForegroundColor Cyan }
function Run([string]$what, [scriptblock]$cmd) {
  & $cmd
  if ($LASTEXITCODE -ne 0) { throw "FAILED: $what (exit code $LASTEXITCODE). Nothing was restarted." }
}

$envFile = Join-Path $root '.env'
if (-not (Test-Path $envFile)) { throw ".env is missing in $root. Copy .env.example to .env and fill it in first." }
# The health check uses the PORT from this server's .env, so the two can never disagree. -Port overrides it.
if ($Port -eq 0) {
  $line = Get-Content $envFile | Where-Object { $_ -match '^\s*PORT\s*=\s*\d+' } | Select-Object -First 1
  if (-not $line) { throw "No PORT=... line in .env. Add one (for example PORT=4400)." }
  $Port = [int](($line -split '=', 2)[1].Trim())
}
Write-Host "Using port $Port (from .env)"

Step 'Checking the server copy is clean'
$dirty = git status --porcelain
if ($dirty) { throw "Files on the server were changed by hand:`n$dirty`nFix that in Git instead, then run again." }

if ($Ref) {
  Step "Switching to $Ref"
  Run 'git fetch' { git fetch --tags origin }
  Run 'git checkout' { git checkout $Ref }
} else {
  Step "Pulling $Branch"
  Run 'git fetch' { git fetch origin }
  Run 'git checkout' { git checkout $Branch }
  Run 'git pull' { git pull --ff-only origin $Branch }
}
Write-Host ("Now at: " + (git log -1 --format='%h %s (%cd)' --date=short))

Step 'Installing packages (npm ci)'
Run 'npm ci' { npm ci }

Step 'Building'
Run 'npm run build' { npm run build }

Step 'Updating the database (safe to repeat)'
Run 'npm run migrate' { npm run migrate }

Step "Restarting service $Service"
Run 'nssm restart' { nssm restart $Service }

Step 'Health check'
$ok = $false
for ($i = 1; $i -le 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-RestMethod "http://localhost:$Port/api/health" -TimeoutSec 3
    if ($r.ok) { $ok = $true; break }
  } catch { }
}
if (-not $ok) { throw "The site did not answer on port $Port. Look at $root\logs\err.log" }
Write-Host "`nDeployed and healthy." -ForegroundColor Green
