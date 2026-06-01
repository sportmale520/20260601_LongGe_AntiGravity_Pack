const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'wordcloud-app', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

const GAMES_DIR = path.join(PUBLIC_DIR, 'games');
if (!fs.existsSync(GAMES_DIR)) {
  fs.mkdirSync(GAMES_DIR, { recursive: true });
}

const LOBBY_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌌 Anti-Gravity Premium 遊戲大廳</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Noto+Sans+TC:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0c10;
      --surface: rgba(31, 40, 51, 0.4);
      --border: rgba(102, 252, 241, 0.2);
      --primary: #66fcf1;
      --secondary: #45f3ff;
      --accent: #c5a1ff;
      --text: #f5f5f7;
      --text-muted: #8b9bb4;
      --neon-glow: 0 0 10px rgba(102, 252, 241, 0.5), 0 0 20px rgba(102, 252, 241, 0.2);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background: radial-gradient(circle at center, #1f2833 0%, #0b0c10 100%);
      color: var(--text);
      font-family: 'Outfit', 'Noto Sans TC', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 1.5rem;
    }
    
    header {
      text-align: center;
      margin-bottom: 3.5rem;
      animation: fadeInDown 0.8s ease-out;
    }
    
    h1 {
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: 2px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
      text-shadow: 0 0 40px rgba(102, 252, 241, 0.1);
    }
    
    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      font-weight: 300;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }
    
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-8px);
      border-color: rgba(102, 252, 241, 0.6);
      box-shadow: 0 12px 30px rgba(102, 252, 241, 0.15);
    }
    
    .card:hover::before {
      opacity: 1;
    }
    
    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--primary);
    }
    
    .card-title {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #fff;
    }
    
    .card-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 2rem;
      flex-grow: 1;
    }
    
    .play-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(102, 252, 241, 0.1) 0%, rgba(197, 161, 255, 0.1) 100%);
      border: 1px solid var(--primary);
      color: var(--primary);
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .play-btn:hover {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      color: #0b0c10;
      border-color: transparent;
      box-shadow: var(--neon-glow);
    }
    
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 5rem 2rem;
      background: var(--surface);
      border: 1px dashed var(--border);
      border-radius: 16px;
      backdrop-filter: blur(12px);
    }
    
    .empty-icon {
      font-size: 3.5rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    
    .empty-text {
      color: var(--text-muted);
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    
    .empty-tip {
      color: rgba(102, 252, 241, 0.6);
      font-size: 0.95rem;
    }
    
    footer {
      margin-top: auto;
      padding-top: 5rem;
      color: rgba(255, 255, 255, 0.2);
      font-size: 0.85rem;
      text-align: center;
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>🌌 Anti-Gravity Premium 遊戲大廳</h1>
    <div class="subtitle">手機遙控 AI 生成 • 本地即時託管系統</div>
  </header>
  
  <div class="container">
    {{GAMES_CARDS}}
  </div>
  
  <footer>
    Power by Anti-Gravity AI Engine © 2026
  </footer>
</body>
</html>\n`;

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  let decodedUrl = '';
  try {
    decodedUrl = decodeURIComponent(req.url);
  } catch (e) {
    decodedUrl = req.url;
  }
  
  // Normalize URL path to prevent directory traversal
  let safeSuffix = path.normalize(decodedUrl).replace(/^(\.\.[\/\\])+/, '');
  if (safeSuffix === '/' || safeSuffix === '\\') {
    safeSuffix = 'index.html';
  }
  
  // Dynamic Game Lobby Route
  let normalizedPath = safeSuffix.replace(/\\/g, '/');
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.slice(1);
  }
  if (normalizedPath === 'games' || normalizedPath === 'games/' || normalizedPath === 'games/index.html') {
    fs.readdir(GAMES_DIR, { withFileTypes: true }, (err, files) => {
      let cardsHtml = '';
      const folders = (files || []).filter(f => f.isDirectory()).map(f => f.name);
      
      if (err || folders.length === 0) {
        cardsHtml = `
          <div class="empty-state">
            <div class="empty-icon">🎮</div>
            <div class="empty-text">目前大廳空空如也...</div>
            <div class="empty-tip">快拿起您的手機，在 Telegram 中對機器人發送「做一個彈珠遊戲」來生成第一個遊戲吧！</div>
          </div>
        `;
      } else {
        folders.forEach(folder => {
          let displayName = folder.replace(/^game-/, '').replace(/-[0-9]+$/, '');
          displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          const isChinese = /[\u4e00-\u9fa5]/.test(displayName);
          const title = isChinese ? displayName : `🎮 ${displayName} Game`;
          
          cardsHtml += `
            <div class="card">
              <div class="card-icon">👾</div>
              <div class="card-title">${title}</div>
              <div class="card-desc">一個由 Gemini AI 在本地為您自動生成的高品質網頁遊戲。</div>
              <a class="play-btn" href="/games/${folder}/index.html">立即玩 🚀</a>
            </div>
          `;
        });
      }
      
      const lobbyHtml = LOBBY_TEMPLATE.replace('{{GAMES_CARDS}}', cardsHtml);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(lobbyHtml);
    });
    return;
  }
  
  const filePath = path.join(PUBLIC_DIR, safeSuffix);
  
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    
    let targetFile = filePath;
    if (stats.isDirectory()) {
      targetFile = path.join(filePath, 'index.html');
    }
    
    fs.stat(targetFile, (err2, stats2) => {
      if (err2 || !stats2.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      
      const ext = path.extname(targetFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(targetFile);
      stream.pipe(res);
    });
  });
});

const os = require('os');

server.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`🌌 Anti-Gravity 2 Premium 即時文字雲已在本地與區網啟動！`);
  console.log(`👉 電腦端開啟: http://localhost:${PORT}`);
  console.log(`📱 手機遙控端 (需在同個 Wi-Fi): http://${localIP}:${PORT}`);
  console.log(`==================================================\n`);
});

