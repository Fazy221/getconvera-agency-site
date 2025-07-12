"use strict";

// ---- Navbar Click to scroll ---- 
// Reusable ease (t = 0..1)
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function smoothScrollTo(targetSelector, duration = 800, offset = 0) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const startY = window.pageYOffset;
  const endY = target.getBoundingClientRect().top + startY - offset;
  const diff = endY - startY;
  const startT = performance.now();

  function step(now) {
    const elapsed = now - startT;
    const progress = Math.min(elapsed / duration, 1); // 0 → 1
    window.scrollTo(0, startY + diff * easeInOutQuad(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Attach to all in-page links
document.querySelectorAll('a.scroll-link[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    smoothScrollTo(link.getAttribute("href"), 1200, 70); // 1.2 s, 70 px header
  });
});

// ---- Navbar scroll to trigger changes ---- 
const header = document.getElementById('site-header');
const SCROLL_TRIGGER = 80;             // px from top before state change

window.addEventListener('scroll', () => {
  header.classList.toggle('nav--scrolled', window.scrollY > SCROLL_TRIGGER);
});

/* reveal.js  – drop this just before </body> */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('reveal--in'));
    return;
  }

  /* --- tweakables --- */
  const BASE_DELAY   = window.innerWidth < 600 ? 40 : 60; // ms
  const MAX_STAGGER  = 6;                                 // after this, show immediately

  let currentSection = null;
  let seqIndex       = 0;

  const io = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el       = entry.target;
      const section  = el.closest('section,[id="hero"]') || document.body;

      if (section !== currentSection) {          // new section → reset
        currentSection = section;
        seqIndex = 0;
      }

      const delay = Math.min(seqIndex, MAX_STAGGER) * BASE_DELAY;
      setTimeout(() => el.classList.add('reveal--in'), delay);
      seqIndex++;

      io.unobserve(el);
    }),
    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }    // tiny pre-load bump
  );

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

var indian = 'pajeet';
function shittingToiler() {
  var indian = 'saaar';
  console.log(indian);
}
shittingToiler();