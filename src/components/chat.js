let chatRecognition = null;
let isChatListening = false;

function initChatModule() {
  document.getElementById('btn-chat-send').onclick = () => submitChatMessage();
  document.getElementById('chat-text-input').onkeydown = (e) => {
    if (e.key === 'Enter') submitChatMessage();
  };

  document.getElementById('btn-chat-mic').onclick = toggleChatMic;

  // Initialize Web Speech Recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    chatRecognition = new SpeechRecognitionClass();
    chatRecognition.continuous = false;
    chatRecognition.interimResults = false;
    chatRecognition.lang = 'en-US';

    chatRecognition.onstart = () => {
      isChatListening = true;
      document.getElementById('btn-chat-mic').classList.add('listening');
    };

    chatRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('chat-text-input').value = transcript;
      submitChatMessage(transcript);
    };

    chatRecognition.onerror = (event) => {
      console.error('Speech recognition error in chat', event.error);
      stopChatMic();
    };

    chatRecognition.onend = () => {
      stopChatMic();
    };
  } else {
    document.getElementById('btn-chat-mic').style.display = 'none';
  }
}

function toggleChatMic() {
  if (!chatRecognition) return;
  if (isChatListening) {
    chatRecognition.stop();
  } else {
    chatRecognition.start();
  }
}

function stopChatMic() {
  isChatListening = false;
  document.getElementById('btn-chat-mic').classList.remove('listening');
}

async function submitChatMessage(customText) {
  const inputEl = document.getElementById('chat-text-input');
  const message = (customText || inputEl.value).trim();
  if (!message) return;

  inputEl.value = '';
  
  // Render user bubble
  appendChatBubble('user', message);

  // Render thinking loader bubble
  const loaderId = appendChatBubble('model', 'Thinking...', true);

  if (window.aetherAPI) {
    // Send request to Gemini main process IPC
    const response = await window.aetherAPI.aiChat(message, chatHistory, currentActiveWindow);
    
    // Remove loader
    document.getElementById(loaderId).remove();

    if (response.success) {
      // Render model bubble
      appendChatBubble('model', response.speech);
      
      // Speak response out loud!
      speakOutLoud(response.speech);

      // Save to chat history
      chatHistory.push({ role: 'user', content: message });
      chatHistory.push({ role: 'model', content: response.speech });
      if (chatHistory.length > 10) chatHistory.shift();

      // Trigger returned local OS actions
      if (response.action && response.action !== 'none') {
        const sysResult = await window.aetherAPI.systemExecute(response.action, response.param);
        if (sysResult.success) {
          if (response.action === 'git_sync') {
            appendChatBubble('model', '⚙️ System: LeetCode files synchronized and pushed to GitHub!');
            speakOutLoud('LeetCode repository synchronized successfully!');
            
            stats.intellect = Math.min(100, stats.intellect + 6);
          } else if (response.action === 'sys_info') {
            const ram = sysResult.data;
            const ramText = `System RAM is at ${ram.percent}% usage with ${Math.round(ram.freeKB / 1024 / 1024)} GB free.`;
            appendChatBubble('model', `⚙️ System Memory Metrics:\n${ramText}`);
            speakOutLoud(ramText);
          } else if (response.action === 'launch_app' || response.action === 'open_url') {
            stats.intellect = Math.min(100, stats.intellect + 3);
            stats.energy = Math.max(0, stats.energy - 6);
          }
          saveStats();
        } else {
          appendChatBubble('model', `⚙️ System Error: ${sysResult.error}`);
        }
      }
    } else {
      appendChatBubble('model', `Connection glitched: ${response.error}`);
    }
  }
}

function appendChatBubble(sender, text, isLoader = false) {
  const viewport = document.getElementById('chat-viewport');
  const bubble = document.createElement('div');
  const bubbleId = `bubble-${Date.now()}`;
  
  bubble.className = `chat-bubble ${sender}`;
  bubble.id = bubbleId;
  bubble.textContent = text;
  
  viewport.appendChild(bubble);
  viewport.scrollTop = viewport.scrollHeight;

  return bubbleId;
}
