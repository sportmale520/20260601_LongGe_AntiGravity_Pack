# ============================================================
# autostart-antigravity.ps1 — Auto-Start Script v4.3
# Features: Starts Bot Guardian and Antigravity IDE
# Fix: 100% Pure ASCII to prevent Windows encoding/parser bugs
# Update: 2026-05-25
# ============================================================

$LogFile      = "D:\20260523\autostart.log"
$ProjectDir   = "D:\20260523"
$AgyIDEExe    = "C:\Users\admin\AppData\Local\Programs\Antigravity IDE\Antigravity IDE.exe"
$NodeExe      = "C:\Users\admin\AppData\Roaming\Antigravity\node\node.exe"
$GuardianScript = "D:\20260523\bot-guardian.ps1"
$PsExe        = "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

Log "======================================"
Log "  Anti-Gravity Auto-Start Program"
Log "======================================"

# --- Step 1: Wait for Explorer (Desktop) ---
Log "Step 1: Waiting for Windows Desktop Explorer..."
$maxWait = 120
$waited  = 0
do {
    Start-Sleep -Seconds 3
    $waited += 3
    $explorerRunning = (Get-Process -Name explorer -ErrorAction SilentlyContinue)
} while (-not $explorerRunning -and $waited -lt $maxWait)

if (-not $explorerRunning) {
    Log "WARNING: Explorer did not start within $maxWait seconds. Proceeding..."
} else {
    Log "Explorer is ready! (Waited ${waited} seconds)"
}

Start-Sleep -Seconds 5

# --- Step 2: Start Bot Guardian ---
Log "Step 2: Starting Telegram Bot Guardian..."

if (-not (Test-Path $NodeExe)) {
    Log "ERROR: Node.exe not found: $NodeExe"
} elseif (-not (Test-Path $GuardianScript)) {
    Log "ERROR: Guardian script not found: $GuardianScript"
} else {
    $PidFile = "D:\20260523\guardian.pid"
    $guardianRunning = $false
    $runningPid = $null
    
    if (Test-Path $PidFile) {
        try {
            $runningPid = (Get-Content $PidFile -Raw -ErrorAction SilentlyContinue).Trim()
            if ($runningPid) {
                $proc = Get-Process -Id $runningPid -ErrorAction SilentlyContinue
                if ($proc -and ($proc.ProcessName -eq "powershell" -or $proc.ProcessName -eq "pwsh")) {
                    $guardianRunning = $true
                }
            }
        } catch {
            $guardianRunning = $false
        }
    }

    if ($guardianRunning) {
        Log "SUCCESS: Bot Guardian is already running (PID: $runningPid). Skipping..."
    } else {
        Log "No running Guardian detected. Launching in background..."
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        
        # Start Guardian hidden in background
        Start-Process -FilePath $PsExe `
            -ArgumentList "-NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$GuardianScript`"" `
            -WorkingDirectory $ProjectDir
        Log "Guardian startup command issued!"

        # Verify startup using PID file
        Start-Sleep -Seconds 5
        if (Test-Path $PidFile) {
            $checkPid = (Get-Content $PidFile -Raw -ErrorAction SilentlyContinue).Trim()
            $checkProc = Get-Process -Id $checkPid -ErrorAction SilentlyContinue
            if ($checkProc) {
                Log "SUCCESS: Bot Guardian is running in background (PID: $checkPid)"
            } else {
                Log "WARNING: Guardian process not found after startup."
            }
        } else {
            Log "WARNING: PID file not found after startup. Check guardian.log"
        }
    }
}

# --- Step 3: Start Antigravity IDE ---
Log "Step 3: Starting Antigravity IDE..."
if (Test-Path $AgyIDEExe) {
    $ideProcess = Get-Process -ErrorAction SilentlyContinue | 
                  Where-Object { $_.Name -like "Antigravity*" }
    if ($ideProcess) {
        Log "SUCCESS: Antigravity IDE is already running. Skipping..."
    } else {
        Start-Process -FilePath $AgyIDEExe -WorkingDirectory $ProjectDir
        Log "Antigravity IDE startup command issued!"

        Log "Waiting for IDE window to load..."
        $waited2 = 0
        do {
            Start-Sleep -Seconds 3
            $waited2 += 3
            $ideReady = Get-Process -ErrorAction SilentlyContinue | 
                        Where-Object { $_.Name -like "Antigravity*" }
        } while (-not $ideReady -and $waited2 -lt 60)

        if ($ideReady) {
            Log "SUCCESS: Antigravity IDE is ready! (Waited ${waited2} seconds)"
        } else {
            Log "WARNING: IDE did not start within 60 seconds."
        }
    }
} else {
    Log "ERROR: Antigravity IDE not found: $AgyIDEExe"
}

Log "======================================"
Log "  All auto-start procedures completed!"
Log "======================================"
