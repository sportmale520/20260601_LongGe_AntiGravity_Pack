# 🌌 20260601_龍哥 AntiGravity 安裝懶人包 (V5.0 Premium)

歡迎來到 **「龍哥 AntiGravity 全能遠端遙控機器人 ✕ AI 美學排版 ✕ 文字雲」** 專屬安裝懶人包！

本懶人包完美彙整了從 **5 月 23 日** 首度開工，一直到今天 **6 月 1 日** 期間所有開創性的系統建置、多次深度技術診斷、核心重構與完美的升級成果。這是一套 100% 準備就緒、具備高度強健度（24/7 在線保護）與極致美學排版能力的智慧系統骨架！

---

## 📂 懶人包核心檔案清單與說明

本安裝包共包含以下 **11 個核心元件**，每一份程式碼都已經過深度優化與相容性測試：

| 序號 | 檔案名稱 | 核心角色與功能說明 |
| :---: | :--- | :--- |
| **01** | **[telegram-bot.js](file:///./telegram-bot.js)** | **即時遠端語意遙控機器人 (主程式)**<br>• 整合 `Gemini 3.5/2.5` 智能問答、即時 Google 地理氣象查詢、全自動 HTML5 遊戲開發與上架。<br>• 內建 **6 層超級備用重試鏈 (Fallback Chain)** 與 **1.5s 避讓限流機制**，確保 24/7 高可靠度連線。<br>• **生圖分流引擎**：支援非連貫口語生圖（如「生成...圖片」）並實施智慧 Prompt 淨化處理。 |
| **02** | **[convert-md-to-docx.ps1](file:///./convert-md-to-docx.ps1)** | **AI 智慧美學 Word 排版編譯器 (核心升級！)**<br>• **100% Pure ASCII** 安全架構，徹底解決 Windows PowerShell 惱人的 Unicode/BOM 剖析 Bug。<br>• **扁平化狀態機器**：無任何巢狀迴圈與 C-style loop，大括號 100% 穩定平衡。<br>• **出版級排版**：滿版深海藍橫幅 Banner、淺米黃 DFKai-SB 標楷體引文框、斑馬紋圖表、選項自動縮排、題目智慧加粗。 |
| **03** | **[bot-guardian.ps1](file:///./bot-guardian.ps1)** | **機器人守護進程 (Daemon Loop)**<br>• 全天候守護 `telegram-bot.js` 運作。若機器人因網路斷線、API 異常而停擺，將自動於 10 秒內完成安全熱重啟，保證服務永不下線。 |
| **04** | **[server.js](file:///./server.js)** | **輕量化極速網頁伺服器 (免依賴版)**<br>• 在 Port 3000 提供零依賴靜態網頁託管，作為 Firestore 3D 即時互動文字雲等前端應用的本地端極速引擎。 |
| **05** | **[setup-full-autostart.ps1](file:///./setup-full-autostart.ps1)** | **全自動開機自啟啟動安裝腳本**<br>• 點擊即可全自動在 Windows 中註冊開機任務，免去手動配置的繁雜手續。 |
| **06** | **[autostart-antigravity.ps1](file:///./autostart-antigravity.ps1)** | **開機啟動引導檔**<br>• Windows 開機自動調用此檔，無縫將「文字雲網頁伺服器」與「Bot 守護進程」同時在背景靜默拉起。 |
| **07** | **[diagnose-bot.ps1](file:///./diagnose-bot.ps1)** | **系統診斷與健康檢查工具**<br>• 一鍵掃描本地 Node 進程 PID、CPU 佔用率，並分析實時運作日誌，方便隨時檢視系統健康度。 |
| **08** | **[github-config-template.json](file:///./github-config-template.json)** | **GitHub 自動部署金鑰設定範本**<br>• 提供 GitHub 自動部署、網頁託管及 Pages 自動上架的 Token 與使用者名稱配置範本。 |
| **09** | **[DAILY_NOTE_2026-05-23.md](file:///./DAILY_NOTE_2026-05-23.md)** | **Obsidian 開工日誌**，詳細紀錄了 5 月 23 日專案發起首日的環境配置、Whisper 本地語音部署及開工軌跡。 |
| **10** | **[ANTIGRAVITY.md](file:///./ANTIGRAVITY.md)** | **專案駕駛艙 (SOP 指南)**，完整定義了「開工、收工、初始化專案」的全自動化 Git/ Obsidian 聯動工作流。 |
| **11** | **[09-AntiGravity專屬懶人包.md](file:///./09-AntiGravity專屬懶人包.md)** | **懶人包連接手冊**，提供全平台的快速接入與語意遙控操作說明。 |

---

## 📈 2026-05-23 至 2026-06-01 發展編年史 (Chronology)

### 📅 Phase 1：2026-05-23 至 05-24 —— 遙控啟航與守護建立
* **即時遙控建立**：架設 `telegram-bot.js` 遙控機器人，讓龍哥能透過手機隨時向本機下達複雜指令。
* **GPU 聽寫與文字雲**：在本地端完成 Whisper GPU 高速聽寫模型配置，並建置 Firestore 互動文字雲伺服器。
* **SOP 駕駛艙**：完成 `ANTIGRAVITY.md` 專案開工/收工 SOP 指南，實現無隱私金鑰洩漏風險的安全 Git 提交。
* **守護與自啟**：為防止 Node 行程崩潰，開發 `bot-guardian.ps1` 守護行程，並編寫 `setup-full-autostart.ps1` 註冊開機自啟動，保障系統全天候在線。

### 📅 Phase 2：2026-05-25 至 05-31 —— 重度抗壓與時間糾錯
* **Gemini 6 層重試鏈**：針對超長代碼生成易導致 Google API 503 超載的問題，重構 AI 調用層，引入 **1.5 秒避讓延時機制**與 **6 層模型重試鏈**，讓 API 金鑰抗壓性提升數倍。
* **跨月日期 Rollover 修復**：針對 JavaScript 日期計算在 5/31 跨 6/1 時易溢出滾動至 7/1 的 Bug，實作了安全的日期時間建構模組，確保「明日活動查詢」等功能時間精準無誤。

### 📅 Phase 3：2026-06-01 —— 精英美學排版與生圖大捷
* **修復 Word 文件傳送失敗**：診斷出先前 Telegram 使用了 `/sendPhoto` 端點上傳 `.docx` 檔案導致 `400 Bad Request` 拒絕，將其重構為 `/sendDocument`，徹底恢復文件傳送。
* **重構 Word 智慧美學編譯引擎**：
  * **解決編碼 Bug**：重寫 `convert-md-to-docx.ps1` 為 **100% Pure ASCII 檔案**，中文全數參數化，Unicode 正則化，完美解決 Windows PowerShell 將 UTF-8 中文漢字解碼為錯位 `{}` 括號的剖析 Bug。
  * **結構扁平化**：將原本複雜的巢狀迴圈改為「線性狀態機器」，採用 `.NET List` 與 native `-split` 替代易報錯的 unary comma 與 C-style 迴圈。
  * **套用奢華版面**：支援深藍 Banner 橫幅、淺米黃標楷體引文框、斑馬紋圖表、題目智慧加粗及選項縮排，產出出版級精美試卷。
* **生圖分流引擎升級**：修復了因指令「生成...圖片」非 contiguous 導致錯失生圖分流的 bug，新增模糊字串多條件比對，並智慧淨化前置/後置命令與贅詞（例如將「生成大梨山的大自然美感圖片」淨化為提示詞「大梨山的大自然美感」），完美上傳高清風景生圖至手機端！

---

## 🚀 懶人包安裝與開工指南

如果您要在新的 Windows 電腦上部署這套「龍哥 AntiGravity 系統」，請遵循以下 3 步極簡流程：

### 1️⃣ 第一步：還原金鑰設定
1. 將本目錄底下的 `github-config-template.json` 複製一份並重命名為 `github-config.json`。
2. 開啟並填入您的 GitHub 使用者名稱與 **GitHub Personal Access Token**：
   ```json
   {
     "github_username": "YOUR_GITHUB_USERNAME_HERE",
     "github_token": "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN_HERE"
   }
   ```

### 2️⃣ 第二步：註冊開機自啟動
1. 在本資料夾中按滑鼠右鍵，點選「**在終端機中開啟**」或打開 PowerShell。
2. 執行以下安裝命令：
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\setup-full-autostart.ps1
   ```
3. 腳本會自動為您在系統中建立捷徑並註冊開機啟動。下次重開機時，您的 Web 文字雲伺服器與 Telegram 遙控機器人都將自動在背景完美運作！

### 3️⃣ 第三步：日常診斷與管理
* **日常健康檢查**：隨時在 PowerShell 執行 `.\diagnose-bot.ps1` 即可瞬間檢視守護行程、Node.js 佔用及 Bot 最新運作日誌。
* **開工/收工 SOP**：對著手機 Telegram 機器人說「**開工**」，系統會自動對接 Obsidian 大大腦並核對 Git 分支狀態；說「**收工**」，系統將自動進行安全性敏感資訊掃描，並以有條理的分析自動 Commit 推送至 GitHub，並自動在筆記中留下 Next Steps！

---

*🌌 龍哥，這是屬於您的 AntiGravity 大腦與全能遙控助理。科技與美感交匯，願它能成為您教學與行政路上的最佳智能羽翼！*
