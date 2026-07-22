/* =========================================================
   HCSL MAIN SCRIPT — shared across every page
   Handles: header scroll state, mobile menu, active nav link,
   back-to-top, the Register modal (Fillout embed), the
   announcement popup, and scroll-reveal animation.
   ========================================================= */

const HCSL_LINKS = {
  registerForm: 'https://forms.fillout.com/t/1WFp8Hadxuus',
  whatsapp: 'https://chat.whatsapp.com/GAh3WmI3wQtKqZRGu0KXlz'
};

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     STICKY HEADER + BACK TO TOP
  --------------------------------------------------------- */
  const header = document.getElementById('site-header');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    header && header.classList.toggle('scrolled', window.scrollY > 20);
    backToTop && backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  backToTop && backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------------------------------------------------------
     MOBILE MENU
  --------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function closeMobileMenu() {
    hamburger && hamburger.classList.remove('open');
    mobileMenu && mobileMenu.classList.remove('open');
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeMobileMenu));
  }

  /* ---------------------------------------------------------
     ACTIVE NAV LINK (based on current page, multi-page site)
  --------------------------------------------------------- */
  const currentPage = (location.pathname.split('/').pop() || 'index.html') || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------------------------------------------------------
     WHATSAPP "JOIN COMMUNITY" BUTTONS
     Any element with [data-whatsapp-link] gets wired up so the
     URL only has to live in one place.
  --------------------------------------------------------- */
  document.querySelectorAll('[data-whatsapp-link]').forEach(el => {
    if (el.tagName === 'A') el.setAttribute('href', HCSL_LINKS.whatsapp);
  });

  /* ---------------------------------------------------------
     REGISTER MODAL (Fillout form embedded in-page)
  --------------------------------------------------------- */
  const registerModal = document.getElementById('register-modal');
  const registerIframe = document.getElementById('register-iframe');
  const registerLoading = document.getElementById('register-loading');

  function openRegisterModal() {
    if (!registerModal) return;
    if (registerIframe && !registerIframe.getAttribute('src')) {
      registerIframe.setAttribute('src', HCSL_LINKS.registerForm);
    }
    registerModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeRegisterModal() {
    if (!registerModal) return;
    registerModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-register]').forEach(btn => {
    btn.addEventListener('click', openRegisterModal);
  });
  document.getElementById('register-modal-close') && document.getElementById('register-modal-close').addEventListener('click', closeRegisterModal);
  registerModal && registerModal.addEventListener('click', e => { if (e.target === registerModal) closeRegisterModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && registerModal && registerModal.classList.contains('open')) closeRegisterModal(); });

  if (registerIframe && registerLoading) {
    registerIframe.addEventListener('load', () => registerLoading.classList.add('hidden'));
  }

  window.HCSL = window.HCSL || {};
  window.HCSL.openRegisterModal = openRegisterModal;

  /* ---------------------------------------------------------
     ANNOUNCEMENT POPUP (content/announcement.md)
  --------------------------------------------------------- */
  const popup = document.getElementById('announcement-popup');
  if (popup && window.HCSLContent) {
    const DISMISS_KEY = 'hcsl-announcement-dismissed';

    window.HCSLContent.loadSingle('content/announcement.md')
      .then(data => {
        if (!data.active) return;
        const dismissedTitle = sessionStorage.getItem(DISMISS_KEY);
        if (dismissedTitle === data.title) return;

        popup.querySelector('.announcement-title').textContent = data.title || 'News';
        popup.querySelector('.announcement-message').textContent = data.message || '';

        const actionBtn = popup.querySelector('.announcement-action');
        if (data.linkLabel) {
          actionBtn.textContent = data.linkLabel;
          actionBtn.hidden = false;
          actionBtn.onclick = () => {
            if (data.linkType === 'register') {
              openRegisterModal();
            } else if (data.link) {
              window.open(data.link, '_blank', 'noopener');
            }
          };
        } else {
          actionBtn.hidden = true;
        }

        setTimeout(() => popup.classList.add('visible'), 900);

        popup.querySelector('.announcement-close').addEventListener('click', () => {
          popup.classList.remove('visible');
          sessionStorage.setItem(DISMISS_KEY, data.title);
        });
      })
      .catch(() => { /* no announcement file yet — fail silently */ });
  }

  /* ---------------------------------------------------------
     SCROLL REVEAL ANIMATION
     Exposed globally so page scripts can re-run it after they
     inject content fetched from the CMS.
  --------------------------------------------------------- */
  function setupRevealObserver() {
    const revealEls = document.querySelectorAll('.reveal:not(.observed)');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => {
      el.classList.add('observed');
      observer.observe(el);
    });
  }
  setupRevealObserver();
  window.HCSL.setupRevealObserver = setupRevealObserver;

});

