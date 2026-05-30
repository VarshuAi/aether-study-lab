# Project Aether: Ultimate Developer Studio & AI Physics Study Lab 🔮

Project Aether is a highly comprehensive, production-grade, asset-rich desktop workspace designed to assist programmers (LeetCode) and students (JEE Preparations). 

Aether bundles interactive 2D canvas physics visualizers, Monaco code editor sandboxes, mechanical switch clicky key synthesizers, offline mock examinations, and an integrated multi-threaded background lofi audio mixing board.

---

## 💎 Premium Integrated Modules

### ⚛️ 1. Physics Visualizer & Simulation Lab
* Interactive 2D visual physics environments computed on high-performance Canvas elements:
  - **Projectile Kinematics**: Plot parabolic ranges, flight times, and heights by configuring initial velocity, gravity, and angles.
  - **Electrostatic Field Lines**: Click anywhere inside the laboratory grid to place positive and negative charges and watch electrostatic vector field lines render dynamically in real-time.
  - **Optics Ray-Tracer**: Slide lens focal lengths and object distances to calculate conjugate image heights and principal rays.

### 💻 2. Monaco Code Workspace & Mechanical switch Synth
* Houses a local Monaco Editor code playground (powering VS Code) with auto-layout and syntax highlighting for Javascript, Python, and C++.
* Integrates a **Mechanical Keyboard Synthesizer** (Web Audio API). Every keypress triggers realistic mechanical clacks, spacebar clicks play heavy wooden space clacks, and Enter sounds a deep double-stroke clack.

### 📝 3. Offline Exam Board & Metrics
* Evaluates preparatory JEE/Math questions using a local dataset containing Physics, Calculus, and Computer Science questions.
* Features grading, score markers, and comprehensive mathematical breakdowns of solutions.
* Exam success awards Care XP, which automatically synchronizes with your taskbar companion Pico!

### 🎵 4. Lofi Mixing Board & Multi-Threaded Setup
* Mix separate channels of Rain Lofi, Deep Synth beats, and Chill Piano tracks.
* Includes a **Main Process Downloader**. Clicking "Download Ambiance Pack" spawns background download streams that pull copyright-free MP3 loops directly to your local workspace, immediately building a **25MB - 50MB** high-fidelity audio library on your hard drive!

### 💬 5. Integrated Pico AI Companion
* Communicates directly with your desktop companion Pico.
* Toggles speech recognition mic transcription and speaks responses out-loud using cute high-pitched Speech Synthesis.

---

## 🛠️ Architecture and Setup

### 📂 Directory Layout
```
├── package.json              # App configuration
├── main.js                   # Node.js Electron main window
├── preload.js                # Secure Context isolated IPC
├── .env                      # Gemini API keys
├── .gitignore                # Safely ignores key files & audio loops
└── src/
    ├── index.html            # Main SPA dashboard
    ├── style.css             # HSL Neumorphic styling
    ├── app.js                # Core frontend router
    ├── assets/               # Local question databases & loops
    └── components/           # Lab, Exam, Monaco, Mixer, and Chat modules
```

### 🚀 Launch Guide
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Configure credentials in a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Run the application:
   ```powershell
   npm start
   ```
