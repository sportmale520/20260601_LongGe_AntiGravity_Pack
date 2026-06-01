# 🌌 Anti-Gravity 專案駕駛艙 (SOP) — 專案管理與自動化指南

> **專案名稱**：Anti-Gravity 專屬懶人包 ✕ 即時互動文字雲  
> **當前狀態**：已安裝完成，準備就緒！✨  
> **語系設定**：預設繁體中文（Taiwan）  

---

## 🛠️ 本地即時服務控制台

如果您想要在本地端開啟這套超精美的 Firestore 即時互動文字雲網頁，請直接叫我執行以下指令，或在終端機中手動執行：

```powershell
# 啟動本地極速 Web 伺服器
agy-node server.js
```

啟動後，請在瀏覽器中打開：**[http://localhost:3000](http://localhost:3000)** 即可即時體驗多人連線的 3D 文字投放！🚀

---

## 🤖 專案自動化技能 (SOP 指南)

身為您的 **Anti-Gravity 2** 編碼助理，我已深度整合本專案的自動化工作流技能。當您對我說出以下關鍵字時，我會自動為您觸發對應的 SOP：

### 🟢 關鍵字：「開工」或「我來了」
我將會自動執行以下流程：
1. **檢查 Git 狀態**：執行 `git status` 與 `git log -n 5`，核對本地與遠端分支是否同步。
2. **對接 Obsidian 大腦**（若有設定）：至 Obsidian `每日筆記/` 自動讀取「上次做到哪」與「下一步計畫」。
3. **今日行動指南**：彙整出今日開發的第一步行動建議，讓您無縫開工。

### 🔴 關鍵字：「收工」或「下班了」
我將會自動執行以下流程：
1. **敏感檔案安全掃描**：主動掃描專案，防止金鑰（API Key）、密碼等敏感資料外洩至 Git。
2. **自動 Git Commit**：執行 `git add .`，深入分析今日程式碼變更，自動生成有條理的 commit 訊息。
3. **自動推送到遠端**：詢問並確認後，自動執行 `git commit` 與 `git push`。
4. **自動更新筆記**：在您的 Obsidian 每日筆記中寫入今日的「已完成工作」與「留待明日待辦事項」。

### 🔵 關鍵字：「初始化專案」
當您要在新目錄開始新計畫時，我會自動執行：
1. **專案骨架生成**：自動生成專案所需的 `ANTIGRAVITY.md`、`.gitignore` 及 README。
2. **初始化儲存庫**：自動執行 `git init`，加入所有檔案並完成 initial commit。
3. **雲端儲存庫對接**：透過 `gh repo create` 自動在 GitHub 上建立同名儲存庫並完成首度推送。
4. ** Obsidian 綁定**：在您的 Obsidian 本地 Vault 中自動建立對應的專案管理資料夾。

---

## 📊 當前專案目錄結構

```text
d:\20260523\
├── 📂 wordcloud-app/           # Premium Firestore 即時互動文字雲前端網頁
│   ├── 📂 public/              # 靜態網頁資源 (index.html, style.css, app.js)
│   ├── .firebaserc             # Firebase 專案設定檔 (專案 ID: my-teaching-tools)
│   ├── firebase.json           # Firebase Hosting 部署設定檔
│   └── firestore.rules         # Firestore 安全規則
├── 📄 09-AntiGravity專屬懶人包.md # 懶人包核心全平台連接指南 (主檔)
├── 📄 ANTIGRAVITY.md           # 本專案駕駛艙 (SOP 自動化技能)
├── 📄 README.md                # 專案首頁說明
├── 📄 server.js                # 本地靜態伺服器 (agy-node 免依賴專用)
├── 📄 ai_educational_agents_trends.md # AI 教育代理人深度趨勢報告
├── 📄 notebooks.json           # NotebookLM MCP 資料備份
└── 🖼️ *.png                    # 實戰繁體中文高品質生圖及漫畫範例
```

---

*祝您開發愉快！需要啟動文字雲、或是開始開工 SOP，請隨時對我說！* 🌌
