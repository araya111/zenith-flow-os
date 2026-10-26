/* ==========================================================================
   analytics.js — Weekly Focus Analytics for Zenith Flow OS
   ========================================================================== */

(function() {
  'use strict';

  const STORAGE_KEY = 'zfo_daily_focus_v2';  // { 'YYYY-MM-DD': { minutes, sessions } }

  let focusData = {};

  // ── Helpers ────────────────────────────────────────────────────────────────
  function todayKey() { return new Date().toLocaleDateString('en-CA'); }

  function dayKey(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('en-CA');
  }

  const DAY_LABELS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function dayLabel(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return DAY_LABELS_SHORT[d.getDay()];
  }

  // ── Load & Save ────────────────────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) focusData = JSON.parse(raw);
    } catch(e) {}
    renderChart();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(focusData));
  }

  // ── Public: Record a completed focus session ───────────────────────────────
  function recordSession(durationMinutes) {
    const key = todayKey();
    if (!focusData[key]) focusData[key] = { minutes: 0, sessions: 0 };
    focusData[key].minutes  += durationMinutes;
    focusData[key].sessions += 1;
    save();
    renderChart();
  }

  // ── Chart Render ───────────────────────────────────────────────────────────
  function renderChart() {
    const chart = document.getElementById('focus-chart');
    if (!chart) return;

    // Collect last 7 days (oldest first → index 6 = today)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const key  = dayKey(i);
      const data = focusData[key] || { minutes: 0, sessions: 0 };
      days.push({ key, label: dayLabel(i), minutes: data.minutes, sessions: data.sessions, isToday: i === 0 });
    }

    // Max for scaling
    const maxMin = Math.max(...days.map(d => d.minutes), 30); // floor at 30m for aesthetics
    const chartHeight = 90; // usable px height

    // Clear existing bars (keep baseline)
    const existing = chart.querySelectorAll('.chart-bar-group');
    existing.forEach(el => el.remove());

    let totalMin = 0, totalSessions = 0, bestMin = 0;

    days.forEach(day => {
      totalMin      += day.minutes;
      totalSessions += day.sessions;
      if (day.minutes > bestMin) bestMin = day.minutes;

      const barH = day.minutes > 0
        ? Math.max(4, Math.round((day.minutes / maxMin) * chartHeight))
        : 3;

      const group = document.createElement('div');
      group.className = 'chart-bar-group' + (day.isToday ? ' chart-today' : '');
      group.style.height = '100%';

      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height    = '3px'; // start small for animation
      bar.style.minHeight = '3px';

      const tip = document.createElement('div');
      tip.className = 'chart-bar-tip';
      tip.textContent = day.minutes > 0 ? `${day.minutes}m` : '–';

      const label = document.createElement('div');
      label.className = 'chart-day-label';
      label.textContent = day.label;
      label.setAttribute('aria-label', `${day.label}: ${day.minutes} focus minutes`);

      bar.appendChild(tip);
      group.appendChild(bar);
      group.appendChild(label);
      chart.appendChild(group);

      // Animate bar height after paint
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.transition = 'height 0.7s cubic-bezier(0.16,1,0.3,1)';
          bar.style.height = `${barH}px`;
        });
      });
    });

    // Update summary
    const avg = days.length > 0 ? Math.round(totalMin / 7) : 0;

    const fmt = m => m >= 60 ? `${Math.floor(m/60)}h${m%60 > 0 ? (m%60)+'m' : ''}` : `${m}m`;

    const elTotal    = document.getElementById('analytics-total');
    const elAvg      = document.getElementById('analytics-avg');
    const elBest     = document.getElementById('analytics-best');
    const elSessions = document.getElementById('analytics-sessions');

    if (elTotal)    elTotal.textContent    = totalMin > 0 ? fmt(totalMin) : '0m';
    if (elAvg)      elAvg.textContent      = avg > 0 ? fmt(avg) : '0m';
    if (elBest)     elBest.textContent     = bestMin > 0 ? fmt(bestMin) : '0m';
    if (elSessions) elSessions.textContent = totalSessions;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  window.FocusAnalytics = {
    init: load,
    recordSession,
    renderChart,
    getTodayMinutes() {
      const d = focusData[todayKey()];
      return d ? d.minutes : 0;
    }
  };

  document.addEventListener('DOMContentLoaded', load);

})();
