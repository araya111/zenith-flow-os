/* ==========================================================================
   roulette.js — Decision Wheel, Destiny Coin & Spirit Animal Oracle
   Zenith Flow OS v2
   ========================================================================== */

(function() {
  'use strict';

  // ── Decision Wheel ─────────────────────────────────────────────────────────
  const canvas   = document.getElementById('roulette-canvas');
  const resultEl = document.getElementById('roulette-result');
  const spinBtn  = document.getElementById('roulette-spin-btn');
  const addOptBtn= document.getElementById('roulette-add-option-btn');

  const SEGMENT_COLORS = [
    '#f472b6','#c084fc','#38bdf8','#34d399',
    '#fbbf24','#fb923c','#ec4899','#818cf8',
    '#06b6d4','#10b981','#a855f7','#f59e0b',
  ];

  let options = [
    '5m Stretch', 'Drink Water', 'Deep Focus sprint', 'Pet your Familiar',
    'Quick Walk', 'Meditate 3m', 'Check Quests', 'Sip Hot Tea',
  ];

  let spinning    = false;
  let currentAngle = 0;

  function drawWheel(rotationAngle) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const CX  = canvas.width  / 2;
    const CY  = canvas.height / 2;
    const R   = CX - 4;
    const N   = options.length;
    const arc = (Math.PI * 2) / N;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer glow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(244,114,182,0.6)';
    ctx.lineWidth   = 2;
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < N; i++) {
      const startAngle = rotationAngle + arc * i;
      const endAngle   = startAngle + arc;

      // Slice
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(startAngle + arc / 2);
      ctx.fillStyle   = '#ffffff';
      ctx.font        = `bold ${Math.max(9, Math.min(12, 120 / N))}px Outfit, Inter, sans-serif`;
      ctx.textAlign   = 'right';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur  = 3;

      const label = options[i].length > 15 ? options[i].slice(0, 13) + '…' : options[i];
      ctx.fillText(label, R - 6, 4);
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(CX, CY, 16, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(CX-4, CY-4, 0, CX, CY, 16);
    hubGrad.addColorStop(0, '#ffffff');
    hubGrad.addColorStop(1, '#f472b6');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }

  function spin() {
    if (spinning || options.length < 2) return;
    spinning = true;

    if (spinBtn) { spinBtn.disabled = true; spinBtn.textContent = '🎡 Spinning...'; }
    if (resultEl) { resultEl.textContent = 'Spinning...'; resultEl.className = 'roulette-result-text pulse'; }

    const extraRotations = 6 + Math.random() * 4;
    const targetOffset   = Math.random() * Math.PI * 2;
    const totalRotation  = extraRotations * Math.PI * 2 + targetOffset;
    const duration       = 3500 + Math.random() * 1000;
    const startAngle     = currentAngle;
    const startTime      = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

    function animate(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedP   = easeOut(progress);
      currentAngle   = startAngle + totalRotation * easedP;

      drawWheel(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const N        = options.length;
        const arc      = (Math.PI * 2) / N;
        const norm     = (((-currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
        const winnerIdx = Math.floor(norm / arc) % N;
        const winner   = options[winnerIdx];

        if (resultEl) {
          resultEl.textContent  = `✨ ${winner}!`;
          resultEl.className    = 'roulette-result-text';
        }
        spinning = false;
        if (spinBtn) { spinBtn.disabled = false; spinBtn.textContent = '🎡 Spin the Wheel!'; }

        if (window.AudioEngine) window.AudioEngine.playChimeNote(659.25, 1.5);
        if (window.Zenith) window.Zenith.showToast(`🎡 The wheel says: ${winner}!`, '✨');
      }
    }

    requestAnimationFrame(animate);
  }

  function promptAddOption() {
    const opt = window.prompt('Add a new wheel choice:', '');
    if (opt && opt.trim()) {
      options.push(opt.trim().slice(0, 22));
      drawWheel(currentAngle);
      if (window.Zenith) window.Zenith.showToast(`Added: "${opt.trim()}"`, '🎡');
    }
  }

  if (spinBtn)   spinBtn.addEventListener('click', spin);
  if (addOptBtn) addOptBtn.addEventListener('click', promptAddOption);

  // ── Destiny Coin ────────────────────────────────────────────────────────────
  const coin        = document.getElementById('destiny-coin');
  const coinResult  = document.getElementById('coin-result');
  const coinFlipBtn = document.getElementById('coin-flip-btn');

  let coinFlipping = false;

  function flipCoin() {
    if (coinFlipping) return;
    coinFlipping = true;

    if (window.AudioEngine) window.AudioEngine.initCtx();

    const isHeads = Math.random() < 0.5;
    if (coin) {
      coin.classList.remove('flip-heads', 'flip-tails');
      void coin.offsetWidth;
      coin.classList.add(isHeads ? 'flip-heads' : 'flip-tails');
    }

    setTimeout(() => {
      if (coinResult) coinResult.textContent = isHeads ? '🌟 Heads!' : '🌙 Tails!';
      coinFlipping = false;

      if (window.AudioEngine) window.AudioEngine.playChimeNote(isHeads ? 1046.50 : 523.25, 0.8);
      if (window.Zenith) window.Zenith.showToast(`Destiny says: ${isHeads ? '🌟 Heads!' : '🌙 Tails!'}`, '🪙');
    }, 1220);
  }

  if (coin)        coin.addEventListener('click', flipCoin);
  if (coinFlipBtn) coinFlipBtn.addEventListener('click', flipCoin);

  // ── Spirit Animal Oracle Card ──────────────────────────────────────────────
  const ORACLE_CARDS = [
    { animal: '🐶', title: 'Doggo of Loyalty', quote: 'Stay devoted to what matters. With loyal love and happy enthusiasm, miracles happen.' },
    { animal: '🐰', title: 'Bunny of Courage', quote: 'Take a soft, brave leap forward. Your effort is quietly blooming.' },
    { animal: '🦫', title: 'Capybara of Peace', quote: 'Don\'t let passing ripples disturb your tranquil lake. Stay calm and serene.' },
    { animal: '🦊', title: 'Star Fox of Wisdom', quote: 'Break your mountain of tasks into 3 tiny foxfire sparks. Ignite one by one.' },
    { animal: '🐼', title: 'Panda of Savoring', quote: 'Savor each small milestone like sweet star bamboo. Progress is joyful.' },
    { animal: '🐧', title: 'Penguin of Momentum', quote: 'Slide smoothly through friction. Tiny consistent glides conquer glaciers.' },
    { animal: '🐱', title: 'Boba Cat of Flow', quote: 'Trust your intuitive rhythm. When it\'s time to focus, sip your tea and conquer.' },
    { animal: '🦉', title: 'Cosmic Owl of Vision', quote: 'Soar above the immediate hurry. Look at how far you\'ve already journeyed.' },
    { animal: '🐬', title: 'Starlight Dolphin of Joy', quote: 'Approach your work with curious play. Wonder dissolves hesitation.' },
  ];

  const oracleCard     = document.getElementById('oracle-card');
  const oracleDrawBtn  = document.getElementById('oracle-draw-btn');
  const oracleAnimalEl = document.getElementById('oracle-back-animal');
  const oracleTitleEl  = document.getElementById('oracle-back-title');
  const oracleWisdomEl = document.getElementById('oracle-back-wisdom');

  let currentCardIndex = 0;

  function drawOracleCard() {
    if (!oracleCard) return;
    const newIdx = Math.floor(Math.random() * ORACLE_CARDS.length);
    currentCardIndex = newIdx;
    const cardData = ORACLE_CARDS[newIdx];

    if (oracleAnimalEl) oracleAnimalEl.textContent = cardData.animal;
    if (oracleTitleEl)  oracleTitleEl.textContent  = cardData.title;
    if (oracleWisdomEl) oracleWisdomEl.textContent = `"${cardData.quote}"`;

    oracleCard.classList.toggle('is-flipped');

    if (window.AudioEngine && window.AudioEngine.playChimeNote) {
      window.AudioEngine.playChimeNote(880, 1.2);
    }
    if (window.Zenith) {
      window.Zenith.showToast(`🐾 Oracle: ${cardData.animal} ${cardData.title}`, '🔮');
    }
  }

  if (oracleCard)    oracleCard.addEventListener('click', drawOracleCard);
  if (oracleDrawBtn) oracleDrawBtn.addEventListener('click', drawOracleCard);

  // ── Public API ──────────────────────────────────────────────────────────────
  window.FateEngine = { spin, flipCoin, drawOracleCard };

  // ── Init ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => drawWheel(0));

})();
