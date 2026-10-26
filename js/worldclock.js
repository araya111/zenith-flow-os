/* ==========================================================================
   worldclock.js — World Clock Panel for Zenith Flow OS
   ========================================================================== */

(function() {
  'use strict';

  // City / timezone definitions
  const CLOCKS = [
    { city: 'Your Time',    tz: null,                   isHome: true  },
    { city: 'New York',     tz: 'America/New_York',     isHome: false },
    { city: 'London',       tz: 'Europe/London',        isHome: false },
    { city: 'Paris',        tz: 'Europe/Paris',         isHome: false },
    { city: 'Dubai',        tz: 'Asia/Dubai',           isHome: false },
    { city: 'Tokyo',        tz: 'Asia/Tokyo',           isHome: false },
    { city: 'Sydney',       tz: 'Australia/Sydney',     isHome: false },
    { city: 'Los Angeles',  tz: 'America/Los_Angeles',  isHome: false },
  ];

  const grid = document.getElementById('world-clocks-grid');

  // Build cards
  function buildCards() {
    if (!grid) return;
    grid.innerHTML = '';
    CLOCKS.forEach((cl, i) => {
      const card = document.createElement('div');
      card.className = 'world-clock-card' + (cl.isHome ? ' wc-home' : '');
      card.setAttribute('role', 'listitem');
      card.id = `wc-card-${i}`;

      const cityEl  = document.createElement('div');
      cityEl.className = 'wc-city';
      cityEl.textContent = cl.city;

      const timeEl  = document.createElement('div');
      timeEl.className = 'wc-time';
      timeEl.id = `wc-time-${i}`;
      timeEl.setAttribute('aria-live', 'off');

      const offEl   = document.createElement('div');
      offEl.className = 'wc-offset';
      offEl.id = `wc-offset-${i}`;

      card.appendChild(cityEl);
      card.appendChild(timeEl);
      card.appendChild(offEl);
      grid.appendChild(card);
    });

    // Update TZ badge
    const tzBadge = document.getElementById('user-tz-badge');
    if (tzBadge) {
      tzBadge.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace('_', ' ');
    }
  }

  // Format helpers
  function formatTime(date, tz) {
    try {
      return date.toLocaleTimeString('en-US', {
        timeZone:  tz,
        hour:      '2-digit',
        minute:    '2-digit',
        hour12:    false
      });
    } catch(e) {
      return '--:--';
    }
  }

  function getOffset(date, tz) {
    try {
      // Get UTC offset string
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone:     tz,
        timeZoneName: 'short'
      });
      const parts = fmt.formatToParts(date);
      const tzName = parts.find(p => p.type === 'timeZoneName');
      return tzName ? tzName.value : '';
    } catch(e) { return ''; }
  }

  function isDaytime(date, tz) {
    try {
      const h = parseInt(date.toLocaleTimeString('en-US', {
        timeZone: tz, hour: '2-digit', hour12: false
      }), 10);
      return h >= 6 && h < 20;
    } catch(e) { return true; }
  }

  function tick() {
    const now = new Date();

    // Local time in nav clock
    const liveTime = document.getElementById('live-clock-time');
    const liveDate = document.getElementById('live-clock-date');
    if (liveTime) {
      liveTime.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      });
    }
    if (liveDate) {
      liveDate.textContent = now.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      });
    }

    // World clocks
    CLOCKS.forEach((cl, i) => {
      const timeEl   = document.getElementById(`wc-time-${i}`);
      const offEl    = document.getElementById(`wc-offset-${i}`);
      if (!timeEl) return;

      if (cl.isHome) {
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false });
        if (offEl) offEl.textContent = 'Your local time';
      } else {
        timeEl.textContent = formatTime(now, cl.tz);
        const day = isDaytime(now, cl.tz) ? '☀️' : '🌙';
        if (offEl) offEl.textContent = `${day} ${getOffset(now, cl.tz)}`;
      }
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────────
  window.WorldClock = {
    init() {
      buildCards();
      tick();
      setInterval(tick, 1000);
    }
  };

  document.addEventListener('DOMContentLoaded', () => window.WorldClock.init());

})();
