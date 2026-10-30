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

// ── Easter egg: the moon plays the music ──────────────────
// Click (or Enter on) the 🌙 in the nav: the MoonThoughts theme fades in and loops; click
// again to stop. Nothing downloads until then, and it never starts on its own — browsers
// block sound before a click anyway. A visitor who turned it on keeps it on page to page
// (it resumes where it left off, on the first tap if the browser insists on one).
(function moonMusic() {
  const moon = document.querySelector('.nav .moon-icon');
  if (!moon) return;
  const KEY = 'mt-music', POS = 'mt-music-pos', VOL = 0.35;
  const store = {
    get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} },
  };
  let audio = null, fade = null;

  moon.setAttribute('role', 'button');
  moon.setAttribute('tabindex', '0');
  moon.setAttribute('aria-pressed', 'false');
  moon.setAttribute('aria-label', 'Play music');

  function getAudio() {
    if (!audio) {
      audio = new Audio('audio/moonthoughts-theme.mp3');
      audio.loop = true;
      audio.volume = 0;
      const pos = parseFloat(store.get(POS, true));
      if (pos > 0) audio.addEventListener('loadedmetadata', () => { audio.currentTime = pos % (audio.duration || pos + 1); }, { once: true });
      window.addEventListener('pagehide', () => { if (!audio.paused) store.set(POS, String(audio.currentTime), true); });
    }
    return audio;
  }
  function ramp(to, done) {
    clearInterval(fade);
    fade = setInterval(() => {
      const v = audio.volume + (to > audio.volume ? 0.02 : -0.03);
      if ((to > audio.volume && v >= to) || (to <= audio.volume && v <= to)) {
        audio.volume = to; clearInterval(fade); if (done) done();
      } else audio.volume = Math.max(0, Math.min(1, v));
    }, 50);
  }
  function show(on) {
    moon.classList.toggle('playing', on);
    moon.setAttribute('aria-pressed', String(on));
    moon.setAttribute('aria-label', on ? 'Stop music' : 'Play music');
  }
  function start() {
    const a = getAudio();
    return a.play().then(() => { show(true); ramp(VOL); store.set(KEY, 'on'); });
  }
  function stop() {
    store.set(KEY, 'off');
    store.set(POS, String(audio.currentTime), true);
    show(false);
    ramp(0, () => audio.pause());
  }
  function toggle(e) {
    e.preventDefault(); e.stopPropagation();          // the moon sits inside the home link
    if (audio && !audio.paused && !moon.classList.contains('resume')) stop();
    else { moon.classList.remove('resume'); start().catch(() => {}); }
  }
  moon.addEventListener('click', toggle);
  moon.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle(e); });

  // Turned on earlier: carry on. If the browser wants a gesture first, resume on the first one.
  if (store.get(KEY) === 'on') {
    start().catch(() => {
      moon.classList.add('resume');
      const resume = ev => {
        if (moon.contains(ev.target)) return;           // the moon handles its own click
        ['pointerdown', 'keydown'].forEach(t => document.removeEventListener(t, resume, true));
        moon.classList.remove('resume');
        start().catch(() => {});
      };
      ['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, resume, true));
    });
  }
})();

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
