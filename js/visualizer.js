/* ==========================================================================
   visualizer.js — 60fps Canvas Visualizer for Zenith Flow OS v2
   Modes: Constellation, Warp, Aurora
   ========================================================================== */

(function() {
  'use strict';

  const canvas = document.getElementById('ambient-canvas');
  const ctx    = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width  = W;
  canvas.height = H;

  let mode   = 'constellation';
  let animId = null;
  let frame  = 0;

  let mouseX = W / 2;
  let mouseY = H / 2;

  // ── Stars / Constellation ─────────────────────────────────────────────────
  const NUM_STARS = 140;
  const stars     = [];

  class Star {
    constructor() { this.reset(true); }
    reset(random) {
      this.x    = random ? Math.random() * W : W / 2;
      this.y    = random ? Math.random() * H : H / 2;
      this.r    = Math.random() * 1.6 + 0.3;
      this.vx   = (Math.random() - 0.5) * 0.22;
      this.vy   = (Math.random() - 0.5) * 0.22;
      this.life = Math.random() * 300 + 100;
      this.age  = 0;
      this.alpha = 0;
    }
    update() {
      const mx  = (mouseX - W/2) * 0.012;
      const my  = (mouseY - H/2) * 0.012;
      this.x   += this.vx + mx * 0.003;
      this.y   += this.vy + my * 0.003;
      this.age++;
      this.alpha = this.age < 40
        ? this.age / 40
        : Math.max(0, 1 - (this.age - (this.life - 40)) / 40);
      if (this.age >= this.life || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset(false);
    }
    draw() {
      ctx.globalAlpha = this.alpha * 0.7;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  function initStars() { for (let i = 0; i < NUM_STARS; i++) stars.push(new Star()); }

  function drawConnections() {
    const DIST = 110;
    ctx.lineWidth = 0.4;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx   = stars[i].x - stars[j].x;
        const dy   = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < DIST) {
          const alpha = (1 - dist / DIST) * 0.15 * Math.min(stars[i].alpha, stars[j].alpha);
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = '#8b5cf6';
          ctx.stroke();
        }
      }
    }
  }

  // Mouse proximity glow
  function drawMouseOrb() {
    const rad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180);
    rad.addColorStop(0, 'rgba(139,92,246,0.045)');
    rad.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 180, 0, Math.PI * 2);
    ctx.fillStyle = rad;
    ctx.fill();
  }

  // ── Warp Mode ─────────────────────────────────────────────────────────────
  const NUM_WARP = 160;
  const warpStars = [];

  class WarpStar {
    constructor() { this.reset(); }
    reset() {
      this.x    = (Math.random() - 0.5) * W;
      this.y    = (Math.random() - 0.5) * H;
      this.z    = Math.random() * W;
      this.pz   = this.z;
      this.speed = 8 + Math.random() * 12;
    }
    update() {
      this.pz = this.z;
      this.z -= this.speed;
      if (this.z <= 0) this.reset();
    }
    draw() {
      const sx  = (this.x  / this.z)  * W + W/2;
      const sy  = (this.y  / this.z)  * H + H/2;
      const px  = (this.x  / this.pz) * W + W/2;
      const py  = (this.y  / this.pz) * H + H/2;
      const size = Math.max(0.5, (1 - this.z / W) * 3.5);
      ctx.globalAlpha = (1 - this.z / W) * 0.9;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = size;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }
  }

  function initWarp() { for (let i = 0; i < NUM_WARP; i++) warpStars.push(new WarpStar()); }

  // ── Aurora Mode ───────────────────────────────────────────────────────────
  const AURORA_BANDS = 4;
  const auroraPhases = Array.from({ length: AURORA_BANDS }, () => Math.random() * Math.PI * 2);
  const auroraSpeeds = Array.from({ length: AURORA_BANDS }, () => 0.0008 + Math.random() * 0.0012);
  const auroraColors = [
    ['rgba(139,92,246,0.06)', 'rgba(139,92,246,0)'],
    ['rgba(6,182,212,0.05)',  'rgba(6,182,212,0)'],
    ['rgba(236,72,153,0.04)','rgba(236,72,153,0)'],
    ['rgba(16,185,129,0.04)','rgba(16,185,129,0)'],
  ];

  function drawAurora() {
    for (let b = 0; b < AURORA_BANDS; b++) {
      auroraPhases[b] += auroraSpeeds[b];
      const t = auroraPhases[b];

      ctx.save();
      ctx.globalAlpha = 1;

      const points = [];
      const SEGMENTS = 12;
      for (let i = 0; i <= SEGMENTS; i++) {
        const px = (i / SEGMENTS) * W;
        const py = H * (0.25 + b * 0.18) +
                   Math.sin(t + i * 0.4) * H * 0.06 +
                   Math.sin(t * 1.7 + i * 0.7) * H * 0.03;
        points.push({ x: px, y: py });
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const mx = (points[i].x + points[i+1].x) / 2;
        const my = (points[i].y + points[i+1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
      }
      ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
      ctx.lineTo(W, H); ctx.lineTo(0, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, H * 0.15, 0, H * 0.7);
      grad.addColorStop(0, auroraColors[b][0]);
      grad.addColorStop(1, auroraColors[b][1]);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Main render loops ─────────────────────────────────────────────────────
  const MODES = {
    constellation() {
      ctx.clearRect(0, 0, W, H);
      drawMouseOrb();
      stars.forEach(s => { s.update(); s.draw(); });
      drawConnections();
      ctx.globalAlpha = 1;
    },

    warp() {
      // Motion blur trail
      ctx.fillStyle = 'rgba(4,5,9,0.22)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      warpStars.forEach(s => { s.update(); s.draw(); });
      ctx.globalAlpha = 1;
    },

    aurora() {
      ctx.clearRect(0, 0, W, H);
      drawAurora();
      stars.forEach(s => { s.update(); s.draw(); });
      ctx.globalAlpha = 1;
    }
  };

  function loop() {
    frame++;
    (MODES[mode] || MODES.constellation)();
    animId = requestAnimationFrame(loop);
  }

  // ── Cycle mode button ──────────────────────────────────────────────────────
  const modeNames = ['constellation', 'warp', 'aurora'];
  const modLabels = { constellation: '⭐ Starfield', warp: '🚀 Warp Speed', aurora: '🌌 Aurora' };

  const modeBtn = document.getElementById('visualizer-mode-btn');
  function cycleMode() {
    const idx = modeNames.indexOf(mode);
    mode = modeNames[(idx + 1) % modeNames.length];
    if (modeBtn) modeBtn.textContent = modLabels[mode];

    // Re-initialize mode if needed
    if (mode === 'constellation' && stars.length === 0)   initStars();
    if (mode === 'warp'          && warpStars.length === 0) initWarp();

    if (window.Zenith && window.Zenith.showToast)
      window.Zenith.showToast(`✨ Switched to ${modLabels[mode]} mode`, '');
  }
  if (modeBtn) modeBtn.addEventListener('click', cycleMode);

  // ── Resize ────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
  });

  // Mouse tracking
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  initStars();
  initWarp();
  loop();

  window.Visualizer = {
    setMode(m) { if (MODES[m]) mode = m; }
  };

})();
