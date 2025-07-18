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
const header = document.getElementById("site-header");
const SCROLL_TRIGGER = 80; // px from top before state change

window.addEventListener("scroll", () => {
  header.classList.toggle("nav--scrolled", window.scrollY > SCROLL_TRIGGER);
});

/* reveal.js  – drop this just before </body> */
(() => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReduced) {
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("reveal--in"));
    return;
  }

  /* --- tweakables --- */
  const BASE_DELAY = window.innerWidth < 600 ? 40 : 60; // ms
  const MAX_STAGGER = 6; // after this, show immediately

  let currentSection = null;
  let seqIndex = 0;

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const section = el.closest('section,[id="hero"]') || document.body;

        if (section !== currentSection) {
          // new section → reset
          currentSection = section;
          seqIndex = 0;
        }

        const delay = Math.min(seqIndex, MAX_STAGGER) * BASE_DELAY;
        setTimeout(() => el.classList.add("reveal--in"), delay);
        seqIndex++;

        io.unobserve(el);
      }),
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" } // tiny pre-load bump
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

// For dynamically active on section scrollvoer
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("nav a");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      const navLink = document.querySelector(`nav a[href="#${id}"]`);

      if (entry.isIntersecting) {
        navLinks.forEach((link) => link.classList.remove("active"));
        if (navLink) navLink.classList.add("active");
      }
    });
  },
  {
    threshold: 0.2, // Trigger when 50% of the section is visible
  }
);

sections.forEach((section) => observer.observe(section));

// Scroll to call section from hero btn
document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const targetSelector = btn.getAttribute("data-scroll-to");
    smoothScrollTo(targetSelector, 1200, 70); // adjust duration & offset if needed
  });
});

// === Brand Selector Logic ===
document.addEventListener("DOMContentLoaded", () => {
  const brandItems = document.querySelectorAll(".hero__target-brand");
  const brandImage = document.getElementById("brand-preview-img");
  const spinner = document.getElementById("brand-spinner");

  let activeBrand = null;

  brandItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      // If already selected, don't re-trigger
      if (item === activeBrand) return;

      // Remove active class
      if (activeBrand) activeBrand.classList.remove("active");

      item.classList.add("active");
      activeBrand = item;

      // Show spinner
      spinner.style.display = "flex";

      const tempImg = new Image();
      const newSrc = `./assets/hero__target__brand-detail_img-${index + 1}.png`;

      tempImg.src = newSrc;

      tempImg.onload = () => {
        brandImage.src = newSrc;
        brandImage.alt = item.innerText.trim();

        // Small delay to simulate smooth transition
        setTimeout(() => {
          spinner.style.display = "none";
        }, 200); // Optional
      };
    });
  });
});


// Skeleton loading
// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  const showcaseImages = document.querySelectorAll(
    ".work__showcase-img-container"
  );

  showcaseImages.forEach((container) => {
    const img = container.querySelector("img");

    // If already loaded from cache
    if (img.complete) {
      container.classList.add("loaded");
    } else {
      img.addEventListener("load", () => {
        container.classList.add("loaded");
      });
    }
  });
});
// Change nav btn content
function updateNavBtnText() {
  const btn = document.querySelector(".nav-btn-content-change");
  const btnOutline = document.querySelector(".btn--outline--hid");
  const btnText = btn?.querySelector(".nav-btn-text");
  const btnIcon = btn?.querySelector(".btn--icon");

  if (!btnText || !btnIcon) return;

  if (window.innerWidth < 540) {
    btnText.innerText = "Book Now";
    btnIcon.style.display = "none";
    btnOutline.style.display = "flex";
  } else {
    btnText.innerText = "Book Free Consultation";
    btnIcon.style.display = "inline-block";
    btnOutline.style.display = "none";
  }
}

// Run on load and on resize
window.addEventListener("DOMContentLoaded", updateNavBtnText);
window.addEventListener("resize", updateNavBtnText);
