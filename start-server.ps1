# LUXE INTIMO - PowerShell launcher (Windows)
# Right-click → Run with PowerShell.
# If blocked by execution policy, run instead:
#   powershell -ExecutionPolicy Bypass -File .\start-server.ps1

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

$port = 8080

Write-Host ""
Write-Host "  =================================================="
Write-Host "   LUXE INTIMO  -  starting local server"
Write-Host "  =================================================="
Write-Host "   Folder : $PSScriptRoot"
Write-Host "   Port   : $port"
Write-Host ""

function Test-Tool([string]$name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

$servePy = Join-Path $PSScriptRoot 'tools\serve.py'
$serveJs = Join-Path $PSScriptRoot 'tools\serve.js'

if (Test-Tool 'py') {
    & py -3 $servePy $port
}
elseif (Test-Tool 'python') {
    & python $servePy $port
}
elseif (Test-Tool 'python3') {
    & python3 $servePy $port
}
elseif (Test-Tool 'node') {
    & node $serveJs $port
}
else {
    Write-Host "  [!]  Neither Python nor Node.js was found on this computer."
    Write-Host ""
    Write-Host "       Recommended - install Python 3 (free):"
    Write-Host "         https://www.python.org/downloads/"
    Write-Host "         Tick 'Add python.exe to PATH' during setup."
    Write-Host ""
    Write-Host "       Opening index.html directly instead. The site still works,"
    Write-Host "       but password hashing and saved data are more reliable when"
    Write-Host "       served over http://localhost."
    Write-Host ""
    Start-Process (Join-Path $PSScriptRoot 'index.html')
}

Write-Host ""
Write-Host "  =================================================="
Write-Host "   LUXE INTIMO - server stopped"
Write-Host "  =================================================="
Write-Host ""
Read-Host "Press Enter to close"