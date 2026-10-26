/* ==========================================================================
   breathing.js — Breath Coach for Zenith Flow OS v2
   ========================================================================== */

(function() {
  'use strict';

  // Patterns: [inhale, hold, exhale, hold2] in seconds (0 = skip phase)
  const PATTERNS = {
    box:      { phases: [4, 4, 4, 4], name: 'Box Breathing',     desc: 'Equal 4-count cycle for focus & calm' },
    '478':    { phases: [4, 7, 8, 0], name: '4-7-8 Calm',        desc: 'Powerful for anxiety & sleep onset' },
    hrv:      { phases: [5.5,0,5.5,0],name: '5.5s HRV Coherence',desc: 'Optimal heart rate variability balance' },
    energize: { phases: [6, 2, 6, 0], name: 'Energizing 6-2-6',  desc: 'Activate energy & mental clarity' },
  };

  const PHASE_NAMES = ['inhale', 'hold', 'exhale', 'hold2'];
  const PHASE_LABELS = { inhale: 'Inhale 🌬', hold: 'Hold 🤫', exhale: 'Exhale 💨', hold2: 'Rest 🌿' };
  const PHASE_INSTRUCTIONS = {
    inhale:  'Breathe in slowly through your nose',
    hold:    'Hold your breath gently',
    exhale:  'Exhale slowly through your mouth',
    hold2:   'Rest before next breath',
  };

  // ── State ──────────────────────────────────────────────────────────────────
  let pattern    = PATTERNS['box'];
  let running    = false;
  let cycles     = 0;
  let phaseIdx   = 0;
  let phaseTime  = 0;
  let intervalId = null;

  // ── DOM ────────────────────────────────────────────────────────────────────
  const halo          = document.getElementById('breath-halo');
  const phaseEl       = document.getElementById('breath-phase');
  const timerReadout  = document.getElementById('breath-timer-readout');
  const instrEl       = document.getElementById('breath-instructions');
  const cycleCountEl  = document.getElementById('breath-cycle-count');
  const startBtn      = document.getElementById('breath-start-btn');
  const patternSel    = document.getElementById('breath-pattern-select');
  const patternDesc   = document.getElementById('breath-pattern-desc');

  // ── Halo animation ─────────────────────────────────────────────────────────
  function animateHalo(phaseName, duration) {
    if (!halo) return;
    halo.style.transition = 'none';
    // Reset
    void halo.offsetWidth; // force reflow

    let targetScale, animStyle;
    if (phaseName === 'inhale') {
      targetScale = 1.28;
      animStyle   = `transform ${duration}s ease-in, opacity ${duration}s ease-in, box-shadow ${duration}s ease-in`;
    } else if (phaseName === 'hold' || phaseName === 'hold2') {
      targetScale = phaseName === 'hold' ? 1.28 : 0.88;
      animStyle   = `none`;
    } else { // exhale
      targetScale = 0.88;
      animStyle   = `transform ${duration}s ease-out, opacity ${duration}s ease-out, box-shadow ${duration}s ease-out`;
    }

    halo.style.transition = animStyle;
    halo.style.transform  = `scale(${targetScale})`;

    const opacity  = phaseName === 'inhale' ? 1 : phaseName === 'exhale' ? 0.7 : 0.85;
    halo.style.opacity = opacity;

    const glow = phaseName === 'inhale' ? '0 0 50px var(--accent-2), 0 0 90px rgba(6,182,212,0.3)' : '0 0 15px var(--accent-2)';
    halo.style.boxShadow = glow;
  }

  // ── Phase management ────────────────────────────────────────────────────────
  function getActivePhases() {
    return pattern.phases.map((dur, i) => ({ name: PHASE_NAMES[i], duration: dur }))
                         .filter(p => p.duration > 0);
  }

  function startPhase(idx) {
    const phases = getActivePhases();
    if (phases.length === 0) return;

    phaseIdx = idx % phases.length;
    if (phaseIdx === 0 && idx > 0) cycles++;

    const phase = phases[phaseIdx];
    phaseTime   = phase.duration;

    if (phaseEl)      phaseEl.textContent     = PHASE_LABELS[phase.name] || phase.name;
    if (instrEl)      instrEl.textContent     = PHASE_INSTRUCTIONS[phase.name] || '';
    if (cycleCountEl) cycleCountEl.textContent = `Cycles: ${cycles}`;

    animateHalo(phase.name, phase.duration);

    // Audio cue
    if (window.AudioEngine) window.AudioEngine.playBreathTone(phase.name);

    updateTimerReadout();
  }

  function updateTimerReadout() {
    if (timerReadout) timerReadout.textContent = `${phaseTime.toFixed(0)}s`;
  }

  function tick() {
    phaseTime -= 0.1;
    updateTimerReadout();
    if (phaseTime <= 0) {
      startPhase(phaseIdx + 1);
    }
  }

  function startBreathing() {
    if (running) {
      stop();
      return;
    }

    running   = true;
    phaseIdx  = 0;
    cycles    = 0;
    if (startBtn) startBtn.textContent = '⏹ Stop';
    startPhase(0);
    intervalId = setInterval(tick, 100);
  }

  function stop() {
    running = false;
    clearInterval(intervalId);
    if (startBtn) startBtn.textContent = '▶ Start';
    if (halo) {
      halo.style.transition = 'all 0.5s ease';
      halo.style.transform  = 'scale(1)';
      halo.style.boxShadow  = '';
    }
    if (phaseEl) phaseEl.textContent = 'Ready';
    if (timerReadout) timerReadout.textContent = '—';
    if (instrEl) instrEl.textContent = 'Press start';
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  if (startBtn)    startBtn.addEventListener('click',  startBreathing);
  if (patternSel)  patternSel.addEventListener('change', e => {
    stop();
    pattern = PATTERNS[e.target.value] || PATTERNS['box'];
    if (patternDesc) patternDesc.textContent = pattern.desc;
  });

  window.BreathCoach = { start: startBreathing, stop };

})();
