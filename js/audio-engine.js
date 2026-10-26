/* ==========================================================================
   audio-engine.js — Web Audio API Procedural Synthesis Engine
   Zenith Flow OS v2
   ========================================================================== */

(function() {
  'use strict';

  let ctx       = null;
  let masterGain = null;
  let masterVol  = 0.70;
  let muted      = false;

  const activeNodes = {};   // channelId -> { gain, oscillators, sources, ... }

  // ── Init AudioContext ────────────────────────────────────────────────────
  function initCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = masterVol;
    masterGain.connect(ctx.destination);
  }

  function resumeCtx() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // ── Sound channel definitions ─────────────────────────────────────────────
  const CHANNELS = [
    { id: 'purr',      label: 'Kitty Purr', icon: '🐱', sub: 'Calming 40Hz purr',  color: '#fb923c' },
    { id: 'crickets',  label: 'Crickets',   icon: '🦗', sub: 'Summer night song', color: '#a78bfa' },
    { id: 'rain',      label: 'Rain',       icon: '🌧', sub: 'White noise rain',   color: '#38bdf8' },
    { id: 'campfire',  label: 'Campfire',   icon: '🔥', sub: 'Crackling fire',    color: '#f97316' },
    { id: 'ocean',     label: 'Ocean',      icon: '🌊', sub: 'Deep sea waves',    color: '#06b6d4' },
    { id: 'binaural',  label: 'Binaural',   icon: '🎵', sub: 'Alpha waves 10 Hz', color: '#8b5cf6' },
    { id: 'lofi',      label: 'Lo-Fi',      icon: '🎹', sub: 'Chords & melody',   color: '#a855f7' },
    { id: 'drone',     label: 'Drone',      icon: '🔊', sub: 'Ambient hum',       color: '#6366f1' },
    { id: 'forest',    label: 'Forest',     icon: '🌿', sub: 'Birds & wind',      color: '#34d399' },
    { id: 'chimes',    label: 'Wind Chimes',icon: '✨', sub: 'Gentle chimes',     color: '#fbbf24' },
  ];

  // ── Build Mixer UI ────────────────────────────────────────────────────────
  function buildMixerUI() {
    const list = document.getElementById('sound-channels-list');
    if (!list) return;
    list.innerHTML = '';

    CHANNELS.forEach(ch => {
      const item = document.createElement('div');
      item.className = 'sound-channel-item';
      item.setAttribute('role', 'listitem');
      item.innerHTML = `
        <div class="channel-info">
          <div class="channel-icon" aria-hidden="true">${ch.icon}</div>
          <div>
            <div class="channel-name">${ch.label}</div>
            <div class="channel-sub">${ch.sub}</div>
          </div>
        </div>
        <div class="slider-container">
          <input type="range" class="zenith-slider" id="slider-${ch.id}"
            min="0" max="100" value="0"
            aria-label="${ch.label} volume" />
        </div>
      `;
      list.appendChild(item);

      document.getElementById(`slider-${ch.id}`).addEventListener('input', e => {
        const vol = parseInt(e.target.value) / 100;
        setChannel(ch.id, vol);
      });
    });
  }

  // ── Sound generators ──────────────────────────────────────────────────────

  function makeRain(gainNode) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop   = true;

    const lpf  = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 1200;
    const hpf  = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 200;

    src.connect(lpf); lpf.connect(hpf); hpf.connect(gainNode);
    src.start();
    return { type: 'rain', sources: [src], filters: [lpf, hpf] };
  }

  function makeCampfire(gainNode) {
    // Low-rumble crackle using two noise layers
    const bufLen = ctx.sampleRate * 3;
    const buf1   = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d1     = buf1.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d1.length; i++) {
      const white = Math.random() * 2 - 1;
      last = 0.95 * last + 0.05 * white;
      d1[i] = last * 6;         // boost brownian
    }

    const src1 = ctx.createBufferSource();
    src1.buffer = buf1;
    src1.loop   = true;

    const lpf  = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 600;
    const wav  = ctx.createGain();
    src1.connect(lpf); lpf.connect(wav); wav.connect(gainNode);

    // Crackle LFO modulation
    const lfo  = ctx.createOscillator(); lfo.type = 'sawtooth'; lfo.frequency.value = 1.5;
    const lfoG = ctx.createGain();       lfoG.gain.value = 0.3;
    lfo.connect(lfoG); lfoG.connect(wav.gain);

    src1.start(); lfo.start();
    return { type: 'campfire', sources: [src1], oscillators: [lfo] };
  }

  function makeOcean(gainNode) {
    const bufLen = ctx.sampleRate * 4;
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d      = buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < d.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + white*0.0555179;
      b1 = 0.99332*b1 + white*0.0750759;
      b2 = 0.96900*b2 + white*0.1538520;
      b3 = 0.86650*b3 + white*0.3104856;
      b4 = 0.55000*b4 + white*0.5329522;
      b5 = -0.7616*b5 - white*0.0168980;
      d[i] = (b0+b1+b2+b3+b4+b5+b6 + white*0.5362)*0.11;
      b6 = white * 0.115926;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lpf  = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 800;
    src.connect(lpf); lpf.connect(gainNode);
    src.start();
    return { type: 'ocean', sources: [src] };
  }

  function makeBinaural(gainNode) {
    // 200 Hz carrier, 10 Hz beat (alpha)
    const freq  = 200;
    const beat  = 10;
    const oscs  = [];
    ['left','right'].forEach((side, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq + (i === 0 ? 0 : beat);
      const splitter = ctx.createChannelMerger(2);
      const panner   = ctx.createStereoPanner();
      panner.pan.value = i === 0 ? -1 : 1;
      o.connect(panner); panner.connect(gainNode);
      o.start();
      oscs.push(o);
    });
    return { type: 'binaural', oscillators: oscs };
  }

  function makeLofi(gainNode) {
    // Simple chord progression with detuned oscillators
    const CHORD_PROG = [
      [261.63, 329.63, 392.00],  // C major
      [220.00, 293.66, 349.23],  // Am
      [196.00, 246.94, 329.63],  // G major
      [174.61, 220.00, 261.63],  // F major
    ];
    const oscs = [];
    let chord = 0;
    const chordDuration = 2.0; // seconds per chord

    function playChord(chordIdx, startTime) {
      const freqs = CHORD_PROG[chordIdx % CHORD_PROG.length];
      freqs.forEach((freq, i) => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = freq * (i === 2 ? 0.5 : 1); // bass octave trick
        o.detune.value    = (Math.random() - 0.5) * 18; // slight warmth
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(0.25, startTime + 0.08);
        env.gain.setValueAtTime(0.25, startTime + chordDuration - 0.12);
        env.gain.linearRampToValueAtTime(0, startTime + chordDuration);
        const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 1800;
        o.connect(env); env.connect(lpf); lpf.connect(gainNode);
        o.start(startTime);
        o.stop(startTime + chordDuration);
        oscs.push(o);
      });
    }

    // Schedule ahead
    function schedule() {
      const now   = ctx.currentTime;
      const until = now + 8;
      let t       = now;
      while (t < until) {
        playChord(chord, t);
        chord = (chord + 1) % CHORD_PROG.length;
        t    += chordDuration;
      }
    }
    schedule();
    const interval = setInterval(() => {
      if (!activeNodes['lofi']) { clearInterval(interval); return; }
      schedule();
    }, 6000);

    return { type: 'lofi', oscillators: oscs, cleanup: () => clearInterval(interval) };
  }

  function makeDrone(gainNode) {
    const baseFreq = 55; // A1
    const oscs     = [];
    [1, 2, 3, 4].forEach(harmonic => {
      const o = ctx.createOscillator();
      o.type = harmonic === 1 ? 'sine' : 'triangle';
      o.frequency.value = baseFreq * harmonic;
      o.detune.value    = (Math.random() - 0.5) * 8;
      const g = ctx.createGain();
      g.gain.value = 0.3 / harmonic;
      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 600;
      o.connect(g); g.connect(lpf); lpf.connect(gainNode);
      o.start();
      oscs.push(o);
    });
    return { type: 'drone', oscillators: oscs };
  }

  function makeForest(gainNode) {
    // Pink noise for wind + occasional bird chirps
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    let b0=0, b1=0, b2=0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765*b0 + w*0.0990460;
      b1 = 0.96300*b1 + w*0.2965164;
      b2 = 0.57000*b2 + w*1.0526913;
      d[i] = (b0+b1+b2 + w*0.1848) * 0.1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const lpf  = ctx.createBiquadFilter(); lpf.type = 'bandpass'; lpf.frequency.value = 400; lpf.Q.value = 0.5;
    src.connect(lpf); lpf.connect(gainNode);
    src.start();

    // Chirp periodically
    let chirpTimer;
    function chirp() {
      if (!activeNodes['forest']) return;
      const o    = ctx.createOscillator(); o.type = 'sine';
      const oG   = ctx.createGain();
      const now  = ctx.currentTime;
      const freq = 800 + Math.random() * 1200;
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.08);
      oG.gain.setValueAtTime(0, now);
      oG.gain.linearRampToValueAtTime(0.3, now + 0.03);
      oG.gain.linearRampToValueAtTime(0, now + 0.18);
      o.connect(oG); oG.connect(gainNode);
      o.start(now); o.stop(now + 0.25);
      chirpTimer = setTimeout(chirp, 1200 + Math.random() * 4000);
    }
    chirpTimer = setTimeout(chirp, 1000);

    return { type: 'forest', sources: [src], cleanup: () => clearTimeout(chirpTimer) };
  }

  function makeWindChimes(gainNode) {
    // Periodic random metallic pings
    const FREQS = [523.25, 659.25, 783.99, 1046.50, 880, 1174.66, 1318.51, 1567.98];
    let timer;
    function ping() {
      if (!activeNodes['chimes']) return;
      const f    = FREQS[Math.floor(Math.random() * FREQS.length)];
      const o    = ctx.createOscillator(); o.type = 'sine';
      const now  = ctx.currentTime;
      o.frequency.value = f;
      const oG   = ctx.createGain();
      oG.gain.setValueAtTime(0, now);
      oG.gain.linearRampToValueAtTime(0.35, now + 0.01);
      oG.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      o.connect(oG); oG.connect(gainNode);
      o.start(now); o.stop(now + 2.8);
      timer = setTimeout(ping, 600 + Math.random() * 2200);
    }
    ping();
    return { type: 'chimes', cleanup: () => clearTimeout(timer) };
  }

  function makePurr(gainNode) {
    // 40Hz resonant base frequency with 25Hz throat vibrato LFO and 0.25Hz respiration wave
    const baseFreq = 42;
    const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = baseFreq;
    const osc2 = ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = baseFreq * 2;
    const osc3 = ctx.createOscillator(); osc3.type = 'sine'; osc3.frequency.value = baseFreq * 3;

    // LFO 1: Rapid throat flutter (26 Hz)
    const lfoFlutter = ctx.createOscillator();
    lfoFlutter.frequency.value = 26;
    const flutterGain = ctx.createGain();
    flutterGain.gain.value = 0.45;
    lfoFlutter.connect(flutterGain);

    // LFO 2: Slow breathing cycle (0.3 Hz = ~3.3s inhale/exhale)
    const lfoBreath = ctx.createOscillator();
    lfoBreath.frequency.value = 0.32;
    const breathGain = ctx.createGain();
    breathGain.gain.value = 0.35;
    lfoBreath.connect(breathGain);

    const purrAmp = ctx.createGain();
    purrAmp.gain.value = 0.55;
    flutterGain.connect(purrAmp.gain);
    breathGain.connect(purrAmp.gain);

    const mixGain = ctx.createGain();
    osc1.connect(mixGain);
    osc2.connect(mixGain);
    osc3.connect(mixGain);

    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 320;

    mixGain.connect(purrAmp);
    purrAmp.connect(lpf);
    lpf.connect(gainNode);

    osc1.start(); osc2.start(); osc3.start();
    lfoFlutter.start(); lfoBreath.start();

    return {
      type: 'purr',
      oscillators: [osc1, osc2, osc3, lfoFlutter, lfoBreath]
    };
  }

  function makeCrickets(gainNode) {
    // Summertime chirping crickets
    let timer;
    function chirpBurst() {
      if (!activeNodes['crickets']) return;
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 4600 + (Math.random() - 0.5) * 300;
        const g = ctx.createGain();
        const t = now + i * 0.045;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.09, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
        osc.connect(g);
        g.connect(gainNode);
        osc.start(t);
        osc.stop(t + 0.04);
      }
      timer = setTimeout(chirpBurst, 600 + Math.random() * 800);
    }
    chirpBurst();
    return { type: 'crickets', cleanup: () => clearTimeout(timer) };
  }

  const GENERATORS = {
    purr:     makePurr,
    crickets: makeCrickets,
    rain:     makeRain,
    campfire: makeCampfire,
    ocean:    makeOcean,
    binaural: makeBinaural,
    lofi:     makeLofi,
    drone:    makeDrone,
    forest:   makeForest,
    chimes:   makeWindChimes,
  };

  // ── Channel control ────────────────────────────────────────────────────────
  function setChannel(id, volume) {
    initCtx(); resumeCtx();

    if (volume <= 0) {
      stopChannel(id);
      return;
    }

    if (!activeNodes[id]) {
      // Create gain node
      const gain = ctx.createGain();
      gain.gain.value = volume * (muted ? 0 : masterVol);
      gain.connect(masterGain);

      const gen = GENERATORS[id](gain);
      activeNodes[id] = { ...gen, gain };
    } else {
      // Just update gain
      const node = activeNodes[id];
      node.gain.gain.cancelScheduledValues(ctx.currentTime);
      node.gain.gain.linearRampToValueAtTime(
        volume * (muted ? 0 : masterVol), ctx.currentTime + 0.05
      );
    }
  }

  function stopChannel(id) {
    const node = activeNodes[id];
    if (!node) return;

    if (node.gain) {
      node.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      setTimeout(() => { try { node.gain.disconnect(); } catch(e){} }, 250);
    }

    if (node.sources)     node.sources.forEach(s     => { try { s.stop(); } catch(e){} });
    if (node.oscillators) node.oscillators.forEach(o => { try { o.stop(); } catch(e){} });
    if (node.cleanup)     node.cleanup();

    delete activeNodes[id];
  }

  function stopAll() {
    Object.keys(activeNodes).forEach(stopChannel);
    // Reset sliders
    CHANNELS.forEach(ch => {
      const sl = document.getElementById(`slider-${ch.id}`);
      if (sl) sl.value = 0;
    });
  }

  function setMasterVolume(vol) {
    masterVol = vol;
    if (masterGain) masterGain.gain.linearRampToValueAtTime(muted ? 0 : vol, (ctx?.currentTime || 0) + 0.05);
  }

  function setMuted(m) {
    muted = m;
    if (masterGain) {
      masterGain.gain.linearRampToValueAtTime(
        m ? 0 : masterVol, (ctx?.currentTime || 0) + 0.08
      );
    }
  }

  // ── Thunder Burst ──────────────────────────────────────────────────────────
  function thunderBurst() {
    initCtx(); resumeCtx();
    const now  = ctx.currentTime;
    const buf  = ctx.createBuffer(1, ctx.sampleRate * 2.5, ctx.sampleRate);
    const d    = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);

    const src  = ctx.createBufferSource();
    src.buffer = buf;

    const lpf  = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 180;
    const g    = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(1.2 * masterVol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    src.connect(lpf); lpf.connect(g); g.connect(ctx.destination);
    src.start(now); src.stop(now + 2.6);

    // Flash the canvas slightly
    document.body.style.transition = 'filter 0.04s';
    document.body.style.filter = 'brightness(1.4)';
    setTimeout(() => { document.body.style.filter = 'brightness(1)'; }, 40);
    setTimeout(() => { document.body.style.filter = 'brightness(1.2)'; }, 80);
    setTimeout(() => { document.body.style.filter = ''; document.body.style.transition = ''; }, 160);
  }

  // ── Pet / milestone tones ──────────────────────────────────────────────────
  function playPetPurr() {
    initCtx(); resumeCtx();
    const now  = ctx.currentTime;
    const o    = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(130, now);
    o.frequency.linearRampToValueAtTime(120, now + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12 * masterVol, now + 0.05);
    g.gain.setValueAtTime(0.12 * masterVol, now + 0.25);
    g.gain.linearRampToValueAtTime(0, now + 0.35);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + 0.4);
  }

  function playChimeNote(freq, durationSec = 1.5) {
    initCtx(); resumeCtx();
    const now  = ctx.currentTime;
    const o    = ctx.createOscillator(); o.type = 'sine';
    o.frequency.value = freq;
    const g    = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.35 * masterVol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + durationSec + 0.1);
  }

  function playMilestoneChime() {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      setTimeout(() => playChimeNote(f, 1.5), i * 160);
    });
  }

  function playBreathTone(phase) {
    initCtx(); resumeCtx();
    const now = ctx.currentTime;
    const PHASES = { inhale: 220, hold: 330, exhale: 174, hold2: 110 };
    const freq   = PHASES[phase] || 220;
    const o      = ctx.createOscillator(); o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08 * masterVol, now);
    g.gain.linearRampToValueAtTime(0, now + 0.6);
    o.connect(g); g.connect(ctx.destination);
    o.start(now); o.stop(now + 0.7);
  }

  // ── Presets ────────────────────────────────────────────────────────────────
  const PRESETS = {
    'cat-cafe':     { purr: 80, lofi: 45, rain: 25 },
    'capybara-spa': { campfire: 50, forest: 40, chimes: 35 },
    'bunny-meadow': { forest: 65, chimes: 45, crickets: 25 },
    'deep-focus':   { rain: 65, binaural: 45, drone: 30 },
    'campfire-zen': { campfire: 70, forest: 35, chimes: 25 },
    'night-rain':   { rain: 80, ocean: 40, crickets: 30 },
    'binaural-flow':{ binaural: 75, rain: 30 },
    'lofi-vibes':   { lofi: 70, rain: 35, purr: 30 },
  };

  function applyPreset(name) {
    stopAll();
    const preset = PRESETS[name];
    if (!preset) return;
    Object.entries(preset).forEach(([id, pct]) => {
      const vol = pct / 100;
      setChannel(id, vol);
      const sl = document.getElementById(`slider-${id}`);
      if (sl) sl.value = pct;
    });

    // Update preset buttons
    document.querySelectorAll('.sound-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === name);
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.AudioEngine = {
    init:             buildMixerUI,
    setChannel,
    stopChannel,
    stopAll,
    setMasterVolume,
    setMuted,
    thunderBurst,
    playPetPurr,
    playChimeNote,
    playMilestoneChime,
    playBreathTone,
    applyPreset,
    getContext:       () => ctx,
    initCtx,
    resumeCtx,
    CHANNELS,
  };

  document.addEventListener('DOMContentLoaded', buildMixerUI);

})();
