/* =========================================================
   WORKSHOPS PAGE SCRIPT
   Renders content/workshops/*.md into a timeline and drives
   the live countdown to the soonest upcoming session.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const timelineEl = document.getElementById('workshops-timeline');
  if (!timelineEl || !window.HCSLContent) return;

  const escapeHtml = window.HCSLContent.escapeHtml;
  let countdownTarget = null;
  let countdownInterval = null;

  function renderTimeline(workshops) {
    if (!workshops.length) {
      timelineEl.innerHTML = '<p class="projects-status">No workshops scheduled yet — check back soon.</p>';
      return;
    }
    // Soonest first: upcoming (by date ascending) then past (by date descending)
    const upcoming = workshops.filter(w => w.status === 'upcoming' && w.date).sort((a, b) => new Date(a.date) - new Date(b.date));
    const past = workshops.filter(w => w.status !== 'upcoming').sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    const ordered = [...upcoming, ...past];

    timelineEl.innerHTML = ordered.map(w => `
      <div class="workshop-item ${w.status === 'past' ? 'past' : ''} reveal">
        <p class="workshop-date">${escapeHtml(w.displayDate || '')}</p>
        <h4 class="workshop-name">${escapeHtml(w.title || 'Untitled workshop')}</h4>
        <div class="workshop-desc">${w.bodyHtml || ''}</div>
        <span class="workshop-badge">${w.status === 'past' ? 'Completed' : 'Upcoming'}</span>
        ${w.status !== 'past' ? '<div class="workshop-register"><button class="btn btn-ghost" data-open-register>Register</button></div>' : ''}
      </div>
    `).join('');

    window.HCSL && window.HCSL.setupRevealObserver && window.HCSL.setupRevealObserver();

    // Re-bind the newly injected "Register" buttons to the shared modal opener.
    if (window.HCSL && window.HCSL.openRegisterModal) {
      timelineEl.querySelectorAll('[data-open-register]').forEach(btn => {
        btn.addEventListener('click', window.HCSL.openRegisterModal);
      });
    }

    countdownTarget = upcoming.length ? new Date(upcoming[0].date).getTime() : null;
    startCountdown();
  }

  function updateCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    if (!daysEl) return;

    if (!countdownTarget) {
      [daysEl, hoursEl, minsEl, secsEl].forEach(el => el.textContent = '--');
      return;
    }

    let diff = countdownTarget - Date.now();
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
  }

  function startCountdown() {
    updateCountdown();
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  window.HCSLContent.loadCollection('content/workshops')
    .then(renderTimeline)
    .catch(() => {
      timelineEl.innerHTML = '<p class="projects-status">Schedule is temporarily unavailable. Please try again soon.</p>';
    });
});
