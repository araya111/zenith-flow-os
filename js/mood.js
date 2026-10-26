/* ==========================================================================
   mood.js — Mood Journal & History for Zenith Flow OS
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_KEY = 'zfo_mood_history_v2';

  // ── State ──────────────────────────────────────────────────────────────────
  let selectedMood = null;
  let moodHistory  = [];   // [{ mood, emoji, note, timestamp }]

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const moodOptions  = document.querySelectorAll('.mood-option');
  const moodNoteInput = document.getElementById('mood-note-input');
  const logMoodBtn   = document.getElementById('log-mood-btn');
  const historyStrip = document.getElementById('mood-history-strip');
  const todayBadge   = document.getElementById('todays-mood-badge');

  // ── Load ───────────────────────────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) moodHistory = JSON.parse(raw);
    } catch(e) {}

    // Check if today already logged
    const today = todayKey();
    const todayEntry = moodHistory.find(m => dayKey(m.timestamp) === today);
    if (todayEntry) {
      todayBadge.textContent = todayEntry.emoji + ' Logged';
      // Highlight that mood
      moodOptions.forEach(opt => {
        if (opt.dataset.mood === todayEntry.mood) {
          opt.classList.add('selected');
          opt.setAttribute('aria-checked', 'true');
          selectedMood = todayEntry;
        }
      });
    }

    renderHistory();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodHistory));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function todayKey() { return new Date().toLocaleDateString('en-CA'); } // YYYY-MM-DD
  function dayKey(ts) { return new Date(ts).toLocaleDateString('en-CA'); }

  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // ── Render ─────────────────────────────────────────────────────────────────
  function renderHistory() {
    if (!historyStrip) return;
    historyStrip.innerHTML = '';

    // Show last 14 entries (most recent first)
    const recent = [...moodHistory].reverse().slice(0, 14);

    if (recent.length === 0) {
      historyStrip.innerHTML = '<span style="font-size:0.72rem;color:var(--text-faint)">No entries yet — log your mood above!</span>';
      return;
    }

    recent.forEach(entry => {
      const d    = new Date(entry.timestamp);
      const dot  = document.createElement('div');
      dot.className = 'mood-history-dot';
      dot.title = `${entry.emoji} ${entry.mood}${entry.note ? ' — ' + entry.note : ''} · ${d.toLocaleDateString()}`;
      dot.innerHTML = `
        <span class="mood-dot-emoji" aria-hidden="true">${entry.emoji}</span>
        <span class="mood-dot-day">${DAY_LABELS[d.getDay()]}</span>
      `;
      historyStrip.appendChild(dot);
    });
  }

  // ── Event: Select mood ─────────────────────────────────────────────────────
  moodOptions.forEach(opt => {
    function selectThis() {
      moodOptions.forEach(o => { o.classList.remove('selected'); o.setAttribute('aria-checked','false'); });
      opt.classList.add('selected');
      opt.setAttribute('aria-checked', 'true');
      selectedMood = { mood: opt.dataset.mood, emoji: opt.dataset.emoji };

      // Animate emoji
      const emojiEl = opt.querySelector('.mood-emoji');
      emojiEl.style.transform = 'scale(1.4)';
      setTimeout(() => { emojiEl.style.transform = ''; }, 200);
    }
    opt.addEventListener('click', selectThis);
    opt.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectThis(); }});
  });

  // ── Event: Log mood ────────────────────────────────────────────────────────
  function logMood() {
    if (!selectedMood) {
      // Wiggle the wheel to hint
      document.querySelector('.mood-wheel').style.animation = 'none';
      setTimeout(() => {
        document.querySelector('.mood-wheel').style.animation = '';
      }, 50);
      if (window.Zenith && window.Zenith.showToast)
        window.Zenith.showToast('🌸 Pick a mood first!', '');
      return;
    }

    const today = todayKey();
    const note  = moodNoteInput ? moodNoteInput.value.trim() : '';

    // Remove existing today entry if re-logging
    moodHistory = moodHistory.filter(m => dayKey(m.timestamp) !== today);

    const entry = {
      mood:      selectedMood.mood,
      emoji:     selectedMood.emoji,
      note,
      timestamp: Date.now()
    };
    moodHistory.push(entry);
    save();
    renderHistory();

    // Update badge
    if (todayBadge) todayBadge.textContent = entry.emoji + ' Logged!';
    if (moodNoteInput) moodNoteInput.value = '';

    // Notify
    if (window.Zenith && window.Zenith.showToast) {
      const msgs = {
        radiant:  "You're absolutely radiant today ✨ Keep shining!",
        happy:    "Happy vibes logged! 😊 Let's make it a great day!",
        focused:  "Focused mode activated! 🎯 You're in the zone.",
        neutral:  "Steady and grounded — that's perfectly fine 😐",
        tired:    "Rest is productive too 😴 Take it easy today.",
        stressed:  "Deep breath... 😤 Try the Breath Coach below.",
        zen:      "Pure zen energy 🧘 You're on a higher frequency."
      };
      window.Zenith.showToast(msgs[entry.mood] || 'Mood logged!', entry.emoji);
    }
  }

  if (logMoodBtn) logMoodBtn.addEventListener('click', logMood);
  if (moodNoteInput) {
    moodNoteInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') logMood();
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.MoodTracker = {
    init: load,
    getHistory:  () => moodHistory,
    getTodayMood() {
      const today = todayKey();
      return moodHistory.find(m => dayKey(m.timestamp) === today) || null;
    },
    getWeekMoods() {
      const now  = Date.now();
      const week = 7 * 24 * 3600 * 1000;
      return moodHistory.filter(m => now - m.timestamp < week);
    }
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', load);

})();
