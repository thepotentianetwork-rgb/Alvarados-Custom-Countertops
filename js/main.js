(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const FORMSPREE_URL = "https://formspree.io/f/mredlobr";
  const form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const success = document.getElementById("form-success");
      const errorEl = document.getElementById("form-error");
      const originalLabel = btn ? btn.textContent : "";

      if (success) success.classList.remove("show");
      if (errorEl) errorEl.classList.remove("show");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      const data = new FormData(form);
      const payload = {
        name: (data.get("name") || "").toString().trim(),
        email: (data.get("email") || "").toString().trim(),
        phone: (data.get("phone") || "").toString().trim(),
        service: (data.get("service") || "").toString().trim(),
        projectType: (data.get("projectType") || "").toString().trim(),
        message: (data.get("message") || "").toString().trim(),
        _subject: "Quote Request — Alvarado's Custom & Countertops",
      };

      try {
        const res = await fetch(FORMSPREE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          form.reset();
          if (success) success.classList.add("show");
        } else {
          throw new Error("Formspree error");
        }
      } catch (err) {
        console.error(err);
        if (errorEl) errorEl.classList.add("show");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalLabel || "Send Quote Request";
        }
      }
    });
  }

  // Inline project videos: load + play only when in view, pause when out.
  const vids = document.querySelectorAll("video.inline-video");
  if (vids.length) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showControls = (v) => { v.controls = true; v.preload = "metadata"; };
    if (reduce || !("IntersectionObserver" in window)) {
      vids.forEach(showControls);
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          const v = en.target;
          if (en.isIntersecting) {
            if (v.controls) return;
            const p = v.play();
            // A quick scroll-past pauses before play() resolves (AbortError); only fall back to controls when playback is truly blocked.
            if (p && p.catch) p.catch((err) => { if (!err || err.name !== "AbortError") showControls(v); });
          } else if (!v.paused && !v.controls) {
            v.pause();
          }
        });
      }, { threshold: 0.25 });
      vids.forEach((v) => io.observe(v));
    }
  }

  // Project photo lightbox (images only; videos keep playing inline).
  const lbGroups = document.querySelectorAll("[data-lightbox]");
  if (lbGroups.length && typeof HTMLDialogElement === "function") {
    const dlg = document.createElement("dialog");
    dlg.className = "pj-lightbox";
    dlg.setAttribute("aria-label", "Project photo viewer");
    dlg.innerHTML =
      '<span class="pj-lb-count" aria-live="polite"></span>' +
      '<figure class="pj-lb-figure"><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="pj-lb-btn pj-lb-prev" aria-label="Previous photo">&#8249;</button>' +
      '<button type="button" class="pj-lb-btn pj-lb-next" aria-label="Next photo">&#8250;</button>' +
      '<button type="button" class="pj-lb-btn pj-lb-close" aria-label="Close">&times;</button>';
    document.body.appendChild(dlg);
    const lbImg = dlg.querySelector("img");
    const lbCap = dlg.querySelector("figcaption");
    const lbCount = dlg.querySelector(".pj-lb-count");
    const prevBtn = dlg.querySelector(".pj-lb-prev");
    const nextBtn = dlg.querySelector(".pj-lb-next");
    let items = [];
    let idx = 0;
    const show = (i) => {
      idx = (i + items.length) % items.length;
      const img = items[idx].querySelector("img");
      const cap = items[idx].querySelector("figcaption");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      lbCap.textContent = cap ? cap.textContent.trim() : "";
      lbCount.textContent = items.length > 1 ? (idx + 1) + " / " + items.length : "";
      prevBtn.hidden = nextBtn.hidden = items.length < 2;
    };
    const open = (group, fig) => {
      items = Array.from(group.querySelectorAll("figure[role='button']"));
      show(items.indexOf(fig));
      document.documentElement.classList.add("pj-lb-open");
      dlg.showModal();
    };
    dlg.addEventListener("close", () => {
      document.documentElement.classList.remove("pj-lb-open");
      lbImg.removeAttribute("src");
    });
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest(".pj-lb-close")) dlg.close();
      else if (e.target.closest(".pj-lb-prev")) show(idx - 1);
      else if (e.target.closest(".pj-lb-next")) show(idx + 1);
    });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1); }
    });
    lbGroups.forEach((group) => {
      group.querySelectorAll("figure").forEach((fig) => {
        const img = fig.querySelector("img");
        if (!img || fig.querySelector("video")) return;
        fig.setAttribute("role", "button");
        fig.tabIndex = 0;
        fig.setAttribute("aria-label", "Enlarge photo: " + (img.alt || "project photo"));
        fig.addEventListener("click", () => open(group, fig));
        fig.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(group, fig); }
        });
      });
    });
  }
})();
