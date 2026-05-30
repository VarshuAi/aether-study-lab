let canvas, ctx;
let activeSim = 'kinematics';
let isSimRunning = false;
let simInterval = null;

// Physics Sim state variables
let kinematicsState = {
  u: 20,       // velocity
  theta: 45,   // angle in degrees
  g: 9.8,      // gravity
  t: 0,
  trail: []
};

let fieldState = {
  charges: [
    { x: 200, y: 240, q: 2 },  // Positive
    { x: 480, y: 240, q: -2 }  // Negative
  ]
};

let opticsState = {
  f: 120,      // focal length
  u: -180,     // object distance from lens
  objectHeight: 60
};

function initPhysicsLab() {
  canvas = document.getElementById('lab-canvas');
  ctx = canvas.getContext('2d');

  // Setup tab-specific selectors
  document.getElementById('btn-sim-kinematics').onclick = () => selectSim('kinematics');
  document.getElementById('btn-sim-fields').onclick = () => selectSim('fields');
  document.getElementById('btn-sim-optics').onclick = () => selectSim('optics');

  document.getElementById('btn-sim-run').onclick = runSimulation;
  document.getElementById('btn-sim-reset').onclick = resetSimulation;

  // Bind slider changes to values
  document.getElementById('slider-velocity').oninput = (e) => {
    document.getElementById('val-velocity').textContent = e.target.value;
    kinematicsState.u = parseFloat(e.target.value);
    drawCurrentState();
  };
  document.getElementById('slider-angle').oninput = (e) => {
    document.getElementById('val-angle').textContent = e.target.value;
    kinematicsState.theta = parseFloat(e.target.value);
    drawCurrentState();
  };
  document.getElementById('slider-gravity').oninput = (e) => {
    document.getElementById('val-gravity').textContent = e.target.value;
    kinematicsState.g = parseFloat(e.target.value);
    drawCurrentState();
  };

  // Canvas click listener to place charges in electromagnetism mode!
  canvas.onmousedown = handleCanvasClick;

  selectSim('kinematics');
}

function selectSim(mode) {
  activeSim = mode;
  resetSimulation();

  document.querySelectorAll('.sim-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-sim-${mode}`).classList.add('active');

  const paramPanel = document.getElementById('lab-param-panel');
  
  // Custom slider setups based on simulator
  if (mode === 'kinematics') {
    paramPanel.innerHTML = `
      <div class="slider-field">
        <label>Velocity: <span id="val-velocity">${kinematicsState.u}</span> m/s</label>
        <input type="range" id="slider-velocity" min="5" max="40" value="${kinematicsState.u}">
      </div>
      <div class="slider-field">
        <label>Angle: <span id="val-angle">${kinematicsState.theta}</span>°</label>
        <input type="range" id="slider-angle" min="10" max="85" value="${kinematicsState.theta}">
      </div>
      <div class="slider-field">
        <label>Gravity: <span id="val-gravity">${kinematicsState.g}</span> m/s²</label>
        <input type="range" id="slider-gravity" min="2" max="25" value="${kinematicsState.g}" step="0.1">
      </div>
    `;
    
    // Bind listeners
    document.getElementById('slider-velocity').oninput = (e) => {
      document.getElementById('val-velocity').textContent = e.target.value;
      kinematicsState.u = parseFloat(e.target.value);
      drawCurrentState();
    };
    document.getElementById('slider-angle').oninput = (e) => {
      document.getElementById('val-angle').textContent = e.target.value;
      kinematicsState.theta = parseFloat(e.target.value);
      drawCurrentState();
    };
    document.getElementById('slider-gravity').oninput = (e) => {
      document.getElementById('val-gravity').textContent = e.target.value;
      kinematicsState.g = parseFloat(e.target.value);
      drawCurrentState();
    };

    document.querySelector('.physics-card h4').textContent = "Kinematics Analytics";
  } 
  
  else if (mode === 'fields') {
    paramPanel.innerHTML = `
      <div class="physics-info-alert" style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
        <strong>⚡ Electrostatic Interactive Playground</strong><br>
        Click anywhere inside the dark laboratory grid above to place alternate positive (+) and negative (-) electric charge fields!
      </div>
    `;
    document.querySelector('.physics-card h4').textContent = "Electrostatics Analytics";
  } 
  
  else if (mode === 'optics') {
    paramPanel.innerHTML = `
      <div class="slider-field">
        <label>Lens Focal Length (F): <span id="val-focal">${opticsState.f}</span> px</label>
        <input type="range" id="slider-focal" min="60" max="200" value="${opticsState.f}">
      </div>
      <div class="slider-field">
        <label>Object Distance (u): <span id="val-distance">${opticsState.u}</span> px</label>
        <input type="range" id="slider-distance" min="-300" max="-60" value="${opticsState.u}">
      </div>
    `;

    document.getElementById('slider-focal').oninput = (e) => {
      document.getElementById('val-focal').textContent = e.target.value;
      opticsState.f = parseFloat(e.target.value);
      drawCurrentState();
    };
    document.getElementById('slider-distance').oninput = (e) => {
      document.getElementById('val-distance').textContent = e.target.value;
      opticsState.u = parseFloat(e.target.value);
      drawCurrentState();
    };

    document.querySelector('.physics-card h4').textContent = "Optics Conjugate Analytics";
  }

  drawCurrentState();
}

function handleCanvasClick(e) {
  if (activeSim !== 'fields') return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  // Alternate charges (+2 then -2 then +2)
  const nextQ = fieldState.charges.length % 2 === 0 ? 2 : -2;
  fieldState.charges.push({ x, y, q: nextQ });
  
  drawCurrentState();
}

function drawCurrentState() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (activeSim === 'kinematics') {
    drawKinematics();
  } else if (activeSim === 'fields') {
    drawFields();
  } else if (activeSim === 'optics') {
    drawOptics();
  }
}

function runSimulation() {
  if (isSimRunning) return;
  
  isSimRunning = true;
  
  if (activeSim === 'kinematics') {
    kinematicsState.t = 0;
    kinematicsState.trail = [];
    
    // Boost Intellect and drain energy
    stats.intellect = Math.min(100, stats.intellect + 2);
    stats.energy = Math.max(0, stats.energy - 3);
    saveStats();

    simInterval = setInterval(() => {
      kinematicsState.t += 0.05;
      const angleRad = (kinematicsState.theta * Math.PI) / 180;
      
      const x = kinematicsState.u * Math.cos(angleRad) * kinematicsState.t;
      const y = kinematicsState.u * Math.sin(angleRad) * kinematicsState.t - 0.5 * kinematicsState.g * Math.pow(kinematicsState.t, 2);

      // Floor coordinates
      const cx = 50 + x * 10; // scale
      const cy = canvas.height - 50 - y * 10;

      if (cy > canvas.height - 50) {
        // Collided with floor, stop!
        clearInterval(simInterval);
        isSimRunning = false;
        
        // Calculate max range and height analytically
        const flightTime = (2 * kinematicsState.u * Math.sin(angleRad)) / kinematicsState.g;
        const hRange = (Math.pow(kinematicsState.u, 2) * Math.sin(2 * angleRad)) / kinematicsState.g;
        const maxHeight = (Math.pow(kinematicsState.u, 2) * Math.pow(Math.sin(angleRad), 2)) / (2 * kinematicsState.g);

        document.getElementById('stat-time').textContent = `${flightTime.toFixed(2)}s`;
        document.getElementById('stat-range').textContent = `${hRange.toFixed(2)}m`;
        document.getElementById('stat-height').textContent = `${maxHeight.toFixed(2)}m`;
        
        // Custom congrats welcome speech!
        speakOutLoud(`Trajectory resolved! Projectile reached a range of ${Math.round(hRange)} meters, Varshan!`);
      } else {
        kinematicsState.trail.push({ x: cx, y: cy });
        drawCurrentState();
      }
    }, 20);
  }
}

function resetSimulation() {
  if (simInterval) clearInterval(simInterval);
  isSimRunning = false;

  kinematicsState.t = 0;
  kinematicsState.trail = [];
  
  if (activeSim === 'fields') {
    fieldState.charges = [
      { x: 200, y: 240, q: 2 },
      { x: 480, y: 240, q: -2 }
    ];
  }

  document.getElementById('stat-time').textContent = "0.00s";
  document.getElementById('stat-range').textContent = "0.00m";
  document.getElementById('stat-height').textContent = "0.00m";

  drawCurrentState();
}

// --- SIMULATOR RENDERERS ---

function drawKinematics() {
  // Ground
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 50);
  ctx.lineTo(canvas.width, canvas.height - 50);
  ctx.stroke();

  // Launcher (Cannon)
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.arc(50, canvas.height - 50, 15, 0, Math.PI * 2);
  ctx.fill();

  // Trail
  if (kinematicsState.trail.length > 0) {
    ctx.strokeStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(kinematicsState.trail[0].x, kinematicsState.trail[0].y);
    for (let p of kinematicsState.trail) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset
  }

  // Active Projectile
  if (isSimRunning && kinematicsState.trail.length > 0) {
    const head = kinematicsState.trail[kinematicsState.trail.length - 1];
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFields() {
  const charges = fieldState.charges;

  // Render charge field lines!
  // Traces field lines starting from positive charges out to infinity or negative bounds!
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
  ctx.lineWidth = 1.5;

  charges.forEach(charge => {
    if (charge.q > 0) {
      // Trace 12 radiating field vectors from positive poles
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        let x = charge.x + Math.cos(angle) * 15;
        let y = charge.y + Math.sin(angle) * 15;

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Run tracing step
        for (let step = 0; step < 120; step++) {
          let Ex = 0;
          let Ey = 0;

          // Sum field contributions from all charges
          charges.forEach(other => {
            const dx = x - other.x;
            const dy = y - other.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);
            if (dist < 10) return; // avoid singularities

            const f = other.q / (distSq * dist);
            Ex += dx * f;
            Ey += dy * f;
          });

          // Normalize field vector
          const E = Math.sqrt(Ex * Ex + Ey * Ey);
          if (E === 0) break;
          x += (Ex / E) * 6;
          y += (Ey / E) * 6;

          // Check out of bounds
          if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) break;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  });

  // Render Charge point circles
  charges.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = c.q > 0 ? '#ef4444' : '#3b82f6';
    ctx.fill();

    // Plus/minus sign
    ctx.fillStyle = '#fff';
    ctx.font = '16px bold sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.q > 0 ? '+' : '−', c.x, c.y);
  });

  // Analytics updates
  document.getElementById('stat-time').textContent = `${charges.length} Total`;
  document.getElementById('stat-range').textContent = `${charges.filter(c => c.q > 0).length} Pos (+)`;
  document.getElementById('stat-height').textContent = `${charges.filter(c => c.q < 0).length} Neg (−)`;
}

function drawOptics() {
  const midX = canvas.width / 2;
  const midY = canvas.height / 2;

  // Principal Axis line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(canvas.width, midY);
  ctx.stroke();

  // Focal Points (F1, F2)
  const f = opticsState.f;
  const points = [
    { x: midX - f, label: "F1" },
    { x: midX + f, label: "F2" },
    { x: midX - 2 * f, label: "2F1" },
    { x: midX + 2 * f, label: "2F2" }
  ];

  ctx.fillStyle = varColor('--text-muted');
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';

  points.forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, midY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(pt.label, pt.x, midY + 18);
  });

  // Draw Convex Lens shape
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(midX, midY - 140);
  ctx.lineTo(midX, midY + 140);
  ctx.stroke();
  
  // Arrow heads on lens
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.moveTo(midX, midY - 142);
  ctx.lineTo(midX - 6, midY - 132);
  ctx.lineTo(midX + 6, midY - 132);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(midX, midY + 142);
  ctx.lineTo(midX - 6, midY + 132);
  ctx.lineTo(midX + 6, midY + 132);
  ctx.fill();

  // Draw Object Arrow
  const objX = midX + opticsState.u;
  const objY = midY - opticsState.objectHeight;

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(objX, midY);
  ctx.lineTo(objX, objY);
  ctx.stroke();

  // Object Arrow head
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(objX, objY);
  ctx.lineTo(objX - 5, objY + 8);
  ctx.lineTo(objX + 5, objY + 8);
  ctx.fill();

  // Lens equation math: 1/f = 1/v - 1/u => 1/v = 1/f + 1/u
  const u = opticsState.u;
  const v = 1 / (1 / f + 1 / u);
  const imgX = midX + v;
  const magnification = v / u;
  const imgHeight = opticsState.objectHeight * magnification;
  const imgY = midY + imgHeight;

  // Draw Image Arrow (only if u is outside focal distance)
  if (Math.abs(u) !== f) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(imgX, midY);
    ctx.lineTo(imgX, imgY);
    ctx.stroke();

    // Image Arrow head
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(imgX, imgY);
    ctx.lineTo(imgX - 5, imgY + (imgHeight > 0 ? -8 : 8));
    ctx.lineTo(imgX + 5, imgY + (imgHeight > 0 ? -8 : 8));
    ctx.fill();

    // RAYS DEPICTIONS
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;

    // Ray 1: Parallel to Principal Axis -> refracts through focus (F2)
    ctx.beginPath();
    ctx.moveTo(objX, objY);
    ctx.lineTo(midX, objY);
    ctx.lineTo(imgX, imgY);
    ctx.stroke();

    // Ray 2: Through Optical Center -> continues straight
    ctx.beginPath();
    ctx.moveTo(objX, objY);
    ctx.lineTo(midX, midY);
    ctx.lineTo(imgX, imgY);
    ctx.stroke();
  }

  // Update Metrics
  document.getElementById('stat-time').textContent = `${magnification.toFixed(2)}x`;
  document.getElementById('stat-range').textContent = `${Math.round(Math.abs(v))} px`;
  document.getElementById('stat-height').textContent = `${Math.abs(u)} px`;
}

function varColor(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
