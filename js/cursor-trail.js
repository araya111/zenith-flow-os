/* ==========================================================================
   cursor-trail.js — Adorable Animal Paw & Particle Trail for Zenith Flow OS
   Modes: 'paws' (🐾 animal paw prints), 'sakura' (🌸 petals), 'stardust' (✨ stars)
   ========================================================================== */

(function() {
  'use strict';

  const canvas = document.getElementById('cursor-trail-canvas');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  canvas.width  = W;
  canvas.height = H;

  const particles = [];
  let mouseX = -999, mouseY = -999;
  let lastSpawnDist = 0;
  let lastX = -999, lastY = -999;
  let animId  = null;
  let enabled = true;
  let trailMode = 'paws'; // 'paws' | 'sakura' | 'stardust'
  let stepSide = 0;       // alternating left/right paws

  const MAX_PARTICLES = 40;

  function getAccentColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#f472b6';
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  class Particle {
    constructor(x, y, mode = trailMode, isBurst = false) {
      this.mode  = mode;
      this.life  = 1;
      this.decay = isBurst ? (0.02 + Math.random() * 0.02) : (0.016 + Math.random() * 0.014);
      this.scale = isBurst ? (0.8 + Math.random() * 0.7) : (0.65 + Math.random() * 0.35);
      this.rot   = Math.random() * Math.PI * 2;
      this.vRot  = (Math.random() - 0.5) * 0.04;

      if (isBurst) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      } else {
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -0.2 - Math.random() * 0.4;
      }

      // Slightly offset alternating paws for natural gait
      stepSide = 1 - stepSide;
      const sideOffset = (stepSide === 0 ? -9 : 9);
      this.x = x + (isBurst ? 0 : sideOffset);
      this.y = y;

      const palette = [
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#f472b6',
        getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#c084fc',
        getComputedStyle(document.documentElement).getPropertyValue('--accent-3').trim() || '#fde047',
      ];
      const pick = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      this.r = pick.r; this.g = pick.g; this.b = pick.b;
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.rot  += this.vRot;
      this.life -= this.decay;
      this.scale*= 0.99;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      ctx.scale(this.scale, this.scale);
      ctx.globalAlpha = Math.max(0, this.life) * 0.85;

      if (this.mode === 'paws') {
        this.drawPaw(ctx);
      } else if (this.mode === 'sakura') {
        this.drawSakura(ctx);
      } else {
        this.drawStar(ctx);
      }

      ctx.restore();
    }

    drawPaw(ctx) {
      const col = `rgba(${this.r},${this.g},${this.b},${this.life})`;
      ctx.fillStyle = col;
      ctx.shadowColor = `rgba(${this.r},${this.g},${this.b},0.6)`;
      ctx.shadowBlur = 8;

      // Main palm pad (slightly bean-shaped)
      ctx.beginPath();
      ctx.ellipse(0, 3, 7, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4 Cute Little Toes
      const toes = [
        { dx: -6.5, dy: -4, rx: 2.2, ry: 2.8, rot: -0.3 },
        { dx: -2.3, dy: -7, rx: 2.4, ry: 3.2, rot: -0.1 },
        { dx:  2.3, dy: -7, rx: 2.4, ry: 3.2, rot:  0.1 },
        { dx:  6.5, dy: -4, rx: 2.2, ry: 2.8, rot:  0.3 },
      ];
      toes.forEach(t => {
        ctx.beginPath();
        ctx.ellipse(t.dx, t.dy, t.rx, t.ry, t.rot, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    drawSakura(ctx) {
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.life * 0.9})`;
      ctx.shadowColor = `rgba(${this.r},${this.g},${this.b},0.5)`;
      ctx.shadowBlur = 6;
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(4, -8, 8, -10, 0, -14);
        ctx.bezierCurveTo(-8, -10, -4, -8, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    drawStar(ctx) {
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.life})`;
      ctx.shadowColor = `rgba(${this.r},${this.g},${this.b},0.8)`;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 8, -Math.sin((18 + i * 72) * Math.PI / 180) * 8);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 3.5, -Math.sin((54 + i * 72) * Math.PI / 180) * 3.5);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  function spawnParticles(x, y, n, isBurst = false) {
    for (let i = 0; i < n; i++) {
      if (particles.length >= MAX_PARTICLES) {
        particles.shift();
      }
      particles.push(new Particle(x, y, trailMode, isBurst));
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.draw(ctx);
    }
    animId = requestAnimationFrame(loop);
  }

  // Mouse tracking with distance threshold so paw prints look like steps
  document.addEventListener('mousemove', e => {
    if (!enabled) return;
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 28) { // distance between steps
      spawnParticles(mouseX, mouseY, 1, false);
      lastX = mouseX;
      lastY = mouseY;
    }
  });

  // Click burst: showers paws/sparkles!
  document.addEventListener('click', e => {
    if (!enabled) return;
    spawnParticles(e.clientX, e.clientY, 10, true);
  });

  // Window Resize
  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
  });

  // Public API
  window.CursorTrail = {
    start() { enabled = true; if (!animId) loop(); },
    stop()  { enabled = false; },
    toggle(){ enabled ? this.stop() : this.start(); },
    setMode(mode) {
      if (['paws', 'sakura', 'stardust'].includes(mode)) {
        trailMode = mode;
      }
    },
    cycleMode() {
      const modes = ['paws', 'sakura', 'stardust'];
      const next = modes[(modes.indexOf(trailMode) + 1) % modes.length];
      this.setMode(next);
      return next;
    },
    getMode() { return trailMode; },
    isEnabled() { return enabled; }
  };

  loop();
})();
