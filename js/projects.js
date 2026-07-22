/* =========================================================
   PROJECTS PAGE SCRIPT
   Renders content/projects/*.md into the gallery, builds
   category filters dynamically, and handles "see more".
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const projectsGrid = document.getElementById('projects-grid');
  const filterBar = document.getElementById('filter-bar');
  if (!projectsGrid || !window.HCSLContent) return;

  const escapeHtml = window.HCSLContent.escapeHtml;
  let projects = [];

  function slugify(str) {
    return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function renderFilters() {
    const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];
    const buttons = ['<button class="filter-btn active" data-filter="all">All</button>']
      .concat(categories.map(cat => `<button class="filter-btn" data-filter="${slugify(cat)}">${escapeHtml(cat)}</button>`));
    filterBar.innerHTML = buttons.join('');
  }

  function renderProjects() {
    if (!projects.length) {
      projectsGrid.innerHTML = '<p class="projects-status">No projects published yet — be the first to ship one!</p>';
      return;
    }

    const cards = projects.map(p => {
      const desc = p.bodyHtml || `<p>${escapeHtml(p.description || '')}</p>`;
      const isLong = (p.body || '').length > 180;
      const tags = Array.isArray(p.tags) ? p.tags : (p.tags ? [p.tags] : []);
      const demoOk = /^https?:\/\//.test(p.demoUrl || '');
      const repoOk = /^https?:\/\//.test(p.repoUrl || '');

      return `
        <div class="project-card reveal" data-cat="${slugify(p.category || 'other')}">
          <span class="project-cat">${escapeHtml(p.category || 'Other')}</span>
          <h3 class="project-title">${escapeHtml(p.title || 'Untitled project')}</h3>
          <div class="project-desc${isLong ? ' is-collapsed' : ''}">${desc}</div>
          ${isLong ? '<button class="project-desc-toggle" aria-expanded="false">See more</button>' : ''}
          <div class="project-tags">${tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
          <div class="project-links">
            ${demoOk ? `<a href="${escapeHtml(p.demoUrl)}" target="_blank" rel="noopener">Live demo →</a>` : ''}
            ${repoOk ? `<a href="${escapeHtml(p.repoUrl)}" target="_blank" rel="noopener">GitHub →</a>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const submitCard = `
      <div class="project-card submit-card reveal">
        <span class="plus">+</span>
        <h3 class="project-title">Submit your project</h3>
        <p class="project-desc">Shipped something? Get it featured here.</p>
        <button class="btn btn-ghost" data-open-register>Submit a project</button>
      </div>
    `;

    projectsGrid.innerHTML = cards + submitCard;
    window.HCSL && window.HCSL.setupRevealObserver && window.HCSL.setupRevealObserver();
  }

  window.HCSLContent.loadCollection('content/projects')
    .then(feed => {
      projects = feed;
      renderFilters();
      renderProjects();
    })
    .catch(() => {
      projectsGrid.innerHTML = '<p class="projects-status">Projects are temporarily unavailable. Please try again soon.</p>';
      filterBar.hidden = true;
    });

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.project-card[data-cat]').forEach(card => {
      const show = filter === 'all' || card.getAttribute('data-cat') === filter;
      card.classList.toggle('hidden', !show);
    });
  });

  projectsGrid.addEventListener('click', e => {
    const toggle = e.target.closest('.project-desc-toggle');
    if (!toggle) return;
    const description = toggle.previousElementSibling;
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    description.classList.toggle('is-collapsed', isExpanded);
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    toggle.textContent = isExpanded ? 'See more' : 'See less';
  });
});
