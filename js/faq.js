/* =========================================================
   FAQ PAGE SCRIPT
   Renders content/faq/*.md into an accordion.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const faqAccordion = document.getElementById('faq-accordion');
  if (!faqAccordion || !window.HCSLContent) return;

  const escapeHtml = window.HCSLContent.escapeHtml;

  window.HCSLContent.loadCollection('content/faq')
    .then(items => {
      if (!items.length) {
        faqAccordion.innerHTML = '<p class="projects-status">Questions are coming soon.</p>';
        return;
      }
      faqAccordion.innerHTML = items.map((item, i) => `
        <div class="faq-item" data-index="${i}">
          <button class="faq-question" aria-expanded="false">
            <span>${escapeHtml(item.question || 'Untitled question')}</span>
            <span class="plus-icon">+</span>
          </button>
          <div class="faq-answer">${item.bodyHtml || ''}</div>
        </div>
      `).join('');
    })
    .catch(() => {
      faqAccordion.innerHTML = '<p class="projects-status">Questions are temporarily unavailable.</p>';
    });

  faqAccordion.addEventListener('click', e => {
    const question = e.target.closest('.faq-question');
    if (!question) return;
    const item = question.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    faqAccordion.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});
