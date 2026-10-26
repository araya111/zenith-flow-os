/* ==========================================================================
   app.js — Master Coordinator for Zenith Flow OS v2
   Handles: themes, keyboard shortcuts, toast system, confetti, chimes, Zen mode
   ========================================================================== */

(function() {
  'use strict';

  // ── Chime Keyboard Setup ───────────────────────────────────────────────────
  const SCALES = {
    pentatonic: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    major:      [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
    minor:      [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16, 523.25],
    blues:      [261.63, 311.13, 349.23, 370.00, 392.00, 466.16, 523.25, 587.33],
  };
  const NOTE_NAMES = {
    pentatonic: ['C4','D4','E4','G4','A4','C5','D5','E5'],
    major:      ['C4','D4','E4','F4','G4','A4','B4','C5'],
    minor:      ['C4','D4','Eb4','F4','G4','Ab4','Bb4','C5'],
    blues:      ['C4','Eb4','F4','F#4','G4','Bb4','C5','D5'],
  };

  let currentScale = 'pentatonic';
  let loopBuffer   = [];
  let loopPlaying  = false;
  let loopInterval = null;

  function buildChimeKeys() {
    const rack      = document.getElementById('chime-keys-rack');
    const scaleSel  = document.getElementById('chime-scale-select');
    const loopBtn   = document.getElementById('chime-loop-btn');
    const clearBtn  = document.getElementById('chime-clear-btn');

    if (!rack) return;
    rack.innerHTML = '';

    const notes    = NOTE_NAMES[currentScale];
    const freqs    = SCALES[currentScale];
    const keyChars = ['1','2','3','4','5','6','7','8'];

    freqs.forEach((freq, i) => {
      const key = document.createElement('div');
      key.className = 'chime-key';
      key.setAttribute('role', 'button');
      key.setAttribute('tabindex', '0');
      key.setAttribute('aria-label', `Play note ${notes[i]} (key ${keyChars[i]})`);
      key.innerHTML = `
        <div class="chime-note">${notes[i]}</div>
        <div class="chime-key-num">${keyChars[i]}</div>
      `;

      function hitKey() {
        if (window.AudioEngine) window.AudioEngine.playChimeNote(freq, 1.4);
        key.classList.add('active-hit');
        setTimeout(() => key.classList.remove('active-hit'), 140);
        if (loopPlaying) loopBuffer.push(freq);
      }

      key.addEventListener('click',   hitKey);
      key.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hitKey(); } });
      rack.appendChild(key);
    });

    if (scaleSel) {
      scaleSel.value = currentScale;
      scaleSel.addEventListener('change', e => {
        currentScale = e.target.value;
        buildChimeKeys();
      });
    }

    if (loopBtn) {
      loopBtn.addEventListener('click', () => {
        loopPlaying = !loopPlaying;
        loopBtn.textContent  = loopPlaying ? '⏹ Recording...' : '⏺ Loop';
        loopBtn.style.color  = loopPlaying ? '#f43f5e' : '';
        if (!loopPlaying && loopBuffer.length > 0) {
          // Playback loop
          let idx = 0;
          clearInterval(loopInterval);
          loopInterval = setInterval(() => {
            if (window.AudioEngine) window.AudioEngine.playChimeNote(loopBuffer[idx], 0.7);
            idx = (idx + 1) % loopBuffer.length;
          }, 400);
          loopBtn.textContent = '⏹ Stop Loop';
          loopBtn.addEventListener('click', () => {
            clearInterval(loopInterval);
            loopBuffer = [];
            loopBtn.textContent = '⏺ Loop';
          }, { once: true });
        } else if (loopPlaying) {
          loopBuffer = [];
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearInterval(loopInterval);
        loopBuffer  = [];
        loopPlaying = false;
        if (loopBtn) loopBtn.textContent = '⏺ Loop';
        showToast('🎵 Loop cleared', '');
      });
    }
  }

  // ── Toast System ───────────────────────────────────────────────────────────
  const toastContainer = document.getElementById('toast-container');
  const toastQueue     = [];
  let   toastVisible   = false;

  function showToast(message, icon) {
    if (!toastContainer) return;
    toastQueue.push({ message, icon });
    if (!toastVisible) dequeueToast();
  }

  function dequeueToast() {
    if (toastQueue.length === 0) { toastVisible = false; return; }
    toastVisible = true;
    const { message, icon } = toastQueue.shift();

    const toast = document.createElement('div');
    toast.className   = 'zenith-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML   = icon
      ? `<span class="toast-sparkle" aria-hidden="true">${icon}</span><span>${message}</span>`
      : `<span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => { toast.remove(); dequeueToast(); }, 320);
    }, 2800);
  }

  // ── Confetti ───────────────────────────────────────────────────────────────
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx    = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let   confettiParts  = [];
  let   confettiAnimId = null;

  window.addEventListener('resize', () => {
    if (confettiCanvas) {
      confettiCanvas.width  = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    if (document.getElementById('ambient-canvas')) {
      document.getElementById('ambient-canvas').width  = window.innerWidth;
      document.getElementById('ambient-canvas').height = window.innerHeight;
    }
    if (document.getElementById('cursor-trail-canvas')) {
      document.getElementById('cursor-trail-canvas').width  = window.innerWidth;
      document.getElementById('cursor-trail-canvas').height = window.innerHeight;
    }
  });

  function launchConfetti(n = 60) {
    if (!confettiCtx || !confettiCanvas) return;
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const COLORS = ['#8b5cf6','#06b6d4','#ec4899','#f97316','#fbbf24','#34d399','#ffffff','#a855f7'];
    for (let i = 0; i < n; i++) {
      confettiParts.push({
        x:    Math.random() * confettiCanvas.width,
        y:    -10 - Math.random() * 80,
        vx:   (Math.random() - 0.5) * 3.5,
        vy:   2 + Math.random() * 3.5,
        rot:  Math.random() * Math.PI * 2,
        vr:   (Math.random() - 0.5) * 0.25,
        w:    6 + Math.random() * 10,
        h:    4 + Math.random() * 6,
        col:  COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      });
    }

    cancelAnimationFrame(confettiAnimId);
    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiCtx || confettiParts.length === 0) {
      if (confettiCtx) confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      return;
    }
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParts = confettiParts.filter(p => p.life > 0 && p.y < confettiCanvas.height + 20);

    confettiParts.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.06; // gravity
      p.rot += p.vr;
      p.life -= 0.007;

      confettiCtx.save();
      confettiCtx.globalAlpha = Math.max(0, p.life);
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.col;
      confettiCtx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      confettiCtx.restore();
    });

    confettiAnimId = requestAnimationFrame(animateConfetti);
  }

  // ── Theme System ────────────────────────────────────────────────────────────
  const THEMES = [
    'bunny-meadow', 'capybara-onsen', 'boba-kitty', 'shiba-sunshine', 'kitsune-foxfire', 'penguin-frost',
    'cyber-obsidian', 'aurora-emerald', 'solar-sunset', 'midnight-abyss', 'neon-sakura'
  ];

  function applyTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
    localStorage.setItem('zfo_theme_v2', name);
    document.querySelectorAll('.theme-option-btn').forEach(btn => {
      const active = btn.dataset.theme === name;
      btn.classList.toggle('active', active);
    });

    // Update cursor trail mode to match cute theme
    if (window.CursorTrail) {
      if (name === 'bunny-meadow' || name === 'boba-kitty' || name === 'shiba-sunshine') {
        window.CursorTrail.setMode('paws');
      } else if (name === 'capybara-onsen') {
        window.CursorTrail.setMode('sakura');
      } else if (name === 'kitsune-foxfire' || name === 'penguin-frost') {
        window.CursorTrail.setMode('stardust');
      }
    }
  }

  document.querySelectorAll('.theme-option-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  // Load saved theme (default to adorable bunny-meadow!)
  const savedTheme = localStorage.getItem('zfo_theme_v2') || 'bunny-meadow';
  applyTheme(savedTheme);

  // ── Zen Mode ───────────────────────────────────────────────────────────────
  let zenMode = false;
  const zenBtn = document.getElementById('zen-mode-toggle');

  function toggleZen() {
    zenMode = !zenMode;
    document.body.classList.toggle('zen-mode-active', zenMode);
    if (zenBtn) {
      zenBtn.classList.toggle('active', zenMode);
      zenBtn.textContent = zenMode ? '✕ Exit Zen' : 'Zen';
    }
    showToast(zenMode ? '🧘 Zen mode activated — pure focus' : '✨ Returning to full dashboard', '');
  }

  if (zenBtn) zenBtn.addEventListener('click', toggleZen);

  // ── Mute All ────────────────────────────────────────────────────────────────
  let muted    = false;
  const muteBtn = document.getElementById('mute-all-btn');

  function toggleMute() {
    muted = !muted;
    if (window.AudioEngine) window.AudioEngine.setMuted(muted);
    if (muteBtn) muteBtn.classList.toggle('muted', muted);
    showToast(muted ? '🔇 All sounds muted' : '🔊 Sound restored', '');
  }

  if (muteBtn) muteBtn.addEventListener('click', toggleMute);

  // Master volume slider
  const masterVol = document.getElementById('master-volume-slider');
  if (masterVol) {
    masterVol.addEventListener('input', e => {
      if (window.AudioEngine) window.AudioEngine.setMasterVolume(parseInt(e.target.value) / 100);
    });
  }

  // Preset buttons
  document.querySelectorAll('.sound-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.AudioEngine) window.AudioEngine.applyPreset(btn.dataset.preset);
      showToast(`🎧 Preset: ${btn.textContent.trim()}`, '');
    });
  });

  // All-off button
  const allOffBtn = document.getElementById('audio-all-off-btn');
  if (allOffBtn) allOffBtn.addEventListener('click', () => {
    if (window.AudioEngine) window.AudioEngine.stopAll();
    showToast('🔇 All sounds stopped', '');
  });

  // Thunder button
  const thunderBtn = document.getElementById('thunder-btn');
  if (thunderBtn) thunderBtn.addEventListener('click', () => {
    if (window.AudioEngine) window.AudioEngine.thunderBurst();
  });

  // ── Shortcuts Modal ────────────────────────────────────────────────────────
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const shortcutsBtn   = document.getElementById('shortcuts-btn');
  const modalCloseBtn  = document.getElementById('modal-close-btn');

  function openShortcuts() {
    if (shortcutsModal) shortcutsModal.classList.remove('hidden');
  }
  function closeShortcuts() {
    if (shortcutsModal) shortcutsModal.classList.add('hidden');
  }

  if (shortcutsBtn)  shortcutsBtn.addEventListener('click',  openShortcuts);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeShortcuts);
  if (shortcutsModal) shortcutsModal.addEventListener('click', e => {
    if (e.target === shortcutsModal) closeShortcuts();
  });

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  const KEY_ACTIONS = {
    ' ':  () => { if (window.FlowTimer) window.FlowTimer.toggle(); },
    'r':  () => { if (window.FlowTimer) window.FlowTimer.reset(); },
    'z':  () => toggleZen(),
    'm':  () => toggleMute(),
    't':  () => { if (window.AudioEngine) window.AudioEngine.thunderBurst(); },
    'f':  () => { if (window.FateEngine) window.FateEngine.flipCoin(); },
    's':  () => { if (window.FateEngine) window.FateEngine.spin(); },
    '?':  () => openShortcuts(),
  };

  // Chime number keys 1–8
  for (let k = 1; k <= 8; k++) {
    const key = String(k);
    KEY_ACTIONS[key] = () => {
      const keys = document.querySelectorAll('.chime-key');
      if (keys[k-1]) keys[k-1].click();
    };
  }

  document.addEventListener('keydown', e => {
    // Skip if typing in an input
    if (['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) return;
    if (e.key === 'Escape') closeShortcuts();

    const handler = KEY_ACTIONS[e.key.toLowerCase()] || KEY_ACTIONS[e.key];
    if (handler) {
      e.preventDefault();
      handler();
    }
  });

  // ── 3D Tilt on glass panels ────────────────────────────────────────────────
  document.querySelectorAll('.glass-panel').forEach(panel => {
    panel.addEventListener('mousemove', e => {
      const rect   = panel.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / rect.width;
      const dy     = (e.clientY - cy) / rect.height;
      const rx     = dy * -8;
      const ry     = dx * 8;
      panel.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.01,1.01,1.01)`;
    });
    panel.addEventListener('mouseleave', () => {
      panel.style.transform = '';
    });
  });

  // ── Init ────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    buildChimeKeys();

    // Confetti canvas size
    if (confettiCanvas) {
      confettiCanvas.width  = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }

    // Cursor Trail Mode Button
    const cursorBtn = document.getElementById('cursor-mode-btn');
    if (cursorBtn && window.CursorTrail) {
      cursorBtn.addEventListener('click', () => {
        const next = window.CursorTrail.cycleMode();
        const icons = { paws: '🐾 Paws', sakura: '🌸 Sakura', stardust: '✨ Stars' };
        cursorBtn.innerHTML = `<span>${icons[next] || next}</span>`;
        showToast(`Cursor: ${icons[next] || next}`, '');
      });
    }

    // Welcome toast
    setTimeout(() => {
      showToast('🐾 Welcome to Zenith Animal Sanctuary & Flow OS!', '🌸');
    }, 800);
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  window.Zenith = {
    showToast,
    launchConfetti,
    toggleZen,
    toggleMute,
    isZenMode: () => zenMode,
    isMuted:   () => muted,
  };

})();
