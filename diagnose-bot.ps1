Write-Host "=== Node.js Process Status ==="
$nodes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodes) {
    foreach ($n in $nodes) {
        Write-Host "PID: $($n.Id)  CPU: $($n.CPU)  Started: $($n.StartTime)"
    }
} else {
    Write-Host ">>> NO node.exe running! Bot is STOPPED."
}

Write-Host ""
Write-Host "=== agy-node Process Status ==="
$agynodes = Get-Process -Name "agy-node" -ErrorAction SilentlyContinue
if ($agynodes) {
    foreach ($n in $agynodes) {
        Write-Host "PID: $($n.Id)  CPU: $($n.CPU)  Started: $($n.StartTime)"
    }
} else {
    Write-Host ">>> NO agy-node running!"
}

Write-Host ""
Write-Host "=== bot-runtime.log (last 30 lines) ==="
if (Test-Path "D:\20260523\bot-runtime.log") {
    Get-Content "D:\20260523\bot-runtime.log" -Tail 30 -Encoding UTF8
} else {
    Write-Host ">>> bot-runtime.log not found"
}

Write-Host ""
Write-Host "=== bot-error.log (last 20 lines) ==="
if (Test-Path "D:\20260523\bot-error.log") {
    Get-Content "D:\20260523\bot-error.log" -Tail 20 -Encoding UTF8
} else {
    Write-Host ">>> bot-error.log not found"
}

Write-Host ""
Write-Host "=== bot-log.txt (last 20 lines) ==="
if (Test-Path "D:\20260523\bot-log.txt") {
    Get-Content "D:\20260523\bot-log.txt" -Tail 20 -Encoding UTF8
} else {
    Write-Host ">>> bot-log.txt not found or empty"
}

Write-Host ""
Write-Host "=== bot-startup.log ==="
if (Test-Path "D:\20260523\bot-startup.log") {
    Get-Content "D:\20260523\bot-startup.log" -Encoding UTF8
} else {
    Write-Host ">>> bot-startup.log not found"
}
