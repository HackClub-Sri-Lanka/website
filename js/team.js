/* =========================================================
   TEAM PAGE SCRIPT
   Renders content/team/*.md into the team grid.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const teamGrid = document.getElementById('team-grid');
  if (!teamGrid || !window.HCSLContent) return;

  const escapeHtml = window.HCSLContent.escapeHtml;

  function initials(name) {
    return String(name).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  window.HCSLContent.loadCollection('content/team')
    .then(team => {
      if (!team.length) {
        teamGrid.innerHTML = '<p class="team-status">Team profiles are coming soon.</p>';
        return;
      }
      teamGrid.innerHTML = team.map(person => `
        <div class="team-card reveal">
          <div class="team-avatar" style="background:${person.color || '#ec3750'}">${initials(person.name || '?')}</div>
          <h3 class="team-name">${escapeHtml(person.name || 'Unnamed')}</h3>
          <p class="team-role">${escapeHtml(person.role || '')}</p>
          ${person.tag ? `<span class="team-tag">${escapeHtml(person.tag)}</span>` : ''}
          ${person.bodyHtml ? `<div class="team-bio">${person.bodyHtml}</div>` : ''}
          <div class="team-socials">
            ${person.github ? `<a href="${escapeHtml(person.github)}" target="_blank" rel="noopener" aria-label="${escapeHtml(person.name)} on GitHub">GH</a>` : ''}
            ${person.linkedin ? `<a href="${escapeHtml(person.linkedin)}" target="_blank" rel="noopener" aria-label="${escapeHtml(person.name)} on LinkedIn">in</a>` : ''}
            ${person.x ? `<a href="${escapeHtml(person.x)}" target="_blank" rel="noopener" aria-label="${escapeHtml(person.name)} on X">X</a>` : ''}
          </div>
        </div>
      `).join('');
      window.HCSL && window.HCSL.setupRevealObserver && window.HCSL.setupRevealObserver();
    })
    .catch(() => {
      teamGrid.innerHTML = '<p class="team-status">Team profiles are temporarily unavailable.</p>';
    });
});
