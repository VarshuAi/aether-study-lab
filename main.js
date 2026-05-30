require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 650,
    frame: true,         // Elegant standard header
    autoHideMenuBar: true, // Hide file menu for pure workspace focus
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();
  startActiveWindowScanner();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// --- AUDIO TRACKS DATABASE (PUBLIC DIRECT HIGH-SPEED STREAMS) ---
const TRACKS_REGISTRY = {
  rain_lofi: {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    filename: "rain_lofi.mp3",
    label: "Chill Rain Lofi Loop"
  },
  synth_study: {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    filename: "synth_study.mp3",
    label: "Focus Deep Synth Beats"
  },
  chill_piano: {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    filename: "chill_piano.mp3",
    label: "Mellow Study Piano"
  },
  zen_focus: {
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    filename: "zen_focus.mp3",
    label: "Zen Concentration Stream"
  }
};

// --- IPC IPC BACKEND HANDLERS ---

// 1. Multi-Threaded Audio Loops Downloader
ipcMain.handle('audio-download-all', async (event) => {
  const targetDir = path.join(__dirname, 'src', 'assets', 'audio');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const trackKeys = Object.keys(TRACKS_REGISTRY);
  let completed = 0;

  for (const key of trackKeys) {
    const track = TRACKS_REGISTRY[key];
    const destPath = path.join(targetDir, track.filename);

    // If file already exists and is not empty, skip downloading!
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 10000) {
      completed++;
      mainWindow.webContents.send('download-progress', {
        track: track.label,
        percent: 100,
        index: completed,
        total: trackKeys.length
      });
      continue;
    }

    try {
      mainWindow.webContents.send('download-progress', {
        track: track.label,
        percent: 0,
        index: completed + 1,
        total: trackKeys.length
      });

      await downloadFile(track.url, destPath, (bytesRead, totalBytes) => {
        const percent = Math.round((bytesRead / totalBytes) * 100);
        mainWindow.webContents.send('download-progress', {
          track: track.label,
          percent: percent,
          index: completed + 1,
          total: trackKeys.length
        });
      });

      completed++;
    } catch (err) {
      console.error(`Failed to download ${track.label}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
});

function downloadFile(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get status 200, got: ${response.statusCode}`));
        return;
      }

      const totalBytes = parseInt(response.headers['content-length'], 10) || 0;
      let bytesRead = 0;

      response.on('data', (chunk) => {
        bytesRead += chunk.length;
        file.write(chunk);
        if (onProgress && totalBytes > 0) {
          onProgress(bytesRead, totalBytes);
        }
      });

      response.on('end', () => {
        file.end();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete local partial file on error
      reject(err);
    });
  });
}

// 2. Safe Shell system execute bridge
ipcMain.handle('system-execute', async (event, { action, param }) => {
  return new Promise((resolve) => {
    try {
      switch (action) {
        case 'open_url':
          exec(`start "" "${param}"`, (err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
          });
          break;
          
        case 'launch_app':
          let cmd = param.toLowerCase() === 'code' ? 'code' : param;
          exec(`start "" "${cmd}"`, (err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
          });
          break;

        case 'git_sync':
          const folderPath = "C:\\Users\\Varshan\\Documents\\antigravity\\magical-hypatia";
          exec(`cd "${folderPath}" && git add . && git commit -m "sync: auto-commit from Aether Lab 🔮" && git push`, (err, stdout) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true, data: stdout });
          });
          break;

        case 'sys_info':
          exec('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value', (err, stdout) => {
            if (err) {
              resolve({ success: false, error: err.message });
            } else {
              const lines = stdout.split('\n');
              let free = 0, total = 0;
              for (const line of lines) {
                if (line.includes('FreePhysicalMemory')) free = parseInt(line.split('=')[1], 10);
                if (line.includes('TotalVisibleMemorySize')) total = parseInt(line.split('=')[1], 10);
              }
              const usedPercent = Math.round(((total - free) / total) * 100);
              resolve({ success: true, data: { freeKB: free, totalKB: total, percent: usedPercent } });
            }
          });
          break;

        default:
          resolve({ success: false, error: `Unknown system action: ${action}` });
      }
    } catch (e) {
      resolve({ success: false, error: e.message });
    }
  });
});

// 3. Multimodal Study Companion Brain (Gemini 3.5 Router)
ipcMain.handle('ai-chat', async (event, { userMessage, chatHistory, activeWindow }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is missing from local .env config!" };
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-3.5-flash" });

    const systemPrompt = `
    You are "Aether AI", an incredibly intelligent, witty, and supportive offline learning companion integrated into Project Aether (Varshan's premium study laboratory).
    You talk out loud and support him in both coding (LeetCode) and JEE studies (Physics, Chemistry, Math).
    
    Current active desktop context: Varshan is currently viewing this window: "${activeWindow || 'Aether Studio'}"

    YOUR CAPABILITIES:
    You can trigger local OS actions by returning a structured command JSON block.
    Supported actions:
    1. "open_url" (param: URL string) - e.g. "https://leetcode.com" or "https://pw.live"
    2. "launch_app" (param: "code", "notepad", "calc") - e.g. launches VS Code
    3. "git_sync" (no param) - commits and pushes LeetCode files.
    4. "sys_info" (no param) - measures memory metrics.
    5. "none" (no param) - basic conversational chat.

    Your spoken response must be high-energy, encouraging, and complete in 1-2 structured sentences.
    You must respond ONLY with a clean JSON block matching the schema below. No markdown fences.

    JSON SCHEMA:
    {
      "speech": "spoken response to Varshan",
      "action": "one of the supported action strings, or 'none'",
      "param": "string parameter or null",
      "animation": "happy" | "thinking" | "sleeping" | "idle"
    }
    `;

    let messages = [{ role: "user", parts: [{ text: systemPrompt }] }];
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }
    messages.push({ role: "user", parts: [{ text: userMessage }] });

    const chat = model.startChat({ history: messages });
    const result = await chat.sendMessage(userMessage);
    let cleanJson = result.response.text().trim();

    if (cleanJson.startsWith('```')) {
      const lines = cleanJson.split('\n');
      cleanJson = lines.slice(1, -1).join('\n').trim();
    }

    try {
      const parsed = JSON.parse(cleanJson);
      return { success: true, ...parsed };
    } catch (e) {
      return {
        success: true,
        speech: cleanJson.substring(0, 150),
        action: "none",
        param: null,
        animation: "idle"
      };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// --- WIN32 ACTIVE WINDOW SCANNER ---
function startActiveWindowScanner() {
  setInterval(() => {
    if (!mainWindow) return;

    const psCommand = `powershell -Command "Add-Type '@[DllImport(\\"user32.dll\\")] public static extern IntPtr GetForegroundWindow(); [DllImport(\\"user32.dll\\")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);' -Name 'Win32' -Namespace 'API'; [IntPtr]$handle = [API.Win32]::GetForegroundWindow(); $Builder = New-Object System.Text.StringBuilder 256; [void][API.Win32]::GetWindowText($handle, $Builder, 256); $Builder.ToString()"`;

    exec(psCommand, (err, stdout) => {
      if (err) return;
      const activeTitle = stdout.trim();
      if (activeTitle) {
        mainWindow.webContents.send('active-window', activeTitle);
      }
    });
  }, 2000);
}
