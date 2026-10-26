/* ==========================================================================
   tasks.js — Gamified Quest Log & Cute Animal Sticker Book for Zenith Flow OS
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_XP       = 'zfo_xp_v2';
  const STORAGE_TASKS    = 'zfo_tasks_v2';
  const STORAGE_STREAK   = 'zfo_streak_v2';
  const STORAGE_STICKERS = 'zfo_stickers_v2';

  const RANKS = [
    { name: 'Wandering Seeker', minXP: 0,    maxXP: 100  },
    { name: 'Mindful Novice',   minXP: 100,  maxXP: 250  },
    { name: 'Flow Apprentice',  minXP: 250,  maxXP: 500  },
    { name: 'Focus Keeper',     minXP: 500,  maxXP: 900  },
    { name: 'Sanctuary Guardian',minXP: 900, maxXP: 1500 },
    { name: 'Cosmic Familiar',  minXP: 1500, maxXP: 2500 },
    { name: 'Transcendent Sage',minXP: 2500, maxXP: Infinity },
  ];

  const XP_BY_PRIORITY = { high: 35, medium: 20, low: 10, zen: 15 };

  const ALL_STICKERS = [
    { emoji: '🐶', name: 'Shiba Doggo Stamp' },
    { emoji: '🐰', name: 'Moon Bunny Stamp' },
    { emoji: '🦊', name: 'Foxfire Stamp' },
    { emoji: '🦫', name: 'Zen Capybara Stamp' },
    { emoji: '🐼', name: 'Red Panda Stamp' },
    { emoji: '🐧', name: 'Polar Penguin Stamp' },
    { emoji: '🐱', name: 'Boba Cat Stamp' },
    { emoji: '🌸', name: 'Sakura Blossom' },
    { emoji: '🍡', name: 'Sweet Dango' },
    { emoji: '🍵', name: 'Matcha Bowl' },
    { emoji: '👑', name: 'Crown of Sanctuary' },
  ];

  const CUTE_QUEST_SUGGESTIONS = [
    'Play fetch & cuddle with Hachi the doggo 🐶🎾',
    'Give Mochi & Boba morning cuddles 🐰🦫',
    'Complete a 25m Pomodoro with Pippin 🐧',
    'Drink a warm cup of matcha with Boba-Neko 🍵🐱',
    'Take 5 deep Box Breaths with Kitsune 🦊',
    'Stretch and roll like Pang-Pang the panda 🐼',
    'Hydrate with a tall glass of water 💧',
    'Tidy up your focus sanctuary desk 🌿',
    'Draw a daily Spirit Animal Oracle card 🔮',
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  let tasks           = [];
  let totalXP         = 0;
  let streak          = 0;
  let filter          = 'all';
  let unlockedStickers= ['🐰']; // starts with Bunny unlocked!

  // ── DOM ────────────────────────────────────────────────────────────────────
  const taskInput      = document.getElementById('task-input');
  const prioritySel    = document.getElementById('task-priority-select');
  const addBtn         = document.getElementById('add-task-btn');
  const taskList       = document.getElementById('task-list');
  const emptyState     = document.getElementById('empty-task-state');
  const countBadge     = document.getElementById('tasks-count-badge');
  const clearDoneBtn   = document.getElementById('clear-done-btn');
  const filterBtns     = document.querySelectorAll('.task-filter-btn');
  const cuteQuestBtn   = document.getElementById('suggest-cute-quest-btn');
  const stickerStrip   = document.getElementById('sticker-album-strip');

  // ── Persistence ────────────────────────────────────────────────────────────
  function load() {
    try {
      tasks            = JSON.parse(localStorage.getItem(STORAGE_TASKS)    || '[]');
      totalXP          = parseInt(localStorage.getItem(STORAGE_XP)         || '0', 10);
      streak           = parseInt(localStorage.getItem(STORAGE_STREAK)     || '0', 10);
      unlockedStickers = JSON.parse(localStorage.getItem(STORAGE_STICKERS) || '["🐰"]');
    } catch(e) {
      tasks = []; totalXP = 0; streak = 0; unlockedStickers = ['🐰'];
    }

    if (tasks.length === 0) {
      // Seed default welcoming quests
      tasks = [
        { id: 'q1', text: 'Pet your focus familiar & give a treat 🍡', priority: 'zen', done: false, created: Date.now() },
        { id: 'q2', text: 'Conquer your first 25m focus session ⏱️', priority: 'high', done: false, created: Date.now() },
        { id: 'q3', text: 'Draw your daily Spirit Animal Oracle card 🔮', priority: 'medium', done: false, created: Date.now() },
      ];
      save();
    }

    updateXPUI();
    renderTasks();
    renderStickerAlbum();
    updateStreak();
  }

  function save() {
    localStorage.setItem(STORAGE_TASKS,    JSON.stringify(tasks));
    localStorage.setItem(STORAGE_XP,       totalXP);
    localStorage.setItem(STORAGE_STICKERS, JSON.stringify(unlockedStickers));
  }

  // ── XP & Rank ──────────────────────────────────────────────────────────────
  function getRank(xp) {
    return RANKS.slice().reverse().find(r => xp >= r.minXP) || RANKS[0];
  }

  function addXP(amount) {
    const prevRank = getRank(totalXP).name;
    totalXP += amount;
    save();

    const newRank = getRank(totalXP);
    if (getRank(totalXP - amount).name !== newRank.name) {
      if (window.Zenith) window.Zenith.showToast(`🏆 RANK UP! You're now a ${newRank.name}!`, '⭐');
      if (window.Zenith) window.Zenith.launchConfetti(80);
    }
    updateXPUI();
  }

  function updateXPUI() {
    const rank     = getRank(totalXP);
    const level    = RANKS.indexOf(rank) + 1;
    const progress = rank.maxXP === Infinity
      ? 100
      : Math.min(100, ((totalXP - rank.minXP) / (rank.maxXP - rank.minXP)) * 100);

    const lvBadge    = document.getElementById('nav-level-badge');
    const rankTitle  = document.getElementById('nav-rank-title');
    const xpFill     = document.getElementById('nav-xp-fill');
    const xpText     = document.getElementById('nav-xp-text');

    if (lvBadge)   lvBadge.textContent   = `Lv.${level}`;
    if (rankTitle) rankTitle.textContent = rank.name;
    if (xpFill)    xpFill.style.width    = `${progress}%`;
    if (xpText)    xpText.textContent    = rank.maxXP === Infinity
      ? `${totalXP} XP (MAX)`
      : `${totalXP} / ${rank.maxXP} XP`;
  }

  function updateStreak() {
    const el = document.getElementById('streak-count');
    if (el) el.textContent = streak;
  }

  // ── Sticker Album ──────────────────────────────────────────────────────────
  function renderStickerAlbum() {
    if (!stickerStrip) return;
    stickerStrip.innerHTML = ALL_STICKERS.map(s => {
      const isUnlocked = unlockedStickers.includes(s.emoji);
      return `
        <div class="sticker-badge ${isUnlocked ? 'unlocked' : ''}" title="${s.name} ${isUnlocked ? '(Unlocked!)' : '(Complete quests to unlock)'}" aria-label="${s.name}">
          ${s.emoji}
        </div>
      `;
    }).join('');
  }

  function unlockNextSticker() {
    const nextSticker = ALL_STICKERS.find(s => !unlockedStickers.includes(s.emoji));
    if (nextSticker) {
      unlockedStickers.push(nextSticker.emoji);
      save();
      renderStickerAlbum();
      if (window.Zenith) {
        window.Zenith.showToast(`🐾 UNLOCKED STICKER: ${nextSticker.emoji} ${nextSticker.name}!`, '🎉');
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function getFilteredTasks() {
    return tasks.filter(t => {
      if (filter === 'active') return !t.done;
      if (filter === 'done')   return  t.done;
      return true;
    });
  }

  function renderTasks() {
    if (!taskList) return;
    taskList.querySelectorAll('.task-card').forEach(el => el.remove());

    const filtered = getFilteredTasks();
    const activeCount = tasks.filter(t => !t.done).length;
    if (countBadge) countBadge.textContent = `${activeCount} active`;

    if (emptyState) {
      emptyState.style.display = filtered.length === 0 ? '' : 'none';
    }

    filtered.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-card priority-${task.priority}${task.done ? ' completed' : ''}`;
      card.setAttribute('role', 'listitem');
      card.dataset.id = task.id;

      const xp = XP_BY_PRIORITY[task.priority] || 20;

      card.innerHTML = `
        <label class="task-checkbox-container" aria-label="Complete quest: ${task.text}">
          <input type="checkbox" ${task.done ? 'checked' : ''} aria-checked="${task.done}" />
          <div class="custom-checkbox">
            <svg class="check-icon" viewBox="0 0 14 11" fill="none">
              <polyline points="1,5 5,9 13,1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </label>
        <div class="task-content">
          <div class="task-text">${escapeHTML(task.text)}</div>
          <div class="task-meta">
            <span class="priority-tag tag-${task.priority}">${priorityLabel(task.priority)}</span>
            <span class="xp-tag">+${xp} XP</span>
          </div>
        </div>
        <button class="task-delete-btn" aria-label="Delete task: ${task.text}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      `;

      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => completeTask(task.id, checkbox.checked));
      card.querySelector('.task-delete-btn').addEventListener('click', () => deleteTask(task.id));

      taskList.appendChild(card);
    });
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────
  function addTask(customText = null, customPriority = null) {
    const text = customText || (taskInput ? taskInput.value.trim() : '');
    if (!text) {
      if (taskInput) {
        taskInput.style.borderColor = '#f43f5e';
        setTimeout(() => taskInput.style.borderColor = '', 1000);
      }
      return;
    }
    const priority = customPriority || (prioritySel ? prioritySel.value : 'medium');
    const task = {
      id:       Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      text,
      priority,
      done:     false,
      created:  Date.now()
    };
    tasks.unshift(task);
    save();
    renderTasks();
    if (!customText && taskInput) taskInput.value = '';
  }

  function completeTask(id, done) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (done && !task.done) {
      const xpGain = XP_BY_PRIORITY[task.priority] || 20;
      addXP(xpGain);

      // Unlock animal sticker
      unlockNextSticker();

      // Burst sparkles
      const card = taskList.querySelector(`[data-id="${id}"]`);
      if (card) spawnSparkles(card);

      if (window.Zenith) window.Zenith.showToast(`🐾 Quest complete! +${xpGain} XP`, '🎉');
      if (window.AudioEngine) {
        [523.25, 783.99, 1046.50].forEach((f,i) => setTimeout(() => window.AudioEngine.playChimeNote(f, 0.8), i * 110));
      }

      // Notify FocusPets
      document.dispatchEvent(new CustomEvent('taskCompleted', { detail: { task } }));
    }

    task.done = done;
    save();
    renderTasks();
  }

  function deleteTask(id) {
    const card = taskList.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.style.transition = 'all 0.22s ease';
      card.style.opacity    = '0';
      card.style.transform  = 'translateX(16px)';
      setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        save();
        renderTasks();
      }, 230);
    }
  }

  function clearDone() {
    tasks = tasks.filter(t => !t.done);
    save();
    renderTasks();
  }

  function spawnSparkles(referenceEl) {
    const rect = referenceEl.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const cy   = rect.top  + rect.height / 2;
    const emojis = ['🐾','✨','⭐','💖','🌸','🍡'];
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.className   = 'floating-pet-emoji';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left  = `${cx + (Math.random()-0.5)*70}px`;
      el.style.top   = `${cy}px`;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  function priorityLabel(p) {
    return { high: '🔥 High', medium: '⚡ Medium', low: '💧 Low', zen: '🌿 Zen' }[p] || p;
  }

  function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  if (addBtn)   addBtn.addEventListener('click', () => addTask());
  if (taskInput) taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  if (clearDoneBtn) clearDoneBtn.addEventListener('click', clearDone);

  if (cuteQuestBtn) {
    cuteQuestBtn.addEventListener('click', () => {
      const sample = CUTE_QUEST_SUGGESTIONS[Math.floor(Math.random() * CUTE_QUEST_SUGGESTIONS.length)];
      addTask(sample, 'zen');
      if (window.Zenith) window.Zenith.showToast(`🐾 Added cute quest: "${sample}"`, '✨');
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      filterBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.filter === filter);
        b.setAttribute('aria-pressed', b.dataset.filter === filter ? 'true' : 'false');
      });
      renderTasks();
    });
  });

  // ── Public API ──────────────────────────────────────────────────────────────
  window.QuestLog = {
    addXP,
    addTask,
    getTotalXP: () => totalXP,
    getRank:    () => getRank(totalXP),
    getStreak:  () => streak,
  };

  document.addEventListener('DOMContentLoaded', load);

})();
