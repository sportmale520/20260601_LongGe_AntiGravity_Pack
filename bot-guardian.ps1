# ============================================================
# bot-guardian.ps1 — Telegram Bot Guardian Process v4.3
# Features: Restart bot on crash, ensure 24/7 online
# Fix: 100% Pure ASCII to prevent Windows encoding/parser bugs
# Update: 2026-05-25
# ============================================================

$NodeExe    = "C:\Users\admin\AppData\Roaming\Antigravity\node\node.exe"
$BotScript  = "D:\20260523\telegram-bot.js"
$GuardLog   = "D:\20260523\guardian.log"
$RuntimeLog = "D:\20260523\bot-runtime.log"
$PidFile    = "D:\20260523\guardian.pid"

function Log($msg) {
    $ts   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content -Path $GuardLog -Value $line -Encoding UTF8
}

Log "============================================"
Log "  Bot Guardian v4.3 (Pure ASCII Edition)"
Log "  Node Engine: $NodeExe"
Log "  Bot Script: $BotScript"
Log "============================================"

try {
    $PID | Out-File $PidFile -Encoding UTF8 -Force
    Log "Registered Guardian PID: $PID"
} catch {
    Log "WARNING: Could not write PID file: $_"
}

if (-not (Test-Path $NodeExe)) {
    Log "ERROR: Node.exe not found: $NodeExe"
    exit 1
}
if (-not (Test-Path $BotScript)) {
    Log "ERROR: Bot script not found: $BotScript"
    exit 1
}

$restartCount = 0

while ($true) {
    $restartCount++
    Log "Starting Bot (Attempt #$restartCount)..."

    # Reset runtime log if larger than 500KB
    if ((Get-Item $RuntimeLog -ErrorAction SilentlyContinue).Length -gt 500KB) {
        "[ Log cleared at $(Get-Date), total runs: $restartCount ]" | Out-File $RuntimeLog -Encoding UTF8
    }

    try {
        & $NodeExe "$BotScript" 2>&1 | ForEach-Object { $_.ToString() } | Out-File -FilePath $RuntimeLog -Append -Encoding UTF8
    } catch {
        Log "ERROR during execution: $_"
    }

    Log "WARNING: Bot stopped running!"
    $waitSec = 10
    Log "Restarting in $waitSec seconds..."
    Start-Sleep -Seconds $waitSec
}
