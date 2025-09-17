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

document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.querySelector(".testimonial__right-block");
  const col1 = document.querySelector(".review-col-1");
  const col2 = document.querySelector(".review-col-2");
  if (!wrap || !col1 || !col2) return;

  const MQ = window.matchMedia("(max-width: 960px)");
  const speed = 40; // px/sec
  let mode = MQ.matches ? "single" : "dual";
  let runToken = 0; // cancels in-flight loops on mode switch

  // --- helpers ---
  function duplicateChildren(col) {
    // Duplicate children once, store original height before duplication
    if (!col.dataset.duped) {
      const h = col.scrollHeight;
      col.dataset.origH = String(h);
      col.insertAdjacentHTML("beforeend", col.innerHTML);
      col.dataset.duped = "1";
      col.style.willChange = "transform";
    }
    return Number(col.dataset.origH) || Math.max(1, col.scrollHeight / 2);
  }

  function resetTransforms() {
    [col1, col2].forEach((c) => (c.style.transform = "translateY(0)"));
  }

  // --- continuous loop (for dual mode) ---
  function startContinuous(col, direction) {
    const token = runToken;
    const origH = duplicateChildren(col);
    const dir = direction === "down" ? 1 : -1;
    let last = performance.now();
    let offset = 0;

    function step(now) {
      if (token !== runToken || mode !== "dual") return; // aborted
      const dt = (now - last) / 1000;
      last = now;
      offset += speed * dt * dir;
      col.style.transform = `translateY(${offset}px)`;
      if (Math.abs(offset) >= origH) offset %= origH;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // --- one full cycle (for single mode) ---
  function animateOneCycle(col, direction) {
    const token = runToken;
    const origH = duplicateChildren(col);
    const dir = direction === "down" ? 1 : -1;
    let last = performance.now();
    let offset = 0;

    return new Promise((resolve) => {
      function step(now) {
        if (token !== runToken || mode !== "single") return resolve(); // aborted
        const dt = (now - last) / 1000;
        last = now;
        offset += speed * dt * dir;
        col.style.transform = `translateY(${offset}px)`;
        if (Math.abs(offset) >= origH) {
          col.style.transform = "translateY(0)"; // reset for next time
          resolve();
          return;
        }
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // --- layout toggles for single-track overlay ---
  function setOverlay(activeCol) {
    wrap.classList.add("single-track");
    [col1, col2].forEach((c) => {
      c.style.position = "absolute";
      c.style.inset = "0";
      c.style.opacity = c === activeCol ? "1" : "0";
      c.style.pointerEvents = c === activeCol ? "auto" : "none";
    });
  }
  function clearOverlay() {
    wrap.classList.remove("single-track");
    [col1, col2].forEach((c) => {
      c.style.position = "";
      c.style.inset = "";
      c.style.opacity = "";
      c.style.pointerEvents = "";
    });
  }

  // --- mode runners ---
  async function runSingle() {
    runToken++; // cancel previous
    const myToken = runToken;
    resetTransforms();
    while (mode === "single" && myToken === runToken) {
      setOverlay(col1);
      await animateOneCycle(col1, "down");
      if (mode !== "single" || myToken !== runToken) break;
      setOverlay(col2);
      await animateOneCycle(col2, "up");
    }
  }

  function runDual() {
    runToken++; // cancel previous
    resetTransforms();
    clearOverlay();
    startContinuous(col1, "down");
    startContinuous(col2, "up");
  }

  function applyMode() {
    mode = MQ.matches ? "single" : "dual";
    MQ.matches ? runSingle() : runDual();
  }

  // init + listen for resizes
  applyMode();
  if (MQ.addEventListener) MQ.addEventListener("change", applyMode);
  else MQ.addListener(applyMode); // Safari fallback
});

document.addEventListener("DOMContentLoaded", () => {
  const accordionItemsFaq = document.querySelectorAll(".accordion button");

  function toggleAccordion() {
    const itemToggle = this.getAttribute("aria-expanded");

    for (let i = 0; i < accordionItemsFaq.length; i++) {
      accordionItemsFaq[i].setAttribute("aria-expanded", "false");
    }

    if (itemToggle == "false") {
      this.setAttribute("aria-expanded", "true");
    }
  }

  accordionItemsFaq.forEach((item) =>
    item.addEventListener("click", toggleAccordion)
  );
});
