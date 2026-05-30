const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aetherAPI', {
  // Trigger multi-threaded audio loop downloader
  downloadAudioPack: () => ipcRenderer.invoke('audio-download-all'),
  
  // Safe OS task executor registry
  systemExecute: (action, param) => ipcRenderer.invoke('system-execute', { action, param }),
  
  // Gemini 3.5 structured AI router
  aiChat: (userMessage, chatHistory, activeWindow) => ipcRenderer.invoke('ai-chat', { userMessage, chatHistory, activeWindow }),
  
  // Real-time IPC listeners
  onActiveWindow: (callback) => ipcRenderer.on('active-window', (event, title) => callback(title)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, progress) => callback(progress))
});
