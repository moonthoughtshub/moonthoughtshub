// MoonThoughts Hub — main.js

// ── Stars ─────────────────────────────────────────────────
(function generateStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  const count = window.innerWidth < 768 ? 80 : 180;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.2 + 0.4;
    star.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `top:${Math.random() * 100}%`,
      `left:${Math.random() * 100}%`,
      `--dur:${(Math.random() * 4 + 2).toFixed(1)}s`,
      `--delay:${(Math.random() * 6).toFixed(1)}s`,
      `--bright:${(Math.random() * 0.5 + 0.3).toFixed(2)}`,
    ].join(';');
    container.appendChild(star);
  }
})();

// ── Nav scroll effect ──────────────────────────────────────
(function navScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Mobile nav toggle ──────────────────────────────────────
(function mobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMobile');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.textContent = menu.classList.contains('open') ? '✕' : '☰';
  });
  // Close on link click
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.textContent = '☰';
    })
  );
})();

// ── Smooth scroll for anchor links ────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

// ── Card entrance animation on scroll ─────────────────────
(function cardReveal() {
  const cards = document.querySelectorAll('.card');
  if (!cards.length || !('IntersectionObserver' in window)) return;

  const style = document.createElement('style');
  style.textContent = `
    .card { opacity: 0; transform: translateY(24px); transition: opacity 0.5s ease, transform 0.5s ease; }
    .card.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${(i % 3) * 0.08}s`;
    observer.observe(card);
  });
})();
