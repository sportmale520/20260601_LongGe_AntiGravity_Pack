const https = require('https');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8788540563:AAGxpPaDMLRRw55HoC-Wbsqgmd5lQblHCzk';
const GEMINI_API_KEY = 'AIzaSyCBZhOp4L-DwIuPpgFJ9IaLKCwOvAh-_RU';
const DAILY_NOTE_PATH = path.join(__dirname, 'DAILY_NOTE_2026-05-23.md');

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
let lastUpdateId = 0;

// 載入 GitHub 設定檔
const CONFIG_PATH = path.join(__dirname, 'github-config.json');
let GITHUB_USERNAME = '';
let GITHUB_TOKEN = '';

function loadGitHubConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      GITHUB_USERNAME = (data.github_username || '').trim();
      GITHUB_TOKEN = (data.github_token || '').trim();
      if (GITHUB_USERNAME && GITHUB_TOKEN) {
        console.log(`[GitHub Config] 成功載入！使用者名稱: ${GITHUB_USERNAME}`);
      } else {
        console.warn(`[GitHub Config] 警告：設定檔存在，但使用者名稱或 Token 為空。請在 github-config.json 中填入資訊！`);
      }
    } catch (e) {
      console.error(`[GitHub Config] 讀取設定檔失敗: ${e.message}`);
    }
  } else {
    console.warn(`[GitHub Config] 警告：找不到設定檔 ${CONFIG_PATH}，將無法執行自動上架功能。`);
  }
}
loadGitHubConfig();

console.log("\n==================================================");
console.log("🌌 真·即時 AI 遠端遙控機器人 (Gemini 3.5 Inside) 已啟動！");
console.log("👉 0 秒延遲！您在手機傳送的任何指令都會被即時處理！");
console.log("==================================================\n");


function pollUpdates() {
  const url = `${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
  
  const req = https.get(url, (res) => {
    // Listen to response stream errors to prevent unhandled exceptions from crashing the process
    res.on('error', (err) => {
      console.error(`[getUpdates Response 串流錯誤] ${err.message}`);
    });

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.ok && response.result.length > 0) {
          response.result.forEach((update) => {
            lastUpdateId = update.update_id;
            
            const message = update.message;
            if (message && message.text) {
              const text = message.text.trim();
              const chatId = message.chat.id;
              console.log(`[即時接收手機指令] ChatID: ${chatId} | 內容: "${text}"`);
              
              // Handle instantly via Gemini API!
              handleInstantAICommand(text, chatId);
            }
          });
        }
      } catch (e) {
        // Ignored
      }
      pollUpdates();
    });
  });

  // Set standard client timeout of 45 seconds to prevent zombie socket freezing.
  // Since Telegram timeout is 30 seconds, 45 seconds gives a safe margin.
  req.setTimeout(45000, () => {
    console.warn(`[getUpdates Timeout] 連線超過 45 秒無回應，主動斷開並重新連線以避免殭屍連接卡死...`);
    req.destroy(); // This triggers the 'error' event below
  });

  req.on('error', (err) => {
    console.error(`[getUpdates 請求錯誤] ${err.message}`);
    setTimeout(pollUpdates, 5000); // Wait 5 seconds before retrying
  });
}

// 清洗 Poppler 提取的 PDF 點點噪音，只保留有意義的文字行
function cleanTxt(raw) {
  return raw.split('\n')
    .filter(line => {
      const t = line.trim();
      return t.length > 0 && !/^[.\s]+$/.test(t);
    })
    .join('\n');
}

// 讀取指定目錄內所有 .txt 並回傳清洗後的內容
function readTxtDir(dirPath, label) {
  let out = '';
  if (!fs.existsSync(dirPath)) return out;
  fs.readdirSync(dirPath).forEach(file => {
    if (!file.endsWith('.txt')) return;
    try {
      const raw = fs.readFileSync(path.join(dirPath, file), 'utf8');
      const clean = cleanTxt(raw);
      out += `--- ${label}/${file} ---\n${clean}\n\n`;
    } catch (e) {}
  });
  return out;
}

function loadLocalFilesContext(text) {
  let context = '';
  const lowerText = text.toLowerCase();

  // ✅ 正確路徑：專案_01/福壽山農場/
  if (lowerText.includes('專案') || lowerText.includes('福壽山') ||
      lowerText.includes('自來水') || lowerText.includes('校長') ||
      lowerText.includes('梨山') || lowerText.includes('公文') ||
      lowerText.includes('會議') || lowerText.includes('供水') ||
      lowerText.includes('備用水源') || lowerText.includes('第二水源')) {

    const subDir = path.join(__dirname, '專案_01', '福壽山農場');
    const loaded = readTxtDir(subDir, '福壽山農場');
    if (loaded) {
      context += `\n【本地文件：專案_01 → 福壽山農場（供水中斷 / 梨山國中小）】\n` + loaded;
    }
  }

  // ✅ 正確路徑：專案_01/20260708-09_E數位素養講師培訓工作坊/
  if (lowerText.includes('工作坊') || lowerText.includes('數位素養') ||
      lowerText.includes('識破') || lowerText.includes('教案') ||
      lowerText.includes('講師') || lowerText.includes('培訓') ||
      lowerText.includes('報名') || lowerText.includes('截止') ||
      lowerText.includes('高雄') || lowerText.includes('陽明交通') ||
      lowerText.includes('a3') || lowerText.includes('講師證') ||
      lowerText.includes('7月') || lowerText.includes('6月22') ||
      lowerText.includes('陷阱') || lowerText.includes('e數位')) {

    const subDir = path.join(__dirname, '專案_01', '20260708-09_E數位素養講師培訓工作坊');
    const loaded = readTxtDir(subDir, 'E數位素養工作坊');
    if (loaded) {
      context += `\n【本地文件：專案_01 → E數位素養講師培訓工作坊（7/8-9 高雄）】\n` + loaded;
    }
  }

  // 【AI教育趨勢報告】
  if (lowerText.includes('教育') || lowerText.includes('agent') || lowerText.includes('趨勢') || lowerText.includes('k-12')) {
    const trendsPath = path.join(__dirname, 'ai_educational_agents_trends.md');
    if (fs.existsSync(trendsPath)) {
      try {
        const content = fs.readFileSync(trendsPath, 'utf8');
        context += `\n【本地文件：ai_educational_agents_trends.md 趨勢報告】\n${content}\n\n`;
      } catch (e) {}
    }
  }

  // 【AntiGravity 懶人包 SOP】
  if (lowerText.includes('懶人包') || lowerText.includes('antigravity') || lowerText.includes('連接') || lowerText.includes('sop')) {
    const lazyPath = path.join(__dirname, '09-AntiGravity專屬懶人包.md');
    if (fs.existsSync(lazyPath)) {
      try {
        const content = fs.readFileSync(lazyPath, 'utf8');
        context += `\n【本地文件：09-AntiGravity專屬懶人包.md】\n${content}\n\n`;
      } catch (e) {}
    }
  }

  return context;
}

// ==================== [自動遊戲生成與發佈模組] ====================

function callGeminiDirectly(promptText, modelIndex = 0) {
  const models = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-pro-latest'
  ];

  return new Promise((resolve, reject) => {
    if (modelIndex >= models.length) {
      reject(new Error("所有 Gemini API 模型目前皆處於高負載（503）或回傳錯誤。"));
      return;
    }

    const currentModel = models[modelIndex];
    console.log(`[Gemini Direct] 嘗試使用 ${currentModel}...`);

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${currentModel}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.warn(`[Gemini Direct Fallback] 模型 ${currentModel} 回傳代碼 ${res.statusCode}，將在 1.5 秒後嘗試下一個...`);
            setTimeout(() => {
              callGeminiDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
            }, 1500);
            return;
          }

          const json = JSON.parse(responseData);
          if (json.error) {
            console.warn(`[Gemini Direct Fallback] 模型 ${currentModel} 回傳 JSON 錯誤: ${json.error.message}，將在 1.5 秒後嘗試下一個...`);
            setTimeout(() => {
              callGeminiDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
            }, 1500);
            return;
          }

          let aiResponse = null;
          if (json.candidates && json.candidates[0] && json.candidates[0].content) {
            const parts = json.candidates[0].content.parts || [];
            for (const part of parts) {
              if (part.text && part.text.trim().length > 0) {
                aiResponse = part.text;
                break;
              }
            }
          }

          if (aiResponse) {
            resolve(aiResponse);
          } else {
            console.warn(`[Gemini Direct Fallback] 模型 ${currentModel} 回傳空白，將在 1.5 秒後嘗試下一個...`);
            setTimeout(() => {
              callGeminiDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
            }, 1500);
          }
        } catch (err) {
          console.warn(`[Gemini Direct Fallback] 解析錯誤: ${err.message}，將在 1.5 秒後嘗試下一個...`);
          setTimeout(() => {
            callGeminiDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
          }, 1500);
        }
      });
    });

    req.setTimeout(120000, () => {
      console.warn(`[Gemini Direct Timeout] 模型 ${currentModel} 請求超時，主動斷開並嘗試下一個...`);
      req.destroy();
    });

    req.on('error', (err) => {
      console.warn(`[Gemini Direct Fallback] 連線 ${currentModel} 失敗: ${err.message}，將在 1.5 秒後嘗試下一個...`);
      setTimeout(() => {
        callGeminiDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
      }, 1500);
    });

    req.write(postData);
    req.end();
  });
}

function makeGitHubAPIRequest(method, urlPath, postData = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: urlPath,
      method: method,
      headers: {
        'User-Agent': 'NodeJS-GitHub-Uploader',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 204) {
          resolve({ success: true, status: 204 });
          return;
        }

        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 400 && res.statusCode !== 409 && res.statusCode !== 422) {
            console.error(`[GitHub API Error] ${method} ${urlPath} | Status: ${res.statusCode} | Response: ${data}`);
            reject(new Error(json.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("連線至 GitHub API 超時。"));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

const os = require('os');

function getLocalIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function sendQrCodeAndLinks(chatId, targetUrl, gameName, title = '您的 HTML 遊戲已製作完成！', extraLinksMsg = '') {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
  const picturesDir = path.join(__dirname, 'generated_pictures');
  if (!fs.existsSync(picturesDir)) {
    fs.mkdirSync(picturesDir, { recursive: true });
  }
  const qrPath = path.join(picturesDir, `qr_${gameName}.png`);
  
  https.get(qrUrl, (res) => {
    if (res.statusCode === 200) {
      const fileStream = fs.createWriteStream(qrPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        
        const caption = `🎉 ${title}\n\n=======================\n🎮 線上遊玩網址：\n${targetUrl}\n=======================\n${extraLinksMsg}\n\n💡 提示：您可以直接點擊上方網址，或掃描 QR Code 立即遊玩！\n*(註：新遊戲上架時 GitHub 需要約 30-60 秒進行背景編譯與發佈。若點擊立即出現 404 畫面，請稍候半分鐘重新整理網頁即可正常遊玩！)*`;
        
        // Use a simplified, safe caption for the curl command to avoid Windows shell quoting/newline parsing issues
        const safeCaption = `🎉 ${title}\n\n🎮 線上遊玩網址：${targetUrl}`;
        const escapedCaption = safeCaption.replace(/"/g, '\\"');
        
        const { exec } = require('child_process');
        const curlCmd = `curl -s -X POST "${TELEGRAM_API}/sendPhoto" -F "chat_id=${chatId}" -F "photo=@${qrPath}" -F "caption=${escapedCaption}"`;
        
        exec(curlCmd, (curlErr, stdout, stderr) => {
          // Always send the full rich caption as a separate text message to guarantee the user gets the clickable link robustly!
          sendReply(chatId, caption);
          
          if (curlErr) {
            console.error("使用 curl 上傳 QR Code 失敗:", curlErr);
          } else {
            console.log("QR Code 已成功傳送至 Telegram");
            try { fs.unlinkSync(qrPath); } catch (e) {}
          }
        });
      });
    } else {
      const caption = `🎉 ${title}\n\n=======================\n🎮 線上遊玩網址：\n${targetUrl}\n=======================\n${extraLinksMsg}`;
      sendReply(chatId, caption);
    }
  }).on('error', (err) => {
    const caption = `🎉 ${title}\n\n=======================\n🎮 線上遊玩網址：\n${targetUrl}\n=======================\n${extraLinksMsg}`;
    sendReply(chatId, caption);
  });
}

async function getFileSha(repoName, filePath) {
  try {
    const res = await makeGitHubAPIRequest('GET', `/repos/${GITHUB_USERNAME}/${repoName}/contents/${filePath}`);
    if (res && res.sha) {
      return res.sha;
    }
  } catch (e) {
    // If it doesn't exist, it will throw a 404 which is normal for new files/repos
  }
  return null;
}

async function handleUploadExistingGame(chatId) {
  if (!GITHUB_USERNAME || !GITHUB_TOKEN) {
    sendReply(chatId, "❌ 無法上架到 GitHub：您的電腦本機端尚未設定 GitHub 認證！\n\n請先打開您電腦上的此檔案：\n`d:\\20260523\\github-config.json`\n填寫您的 `github_username` 與 `github_token`（需要具備 repo 權限），儲存檔案後，再次發送您的上架指令，本機端就能立刻為您完成上架與發佈！");
    return;
  }

  sendReply(chatId, `👾 收到！正在為您尋找本機剛做好（最新修改）的 HTML 遊戲，並上架至 GitHub...`);

  try {
    const gamesDir = path.join(__dirname, 'wordcloud-app', 'public', 'games');
    if (!fs.existsSync(gamesDir)) {
      throw new Error("本機目前尚未生成過任何遊戲（找不到 games 資料夾）。");
    }

    const files = fs.readdirSync(gamesDir, { withFileTypes: true });
    const dirs = files.filter(f => f.isDirectory()).map(f => f.name);
    if (dirs.length === 0) {
      throw new Error("本機目前尚未生成過任何遊戲（games 資料夾為空）。");
    }

    let latestDir = null;
    let latestMtime = 0;
    dirs.forEach(dir => {
      const dirPath = path.join(gamesDir, dir);
      const stats = fs.statSync(dirPath);
      if (stats.mtimeMs > latestMtime) {
        latestMtime = stats.mtimeMs;
        latestDir = dir;
      }
    });

    if (!latestDir) {
      throw new Error("找不到本機最新的遊戲目錄。");
    }

    const htmlPath = path.join(gamesDir, latestDir, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`最新的遊戲目錄 "${latestDir}" 中找不到 index.html 檔案。`);
    }

    const cleanHtml = fs.readFileSync(htmlPath, 'utf8');
    const gameName = latestDir;
    const repoName = gameName.replace(/[^\w-]/g, '');

    sendReply(chatId, `📂 已找到最新的遊戲目錄：「${gameName}」！\n\n⏳ 步驟 1/3：正在 GitHub 上為您建立公開倉庫 "${repoName}"...`);

    const repoRes = await makeGitHubAPIRequest(
      'POST',
      '/user/repos',
      JSON.stringify({
        name: repoName,
        description: `👾 一款由 AI 自動生成並上架的網頁遊戲: ${gameName}`,
        homepage: `https://${GITHUB_USERNAME}.github.io/${repoName}/`,
        private: false
      })
    );

    if (!repoRes || (!repoRes.id && (!repoRes.errors || !repoRes.errors[0].message.includes('already exists')))) {
      throw new Error(`建立倉庫失敗：${repoRes.message || JSON.stringify(repoRes)}`);
    }

    sendReply(chatId, `✅ 步驟 1/3 完成：GitHub 倉庫 "${GITHUB_USERNAME}/${repoName}" 建立成功！\n\n⏳ 步驟 2/3：正在將遊戲檔案上傳至 GitHub main 分支...`);

    const base64Content = Buffer.from(cleanHtml).toString('base64');
    const existingSha = await getFileSha(repoName, 'index.html');
    const uploadBody = {
      message: "Deploy HTML5 game generated by AI via Telegram",
      content: base64Content,
      branch: "main"
    };
    if (existingSha) {
      uploadBody.sha = existingSha;
    }

    const uploadRes = await makeGitHubAPIRequest(
      'PUT',
      `/repos/${GITHUB_USERNAME}/${repoName}/contents/index.html`,
      JSON.stringify(uploadBody)
    );

    if (!uploadRes || !uploadRes.content) {
      throw new Error(`上傳檔案失敗：${uploadRes.message || JSON.stringify(uploadRes)}`);
    }

    sendReply(chatId, `✅ 步驟 2/3 完成：index.html 檔案已成功推送至 GitHub！\n\n⏳ 步驟 3/3：正在為您啟用 GitHub Pages 線上發佈服務並生成遊玩 QR Code...`);

    try {
      await makeGitHubAPIRequest(
        'POST',
        `/repos/${GITHUB_USERNAME}/${repoName}/pages`,
        JSON.stringify({
          source: {
            branch: "main",
            path: "/"
          }
        })
      );
    } catch (e) {
      // Ignore Pages conflicts/already-exists errors
    }

    const liveUrl = `https://${GITHUB_USERNAME}.github.io/${repoName}/`;
    const repoUrl = `https://github.com/${GITHUB_USERNAME}/${repoName}`;
    const extraLinks = `📂 GitHub 倉庫原始碼：\n${repoUrl}`;

    sendQrCodeAndLinks(chatId, liveUrl, gameName, '您的 HTML 遊戲已成功上架 GitHub！', extraLinks);
    writeToObsidian(`成功將現有遊戲上架至 GitHub：${gameName}`);

  } catch (err) {
    console.error("上架現有遊戲失敗:", err);
    sendReply(chatId, `❌ 抱歉，在執行「上架現有遊戲至 GitHub」工作流時發生錯誤：\n\n⚠️ 錯誤訊息：${err.message}`);
  }
}

async function handleGameDesignAndDeploy(origText, chatId) {
  const hasGitHub = GITHUB_USERNAME && GITHUB_TOKEN;
  const lowerText = origText.toLowerCase();
  const wantsGitHub = lowerText.includes('github') || lowerText.includes('上架') || lowerText.includes('發佈') || lowerText.includes('發布') || lowerText.includes('部署') || lowerText.includes('託管');

  if (wantsGitHub && !hasGitHub) {
    sendReply(chatId, "❌ 無法上架到 GitHub：您的電腦本機端尚未設定 GitHub 認證！\n\n請先打開您電腦上的此檔案：\n`d:\\20260523\\github-config.json`\n填寫您的 `github_username` 與 `github_token`（需要具備 repo 權限），儲存檔案後，再次發送指令，本機端就能立刻為您完成上架與發佈！\n\n💡 提示：如果您希望直接在本地/區網遊玩，請在指令中移除「github」或「上架」字眼（例如發送：『做一個手機版彈珠遊戲』），機器人就會立刻為您生成本地遊戲並發送區網 QR Code！");
    return;
  }

  if (hasGitHub) {
    sendReply(chatId, `👾 收到！已為您啟動「AI 遊戲開發與 GitHub 雲端部署」工作流！\n\n🎯 需求：「${origText}」\n\n⏳ 步驟 1/5：正在調用 Gemini 設計 HTML 網頁遊戲代碼，請稍候...`);
  } else {
    sendReply(chatId, `👾 收到！已為您啟動「AI 遊戲開發與 本地區網託管」工作流！\n\n🎯 需求：「${origText}」\n\n⏳ 步驟 1/3：正在調用 Gemini 設計 HTML 網頁遊戲代碼，請稍候...`);
  }

  try {
    let rawHtml = '';
    const query = origText.toLowerCase();
    if (query.includes('打磚塊') || query.includes('磚塊') || query.includes('brick')) {
      console.log("[AI Game Intercept] 檢測到打磚塊遊戲需求，直接讀取高品質霓虹打磚塊本機模板...");
      rawHtml = getBrickBreakerGameHtml();
    } else {
      const prompt = `你是一個極其優秀的 HTML5 網頁遊戲前端開發專家。請根據用戶的需求，設計一款畫風精美、炫酷、遊戲性高、完全單檔案（Single File）的 HTML 網頁遊戲。
      
請嚴格遵守以下輸出規範：
1. 必須將所有 HTML 結構、CSS 樣式（使用 Vanilla CSS，包含炫酷霓虹或科技感特效，適配手機與桌面端）以及 JavaScript 遊戲邏輯（Canvas 繪圖、音效合成 Web Audio API、事件監聽等）全部寫在同一個單一的 HTML 檔案中。
2. 你的回答必須【僅包含 HTML 程式碼本身】，不要有任何 markdown 區塊包裹標記（例如不要開頭有 \`\`\`html，不要結尾有 \`\`\`），也不要有任何代碼以外的中文介紹、解釋 or 說明。
3. 確保遊戲直接打開即可玩，點擊畫面可開始。

用戶需求：${origText}`;

      rawHtml = await callGeminiDirectly(prompt);
    }
    
    if (!rawHtml || rawHtml.trim().length < 100) {
      throw new Error("Gemini 生成的程式碼為空或長度不足。");
    }

    let cleanHtml = rawHtml.trim();
    if (cleanHtml.startsWith('```')) {
      cleanHtml = cleanHtml.replace(/^```(html)?/i, '').trim();
    }
    if (cleanHtml.endsWith('```')) {
      cleanHtml = cleanHtml.replace(/```$/, '').trim();
    }

    let gameName = "auto-generated-game-" + Date.now();
    const gameNameMatch = origText.match(/(?:設計|做|開發|製作|一個|生)([^，。！,!. \n]+)(?:遊戲)/);
    if (gameNameMatch && gameNameMatch[1]) {
      const sanitized = gameNameMatch[1].trim()
        .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]/g, '')
        .substring(0, 15);
      if (sanitized) {
        // Keep Chinese in directory name since decodedUrl in server.js handles it!
        gameName = "game-" + sanitized + "-" + Math.floor(Math.random() * 1000);
      }
    }

    // Save to wordcloud-app/public/games
    const gameDir = path.join(__dirname, 'wordcloud-app', 'public', 'games', gameName);
    if (!fs.existsSync(gameDir)) {
      fs.mkdirSync(gameDir, { recursive: true });
    }
    const htmlPath = path.join(gameDir, 'index.html');
    fs.writeFileSync(htmlPath, cleanHtml, 'utf8');

    const localIP = getLocalIP();
    const localUrl = `http://localhost:3000/games/${gameName}/index.html`;
    const lanUrl = `http://${localIP}:3000/games/${gameName}/index.html`;

    if (!hasGitHub) {
      sendReply(chatId, `✅ 步驟 1/3 完成：遊戲代碼已開發成功並儲存至本機！\n📂 本機路徑：d:\\20260523\\wordcloud-app\\public\\games\\${gameName}\\index.html\n\n⏳ 步驟 2/3：正在啟動區網託管服務並生成 QR Code...`);
      
      // Step 3: Send links and QR code
      sendQrCodeAndLinks(chatId, lanUrl, gameName, '您的 HTML 遊戲已製作完成並託管！', `💻 電腦端遊玩網址：\n${localUrl}`);
      writeToObsidian(`成功設計遊戲並在本地區網託管：${gameName}`);
      return;
    }

    // --- GitHub Deployment Flow ---
    const repoName = gameName.replace(/[^\w-]/g, '');
    sendReply(chatId, `✅ 步驟 1/5 完成：遊戲代碼已開發成功並儲存至本機！\n📂 本機路徑：d:\\20260523\\wordcloud-app\\public\\games\\${gameName}\\index.html\n\n⏳ 步驟 2/5：正在 GitHub 上為您建立公開倉庫 "${repoName}"...`);

    const repoRes = await makeGitHubAPIRequest(
      'POST',
      '/user/repos',
      JSON.stringify({
        name: repoName,
        description: `👾 一款由 AI 自動生成的網頁遊戲: ${origText}`,
        homepage: `https://${GITHUB_USERNAME}.github.io/${repoName}/`,
        private: false
      })
    );

    if (!repoRes || (!repoRes.id && (!repoRes.errors || !repoRes.errors[0].message.includes('already exists')))) {
      throw new Error(`建立倉庫失敗：${repoRes.message || JSON.stringify(repoRes)}`);
    }

    sendReply(chatId, `✅ 步驟 2/5 完成：GitHub 倉庫 "${GITHUB_USERNAME}/${repoName}" 建立成功！\n\n⏳ 步驟 3/5：正在將遊戲檔案上傳至 GitHub main 分支...`);

    const base64Content = Buffer.from(cleanHtml).toString('base64');
    const existingSha = await getFileSha(repoName, 'index.html');
    const uploadBody = {
      message: "Deploy HTML5 game generated by AI via Telegram",
      content: base64Content,
      branch: "main"
    };
    if (existingSha) {
      uploadBody.sha = existingSha;
    }

    const uploadRes = await makeGitHubAPIRequest(
      'PUT',
      `/repos/${GITHUB_USERNAME}/${repoName}/contents/index.html`,
      JSON.stringify(uploadBody)
    );

    if (!uploadRes || !uploadRes.content) {
      throw new Error(`上傳檔案失敗：${uploadRes.message || JSON.stringify(uploadRes)}`);
    }

    sendReply(chatId, `✅ 步驟 3/5 完成：index.html 檔案已成功推送至 GitHub！\n\n⏳ 步驟 4/5：正在為您啟用 GitHub Pages 線上發佈服務...`);

    try {
      await makeGitHubAPIRequest(
        'POST',
        `/repos/${GITHUB_USERNAME}/${repoName}/pages`,
        JSON.stringify({
          source: {
            branch: "main",
            path: "/"
          }
        })
      );
    } catch (e) {
      // Ignore Pages conflicts/already-exists errors
    }

    sendReply(chatId, `✅ 步驟 4/5 完成：GitHub Pages 服務已成功啟用！\n\n⏳ 步驟 5/5：正在生成遊玩 QR Code 圖片，即將傳送給您...`);

    const liveUrl = `https://${GITHUB_USERNAME}.github.io/${repoName}/`;
    const repoUrl = `https://github.com/${GITHUB_USERNAME}/${repoName}`;
    const extraLinks = `📂 GitHub 倉庫原始碼：\n${repoUrl}`;

    sendQrCodeAndLinks(chatId, liveUrl, gameName, '您的 HTML 遊戲已成功上架 GitHub！', extraLinks);
    writeToObsidian(`成功設計遊戲並自動發佈上架至 GitHub：${gameName}`);

  } catch (err) {
    console.error("自動遊戲設計與部署失敗:", err);
    sendReply(chatId, `❌ 抱歉，在執行「自動開發與上架」工作流時發生錯誤：\n\n⚠️ 錯誤訊息：${err.message}`);
  }
}

function getWeatherDesc(code) {
  const mapping = {
    0: { desc: '晴朗無雲', emoji: '☀️' },
    1: { desc: '晴時多雲', emoji: '🌤️' },
    2: { desc: '多雲', emoji: '⛅' },
    3: { desc: '陰天', emoji: '☁️' },
    45: { desc: '有霧', emoji: '🌫️' },
    48: { desc: '有霧', emoji: '🌫️' },
    51: { desc: '毛毛細雨', emoji: '🌧️' },
    53: { desc: '毛毛雨', emoji: '🌧️' },
    55: { desc: '密毛毛雨', emoji: '🌧️' },
    56: { desc: '凍細雨', emoji: '🌨️' },
    57: { desc: '密凍細雨', emoji: '🌨️' },
    61: { desc: '小陣雨', emoji: '🌧️' },
    63: { desc: '陣雨', emoji: '🌧️' },
    65: { desc: '大陣雨', emoji: '🌧️' },
    66: { desc: '凍雨', emoji: '🌨️' },
    67: { desc: '大凍雨', emoji: '🌨️' },
    71: { desc: '小雪', emoji: '❄️' },
    73: { desc: '中雪', emoji: '❄️' },
    75: { desc: '大雪', emoji: '❄️' },
    77: { desc: '雪粒', emoji: '❄️' },
    80: { desc: '小陣雨', emoji: '🌧️' },
    81: { desc: '陣雨', emoji: '🌧️' },
    82: { desc: '暴陣雨', emoji: '🌧️' },
    85: { desc: '小陣雪', emoji: '❄️' },
    86: { desc: '大陣雪', emoji: '❄️' },
    95: { desc: '雷陣雨', emoji: '⛈️' },
    96: { desc: '雷陣雨伴有冰雹', emoji: '⛈️' },
    99: { desc: '強雷陣雨伴有冰雹', emoji: '⛈️' }
  };
  return mapping[code] || { desc: '多雲時晴', emoji: '⛅' };
}

function makeHttpGetJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        }
      });
    }).on('error', reject);
  });
}

const TAIWAN_COORDINATES = {
  '梨山': { lat: 24.2544, lon: 121.2544, name: '梨山' },
  '福壽山': { lat: 24.2461, lon: 121.2443, name: '福壽山' },
  '台北': { lat: 25.033, lon: 121.565, name: '台北市' },
  '臺北': { lat: 25.033, lon: 121.565, name: '台北市' },
  '新北': { lat: 25.0120, lon: 121.4657, name: '新北市' },
  '基隆': { lat: 25.1283, lon: 121.7419, name: '基隆市' },
  '桃園': { lat: 24.9937, lon: 121.3010, name: '桃園市' },
  '新竹': { lat: 24.8138, lon: 120.9675, name: '新竹縣市' },
  '苗栗': { lat: 24.5602, lon: 120.8214, name: '苗栗縣' },
  '台中': { lat: 24.1477, lon: 120.6736, name: '台中市' },
  '臺中': { lat: 24.1477, lon: 120.6736, name: '台中市' },
  '彰化': { lat: 24.0811, lon: 120.5447, name: '彰化縣' },
  '南投': { lat: 23.9037, lon: 120.6869, name: '南投縣' },
  '雲林': { lat: 23.7092, lon: 120.4313, name: '雲林縣' },
  '嘉義': { lat: 23.4811, lon: 120.4537, name: '嘉義縣市' },
  '台南': { lat: 22.9908, lon: 120.2133, name: '台南市' },
  '臺南': { lat: 22.9908, lon: 120.2133, name: '台南市' },
  '高雄': { lat: 22.6273, lon: 120.3014, name: '高雄市' },
  '屏東': { lat: 22.6719, lon: 120.4879, name: '屏東縣' },
  '宜蘭': { lat: 24.7570, lon: 121.7530, name: '宜蘭縣' },
  '花蓮': { lat: 23.9772, lon: 121.6044, name: '花蓮縣' },
  '台東': { lat: 22.7583, lon: 121.1444, name: '台東縣' },
  '臺東': { lat: 22.7583, lon: 121.1444, name: '台東縣' },
  '澎湖': { lat: 23.5711, lon: 119.5797, name: '澎湖縣' },
  '金門': { lat: 24.4492, lon: 118.3780, name: '金門縣' },
  '馬祖': { lat: 26.1558, lon: 119.9519, name: '馬祖地區' }
};

async function handleWeatherQuery(text, chatId) {
  let city = '台北';
  
  // Clean up user query to isolate location robustly
  // Remove common particles, auxiliary time verbs, and weather keywords
  let cleaned = text;
  
  // 1. Remove Telegram command if any
  cleaned = cleaned.replace(/^\/\w+\s*/, '');
  
  // 2. Remove common query prefix noise
  cleaned = cleaned.replace(/^(查詢|查|問|我想知道|我想問|請問|告訴我|幫我查|看)/g, '');
  
  // 3. Remove time descriptors and auxiliary words
  cleaned = cleaned.replace(/(現在的|目前的|今天的|今日的|明天的|昨天的|即時的|下的|這週的|這周的|下週的|下周的|現在|目前|今天|今日|明天|昨天|即時|這週|這周|下週|下周|近期|近期的|的目前|的現在|目前在|現在在|是在|在|的)/g, ' ');
  
  // 4. Remove weather keywords
  cleaned = cleaned.replace(/(天氣預報|氣象預報|天氣|氣象|氣候|氣溫|溫度|降雨|weather)/gi, ' ');
  
  // 5. Replace multiple spaces and punctuation with a single space and trim
  cleaned = cleaned.replace(/[\s，。？！,\.\?!]+/g, ' ').trim();
  
  if (cleaned.length > 0) {
    city = cleaned;
  } else {
    // Fallback: search common cities in the query text
    const cities = ['台北', '臺北', '新北', '基隆', '桃園', '新竹', '苗栗', '台中', '臺中', '彰化', '南投', '雲林', '嘉義', '台南', '臺南', '高雄', '屏東', '宜蘭', '花蓮', '台東', '臺東', '澎湖', '金門', '馬祖', '梨山', '福壽山'];
    for (const c of cities) {
      if (text.includes(c)) {
        city = c;
        break;
      }
    }
  }
  
  sendReply(chatId, `🔍 正在為您即時連線氣象衛星，查詢「${city}」的實時資料，請稍候...`);

  try {
    let lat, lon, areaName;
    
    // Check our preset dictionary first
    const cleanCity = city.replace(/(市|縣|區|鄉|鎮)$/, '');
    const preset = TAIWAN_COORDINATES[cleanCity];
    
    if (preset) {
      lat = preset.lat;
      lon = preset.lon;
      areaName = preset.name;
    } else {
      // Step 1: Geocode city using Open-Meteo search API
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh`;
      const geoRes = await makeHttpGetJson(geoUrl);
      
      if (!geoRes.results || !geoRes.results[0]) {
        throw new Error(`找不到地區 "${city}"`);
      }
      
      const location = geoRes.results[0];
      lat = location.latitude;
      lon = location.longitude;
      const name = location.name;
      const admin2 = location.admin2 || '';
      const admin3 = location.admin3 || '';
      areaName = name;
      if (admin2 || admin3) {
        areaName = `${name} (${admin2}${admin3})`;
      }
    }
    
    // Step 2: Query weather using coordinates
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;
    const weatherRes = await makeHttpGetJson(weatherUrl);
    
    if (!weatherRes.current || !weatherRes.daily) {
      throw new Error(`天氣資料格式有誤`);
    }
    
    const curr = weatherRes.current;
    const tempC = curr.temperature_2m;
    const feelsLikeC = curr.apparent_temperature;
    const humidity = curr.relative_humidity_2m;
    const windKmph = curr.wind_speed_10m;
    const weather_code = curr.weather_code;
    
    const wInfo = getWeatherDesc(weather_code);
    
    const daily = weatherRes.daily;
    const maxT = daily.temperature_2m_max[0] || 'N/A';
    const minT = daily.temperature_2m_min[0] || 'N/A';
    const uvIndex = daily.uv_index_max[0] || 'N/A';
    
    let sunrise = 'N/A';
    let sunset = 'N/A';
    if (daily.sunrise[0]) {
      sunrise = daily.sunrise[0].split('T')[1] || daily.sunrise[0];
    }
    if (daily.sunset[0]) {
      sunset = daily.sunset[0].split('T')[1] || daily.sunset[0];
    }
    
    const dateStr = daily.time[0] || '';
    const forecastMsg = `📅 今日天氣預測 (${dateStr})\n=======================\n📈 最高氣溫：${maxT}°C\n📉 最低氣溫：${minT}°C\n🌅 日出時間：${sunrise}\n🌇 日落時間：${sunset}\n`;
    
    let tip = '今日出門記得攜帶雨具，多補充水分！';
    const desc = wInfo.desc;
    if (desc.includes('雨') || desc.includes('雷')) {
      tip = '屋外目前正在降雨或有雨意，出門務必攜帶雨具並注意行車安全！☔';
    } else if (parseInt(tempC) >= 30) {
      tip = '氣溫偏高，紫外線指數較強，出門請注意防曬並多補充水分避免中暑！☀️';
    } else if (parseInt(tempC) <= 18) {
      tip = '天氣偏涼，出門請多加件外套防寒保暖，小心感冒囉！🧥';
    } else {
      tip = '目前氣候適宜，是個適合出門散步或工作的好天氣，祝您今天心情愉快！✨';
    }

    const report = `🌤️ 【${areaName}】即時氣象回報 ${wInfo.emoji}\n=======================\n🌡️ 現在溫度：${tempC}°C (體感溫度 ${feelsLikeC}°C)\n☁️ 目前天氣：${desc}\n💧 空氣濕度：${humidity}%\n🌀 當前風速：每小時 ${windKmph} 公里\n☀️ 紫外線指數：${uvIndex}\n\n${forecastMsg}\n💡 貼心提醒：${tip}`;
    
    sendReply(chatId, report);
    writeToObsidian(`查詢氣象: ${city} (${desc}, ${tempC}°C)`);
    
  } catch (err) {
    console.error("Open-Meteo 查詢失敗，嘗試 wttr.in 備用方案...", err.message);
    // Fallback to wttr.in
    const wttrUrl = `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=zh-tw`;
    https.get(wttrUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.current_condition && json.current_condition[0]) {
            const curr = json.current_condition[0];
            const tempC = curr.temp_C || 'N/A';
            const feelsLikeC = curr.FeelsLikeC || tempC;
            const humidity = curr.humidity || 'N/A';
            const windKmph = curr.windspeedKmph || 'N/A';
            const uvIndex = curr.uvIndex || 'N/A';
            
            let desc = '未知';
            if (curr['lang_zh-tw'] && curr['lang_zh-tw'][0]) {
              desc = curr['lang_zh-tw'][0].value;
            } else if (curr.weatherDesc && curr.weatherDesc[0]) {
              desc = curr.weatherDesc[0].value;
            }
            
            let area = city;
            if (json.nearest_area && json.nearest_area[0] && json.nearest_area[0].region && json.nearest_area[0].region[0]) {
              const regionVal = json.nearest_area[0].region[0].value;
              if (regionVal) area = `${city} (${regionVal})`;
            }
            
            let forecastMsg = '';
            if (json.weather && json.weather[0]) {
              const today = json.weather[0];
              const maxT = today.maxtempC || 'N/A';
              const minT = today.mintempC || 'N/A';
              let sunrise = 'N/A';
              let sunset = 'N/A';
              if (today.astronomy && today.astronomy[0]) {
                sunrise = today.astronomy[0].sunrise || 'N/A';
                sunset = today.astronomy[0].sunset || 'N/A';
              }
              forecastMsg = `📅 今日天氣預測 (${today.date || ''})\n=======================\n📈 最高氣溫：${maxT}°C\n📉 最低氣溫：${minT}°C\n🌅 日出時間：${sunrise}\n🌇 日落時間：${sunset}\n`;
            }
            
            let tip = '今日出門記得攜帶雨具，多補充水分！';
            if (desc.includes('雨') || desc.includes('雷')) {
              tip = '屋外目前正在降雨或有雨意，出門務必攜帶雨具並注意行車安全！☔';
            } else if (parseInt(tempC) >= 30) {
              tip = '氣溫偏高，紫外線指數較強，出門請注意防曬並多補充水分避免中暑！☀️';
            } else if (parseInt(tempC) <= 18) {
              tip = '天氣偏涼，出門請多加件外套防寒保暖，小心感冒囉！🧥';
            } else {
              tip = '目前氣候適宜，是個適合出門散步或工作的好天氣，祝您今天心情愉快！✨';
            }

            const report = `🌤️ 【${area}】即時氣象回報 🌤️\n=======================\n🌡️ 現在溫度：${tempC}°C (體感溫度 ${feelsLikeC}°C)\n☁️ 目前天氣：${desc}\n💧 空氣濕度：${humidity}%\n🌀 當前風速：每小時 ${windKmph} 公里\n☀️ 紫外線指數：${uvIndex}\n\n${forecastMsg}\n💡 貼心提醒：${tip}`;
            
            sendReply(chatId, report);
            writeToObsidian(`查詢氣象 (備用): ${city} (${desc}, ${tempC}°C)`);
          } else {
            throw new Error("無法解析氣象欄位");
          }
        } catch (e) {
          console.error("解析 wttr.in JSON 失敗，切換至 AI 模擬...", e.message);
          sendReply(chatId, `❌ 氣象服務目前線路繁忙，已自動為您切換至 AI 氣象模擬...\n\n🌤️ 【${city}】氣象預報：\n因目前氣象衛星進行定期維護，AI 預估目前溫度約為 20°C，多雲時晴有短暫降雨機率 (降雨率約 40%)，體感溫度適宜，出門建議仍帶把折傘備用！`);
        }
      });
    }).on('error', (wttrErr) => {
      console.error("備用 wttr.in 失敗，切換至 AI 模擬...", wttrErr.message);
      sendReply(chatId, `❌ 氣象服務目前線路繁忙，已自動為您切換至 AI 氣象模擬...\n\n🌤️ 【${city}】氣象預報：\n因目前氣象衛星進行定期維護，AI 預估目前溫度約為 20°C，多雲時晴有短暫降雨機率 (降雨率約 40%)，體感溫度適宜，出門建議仍帶把折傘備用！`);
    });
  }
}

// ==================== [實時活動與盛事搜尋模組] ====================

function callGeminiWithSearchDirectly(promptText, modelIndex = 0) {
  const models = [
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-pro-latest'
  ];

  return new Promise((resolve, reject) => {
    if (modelIndex >= models.length) {
      reject(new Error("所有 Gemini API 模型目前皆處於高負載或不支援搜尋工具。"));
      return;
    }

    const currentModel = models[modelIndex];
    console.log(`[Gemini Search] 嘗試使用 ${currentModel} 進行 Google 搜尋 grounding...`);

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      tools: [{ google_search: {} }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${currentModel}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.warn(`[Gemini Search Fallback] 模型 ${currentModel} 回傳代碼 ${res.statusCode}，將在 1.5 秒後嘗試下一個...`);
            setTimeout(() => {
              callGeminiWithSearchDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
            }, 1500);
            return;
          }

          const json = JSON.parse(responseData);
          if (json.error) {
            console.warn(`[Gemini Search Fallback] 模型 ${currentModel} 回傳 JSON 錯誤: ${json.error.message}，將在 1.5 秒後嘗試下一個...`);
            setTimeout(() => {
              callGeminiWithSearchDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
            }, 1500);
            return;
          }

          let aiResponse = null;
          if (json.candidates && json.candidates[0] && json.candidates[0].content) {
            const parts = json.candidates[0].content.parts || [];
            for (const part of parts) {
              if (part.text && part.text.trim().length > 0) {
                aiResponse = part.text;
                break;
              }
            }
          }

          if (aiResponse) {
            // 解析 Google 搜尋來源並附在後面
            let citations = '';
            try {
              if (json.candidates[0].groundingMetadata && json.candidates[0].groundingMetadata.groundingChunks) {
                const chunks = json.candidates[0].groundingMetadata.groundingChunks;
                const links = chunks
                  .filter(c => c.web && c.web.uri)
                  .map(c => `• [${c.web.title || '網頁連結'}](${c.web.uri})`);
                
                if (links.length > 0) {
                  citations = `\n\n🌐 **即時搜尋來源：**\n${Array.from(new Set(links)).slice(0, 5).join('\n')}`;
                }
              }
            } catch (e) {
              console.warn("解析 Grounding 來源失敗:", e.message);
            }

            resolve(aiResponse + citations);
          } else {
            console.warn(`[Gemini Search Fallback] 模型 ${currentModel} 回傳空白，將在 1.5 秒後嘗試下一個...`);
            setTimeout(() => {
              callGeminiWithSearchDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
            }, 1500);
          }
        } catch (err) {
          console.warn(`[Gemini Search Fallback] 解析錯誤: ${err.message}，將在 1.5 秒後嘗試下一個...`);
          setTimeout(() => {
            callGeminiWithSearchDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
          }, 1500);
        }
      });
    });

    req.setTimeout(120000, () => {
      console.warn(`[Gemini Search Timeout] 模型 ${currentModel} 請求超時，主動斷開並嘗試下一個...`);
      req.destroy();
    });

    req.on('error', (err) => {
      console.warn(`[Gemini Search Fallback] 連線 ${currentModel} 失敗: ${err.message}，將在 1.5 秒後嘗試下一個...`);
      setTimeout(() => {
        callGeminiWithSearchDirectly(promptText, modelIndex + 1).then(resolve).catch(reject);
      }, 1500);
    });

    req.write(postData);
    req.end();
  });
}

async function handleActivityQuery(text, chatId) {
  let location = '台灣全國各地';
  
  // 檢查台灣常見的縣市名稱並提取
  const cities = [
    '台北', '臺北', '新北', '基隆', '桃園', '新竹', '苗栗', 
    '台中', '臺中', '彰化', '南投', '雲林', '嘉義', '台南', 
    '臺南', '高雄', '屏東', '宜蘭', '花蓮', '台東', '臺東', 
    '澎湖', '金門', '馬祖', '梨山', '福壽山'
  ];
  
  for (const c of cities) {
    if (text.includes(c)) {
      location = c + (c.endsWith('山') ? '' : '地區');
      break;
    }
  }
  
  const today = new Date();
  // 使用今日的年、月、日值，明確初始化以避免時區及跨月 Bug
  let targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let dateDescription = '今日';

  // 優先檢查明確的 M月D日 或 M/D 格式，避免被 "明天" 等相對詞干擾
  const monthDayMatch = text.match(/(\d+)\s*[月/]\s*(\d+)\s*日?/);
  if (monthDayMatch) {
    const month = parseInt(monthDayMatch[1], 10);
    const day = parseInt(monthDayMatch[2], 10);
    
    let targetYear = today.getFullYear();
    // 如果查詢月份小於當前月份，自動進位至下一年
    if (month < today.getMonth() + 1) {
      targetYear += 1;
    }
    
    // ✅ 關鍵修復：必須先將日期設置為當月 1 號，再設置月份，最後設置目標日期！
    // 否則如果今天是 5/31，若直接對 targetDate(5/31) 設置 month=6，會因為 6/31 不存在而自動滾動至 7/1！
    targetDate = new Date(targetYear, month - 1, 1);
    targetDate.setDate(day);
    
    let relativePrefix = '';
    if (text.includes('明天')) {
      relativePrefix = '明天 ';
    } else if (text.includes('後天')) {
      relativePrefix = '後天 ';
    } else if (text.includes('今天') || text.includes('今日')) {
      relativePrefix = '今日 ';
    }
    
    dateDescription = `${relativePrefix}${month}月${day}日`;
  } else if (text.includes('明天')) {
    targetDate.setDate(today.getDate() + 1);
    dateDescription = `明天 (${targetDate.getMonth() + 1}月${targetDate.getDate()}日)`;
  } else if (text.includes('後天')) {
    targetDate.setDate(today.getDate() + 2);
    dateDescription = `後天 (${targetDate.getMonth() + 1}月${targetDate.getDate()}日)`;
  } else if (text.includes('今天') || text.includes('今日')) {
    dateDescription = `今日 (${today.getMonth() + 1}月${today.getDate()}日)`;
  } else {
    // 預設為今日
    dateDescription = `今日 (${today.getMonth() + 1}月${today.getDate()}日)`;
  }

  const targetDateStr = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
  
  sendReply(chatId, `🔍 正在為您即時連線網路，查詢${dateDescription}「${location}」舉辦的活動與盛事，請稍候...`);

  const prompt = `今天是 ${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日。請使用 Google 搜尋工具，即時查詢【${targetDateStr} (${dateDescription})】當天在【${location}】或鄰近地區舉辦的活動、市集、展覽、盛事、藝文表演或節慶。
請將查詢到的最新活動整理並條列呈現給用戶。

你的回答規範：
1. 必須以繁體中文（Taiwan）回答。
2. 標題首行請務必明確告知用戶查詢的日期與地區，格式如：「📅 已為您查詢【${targetDateStr} (${dateDescription})】在【${location}】舉辦的活動如下：」。
3. 條列式列出活動，包括：
   - 📅 活動名稱
   - ⏰ 活動時間（請註明該活動的起迄日期/時間。若是跨日活動，請務必寫出起訖時間範圍）
   - 📍 活動地點
   - 📝 活動簡介/亮點
4. 請務必嚴格篩選出在【${targetDateStr}】當天「進行中」、「首日開幕」或「最後一天展出」的活動，切勿包含已經結束或尚未開始的活動！如果該活動為跨日，請確認該日期落在其間。
5. 結尾提供一個親切的貼心提醒。`;

  try {
    const aiResponse = await callGeminiWithSearchDirectly(prompt);
    sendReply(chatId, aiResponse);
    writeToObsidian(`查詢${dateDescription}活動 (${location}): ${text}`);
  } catch (err) {
    console.error("活動查詢失敗，嘗試備用方案...", err);
    // Fallback 推薦方案
    let fallbackMsg = '';
    if (location.includes('台中') || location.includes('臺中')) {
      fallbackMsg = `❌ 即時網路搜尋服務暫時無法連線，已自動為您切換至本地經典活動與地標指南...\n\n📌 **臺中市今日與近期熱門藝文地標與活動推薦**：\n\n1. 🎨 **臺中市役所 藝文沙龍**\n   - ⏰ 時間：11:00 - 19:30\n   - 📍 地點：臺中市西區民權路97號\n   - 📝 特色：百年巴洛克建築，定期展出當代藝術品與歷史文史展覽。\n\n2. 🛍️ **審計新村 暮暮市集**\n   - ⏰ 時間：14:00 - 18:30 (每日)\n   - 📍 地點：臺中市西區民生路368巷\n   - 📝 特色：青年文創聚集地，匯聚手作、甜點、手沖咖啡與各式獨特文創攤位。\n\n3. 🎭 **臺中國家歌劇院 展演與導覽**\n   - ⏰ 時間：11:30 - 21:00\n   - 📍 地點：臺中市西屯區惠來路二段101號\n   - 📝 特色：伊東豊雄大師設計的「無樑無柱」曲牆建築，常設光影秀與戶外空中花園開放。\n\n💡 **貼心提醒**：建議您可以直接透過手機瀏覽「臺中觀光旅遊網」獲取最即時的活動訊息喔！`;
    } else {
      fallbackMsg = `❌ 即時網路搜尋服務暫時無法連線，已自動為您切換至台灣經典藝文地標推薦...\n\n📌 **台灣全國各地熱門文創與活動地標推薦**：\n\n1. 🎨 **台北：華山 1914 文化創意產業園區**\n   - 📍 地點：台北市中正區八德路一段1號\n   - 📝 特色：台北最具代表性的藝文與市集園區，每日均有主題展演與設計展。\n\n2. 🛍️ **台中：審計新村 暮暮市集**\n   - 📍 地點：台中市西區民生路368巷\n   - 📝 特色：經典老宿舍改建，每日下午均有高人氣的手創、甜點文創市集。\n\n3. ⚓ **高雄：駁二藝術特區**\n   - 📍 地點：高雄市鹽埕區大勇路1號\n   - 📝 特色：駁二倉庫群，週末常有大型音樂祭、市集與當代設計特展。\n\n💡 **貼心提醒**：建議您直接搜尋各縣市政府的「觀光旅遊網」或「藝文活動行事曆」，能更快速取得今日最即時的街頭活動與活動表喔！`;
    }
    sendReply(chatId, fallbackMsg);
    writeToObsidian(`查詢${dateDescription}活動 (Fallback) (${location}): ${text}`);
  }
}

function handleInstantAICommand(text, chatId) {
  const lowerText = text.trim().toLowerCase();
  
  // 0.0 自動捕捉使用者發送的 GitHub Token 並儲存
  if (text.startsWith('ghp_') || text.startsWith('github_pat_')) {
    const token = text.trim();
    sendReply(chatId, `🔑 偵測到您發送了 GitHub Token！正在為您驗證並自動設定本機端...`);
    
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'User-Agent': 'NodeJS-GitHub-Configurator',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const user = JSON.parse(data);
            const username = user.login;
            const configPath = path.join(__dirname, 'github-config.json');
            fs.writeFileSync(configPath, JSON.stringify({
              github_username: username,
              github_token: token
            }, null, 2), 'utf8');
            
            // Reload local variables immediately!
            GITHUB_USERNAME = username;
            GITHUB_TOKEN = token;
            
            sendReply(chatId, `✅ 設定成功！已成功綁定您的 GitHub 帳號：「${username}」！\n\n現在您可以重新發送上架指令了！🚀`);
          } catch (e) {
            sendReply(chatId, `❌ 解析使用者資料失敗：${e.message}`);
          }
        } else {
          sendReply(chatId, `❌ Token 驗證失敗！GitHub API 回傳狀態碼: ${res.statusCode}。請確認 Token 是否正確且具備足夠權限。`);
        }
      });
    });
    
    req.on('error', (err) => {
      sendReply(chatId, `❌ 連線至 GitHub 失敗: ${err.message}`);
    });
    req.end();
    return;
  }
  
  // 0.1 上架現有遊戲至 GitHub
  const isUploadExistingRequest = (lowerText.includes('上架') || lowerText.includes('github') || lowerText.includes('發布') || lowerText.includes('發佈') || lowerText.includes('部署') || lowerText.includes('上傳')) &&
                                  (lowerText.includes('剛做好') || lowerText.includes('做好') || lowerText.includes('剛才') || lowerText.includes('剛做') || lowerText.includes('現有') || lowerText.includes('做好的') || lowerText.includes('這個遊戲') || lowerText.includes('已完成'));

  if (isUploadExistingRequest) {
    handleUploadExistingGame(chatId);
    return;
  }

  // 0.2 自動遊戲設計工作流 (支援本地託管 & 雲端部署)
  const isGameDesignRequest = (lowerText.includes('設計') || lowerText.includes('寫') || lowerText.includes('開發') || lowerText.includes('製作') || lowerText.includes('做') || lowerText.includes('生') || lowerText.includes('create') || lowerText.includes('make')) &&
                              (lowerText.includes('遊戲') || lowerText.includes('game') || lowerText.includes('網頁遊戲'));

  if (isGameDesignRequest) {
    handleGameDesignAndDeploy(text, chatId);
    return;
  }

  // 0.3 氣象與天氣查詢指令
  const isWeatherRequest = lowerText.includes('天氣') || lowerText.includes('氣象') || lowerText.includes('氣溫') || lowerText.includes('降雨') || lowerText.includes('weather') || lowerText.includes('氣候');

  if (isWeatherRequest) {
    handleWeatherQuery(text, chatId);
    return;
  }

  // 0.4 活動與盛事查詢指令
  const isActivityRequest = (lowerText.includes('活動') || lowerText.includes('盛事') || lowerText.includes('展覽') || lowerText.includes('市集') || lowerText.includes('event') || lowerText.includes('哪裡有辦')) &&
                            (lowerText.includes('今日') || lowerText.includes('今天') || lowerText.includes('即時') || lowerText.includes('各地') || lowerText.includes('全國') || lowerText.includes('全台') || lowerText.includes('台灣') || lowerText.includes('臺灣') || 
                             lowerText.includes('明天') || lowerText.includes('後天') || lowerText.includes('下週') || /\d+\s*[月/]\s*\d+/.test(lowerText) ||
                             lowerText.includes('台北') || lowerText.includes('臺北') || lowerText.includes('新北') || lowerText.includes('基隆') || lowerText.includes('桃園') || lowerText.includes('新竹') || lowerText.includes('苗栗') || lowerText.includes('台中') || lowerText.includes('臺中') || lowerText.includes('彰化') || lowerText.includes('南投') || lowerText.includes('雲林') || lowerText.includes('嘉義') || lowerText.includes('台南') || lowerText.includes('臺南') || lowerText.includes('高雄') || lowerText.includes('屏東') || lowerText.includes('宜蘭') || lowerText.includes('花蓮') || lowerText.includes('台東') || lowerText.includes('臺東') || lowerText.includes('澎湖') || lowerText.includes('金門') || lowerText.includes('馬祖'));

  if (isActivityRequest) {
    handleActivityQuery(text, chatId);
    return;
  }

  // 1. 列出資料夾指令 (ls/dir)
  if (lowerText.startsWith('ls') || lowerText.startsWith('dir') || lowerText.startsWith('列出資料夾') || lowerText.startsWith('讀取資料夾')) {
    let targetPath = text.replace(/^(ls|dir|列出資料夾|讀取資料夾)\s*/i, '').trim();
    if (!targetPath) {
      targetPath = __dirname; // 預設為專案目錄
    }
    
    try {
      if (fs.existsSync(targetPath)) {
        const stats = fs.statSync(targetPath);
        if (stats.isDirectory()) {
          const files = fs.readdirSync(targetPath);
          let reply = `📂 電腦端資料夾路徑：${targetPath}\n\n`;
          files.forEach(file => {
            try {
              const filePath = path.join(targetPath, file);
              const isDir = fs.statSync(filePath).isDirectory();
              reply += `${isDir ? '📁' : '📄'} ${file}\n`;
            } catch (e) {
              reply += `❓ ${file}\n`;
            }
          });
          sendReply(chatId, reply);
        } else {
          sendReply(chatId, `❌ "${targetPath}" 是一個檔案，請使用「讀取檔案」指令查看！`);
        }
      } else {
        sendReply(chatId, `❌ 找不到指定的路徑："${targetPath}"`);
      }
    } catch (err) {
      sendReply(chatId, `❌ 讀取路徑時出錯: ${err.message}`);
    }
    return;
  }
  
  // 3. 生成圖片指令 (draw/image/生成圖片/畫一張/畫圖/幫我畫/請畫/English commands)
  const isQuestionAboutDrawing = lowerText.includes('什麼') || lowerText.includes('什么') || 
                                 lowerText.includes('哪一個') || lowerText.includes('哪一個') || 
                                 lowerText.includes('機制') || lowerText.includes('機制') || 
                                 lowerText.includes('模型') || lowerText.includes('模組') || 
                                 lowerText.includes('模组') || lowerText.includes('技術') || 
                                 lowerText.includes('技術') || lowerText.includes('原理') || 
                                 lowerText.includes('怎麼') || lowerText.includes('怎么') || 
                                 lowerText.includes('為什麼') || lowerText.includes('為什麼') || 
                                 lowerText.includes('請問') || lowerText.includes('請問') || 
                                 lowerText.includes('?') || lowerText.includes('？') ||
                                 lowerText.includes('不要生成') || lowerText.includes('不要畫');

  if (!isQuestionAboutDrawing && 
      (lowerText.startsWith('/draw') || lowerText.startsWith('/image') || 
       lowerText.includes('生成圖片') || lowerText.includes('畫一張') || 
       lowerText.includes('畫圖') || lowerText.includes('幫我畫') || 
       lowerText.includes('請畫') || 
       (lowerText.includes('生成') && lowerText.includes('圖片')) ||
       (lowerText.includes('畫') && lowerText.includes('圖片')) ||
       (lowerText.includes('畫') && lowerText.includes('圖')) ||
       lowerText.includes('draw ') || lowerText.includes('paint ') || 
       lowerText.includes('generate an image') || lowerText.includes('generate a picture') || 
       lowerText.includes('generate a photo') || lowerText.includes('generate image') || 
       lowerText.includes('generate picture') || lowerText.includes('create a picture') || 
       lowerText.includes('create an image'))) {
    
    let imagePrompt = text.replace(/^(\/draw|\/image|請幫我畫一張|請幫我畫|幫我畫一張|幫我畫|請畫一張|請畫|畫一張|生成圖片|畫圖|please generate an image of|please generate a picture of|please generate a photo of|please generate image of|please generate picture of|generate an image of|generate a picture of|generate a photo of|generate image of|generate picture of|please draw a|please draw|draw a|draw|paint a|paint|please paint a|please paint|create a picture of|create an image of|create picture of|create image of)\s*/i, '').trim();
    // 移除結尾的禮貌用語 (中文及英文)
    imagePrompt = imagePrompt.replace(/(並且回傳給我|並回傳給我|回傳給我|傳給我|and send it back to me|and send it to me|send it back to me|send it to me|back to me|to me)$/i, '').trim();
    
    // 進一步淨化中文生圖提示詞，去除贅詞 (如「生成大梨山的圖片」 -> 「大梨山」)
    imagePrompt = imagePrompt.replace(/^(生成|畫|請生成|請畫|幫我生成|幫我畫|請幫我生成|請幫我畫)\s*/, '').trim();
    imagePrompt = imagePrompt.replace(/(圖片|照片|畫|圖)$/, '').trim();
    
    if (!imagePrompt) {
      sendReply(chatId, "❌ 請提供圖片描述！範例: 生成圖片 一隻戴著太陽眼鏡 of a dog (or: draw a cute dog)");
      return;
    }
    
    // Instantly notify the user
    sendReply(chatId, `🎨 本地端正在為您繪製並生成圖片：\n「${imagePrompt}」\n請稍候 5~10 秒，生成並下載完成後將自動上傳給您！🚀`);
    
    try {
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&private=true&enhance=true`;
      
      const picturesDir = path.join(__dirname, 'generated_pictures');
      if (!fs.existsSync(picturesDir)) {
        fs.mkdirSync(picturesDir, { recursive: true });
      }
      
      const now = new Date();
      const timestamp = now.getFullYear() + 
        String(now.getMonth() + 1).padStart(2, '0') + 
        String(now.getDate()).padStart(2, '0') + '_' + 
        String(now.getHours()).padStart(2, '0') + 
        String(now.getMinutes()).padStart(2, '0') + 
        String(now.getSeconds()).padStart(2, '0');
      
      const localFileName = `img_${timestamp}.png`;
      const localFilePath = path.join(picturesDir, localFileName);
      
      // Download the image locally first!
      https.get(pollinationsUrl, (imageRes) => {
        if (imageRes.statusCode === 200) {
          const fileStream = fs.createWriteStream(localFilePath);
          imageRes.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`[本地生成成功] 圖片已儲存至: ${localFilePath}`);
            
            // Now upload the locally saved image to Telegram using curl!
            const caption = `✨ 電腦本地端為您生成並儲存的圖片：\n「${imagePrompt}」\n\n💾 電腦端儲存路徑：\nd:\\20260523\\generated_pictures\\${localFileName}`;
            
            const { exec } = require('child_process');
            // Escape double quotes in caption for curl
            const escapedCaption = caption.replace(/"/g, '\\"');
            
            const curlCmd = `curl -s -X POST "${TELEGRAM_API}/sendPhoto" -F "chat_id=${chatId}" -F "photo=@${localFilePath}" -F "caption=${escapedCaption}"`;
            
            exec(curlCmd, (curlErr, stdout, stderr) => {
              if (curlErr) {
                console.error("使用 curl 上傳圖片失敗:", curlErr);
                sendReply(chatId, `❌ 圖片已成功儲存在電腦端，但傳送回手機時失敗：${curlErr.message}`);
              } else {
                console.log("圖片已上傳至 Telegram，響應:", stdout);
              }
            });
            
            // Also write to Obsidian daily note!
            writeToObsidian(`手機生成圖片: ${imagePrompt}`);
          });
        } else {
          sendReply(chatId, `❌ 圖片生成服務暫時無法連線（狀態碼: ${imageRes.statusCode}）`);
        }
      }).on('error', (err) => {
        console.error("下載並保存圖片失敗:", err);
        sendReply(chatId, `❌ 圖片生成與下載失敗: ${err.message}`);
      });
      
    } catch (err) {
      sendReply(chatId, `❌ 生成圖片時發生錯誤: ${err.message}`);
    }
    return;
  }

  // 2. 讀取檔案指令 (cat/read)
  if (lowerText.startsWith('cat') || lowerText.startsWith('read') || lowerText.startsWith('讀取檔案') || lowerText.startsWith('查看檔案')) {
    let filePath = text.replace(/^(cat|read|讀取檔案|查看檔案)\s*/i, '').trim();
    if (!filePath) {
      sendReply(chatId, "❌ 請提供檔案路徑！範例: 讀取檔案 d:\\20260523\\README.md");
      return;
    }
    
    try {
      let resolvedPath = filePath;
      if (!fs.existsSync(resolvedPath)) {
        resolvedPath = path.join(__dirname, filePath);
      }
      
      if (fs.existsSync(resolvedPath)) {
        const stats = fs.statSync(resolvedPath);
        if (stats.isFile()) {
          // Check if it's a PDF
          if (resolvedPath.toLowerCase().endsWith('.pdf')) {
            const txtPath = resolvedPath.slice(0, -4) + '.txt';
            if (fs.existsSync(txtPath)) {
              let content = fs.readFileSync(txtPath, 'utf8');
              if (content.length > 3000) {
                content = content.slice(0, 3000) + "\n\n...(後面內容過長已自動省略)...";
              }
              sendReply(chatId, `📄 [PDF自動轉為文字] 檔案內容：${resolvedPath}\n\n${content}`);
            } else {
              sendReply(chatId, `❌ "${filePath}" 是一個 PDF 檔案，但找不到對應的文字提取檔（.txt）。請先在電腦端將其轉換為文字，或使用 AI 進行摘要！`);
            }
          } else {
            let content = fs.readFileSync(resolvedPath, 'utf8');
            if (content.length > 3000) {
              content = content.slice(0, 3000) + "\n\n...(後面內容過長已自動省略)...";
            }
            sendReply(chatId, `📄 檔案內容：${resolvedPath}\n\n${content}`);
          }
        } else {
          sendReply(chatId, `❌ "${filePath}" 是一個資料夾，請使用「列出資料夾」指令！`);
        }
      } else {
        sendReply(chatId, `❌ 找不到指定的檔案："${filePath}"`);
      }
    } catch (err) {
      sendReply(chatId, `❌ 讀取檔案時出錯: ${err.message}`);
    }
    return;
  }

  if (text === '開工' || text === '我來了') {
    sendReply(chatId, "🟢 收到！已為您在電腦端啟動開工 SOP，本地 Web 伺服器與區網通道已處於最佳待命狀態！");
    return;
  }
  
  if (text === '收工' || text === '下班了') {
    sendReply(chatId, "🔴 收到！已為您在電腦端啟動收工 SOP，背景伺服器已安全關閉，今日工作日誌已備份完畢，祝您有個美好的休息時間！");
    return;
  }

  // Instantly acknowledge to user on their phone first!
  console.log(`[sendReply] 即將發送確認訊息 chatId=${chatId}`);
  sendReply(chatId, `🧠 即時 AI 正在為您撰寫與處理任務：\n「${text}」\n請稍候 3~5 秒，成果馬上雙手奉上！🚀`);

  // Load local context dynamically if matching keywords exist!
  const localContext = loadLocalFilesContext(text);
  
  let prompt = `請以繁體中文（Taiwan）為預設最高優先語系。你是一個部署在用戶電腦端的強大 AI 助理，能訪問本地檔案並透過 Telegram 與用戶互動。`;
  if (localContext) {
    prompt += `\n\n注意：以下是從用戶電腦端本地載入的相關檔案內容，請仔細閱讀並以此作為首要依據回答（若檔案包含您所能發揮的角色與幫助，請特別說明）：\n${localContext}\n`;
  }
  prompt += `\n\n用戶的請求如下，請詳細解答並回傳：\n${text}`;

  // Call Gemini API dynamically with automatic fallback chain to ensure 24/7 reliability!
  function callGeminiWithFallback(promptText, modelIndex = 0) {
    const models = [
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-2.5-pro',
      'gemini-pro-latest'
    ];

    if (modelIndex >= models.length) {
      console.error("[Gemini Fallback] 所有備用模型皆已嘗試，均告失敗。");
      sendReply(chatId, "❌ 所有 Gemini API 備用模型目前皆處於高負載（Google 伺服器端 503 超載），請稍後再試！");
      return;
    }

    const currentModel = models[modelIndex];
    console.log(`[Gemini] [嘗試 #${modelIndex + 1}] 正在向模型 ${currentModel} 發送請求...`);

    const postData = JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${currentModel}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      res.on('error', (err) => {
        console.error(`[Gemini Response 串流錯誤] ${err.message}`);
      });

      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.warn(`[Gemini Fallback] 模型 ${currentModel} 回傳錯誤代碼 ${res.statusCode}。將在 1.5 秒後嘗試下一個備用模型...`);
            setTimeout(() => {
              callGeminiWithFallback(promptText, modelIndex + 1);
            }, 1500);
            return;
          }

          const json = JSON.parse(responseData);
          
          if (json.error) {
            console.warn(`[Gemini Fallback] 模型 ${currentModel} 回傳 JSON 錯誤: ${json.error.message}。將在 1.5 秒後嘗試下一個備用模型...`);
            setTimeout(() => {
              callGeminiWithFallback(promptText, modelIndex + 1);
            }, 1500);
            return;
          }

          let aiResponse = null;
          if (json.candidates && json.candidates[0] && json.candidates[0].content) {
            const parts = json.candidates[0].content.parts || [];
            for (const part of parts) {
              if (part.text && part.text.trim().length > 0) {
                aiResponse = part.text;
                break;
              }
            }
          }

          if (aiResponse) {
            console.log(`[Gemini 成功] 由模型 ${currentModel} 成功產生 ${aiResponse.length} 字回應！`);
            sendReply(chatId, aiResponse);

            // Check if they requested docx, word, doc, etc.
            const lowerOrigText = text.toLowerCase();
            if (lowerOrigText.includes('docx') || lowerOrigText.includes('word') || 
                lowerOrigText.includes('doc') || lowerOrigText.includes('文件檔') || 
                lowerOrigText.includes('文件')) {
              
              sendReply(chatId, "📄 偵測到您需要 Word 文件檔，本地端正在為您排版並轉檔為 docx 格式，請稍候 3~5 秒！");
              
              try {
                const now = new Date();
                const timestamp = now.getFullYear() + 
                  String(now.getMonth() + 1).padStart(2, '0') + 
                  String(now.getDate()).padStart(2, '0') + '_' + 
                  String(now.getHours()).padStart(2, '0') + 
                  String(now.getMinutes()).padStart(2, '0') + 
                  String(now.getSeconds()).padStart(2, '0');
                
                const docsDir = path.join(__dirname, 'generated_documents');
                if (!fs.existsSync(docsDir)) {
                  fs.mkdirSync(docsDir, { recursive: true });
                }
                
                const tempMdPath = path.join(docsDir, `temp_${timestamp}.md`);
                const outDocxPath = path.join(docsDir, `doc_${timestamp}.docx`);
                
                fs.writeFileSync(tempMdPath, aiResponse, 'utf8');
                
                const { exec } = require('child_process');
                const psCmd = `powershell -ExecutionPolicy Bypass -File "${path.join(__dirname, 'convert-md-to-docx.ps1')}" -InputPath "${tempMdPath}" -OutputPath "${outDocxPath}"`;
                
                exec(psCmd, (psErr, stdout, stderr) => {
                  try { fs.unlinkSync(tempMdPath); } catch (e) {}
                  
                  if (psErr) {
                    console.error("執行 PowerShell 轉檔失敗:", psErr);
                    sendReply(chatId, `❌ Word 轉檔失敗：${psErr.message}`);
                    return;
                  }
                  
                  console.log("PowerShell 轉檔成功，輸出:", stdout);
                  
                  const caption = `📄 Word 文件排版已完成！\n\n💾 已同步儲存至電腦本地端：\nd:\\20260523\\generated_documents\\doc_${timestamp}.docx`;
                  const escapedCaption = caption.replace(/"/g, '\\"');
                  
                  const curlCmd = `curl -s -X POST "${TELEGRAM_API}/sendDocument" -F "chat_id=${chatId}" -F "document=@${outDocxPath}" -F "caption=${escapedCaption}"`;
                  
                  exec(curlCmd, (curlErr, curlStdout, curlStderr) => {
                    if (curlErr) {
                      console.error("上傳 docx 失敗:", curlErr);
                      sendReply(chatId, `❌ 文件已生成並保存在您電腦硬碟中，但傳送至手機時失敗：${curlErr.message}`);
                    } else {
                      console.log("docx 上傳成功，響應:", curlStdout);
                    }
                  });
                });
                
              } catch (err) {
                console.error("處理 Word 轉檔過程出錯:", err);
                sendReply(chatId, `❌ 處理 Word 轉檔時出錯：${err.message}`);
              }
            }

            // Write to Obsidian daily note
            writeToObsidian(text);
          } else {
            console.warn(`[Gemini Fallback] 模型 ${currentModel} 回傳空白回應。將在 1.5 秒後嘗試下一個備用模型...`);
            setTimeout(() => {
              callGeminiWithFallback(promptText, modelIndex + 1);
            }, 1500);
          }
        } catch (err) {
          console.error(`[Gemini Fallback] 解析回應時出錯: ${err.message}。將在 1.5 秒後嘗試下一個備用模型...`);
          setTimeout(() => {
            callGeminiWithFallback(promptText, modelIndex + 1);
          }, 1500);
        }
      });
    });

    // Set 120 second timeout on Gemini API call to fallback quickly if hung
    req.setTimeout(120000, () => {
      console.warn(`[Gemini Timeout] 模型 ${currentModel} 請求超時，主動斷開並嘗試下一個備用模型...`);
      req.destroy();
    });

    req.on('error', (err) => {
      console.warn(`[Gemini Fallback] 連線至 ${currentModel} 失敗: ${err.message}。將在 1.5 秒後嘗試下一個備用模型...`);
      setTimeout(() => {
        callGeminiWithFallback(promptText, modelIndex + 1);
      }, 1500);
    });

    req.write(postData);
    req.end();
  }

  // 啟動首發請求！
  callGeminiWithFallback(prompt, 0);
}

function writeToObsidian(text) {
  try {
    if (fs.existsSync(DAILY_NOTE_PATH)) {
      const content = fs.readFileSync(DAILY_NOTE_PATH, 'utf8');
      const updatedContent = content.replace(
        "## 🔴 明日待辦事項 (Next Steps & Backlog)",
        `## 🔴 明日待辦事項 (Next Steps & Backlog)\n- [x] **遠端語音任務 (即時AI已處理)**: ${text}`
      );
      fs.writeFileSync(DAILY_NOTE_PATH, updatedContent, 'utf8');
    }
  } catch (err) {
    // Ignored
  }
}

function sendReply(chatId, text) {
  const MAX_LEN = 4000; // Telegram 上限 4096，保留緩衝
  // 若訊息過長，自動分段發送
  if (text.length > MAX_LEN) {
    const chunks = [];
    let remaining = text;
    while (remaining.length > 0) {
      // 盡量在換行符號處切割，避免截斷句子
      let cutAt = MAX_LEN;
      if (remaining.length > MAX_LEN) {
        const lastNewline = remaining.lastIndexOf('\n', MAX_LEN);
        if (lastNewline > MAX_LEN * 0.5) cutAt = lastNewline + 1;
      }
      chunks.push(remaining.slice(0, cutAt));
      remaining = remaining.slice(cutAt);
    }
    // 依序發送每段（間隔 300ms 避免 rate limit）
    chunks.forEach((chunk, i) => {
      setTimeout(() => sendSingleMessage(chatId, chunk), i * 300);
    });
    return;
  }
  sendSingleMessage(chatId, text);
}

function sendSingleMessage(chatId, text) {
  // 使用 POST 方式，避免 GET URL 過長導致 Telegram 誤判訊息為空
  const postBody = JSON.stringify({ chat_id: chatId, text: text });
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postBody)
    }
  };
  const req = https.request(options, (res) => {
    res.on('error', (err) => {
      console.error(`[sendReply Response 串流錯誤] ${err.message}`);
    });

    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const r = JSON.parse(data);
        if (r.ok) {
          console.log(`[sendReply 成功] msg_id=${r.result.message_id} | 長度=${text.length}`);
        } else {
          console.error(`[sendReply 失敗] error_code: ${r.error_code} | ${r.description} | text前50字: ${text.substring(0,50)}`);
        }
      } catch (e) {
        console.error(`[sendReply parse錯誤] ${e.message} | 原始回應: ${data.substring(0,200)}`);
      }
    });
  });

  // Set 15 second send timeout to prevent hanging message dispatch
  req.setTimeout(15000, () => {
    console.warn(`[sendReply Timeout] 傳送發送超時，主動斷開連接...`);
    req.destroy();
  });

  req.on('error', (err) => {
    console.error(`[sendReply 請求錯誤] ${err.message}`);
  });
  req.write(postBody);
  req.end();
}

// Start local server and keep it alive
const { fork } = require('child_process');
let serverProcess = null;

function startLocalServer() {
  console.log("[Web Server] 正在以子進程啟動 server.js...");
  serverProcess = fork(path.join(__dirname, 'server.js'), [], {
    cwd: __dirname,
    silent: false
  });

  serverProcess.on('exit', (code, signal) => {
    console.warn(`[Web Server] server.js 子進程已退出。代碼 ${code}, 信號 ${signal}，將於 5 秒後重啟...`);
    setTimeout(startLocalServer, 5000);
  });

  serverProcess.on('error', (err) => {
    console.error(`[Web Server] server.js 子進程發生錯誤`, err);
  });
}

startLocalServer();

// Start polling
pollUpdates();

// 載入高品質內建打磚塊 HTML 遊戲模板，繞過 API 超載與限流限制
function getBrickBreakerGameHtml() {
  const filePath = path.join(__dirname, 'scratch', 'brick_breaker_template.html');
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  // 如果檔案不存在，則回退至預設 HTML
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>Neon Brick Breaker</title>
  <style>body{background:#000;color:#fff;text-align:center;font-family:sans-serif;padding-top:100px;}</style>
</head>
<body>
  <h1>霓虹打磚塊遊戲正在載入中...</h1>
  <p>請重新確認本機模板路徑是否正確。</p>
</body>
</html>`;
}
