// --- GLOBAL APPLICATION STATE & METRICS ---
let stats = {
  energy: 85,
  affection: 70,
  intellect: 45
};

let solvedQuestionsCount = 0;
let chatHistory = [];
let currentActiveWindow = 'Aether Studio';

// Load saved stats and solved counts from localStorage to sync with the floating pet Pico!
function loadStats() {
  if (localStorage.getItem('pico_stats')) {
    try {
      stats = JSON.parse(localStorage.getItem('pico_stats'));
    } catch (e) {}
  }
  if (localStorage.getItem('pico_solved_questions')) {
    solvedQuestionsCount = parseInt(localStorage.getItem('pico_solved_questions'), 10) || 0;
  }
  updateStatsUI();
}

function saveStats() {
  localStorage.setItem('pico_stats', JSON.stringify(stats));
  localStorage.setItem('pico_solved_questions', solvedQuestionsCount);
  updateStatsUI();
}

function updateStatsUI() {
  document.getElementById('pico-energy').style.width = `${stats.energy}%`;
  document.getElementById('pico-affection').style.width = `${stats.affection}%`;
  document.getElementById('pico-intellect').style.width = `${stats.intellect}%`;
  
  document.getElementById('stats-solved-count').textContent = solvedQuestionsCount;
}

// --- TAB ROUTING COORDINATOR ---
const TABS = {
  lab: { title: "Physics Visualizer Lab", subtitle: "Interactive mechanical vector environments" },
  exam: { title: "Offline Mock Exam Board", subtitle: "Practice preparatory JEE question sheets" },
  workspace: { title: "Monaco Developer Workspace", subtitle: "Code sandbox with real mechanical keyboard sounds" },
  audio: { title: "Lofi Audio Deck", subtitle: "Auto-download and mix background focus loops" },
  chat: { title: "Aether Study Companion", subtitle: "Discuss equations and sketch algorithms with Pico" }
};

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.getAttribute('data-tab');
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  // Toggle Navigation buttons
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`nav-${tabName}`).classList.add('active');

  // Toggle Viewports
  document.querySelectorAll('.tab-content').forEach(view => view.classList.remove('active'));
  document.getElementById(`tab-content-${tabName}`).classList.add('active');

  // Update Headers
  document.getElementById('tab-title').textContent = TABS[tabName].title;
  document.getElementById('tab-subtitle').textContent = TABS[tabName].subtitle;

  // Initialize specific tab logic
  if (tabName === 'lab') {
    initPhysicsLab();
  } else if (tabName === 'exam') {
    initExamModule();
  } else if (tabName === 'workspace') {
    initWorkspace();
  } else if (tabName === 'audio') {
    initAudioModule();
  } else if (tabName === 'chat') {
    initChatModule();
  }
}

// --- ACTIVE WINDOW MONITOR & FOREGROUND CONTEXT ---
if (window.aetherAPI) {
  window.aetherAPI.onActiveWindow((title) => {
    currentActiveWindow = title;
    document.getElementById('header-status-msg').textContent = `Watching: ${title}`;
  });
}

// --- AUDIO SPEECH SYNTHESIS ENGINE ---
let synth = window.speechSynthesis;
let speakVoice = null;

function loadVoice() {
  const voices = synth.getVoices();
  // Prefer Microsoft Zira or David, or standard Google/English
  speakVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Zira') || v.name.includes('David'))) || voices[0];
}
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = loadVoice;
} else {
  loadVoice();
}

function speakOutLoud(text) {
  if (!text) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (speakVoice) {
    utterance.voice = speakVoice;
  }
  utterance.pitch = 1.15;
  utterance.rate = 1.05;
  synth.speak(utterance);
}

// --- DOM ON CONTENT LOAD INITIALIZER ---
window.addEventListener('DOMContentLoaded', () => {
  loadStats();
  
  // Start with the Physics Visualizer Lab
  switchTab('lab');
});
