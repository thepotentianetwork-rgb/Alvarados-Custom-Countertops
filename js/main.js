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
})();
