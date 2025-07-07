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

/* ---------- hero entrance ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const elements = [...document.querySelectorAll('#hero .reveal')];
  const baseDelay = 90;                       // ms between siblings
  elements.forEach((el, i) => {
    // honour prefers-reduced-motion
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { el.classList.add('reveal--in'); return; }

    setTimeout(() => el.classList.add('reveal--in'), i * baseDelay);
  });
});