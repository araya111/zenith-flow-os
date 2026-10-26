/* ==========================================================================
   timer.js — Flow Chronometer for Zenith Flow OS v2
   Pomodoro / Short Break / Long Break / Stopwatch
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_KEY = 'zfo_timer_stats_v2';

  // ── Config ─────────────────────────────────────────────────────────────────
  const MODE_DURATIONS = {
    pomodoro:  25 * 60,
    short:      5 * 60,
    long:      15 * 60,
    stopwatch:  0        // counts up
  };

  const MODE_LABELS = {
    pomodoro: 'FOCUS',
    short:    'SHORT BREAK',
    long:     'LONG BREAK',
    stopwatch:'STOPWATCH'
  };

  // ── State ──────────────────────────────────────────────────────────────────
  let mode       = 'pomodoro';
  let totalSec   = MODE_DURATIONS.pomodoro;
  let remaining  = totalSec;
  let running    = false;
  let intervalId = null;
  let sessionsToday = 0;
  let focusMinToday = 0;
  let xpEarnedToday = 0;

  // Circle math
  const CIRCUMFERENCE = 2 * Math.PI * 92; // ≈ 578

  // ── DOM ────────────────────────────────────────────────────────────────────
  const timerDigits   = document.getElementById('timer-digits');
  const timerSubStatus = document.getElementById('timer-sub-status');
  const timerModeLabel = document.getElementById('timer-mode-label');
  const playBtn       = document.getElementById('timer-play-btn');
  const playIcon      = document.getElementById('play-icon');
  const pauseIcon     = document.getElementById('pause-icon');
  const resetBtn      = document.getElementById('timer-reset-btn');
  const skipBtn       = document.getElementById('timer-skip-btn');
  const ring          = document.getElementById('timer-progress-ring');
  const glowDot       = document.getElementById('timer-glow-dot');
  const modePills     = document.querySelectorAll('.timer-mode-pill');
  const presetBtns    = document.querySelectorAll('.timer-preset-btn');

  // Stat elements
  const statSessions  = document.getElementById('stat-sessions');
  const statFocusMin  = document.getElementById('stat-focus-min');
  const statXp        = document.getElementById('stat-xp');

  // ── Load persisted daily stats ─────────────────────────────────────────────
  function loadStats() {
    try {
      const raw   = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data  = JSON.parse(raw);
      const today = new Date().toLocaleDateString('en-CA');
      if (data.date === today) {
        sessionsToday = data.sessions || 0;
        focusMinToday = data.focusMin || 0;
        xpEarnedToday = data.xp      || 0;
      }
    } catch(e) {}
    updateStatsUI();
  }

  function saveStats() {
    const today = new Date().toLocaleDateString('en-CA');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: today, sessions: sessionsToday, focusMin: focusMinToday, xp: xpEarnedToday
    }));
  }

  function updateStatsUI() {
    if (statSessions)  statSessions.textContent  = sessionsToday;
    if (statFocusMin)  statFocusMin.textContent  = focusMinToday;
    if (statXp)        statXp.textContent        = xpEarnedToday;
  }

  // ── Display helpers ────────────────────────────────────────────────────────
  function fmtTime(s) {
    const h  = Math.floor(s / 3600);
    const m  = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }

  function updateDisplay() {
    if (timerDigits) timerDigits.textContent = fmtTime(remaining);

    // Progress ring
    if (ring && mode !== 'stopwatch') {
      const progress = totalSec > 0 ? remaining / totalSec : 1;
      const offset   = CIRCUMFERENCE * (1 - progress);
      ring.style.strokeDasharray  = CIRCUMFERENCE;
      ring.style.strokeDashoffset = offset;

      // Glow dot position along circle
      if (glowDot) {
        const angle  = -Math.PI / 2 + (1 - progress) * 2 * Math.PI;
        const cx     = 100 + 92 * Math.cos(angle);
        const cy     = 100 + 92 * Math.sin(angle);
        glowDot.setAttribute('cx', cx);
        glowDot.setAttribute('cy', cy);
      }
    } else if (ring && mode === 'stopwatch') {
      ring.style.strokeDasharray  = CIRCUMFERENCE;
      ring.style.strokeDashoffset = -(remaining % CIRCUMFERENCE);
    }

    document.title = running ? `${fmtTime(remaining)} — Zenith Flow OS` : 'Zenith Flow OS';
  }

  // ── Timer core ─────────────────────────────────────────────────────────────
  function tick() {
    if (mode === 'stopwatch') {
      remaining++;
    } else {
      remaining--;
      if (remaining <= 0) {
        remaining = 0;
        updateDisplay();
        onSessionComplete();
        return;
      }
    }
    updateDisplay();
  }

  function onSessionComplete() {
    stop();
    if (mode === 'pomodoro') {
      const minsCompleted = Math.round(totalSec / 60);
      sessionsToday++;
      focusMinToday += minsCompleted;
      const xpGain = minsCompleted * 4;
      xpEarnedToday += xpGain;
      saveStats();
      updateStatsUI();

      // Record in analytics
      if (window.FocusAnalytics) window.FocusAnalytics.recordSession(minsCompleted);

      // Award XP via tasks module
      if (window.QuestLog) window.QuestLog.addXP(xpGain);

      // Chime!
      if (window.AudioEngine) window.AudioEngine.playMilestoneChime();

      // Toast
      if (window.Zenith) window.Zenith.showToast(`🎉 Focus session complete! +${xpGain} XP`, '✨');

      // Pet event
      document.dispatchEvent(new CustomEvent('timerComplete', { detail: { mode, xp: xpGain } }));

      // Confetti!
      if (window.Zenith) window.Zenith.launchConfetti(60);
    }

    if (timerSubStatus) timerSubStatus.textContent = mode === 'pomodoro' ? 'Session complete! 🎉' : 'Break over!';
  }

  function start() {
    if (running) return;
    running = true;
    intervalId = setInterval(tick, 1000);

    if (playIcon)  playIcon.style.display  = 'none';
    if (pauseIcon) pauseIcon.style.display = 'block';

    if (timerDigits) timerDigits.classList.add('running');
    if (timerSubStatus) timerSubStatus.textContent = mode === 'stopwatch' ? 'Counting up...' : 'In the zone 🔥';

    document.dispatchEvent(new CustomEvent('timerStart', { detail: { mode } }));
  }

  function pause() {
    if (!running) return;
    running = false;
    clearInterval(intervalId);

    if (playIcon)  playIcon.style.display  = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';

    if (timerDigits) timerDigits.classList.remove('running');
    if (timerSubStatus) timerSubStatus.textContent = 'Paused — take a breath';
  }

  function stop() {
    pause();
    document.dispatchEvent(new CustomEvent('timerStop', { detail: { mode } }));
  }

  function reset() {
    stop();
    remaining = mode === 'stopwatch' ? 0 : totalSec;
    updateDisplay();
    if (timerSubStatus) timerSubStatus.textContent = 'Ready to flow ✨';
  }

  function togglePlayPause() {
    if (window.AudioEngine) window.AudioEngine.initCtx();
    running ? pause() : start();
  }

  // ── Mode switching ─────────────────────────────────────────────────────────
  function setMode(m) {
    stop();
    mode      = m;
    totalSec  = MODE_DURATIONS[m];
    remaining = totalSec;

    modePills.forEach(pill => {
      const isActive = pill.dataset.mode === m;
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (timerModeLabel) timerModeLabel.textContent = MODE_LABELS[m] || m.toUpperCase();
    if (timerSubStatus) timerSubStatus.textContent = 'Ready to flow ✨';
    updateDisplay();
    document.dispatchEvent(new CustomEvent('timerStop', { detail: { mode: m } }));
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  if (playBtn)  playBtn.addEventListener('click',  togglePlayPause);
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (skipBtn)  skipBtn.addEventListener('click', () => { stop(); onSessionComplete(); });

  modePills.forEach(pill => {
    pill.addEventListener('click', () => setMode(pill.dataset.mode));
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.dataset.minutes);
      stop();
      totalSec  = mins * 60;
      remaining = totalSec;
      mode      = 'pomodoro';
      setMode('pomodoro');
      if (window.Zenith) window.Zenith.showToast(`⏱ Timer set to ${mins} minutes`, '');
    });
  });

  // ── Public API ─────────────────────────────────────────────────────────────
  window.FlowTimer = {
    start, pause, toggle: togglePlayPause, reset,
    setMode,
    isRunning: () => running,
    getMode:   () => mode,
    getRemaining: () => remaining,
  };

  // ── Init ────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    updateDisplay();
  });

})();
