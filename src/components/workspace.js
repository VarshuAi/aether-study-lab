let editor = null;
let audioCtx = null;

function initWorkspace() {
  const mountEl = document.getElementById('monaco-mount');
  if (mountEl && !editor) {
    if (window.require) {
      window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.39.0/min/vs' } });
      window.require(['vs/editor/editor.main'], function () {
        createMonacoEditor();
      });
    }
  }

  // Initialize Web Audio context for mechanical sounds
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
}

function createMonacoEditor() {
  const container = document.getElementById('monaco-mount');
  if (!container) return;

  editor = monaco.editor.create(container, {
    value: `// --- Project Aether Code Sandbox ---\n// Try typing here! Real mechanical key clacks are synthesized natively ⌨️\n\nfunction findTwoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconsole.log(findTwoSum([2, 7, 11, 15], 9)); // => [0, 1]\n`,
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 14,
    fontFamily: 'Fira Code, monospace',
    minimap: { enabled: false },
    automaticLayout: true
  });

  // Attach key press sounds to content changes
  editor.onDidChangeModelContent((event) => {
    const isSynthChecked = document.getElementById('chk-synth').checked;
    if (!isSynthChecked) return;

    // Detect if space, enter, or regular keys were typed
    const changes = event.changes[0];
    if (changes) {
      const text = changes.text;
      if (text === ' ') {
        playMechanicalClack('space');
      } else if (text === '\n' || text === '\r\n') {
        playMechanicalClack('enter');
      } else {
        playMechanicalClack('key');
      }
    }
  });

  // Language selectors
  document.getElementById('editor-lang-select').onchange = (e) => {
    if (editor) {
      monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
    }
  };
}

// --- MECHANICAL KEYBOARD SYNTHESIZER (WEB AUDIO API) ---
function playMechanicalClack(type) {
  if (!audioCtx) return;

  // Resume context if suspended
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Synthesize custom clicks via oscillator and noise sweeps
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'space') {
    // Heavy wooden clack for spacebar
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  } 
  
  else if (type === 'enter') {
    // Bell click or solid metallic double sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);

    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  } 
  
  else {
    // Normal mechanical switch clack (Chery MX Blue/Brown clack!)
    // Subtle high-pitch click followed by short wooden thud
    const oscPitch = 220 + Math.random() * 80; // Add organic frequency jitter!
    osc.type = 'sine';
    osc.frequency.setValueAtTime(oscPitch, now);
    osc.frequency.exponentialRampToValueAtTime(oscPitch * 0.5, now + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.035);

    osc.start(now);
    osc.stop(now + 0.035);
  }
}
