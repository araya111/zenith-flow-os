/* ==========================================================================
   pets.js — Cyber-Zen Focus Sanctuary Familiars for Zenith Flow OS v2
   6 Companions · Treats Menu · Dress-up · Bond Leveling · Floating Widget
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_KEY = 'zfo_pets_v3';

  const PETS = {
    mochi: {
      id:       'mochi',
      name:     'Mochi',
      species:  'Cosmic Moon Bunny',
      emoji:    '🐰',
      imgSrc:   'assets/pets/bunny.png',
      favTreat: '🍡 Rainbow Dango',
      idleDialogue: [
        'Your focus aura is sparkling today! 🌟',
        'Have you taken a sip of water, bestie? 💧',
        'One gentle hop at a time, you\'ve got this! 🌸',
        'I believe in you with all my bunny heart! 🐰💕',
        'Let\'s make this session legendary! ⚡',
        'Soft ears, sharp mind... ready when you are! ✨',
      ],
      focusDialogue: [
        'Shhh... deep study mode activated 🤫📖',
        'Zoning in with you on our moon cloud... 🌙',
        'Flow state: ENGAGED 🎯',
        '*ears perk up watching your brilliance*',
        '100% focused solidarity! 🐰✨',
      ],
      celebrateDialogue: [
        'YAAAAY!! Focus session conquered!! 🎉🎉',
        'I\'m SO incredibly proud of you!! 🥳✨',
        'Bouncing to the moon with joy!! 🐰💫',
        'TREAT TIME!! You earned that sweet dango! 🍡🎊',
      ],
      snoozeDialogue: ['Zzzz... dreaming of carrots... 💤', '*soft snores on crescent moon*', 'Zzz... best study buddy... 💤'],
    },
    kitsune: {
      id:       'kitsune',
      name:     'Kitsune',
      species:  'Star Fox Guardian',
      emoji:    '🦊',
      imgSrc:   'assets/pets/kitsune.png',
      favTreat: '🐟 Golden Taiyaki',
      idleDialogue: [
        'Ancient wisdom: small daily sparks light galaxies 🦊',
        'Your aura is radiant and clear today 🌟',
        'Flow like water, strike your goals like foxfire 🔥',
        '*nine tails shimmer gently* You\'ve totally got this!',
        'Trust the unfolding process, young scholar 🌙',
        'The cosmos aligns for those who persevere ⭐',
      ],
      focusDialogue: [
        '*nine glowing tails swirl in mystical focus* ✨',
        'Channeling the ancient arts of deep concentration 🦊',
        'Protecting your realm from distractions... 🌌',
        'Starfire focus is blazing hot! 🔥',
      ],
      celebrateDialogue: [
        '🦊 *TRIUMPHANT FOX HOWL* VICTORY!!',
        '*magical golden foxfire firework display* 🎇',
        'The stars bow to your magnificent dedication! ⭐',
        'Glorious accomplishment! A feast is warranted! 🐟✨',
      ],
      snoozeDialogue: ['💤 ...dreaming under the celestial shrine...', 'Zz... ancient fox magic... 🌙'],
    },
    boba: {
      id:       'boba',
      name:     'Boba',
      species:  'Zen Capybara',
      emoji:    '🦫',
      imgSrc:   'assets/pets/capybara.png',
      favTreat: '🍊 Golden Yuzu Hot Tea',
      idleDialogue: [
        'All is peaceful in our universe 🌊',
        'I am unbothered. You can be too 🦫',
        'Good vibes and steady breath, always 🌿',
        'You radiate calm, steady excellence ✨',
        'Hot spring temperature: perfection ♨️',
        'No rush, no stress. True progress is steady 🍵',
      ],
      focusDialogue: [
        '*comfortable capybara solidarity mode: ON* 🦫',
        'Sitting peacefully beside you in the warm mist... 🧘',
        'Maximum chill. Maximum deep work. 🌿',
        '*yuzu on head balances in absolute focus* 🍊',
      ],
      celebrateDialogue: [
        '*gentle, joyful capybara splashes* ♨️🎉',
        'BOBA IS FILLED WITH SERENE DELIGHT!! 🎊',
        'The most wonderfully chill celebration EVER!! 🦫✨',
        'Well done, friend. Time for a peaceful soak 🍵',
      ],
      snoozeDialogue: ['Zzzz... floating in hot springs... 💤', '🦫 ...peaceful capybara slumber...'],
    },
    panda: {
      id:       'panda',
      name:     'Pang-Pang',
      species:  'Cosmic Red Panda',
      emoji:    '🐼',
      imgSrc:   'assets/pets/panda.png',
      favTreat: '🎋 Sweet Star Bamboo',
      idleDialogue: [
        'Crunch crunch! Star bamboo gives +100 energy! 🎋',
        'Look at my fluffy striped tail! Isn\'t it cozy? 🐾',
        'Are you ready to roll into action? Let\'s go! 🌟',
        'High five with your soft paws! 🐾✨',
        'You\'re doing so great, take a big breath! 🌸',
      ],
      focusDialogue: [
        '*stands up tall on back paws to guard your focus* 🐼',
        'Nomming quietly on bamboo so you can work... 🎋',
        'Eyes on the prize! Deep work session! 🎯',
        'Pang-Pang is locked in! 💫',
      ],
      celebrateDialogue: [
        '🎉 ROLLS OVER IN SHEER HAPPINESS!! 🐼',
        'WAHOOO! You crushed that session! 🎋✨',
        'Pang-Pang victory dance commencing!! 💃✨',
        'Extra crunchy star bamboo for everyone! 🎋🎊',
      ],
      snoozeDialogue: ['Zzz... curled up around my big tail... 💤', '🎋 ...dreaming of bamboo forests...'],
    },
    penguin: {
      id:       'penguin',
      name:     'Pippin',
      species:  'Polar Explorer Penguin',
      emoji:    '🐧',
      imgSrc:   'assets/pets/penguin.png',
      favTreat: '❄️ Starberry Ice Flake',
      idleDialogue: [
        'Belly-sliding across the ice straight to victory! ⛸️',
        'My knitted scarf keeps all my big ideas warm 🧣',
        'Cold outside, but warm and focused inside! ❄️✨',
        'Waddle waddle... ready for our next mission! 🐧',
        'The aurora borealis is dancing just for you 🌌',
      ],
      focusDialogue: [
        '*glides silently along the ice beside you* ⛸️',
        'Crisp, cool glacier focus mode activated! 🧊',
        'No fog in our minds, only crystal clarity! 💎',
        'Pippin stays steady on the ice! 🐧✨',
      ],
      celebrateDialogue: [
        '🐧 WADDLE CHEERS!! FLAP FLAP FLAP!! 🎉',
        'SLIDING INTO FIRST PLACE!! AMAZING JOB!! 🏆',
        'Glacier ice celebration shower!! ❄️✨🎊',
        'You earned a mountain of frozen starberries! 🍓',
      ],
      snoozeDialogue: ['Zzz... cozy under my scarf... 💤', '🐧 ...tucked into my igloo...'],
    },
    cat: {
      id:       'cat',
      name:     'Boba-Neko',
      species:  'Boba Magic Calico Kitty',
      emoji:    '🐱',
      imgSrc:   'assets/pets/cat.png',
      favTreat: '🧋 Brown Sugar Boba Tea',
      idleDialogue: [
        'Purrrrr... my boba tea is sweet and life is good 🧋💕',
        'Kneading soft dough paws of positive energy for you 🐾',
        'One sip of tea, one milestone crushed! ✨',
        '*tail twitches with affectionate curiosity* 🌸',
        'You are the cat\'s pajamas! Absolutely wonderful! 🐱',
      ],
      focusDialogue: [
        '*soft rhythmic purring at 40Hz to optimize your brain waves* 🐱',
        'Sipping my boba silently with a cute straw... 🧋',
        'Kitty laser focus engaged! 🎯',
        '*warm loaf posture watching you code & create* 🍞',
      ],
      celebrateDialogue: [
        'MEOWWWWW!! 🎉 HAPPY PAWS EVERYWHERE!! 🐱',
        '*zoomies of pure joy and celebration!!* 💨✨',
        'DOUBLE BOBA TEA CELEBRATION ROUND!! 🧋🧋🎊',
        'You did it! Best study partner in nine lives! 💖',
      ],
      snoozeDialogue: ['Purrr... snoozing on the boba pillow... 💤', '🐱 ...dreaming of salmon treats...'],
    },
    dog: {
      id:       'dog',
      name:     'Hachi',
      species:  'Cosmic Star Shiba',
      emoji:    '🐶',
      imgSrc:   'assets/pets/dog.png',
      favTreat: '🦴 Star Bone Crunch',
      idleDialogue: [
        'WOOF! You are my favorite human in the whole cosmos! 🐶✨',
        '*happy tail wags at warp speed* Ready when you are! 🐾',
        'I fetched extra inspiration and good luck for you! ⭐',
        'Have you had a water break, bestie? Woof! 💧',
        'You\'re doing paws-itively spectacular today! 💖',
        '*warm loyal puppy cuddles and happy panting* 🐕',
      ],
      focusDialogue: [
        '*curls up warmly beside you to guard your focus* 🐶',
        'Quiet watch-dog mode: ENGAGED! No distractions allowed! 🛡️',
        '*attentive ears perk up watching you study* 🐾',
        'Super loyal study buddy reporting for duty! 📖✨',
        'Hachi believes in you 1000%! 🌟',
      ],
      celebrateDialogue: [
        'WOOF WOOF BARK!! 🎉🎉 HAPPY PUPPY ZOOMIES!! 🐶',
        '*spins in circles of pure canine joy!* 🐕💫',
        'TREAT TIME!! Did someone say star bone?! 🦴🎊',
        'YOU DID IT!! BEST HUMAN IN THE GALAXY!! 🥳💖',
      ],
      snoozeDialogue: ['*soft puppy snores and gentle paw twitches* 💤', '🐶 ...dreaming of golden tennis balls... 🎾'],
    }
  };

  const TREATS = [
    { id: 'bone',    name: 'Star Bone Crunch',    emoji: '🦴', hp: 25, xp: 30 },
    { id: 'dango',   name: 'Rainbow Dango',       emoji: '🍡', hp: 15, xp: 20 },
    { id: 'boba',    name: 'Boba Milk Tea',        emoji: '🧋', hp: 20, xp: 25 },
    { id: 'bamboo',  name: 'Star Bamboo',          emoji: '🎋', hp: 20, xp: 25 },
    { id: 'berry',   name: 'Star Strawberry',      emoji: '🍓', hp: 15, xp: 20 },
    { id: 'taiyaki', name: 'Golden Taiyaki',       emoji: '🐟', hp: 25, xp: 30 },
    { id: 'honey',   name: 'Warm Honey Pot',       emoji: '🍯', hp: 30, xp: 35 },
  ];

  const ACCESSORIES = [
    { id: 'none',    name: 'None',           emoji: '❌' },
    { id: 'glasses', name: 'Study Glasses',  emoji: '👓' },
    { id: 'crown',   name: 'Royal Crown',    emoji: '👑' },
    { id: 'sakura',  name: 'Sakura Hairpin', emoji: '🌸' },
    { id: 'bowtie',  name: 'Silk Bowtie',    emoji: '🎀' },
    { id: 'scholar', name: 'Scholar Cap',    emoji: '🎓' },
  ];

  // ── State ──────────────────────────────────────────────────────────────────
  let activePetKey  = 'mochi';
  let happiness     = 100;
  let bondXp        = 40;
  let bondLevel     = 1;
  let accessory     = 'none';
  let timerRunning  = false;
  let dialogueTimer = null;
  let roamingActive = true;

  // ── DOM References ─────────────────────────────────────────────────────────
  let avatarImg, nameEl, speciesEl, speechBubble, happinessBar, happinessLbl;
  let petCard, switchPills, levelBadgeEl, accessoryBadgeEl;
  let floatingWidget, floatingAvatar, floatingBubble;

  function cacheDOM() {
    avatarImg        = document.getElementById('pet-avatar-img');
    nameEl           = document.getElementById('pet-name');
    speciesEl        = document.getElementById('pet-species');
    speechBubble     = document.getElementById('pet-speech-bubble');
    happinessBar     = document.getElementById('pet-happiness-fill');
    happinessLbl     = document.getElementById('pet-happiness-label');
    petCard          = document.getElementById('pet-main-card');
    switchPills      = document.querySelectorAll('.pet-switch-pill');
    levelBadgeEl     = document.getElementById('pet-bond-level');
    accessoryBadgeEl = document.getElementById('pet-accessory-badge');
    floatingWidget   = document.getElementById('floating-companion-widget');
    floatingAvatar   = document.getElementById('floating-companion-avatar');
    floatingBubble   = document.getElementById('floating-companion-bubble');
  }

  // ── Persistence ────────────────────────────────────────────────────────────
  function load() {
    cacheDOM();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data    = JSON.parse(raw);
        activePetKey  = data.pet       || 'mochi';
        happiness     = typeof data.happiness === 'number' ? data.happiness : 100;
        bondXp        = typeof data.bondXp    === 'number' ? data.bondXp    : 40;
        bondLevel     = typeof data.bondLevel === 'number' ? data.bondLevel : 1;
        accessory     = data.accessory || 'none';
        roamingActive = typeof data.roaming === 'boolean' ? data.roaming : true;
      }
    } catch(e) {}

    renderPet();
    renderTreatsMenu();
    renderAccessoryMenu();
    scheduleDialogue();
    bindEvents();
    updateFloatingCompanion();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        pet: activePetKey,
        happiness,
        bondXp,
        bondLevel,
        accessory,
        roaming: roamingActive
      }));
    } catch(e) {}
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function renderPet() {
    const pet = PETS[activePetKey] || PETS.mochi;

    // Switch Pills
    if (switchPills) {
      switchPills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.pet === activePetKey);
      });
    }

    // Name & Species
    if (nameEl) nameEl.textContent = pet.name;
    if (speciesEl) speciesEl.textContent = pet.species;

    // Avatar image
    if (avatarImg) {
      avatarImg.src = pet.imgSrc;
      avatarImg.alt = `${pet.name} the ${pet.species}`;
    }

    // Accessory badge
    if (accessoryBadgeEl) {
      const acc = ACCESSORIES.find(a => a.id === accessory);
      if (acc && acc.id !== 'none') {
        accessoryBadgeEl.textContent = acc.emoji;
        accessoryBadgeEl.style.display = 'block';
      } else {
        accessoryBadgeEl.style.display = 'none';
      }
    }

    // Bond Level & Happiness
    updateBondUI();
    updateHappinessBar();

    // Sleep state
    if (petCard) petCard.classList.toggle('pet-is-sleeping', timerRunning);

    // Initial greeting / dialogue
    showDialogue(pet);

    // Update study buddy in Timer
    updateTimerBuddy(pet);

    // Update Floating widget
    updateFloatingCompanion();
  }

  function updateBondUI() {
    const neededXp = bondLevel * 100;
    if (bondXp >= neededXp && bondLevel < 10) {
      bondLevel++;
      bondXp -= neededXp;
      save();
      if (window.Zenith) {
        window.Zenith.showToast(`🌟 ${PETS[activePetKey].name} grew to Bond Level ${bondLevel}!`, '💖');
      }
      if (window.AudioEngine && window.AudioEngine.playLevelUpTone) {
        window.AudioEngine.playLevelUpTone();
      }
    }

    if (levelBadgeEl) {
      levelBadgeEl.textContent = `Bond Lv. ${bondLevel} (${bondXp}/${bondLevel * 100} XP)`;
    }
  }

  function updateHappinessBar() {
    const pct = Math.max(0, Math.min(100, happiness));
    if (happinessBar) happinessBar.style.width = `${pct}%`;
    if (happinessLbl) {
      const emoji = pct >= 80 ? '💝' : pct >= 50 ? '💛' : pct >= 25 ? '🩶' : '🤍';
      happinessLbl.textContent = `${emoji} ${pct}% happiness`;
    }
  }

  function updateTimerBuddy(pet) {
    const buddyTag = document.getElementById('timer-study-buddy');
    if (buddyTag) {
      buddyTag.innerHTML = `
        <img class="timer-buddy-mini-avatar" src="${pet.imgSrc}" alt="${pet.name}" />
        <span>Studying with <strong>${pet.name}</strong></span>
      `;
    }
  }

  function updateFloatingCompanion() {
    if (!floatingWidget) return;
    const pet = PETS[activePetKey];
    if (!roamingActive) {
      floatingWidget.style.display = 'none';
      return;
    }
    floatingWidget.style.display = 'flex';
    if (floatingAvatar && pet) {
      floatingAvatar.src = pet.imgSrc;
      floatingAvatar.alt = pet.name;
    }
  }

  // ── Treats Menu Rendering ──────────────────────────────────────────────────
  function renderTreatsMenu() {
    const rack = document.getElementById('pet-treats-rack');
    if (!rack) return;
    rack.innerHTML = TREATS.map(t => `
      <button class="pet-treat-chip" data-treat-id="${t.id}" title="Feed ${t.name} (+${t.hp} HP, +${t.xp} XP)" aria-label="Feed ${t.name}">
        <span>${t.emoji}</span>
        <span>${t.name}</span>
      </button>
    `).join('');

    rack.querySelectorAll('.pet-treat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const treatId = btn.dataset.treatId;
        feedTreat(treatId);
      });
    });
  }

  // ── Accessory Menu Rendering ───────────────────────────────────────────────
  function renderAccessoryMenu() {
    const rack = document.getElementById('pet-accessories-rack');
    if (!rack) return;
    rack.innerHTML = ACCESSORIES.map(a => `
      <button class="pet-treat-chip ${accessory === a.id ? 'active' : ''}" data-acc-id="${a.id}" title="Equip ${a.name}" aria-label="Equip ${a.name}">
        <span>${a.emoji}</span>
        <span>${a.name}</span>
      </button>
    `).join('');

    rack.querySelectorAll('.pet-treat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const accId = btn.dataset.accId;
        equipAccessory(accId);
      });
    });
  }

  // ── Dialogue ───────────────────────────────────────────────────────────────
  function showDialogue(pet) {
    if (!pet) pet = PETS[activePetKey];
    const pool = timerRunning ? pet.focusDialogue : pet.idleDialogue;
    const line = pool[Math.floor(Math.random() * pool.length)];

    if (speechBubble) {
      speechBubble.textContent = line;
      speechBubble.classList.remove('bubble-pop');
      void speechBubble.offsetWidth;
      speechBubble.classList.add('bubble-pop');
    }

    if (floatingBubble && roamingActive) {
      floatingBubble.textContent = line;
    }
  }

  function scheduleDialogue() {
    clearTimeout(dialogueTimer);
    dialogueTimer = setTimeout(() => {
      showDialogue(PETS[activePetKey]);
      scheduleDialogue();
    }, 7000 + Math.random() * 6000);
  }

  // ── Interactions: Petting & Cuddles ─────────────────────────────────────────
  function petInteract() {
    happiness = Math.min(100, happiness + 6);
    bondXp += 8;
    save();
    updateBondUI();
    updateHappinessBar();

    // Visual Bounce
    if (avatarImg) {
      avatarImg.classList.remove('pet-bounce', 'pet-wiggle');
      void avatarImg.offsetWidth;
      avatarImg.classList.add('pet-bounce');
      setTimeout(() => avatarImg.classList.remove('pet-bounce'), 450);
    }

    // Audio SFX
    if (window.AudioEngine && window.AudioEngine.playPetPurr) {
      window.AudioEngine.playPetPurr();
    }

    // Floating Hearts & Sparkles
    const symbols = ['💕', '💖', '✨', '🌸', '💫', '⭐', '🐾'];
    const rect = avatarImg ? avatarImg.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 80, height: 80 };
    for (let i = 0; i < 5; i++) {
      spawnFloatingEmoji(
        symbols[Math.floor(Math.random() * symbols.length)],
        rect.left + rect.width / 2 + (Math.random() - 0.5) * 50,
        rect.top + rect.height / 3 + (Math.random() - 0.5) * 20
      );
    }

    // Sweet cuddling lines
    const cuddles = [
      'Purrrr... 💕 So soft! Thank you for the pets!',
      'Hehe~ You are the best study buddy! 🌸',
      '*nuzzles happily into your hand* 💖',
      'Feeling 100% recharged and loved! ✨',
      '*happy happy animal squeaks* 🐾',
    ];
    if (speechBubble) {
      speechBubble.textContent = cuddles[Math.floor(Math.random() * cuddles.length)];
      speechBubble.classList.remove('bubble-pop');
      void speechBubble.offsetWidth;
      speechBubble.classList.add('bubble-pop');
    }
    if (floatingBubble) {
      floatingBubble.textContent = 'Purrr... 💕 Best friends!';
    }
  }

  // ── Interactions: Treats ───────────────────────────────────────────────────
  function feedTreat(treatId) {
    const treat = TREATS.find(t => t.id === treatId) || TREATS[0];
    const pet   = PETS[activePetKey];

    happiness = Math.min(100, happiness + treat.hp);
    bondXp   += treat.xp;
    save();
    updateBondUI();
    updateHappinessBar();

    // Animation
    if (avatarImg) {
      avatarImg.classList.remove('pet-wiggle', 'pet-bounce');
      void avatarImg.offsetWidth;
      avatarImg.classList.add('pet-wiggle');
      setTimeout(() => avatarImg.classList.remove('pet-wiggle'), 500);
    }

    // Spawn floating food emojis
    const rect = avatarImg ? avatarImg.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 80, height: 80 };
    for (let i = 0; i < 4; i++) {
      spawnFloatingEmoji(
        treat.emoji,
        rect.left + rect.width / 2 + (Math.random() - 0.5) * 60,
        rect.top + rect.height / 4
      );
    }

    // Audio SFX
    if (window.AudioEngine && window.AudioEngine.playPetPurr) {
      window.AudioEngine.playPetPurr();
    }

    // Speech
    const yumPhrases = [
      `NOM NOM!! That ${treat.name} is DELICIOUS! 💖`,
      `*happily munches ${treat.emoji}* Best human ever!! ✨`,
      `YUMMY!! That gave ${pet.name} +${treat.xp} Bond XP! 🍡`,
      `So sweet! My tummy is happy and my mind is focused! 🌸`,
    ];
    const line = yumPhrases[Math.floor(Math.random() * yumPhrases.length)];
    if (speechBubble) {
      speechBubble.textContent = line;
      speechBubble.classList.remove('bubble-pop');
      void speechBubble.offsetWidth;
      speechBubble.classList.add('bubble-pop');
    }

    if (window.Zenith) {
      window.Zenith.showToast(`${treat.emoji} ${pet.name} loved the ${treat.name}! (+${treat.xp} XP)`, '💖');
    }
  }

  // ── Equip Accessory ────────────────────────────────────────────────────────
  function equipAccessory(accId) {
    accessory = accId;
    save();
    renderPet();
    renderAccessoryMenu();
    if (window.Zenith) {
      const acc = ACCESSORIES.find(a => a.id === accId);
      window.Zenith.showToast(`✨ Equipped ${acc ? acc.name : 'Accessory'} on ${PETS[activePetKey].name}!`, '🎀');
    }
  }

  // ── Spawn Floating Emoji Helper ────────────────────────────────────────────
  function spawnFloatingEmoji(emoji, x, y) {
    const el = document.createElement('div');
    el.className   = 'floating-pet-emoji';
    el.textContent = emoji;
    el.style.left  = `${x}px`;
    el.style.top   = `${y}px`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // ── Switch Pet ─────────────────────────────────────────────────────────────
  function switchPet(key) {
    if (!PETS[key] || key === activePetKey) return;
    activePetKey = key;
    happiness    = Math.max(happiness, 60);
    save();
    renderPet();
    if (window.Zenith) {
      window.Zenith.showToast(`🐾 Switched focus companion to ${PETS[key].name} the ${PETS[key].species}!`, '✨');
    }
    if (window.AudioEngine && window.AudioEngine.playChimeKey) {
      window.AudioEngine.playChimeKey(5);
    }
  }

  // ── Bind Events ────────────────────────────────────────────────────────────
  function bindEvents() {
    // Pet Avatar click -> Pet interaction
    if (avatarImg) {
      avatarImg.addEventListener('click', petInteract);
    }

    // Switch pills
    const rack = document.querySelector('.pet-switch-rack');
    if (rack) {
      rack.addEventListener('click', e => {
        const btn = e.target.closest('.pet-switch-pill');
        if (btn && btn.dataset.pet) {
          switchPet(btn.dataset.pet);
        }
      });
    }

    // Feed button
    const feedBtn = document.getElementById('pet-feed-btn');
    if (feedBtn) {
      feedBtn.addEventListener('click', () => feedTreat('dango'));
    }

    // Cuddle button
    const cuddleBtn = document.getElementById('pet-cuddle-btn');
    if (cuddleBtn) {
      cuddleBtn.addEventListener('click', petInteract);
    }

    // Roaming toggle button
    const roamBtn = document.getElementById('toggle-roaming-pet-btn');
    if (roamBtn) {
      roamBtn.addEventListener('click', () => {
        roamingActive = !roamingActive;
        save();
        updateFloatingCompanion();
        if (window.Zenith) {
          window.Zenith.showToast(roamingActive ? '🐾 Floating pet companion summoned!' : '🐾 Floating pet companion hidden.', '✨');
        }
      });
    }

    // Floating avatar click
    if (floatingAvatar) {
      floatingAvatar.addEventListener('click', () => {
        petInteract();
      });
    }
  }

  // ── Global Custom Events (from Timer & Tasks) ──────────────────────────────
  document.addEventListener('timerStart', () => {
    timerRunning = true;
    if (petCard) petCard.classList.add('pet-is-sleeping');
    const pet = PETS[activePetKey];
    showDialogue(pet);
    const buddyTag = document.getElementById('timer-study-buddy');
    if (buddyTag) buddyTag.classList.add('active-focus');
  });

  document.addEventListener('timerStop', () => {
    timerRunning = false;
    if (petCard) petCard.classList.remove('pet-is-sleeping');
    const buddyTag = document.getElementById('timer-study-buddy');
    if (buddyTag) buddyTag.classList.remove('active-focus');
  });

  document.addEventListener('timerComplete', () => {
    timerRunning = false;
    if (petCard) {
      petCard.classList.remove('pet-is-sleeping');
      petCard.classList.add('pet-celebrate');
      setTimeout(() => petCard.classList.remove('pet-celebrate'), 3500);
    }
    happiness = Math.min(100, happiness + 25);
    bondXp   += 50;
    save();
    updateBondUI();
    updateHappinessBar();

    const pet = PETS[activePetKey];
    if (speechBubble) {
      const line = pet.celebrateDialogue[Math.floor(Math.random() * pet.celebrateDialogue.length)];
      speechBubble.textContent = line;
      speechBubble.classList.remove('bubble-pop');
      void speechBubble.offsetWidth;
      speechBubble.classList.add('bubble-pop');
    }
  });

  document.addEventListener('taskCompleted', e => {
    happiness = Math.min(100, happiness + 5);
    bondXp   += 15;
    save();
    updateBondUI();
    updateHappinessBar();
    if (avatarImg) {
      avatarImg.classList.add('pet-bounce');
      setTimeout(() => avatarImg.classList.remove('pet-bounce'), 450);
    }
  });

  // ── Expose Global API ──────────────────────────────────────────────────────
  window.FocusPets = {
    getPets:       () => PETS,
    getActivePet:  () => PETS[activePetKey],
    switchPet,
    feedTreat,
    petInteract,
    equipAccessory,
    addBondXp: (amount) => {
      bondXp += amount;
      save();
      updateBondUI();
    }
  };

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }

})();
