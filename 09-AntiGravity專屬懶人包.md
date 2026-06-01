# Anti-Gravity 2 專屬懶人包 #09：全平台服務連接與自動化技能大整合

> 版本：v1.0 (Anti-Gravity 2 專屬版)
> 更新日期：2026-05-22
> 語系偏好：預設繁體中文（Taiwan）

---

## 🚀 這個懶人包會幫你做什麼？

本懶人包是專為 **Anti-Gravity 2 (AI 編碼助理)** 使用者設計的終極整合指南。照著本懶人包的步驟，您將能一步步引導 AI 助理連接您所有的雲端與本地服務，並打造全自動化的「開工/收工/專案初始化」工作流：

1. **NotebookLM 連接**：透過 `notebooklm-mcp-cli` 讀寫您的 NotebookLM 筆記與來源。
2. **Firebase 連接**：透過 `firebase-tools` 管理並部署您的 Firebase 雲端資料庫。
3. **GitHub 連接**：透過 `gh` CLI 進行自動化 Git commit、push 與遠端倉庫建立。
4. **Obsidian 第二大腦連接**：透過 `@bitbonsai/mcpvault` 與本地 Markdown 筆記雙向同步。
5. **「開工/收工/專案初始化」全自動技能**：透過 `ANTIGRAVITY.md` 專案駕駛艙落實 SOP 流程。
6. **免 API Key 原生生圖**：利用內建生圖引擎以 **繁體中文** 為預設語系生成高品質資訊圖表。

---

## 🛠️ 第一部分：全平台服務連接指南

### 🎯 步驟一：連接 Google NotebookLM (MCP)
1. **安裝 CLI 工具**：
   ```powershell
   pip install notebooklm-mcp-cli
   ```
2. **登入 Google 帳號**：
   ```powershell
   nlm login
   ```
3. **繞過 Windows CP950 編碼錯誤**（關鍵防踩坑）：
   在 Windows 終端機執行 `nlm` 指令前，務必加上 `PYTHONIOENCODING=utf-8` 環境變數：
   ```powershell
   $env:PYTHONIOENCODING="utf-8"
   nlm list
   ```

---

### 🎯 步驟二：連接 Firebase 資料庫
1. **安裝 Firebase CLI**：
   ```powershell
   npm install -g firebase-tools
   ```
2. **繞過 Windows PowerShell 執行原則限制 (`PSSecurityException`)**：
   Windows 預設會拒絕載入 `firebase.ps1`。請使用 **CMD 包裝器** 執行：
   ```powershell
   cmd /c firebase login
   cmd /c firebase projects:list
   ```

---

### 🎯 步驟三：連接 GitHub 帳戶
1. **驗證與登入**：
   使用 GitHub CLI 進行網頁端安全授權：
   ```powershell
   $env:GITHUB_TOKEN=""  # 確保清除 AI 代理人的權限干擾
   gh auth login --web --git-protocol https
   gh auth status
   ```
2. **設定 Git 全域使用者資訊**：
   ```powershell
   git config --global user.name "您的名字"
   git config --global user.email "您的email@example.com"
   ```

---

### 🎯 步驟四：連接 Obsidian 第二大腦
1. **安裝全域 MCP 伺服器**：
   ```powershell
   npm install -g @bitbonsai/mcpvault
   ```
2. **定位您的 Obsidian Vault 實體路徑**：
   Windows 預設的 Documents 資料夾路徑：
   `C:\Users\<您的使用者名稱>\Documents\<您的Vault資料夾>`
3. **寫入 `opencode.json` 設定檔**（路徑務必指向正確的實體目錄）：
   ```json
   {
     "mcp": {
       "obsidian": {
         "type": "local",
         "command": ["npx", "@bitbonsai/mcpvault", "C:\\Users\\user\\Documents\\secondbrain"],
         "enabled": true
       }
     }
   }
   ```

---

## 🎨 第二部分：免 API Key 原生繁體中文生圖

Anti-Gravity 2 原生內建了強大的 **`generate_image`** 繪圖引擎，**不需要設定額外的 OpenAI API Key**，即可為您的教學或簡報繪製精美的高畫質圖表：

* **預設繁體中文語系規則**：在下達生圖提示詞時，AI 助理會自動將「繁體中文（Traditional Chinese）」列為預設最高優先順序，確保圖表中的文字與標題以優雅的繁體字體呈現。
* **生圖範例指令**：
  > 🎯 *「請幫我以**繁體中文**生成一張『AI 教育代理人在 K-12 教學應用』的五板塊玻璃擬態資訊圖表，並下載到目前資料夾。」*

---

## 🟢 第三部分：開工/收工/初始化專案自動化技能 (SOP)

我們利用專案根目錄的 **`ANTIGRAVITY.md`** 檔案來定義這三個自動化技能。當您在對話中對 AI 助理說出關鍵字時，將會自動觸發對應的工作流：

### 1. 🟢 說「開工」或「我來了」時
AI 助理會自動：
* 確認當前工作目錄是否位於 Git 倉庫中。
* 至 Obsidian 的 `每日筆記/` 中自動讀取「上次做到哪」與「下一步計畫」。
* 執行 `git status` 與 `git log -n 5`，檢查本地與遠端分支同步狀況。
* 給出今日的第一步行動建議。

### 2. 🔴 說「收工」或「下班了」時
AI 助理會自動：
* 進行專案敏感檔案安全掃描（防範 API Key 外洩）。
* 執行 `git add .`，詢問並自動為您生成 commit message，執行 `git commit` 與 `git push`。
* 自動在您的 Obsidian 每日筆記中更新今日的「已完成工作」與「留待明日待辦事項」。

### 3. 🔵 說「初始化專案」時
AI 助理會自動：
* 在根目錄生成新專案的 `ANTIGRAVITY.md`、`.gitignore` 與首頁說明。
* 執行 `git init`，加入所有檔案並完成 initial commit。
* 使用 `gh repo create` 建立對應的 GitHub 儲存庫並推上去。
* 直接在您的第二大腦中建立對應的專案工作區資料夾。
