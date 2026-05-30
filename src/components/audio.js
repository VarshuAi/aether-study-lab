let activeAudioChannels = {};

function initAudioModule() {
  document.getElementById('btn-trigger-download').onclick = triggerMediaDownloads;

  // Setup channels listeners
  setupMixerChannel('rain_lofi', 'rain_lofi.mp3');
  setupMixerChannel('synth_study', 'synth_study.mp3');
  setupMixerChannel('chill_piano', 'chill_piano.mp3');

  // Verify if tracks are already available locally
  verifyLocalAudioFiles();
}

function verifyLocalAudioFiles() {
  const tracks = ['rain_lofi', 'synth_study', 'chill_piano'];
  tracks.forEach(track => {
    const audioEl = new Audio(`assets/audio/${track}.mp3`);
    audioEl.addEventListener('canplaythrough', () => {
      document.getElementById(`status-${track}`).textContent = "Ready to Play";
      document.getElementById(`status-${track}`).className = "channel-status ready";
      document.getElementById(`btn-play-${track}`).disabled = false;
    });
    audioEl.addEventListener('error', () => {
      // If error occurs, file is missing and needs downloading
      document.getElementById(`status-${track}`).textContent = "Not Loaded (Setup Required)";
      document.getElementById(`status-${track}`).className = "channel-status";
      document.getElementById(`btn-play-${track}`).disabled = true;
    });
  });
}

function triggerMediaDownloads() {
  const btn = document.getElementById('btn-trigger-download');
  btn.disabled = true;
  btn.textContent = "Setting up assets...";

  if (window.aetherAPI) {
    // Register progress event listener
    window.aetherAPI.onDownloadProgress((prog) => {
      const progressBar = document.getElementById('dl-progress');
      const progressPercent = document.getElementById('dl-percent');
      const trackLabel = document.getElementById('dl-current-track');

      progressBar.style.width = `${prog.percent}%`;
      progressPercent.textContent = `${prog.percent}%`;
      trackLabel.textContent = `Downloading [${prog.index}/${prog.total}] ${prog.track}`;
    });

    // Run downloader task
    window.aetherAPI.downloadAudioPack().then((res) => {
      if (res.success) {
        btn.textContent = "✅ SETUP COMPLETED!";
        document.getElementById('dl-current-track').textContent = "All tracks loaded successfully!";
        verifyLocalAudioFiles();
        
        speakOutLoud("Audio media library fully configured, Varshan! Ready to play chill lofi!");
      } else {
        btn.disabled = false;
        btn.textContent = "⚡ DOWNLOAD AMBIANCE PACK";
        document.getElementById('dl-current-track').textContent = `Setup failed: ${res.error}`;
      }
    });
  }
}

function setupMixerChannel(key, filename) {
  const playBtn = document.getElementById(`btn-play-${key}`);
  const volumeSlider = document.getElementById(`volume-${key}`);

  playBtn.onclick = () => {
    let audio = activeAudioChannels[key];

    if (!audio) {
      audio = new Audio(`assets/audio/${filename}`);
      audio.loop = true;
      activeAudioChannels[key] = audio;
    }

    if (audio.paused) {
      audio.volume = parseFloat(volumeSlider.value);
      audio.play();
      playBtn.classList.add('active');
      playBtn.textContent = "⏸";
    } else {
      audio.pause();
      playBtn.classList.remove('active');
      playBtn.textContent = "▶";
    }
  };

  volumeSlider.oninput = (e) => {
    const audio = activeAudioChannels[key];
    if (audio) {
      audio.volume = parseFloat(e.target.value);
    }
  };
}
