# ============================================================
# Anti-Gravity 自動開機排程 — 一鍵安裝腳本
# 執行方式：在 PowerShell（管理員）中執行此腳本
# 版本：v2.0 | 更新：2026-05-24
# ============================================================

$TaskName    = "AntiGravity-AutoStart"
$ScriptPath  = "D:\20260523\autostart-antigravity.ps1"
$Description = "開機後自動啟動 Anti-Gravity IDE 與 Telegram 遠端遙控機器人"
$UserName    = $env:USERNAME   # 目前登入的使用者

Write-Host ""
Write-Host "======================================"
Write-Host "  🌌 Anti-Gravity 自動開機排程安裝"
Write-Host "======================================"
Write-Host ""

# ── 確認腳本存在 ──────────────────────────────────────────────────────
if (-not (Test-Path $ScriptPath)) {
    Write-Host "❌ 找不到啟動腳本：$ScriptPath" -ForegroundColor Red
    Write-Host "   請先確認 autostart-antigravity.ps1 存在於 D:\20260523\" -ForegroundColor Yellow
    exit 1
}

# ── 刪除舊任務（若存在）────────────────────────────────────────────────
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "✅ 舊的排程任務已移除。" -ForegroundColor Green
}

# ── 建立觸發條件：使用者登入時執行 ────────────────────────────────────
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $UserName

# ── 建立執行動作：以隱藏視窗執行 PowerShell ───────────────────────────
$psExe  = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
$psArgs = "-NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""

$action = New-ScheduledTaskAction `
    -Execute $psExe `
    -Argument $psArgs `
    -WorkingDirectory "D:\20260523"

# ── 執行設定（最高權限、延遲 10 秒等桌面穩定）────────────────────────
$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
    -MultipleInstances IgnoreNew `
    -StartWhenAvailable `
    -DontStopOnIdleEnd

# ── 主體設定（使用目前使用者）────────────────────────────────────────
$principal = New-ScheduledTaskPrincipal `
    -UserId $UserName `
    -LogonType Interactive `
    -RunLevel Highest

# ── 建立並登錄排程任務 ─────────────────────────────────────────────────
$task = Register-ScheduledTask `
    -TaskName    $TaskName `
    -Trigger     $trigger `
    -Action      $action `
    -Settings    $settings `
    -Principal   $principal `
    -Description $Description `
    -Force

if ($task) {
    Write-Host ""
    Write-Host "✅ 排程任務安裝成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 任務詳情：" -ForegroundColor Cyan
    Write-Host "   名稱：$TaskName"
    Write-Host "   觸發：每次登入 Windows 時自動執行"
    Write-Host "   腳本：$ScriptPath"
    Write-Host "   使用者：$UserName"
    Write-Host ""
    Write-Host "🔍 您可以在以下位置查看任務：" -ForegroundColor Cyan
    Write-Host "   工作排程器 → 工作排程器程式庫 → $TaskName"
    Write-Host ""
    Write-Host "🧪 立即測試（不需重開機）：" -ForegroundColor Yellow
    Write-Host "   Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host ""
    Write-Host "🗑️  若要移除此排程任務，請執行：" -ForegroundColor Yellow
    Write-Host "   Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
    Write-Host ""
} else {
    Write-Host "❌ 排程任務安裝失敗！請確認以管理員身份執行此腳本。" -ForegroundColor Red
}

Write-Host "======================================"
