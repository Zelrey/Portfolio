/* =========================================================
   Zelrey — Portfolio interactions
   ========================================================= */

(function () {
  "use strict";

  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-nav]");
  const navCenter = document.querySelector(".nav-center");
  const navToggle = document.querySelector(".nav-toggle");
  const contactTriggers = document.querySelectorAll("[data-contact]");
  const modalBackdrop = document.getElementById("contact-modal");
  const modalClose = document.querySelectorAll("[data-close-modal]");
  const contactForm = document.getElementById("contact-form");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox ? lightbox.querySelector("img") : null;

  /* ---------- SPA-style page routing ---------- */
  function showPage(id) {
    const target = id || "home";
    pages.forEach((page) => {
      page.classList.toggle("active", page.id === `page-${target}`);
    });
    document.body.classList.toggle("theme-light", target === "projects");
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("data-nav") === target;
      link.classList.toggle("active", isActive);
    });
    // Close mobile nav
    if (navCenter) navCenter.classList.remove("open");
    // Scroll top
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    // Update hash without jump
    if (history.replaceState) {
      history.replaceState(null, "", `#${target}`);
    } else {
      location.hash = target;
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showPage(link.getAttribute("data-nav"));
    });
  });

  // Initial route
  const initial = (location.hash || "#home").replace("#", "") || "home";
  showPage(["home", "projects", "art", "info"].includes(initial) ? initial : "home");

  window.addEventListener("hashchange", () => {
    const h = (location.hash || "#home").replace("#", "");
    if (["home", "projects", "art", "info"].includes(h)) showPage(h);
  });

  /* ---------- Mobile nav ---------- */
  if (navToggle && navCenter) {
    navToggle.addEventListener("click", () => {
      navCenter.classList.toggle("open");
    });
  }

  /* ---------- Contact modal ---------- */
  function openModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const first = modalBackdrop.querySelector("input, textarea, button");
    if (first) setTimeout(() => first.focus(), 80);
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove("open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  contactTriggers.forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  }));

  modalClose.forEach((el) => el.addEventListener("click", closeModal));

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeLightbox();
    }
  });

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const status = document.getElementById("form-status");
      const original = btn ? btn.textContent : "Send message";

      // Honeypot — bots only
      const honey = contactForm.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      if (btn) {
        btn.textContent = "Sending…";
        btn.disabled = true;
      }
      if (status) {
        status.textContent = "";
        status.classList.remove("is-ok", "is-err");
      }

      const data = new FormData(contactForm);

      try {
        const res = await fetch("https://formsubmit.co/ajax/mcclasen199@gmail.com", {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error("send failed");

        if (status) {
          status.textContent = "Sent — I’ll get back to you soon.";
          status.classList.add("is-ok");
        }
        if (btn) btn.textContent = "Sent";
        contactForm.reset();
        setTimeout(() => {
          closeModal();
          if (btn) {
            btn.textContent = original;
            btn.disabled = false;
          }
          if (status) {
            status.textContent = "";
            status.classList.remove("is-ok", "is-err");
          }
        }, 1600);
      } catch (err) {
        if (status) {
          status.textContent = "Couldn’t send. Email me at mcclasen199@gmail.com";
          status.classList.add("is-err");
        }
        if (btn) {
          btn.textContent = original;
          btn.disabled = false;
        }
      }
    });
  }

  /* ---------- Lightbox for art / projects ---------- */
  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach((el) => {
    el.addEventListener("click", () => {
      const img = el.querySelector("img") || el;
      const src = img.currentSrc || img.src;
      openLightbox(src, img.alt);
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", closeLightbox);
  }

  /* ---------- Soft parallax on hero ---------- */
  const heroBg = document.querySelector(".hero-bg img");
  if (heroBg) {
    window.addEventListener(
      "scroll",
      () => {
        if (!document.getElementById("page-home")?.classList.contains("active")) return;
        const y = window.scrollY;
        heroBg.style.transform = `scale(1.05) translate3d(0, ${y * 0.12}px, 0)`;
      },
      { passive: true }
    );
  }

  /* ---------- Reveal on scroll (projects / art) ---------- */
  const revealEls = document.querySelectorAll(".project-card, .art-item, .job");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)";
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transitionDelay = `${(i % 6) * 0.05}s`;
      io.observe(el);
    });
  }

  /* ---------- Projects 4-Option View Switcher ---------- */
  const projectsPage = document.getElementById("page-projects");
  const viewButtons = document.querySelectorAll(".view-btn[data-view]");
  if (projectsPage && viewButtons.length) {
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const viewCols = btn.getAttribute("data-view");
        viewButtons.forEach((b) => {
          b.classList.toggle("active", b.getAttribute("data-view") === viewCols);
        });
        projectsPage.classList.remove(
          "view-cols-1",
          "view-cols-2",
          "view-cols-3",
          "view-cols-4"
        );
        projectsPage.classList.add(`view-cols-${viewCols}`);
      });
    });
  }
})();
