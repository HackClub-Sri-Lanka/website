/* =========================================================
   HOME PAGE SCRIPT
   Animated stat counters + hero spotlight cards pulled live
   from the content/ CMS (latest project, next workshop).
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     ANIMATED STAT COUNTERS
  --------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    statNumbers.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1400;
      const startTime = performance.now();
      function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  const statsRibbon = document.querySelector('.stats-ribbon');
  if (statsRibbon) {
    const statsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) animateStats(); });
    }, { threshold: 0.4 });
    statsObserver.observe(statsRibbon);
  }

  /* ---------------------------------------------------------
     HERO SPOTLIGHT CARDS (fed by the CMS)
  --------------------------------------------------------- */
  const projectSpot = document.getElementById('spotlight-project');
  const workshopSpot = document.getElementById('spotlight-workshop');

  if (projectSpot && window.HCSLContent) {
    window.HCSLContent.loadCollection('content/projects')
      .then(projects => {
        if (!projects.length) { projectSpot.textContent = 'Be the first to ship one →'; return; }
        const latest = projects[0];
        projectSpot.textContent = `${latest.title} — ${latest.category || 'community build'}`;
      })
      .catch(() => { projectSpot.textContent = 'Projects coming soon'; });
  }

  if (workshopSpot && window.HCSLContent) {
    window.HCSLContent.loadCollection('content/workshops')
      .then(workshops => {
        const upcoming = workshops
          .filter(w => w.status === 'upcoming' && w.date)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        if (!upcoming.length) { workshopSpot.textContent = 'Stay tuned — new dates soon'; return; }
        const next = upcoming[0];
        workshopSpot.textContent = `${next.title} — ${next.displayDate || ''}`;
      })
      .catch(() => { workshopSpot.textContent = 'Schedule coming soon'; });
  }

});
