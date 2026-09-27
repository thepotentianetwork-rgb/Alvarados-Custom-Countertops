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
      document.documentElement.classList.toggle("nav-open", open);
    });
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.documentElement.classList.remove("nav-open");
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
        audience: (data.get("audience") || "").toString().trim(),
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

  // Audience CTAs ("Get a bid" / "Start your custom project") pre-select who's asking in the quote form.
  document.querySelectorAll("a[data-audience]").forEach((a) => {
    a.addEventListener("click", () => {
      const radio = document.querySelector('input[name="audience"][value="' + a.dataset.audience + '"]');
      if (radio) radio.checked = true;
    });
  });

  // Inline project videos: load + play only when in view, pause when out.
  const vids = document.querySelectorAll("video.inline-video");
  if (vids.length) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    const showControls = (v) => { v.controls = true; v.preload = "metadata"; };
    if (reduce || saveData || !("IntersectionObserver" in window)) {
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
      // Start after the page has loaded so posters, images, and CSS come first.
      const startVideos = () => vids.forEach((v) => io.observe(v));
      if (document.readyState === "complete") startVideos();
      else window.addEventListener("load", startVideos, { once: true });
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
  const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const afterLoad = (fn) => {
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 400));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
  };

  // Home hero: slow crossfade slideshow. Slide 1 is in the HTML; the rest load after the page
  // has finished loading and only join the rotation once fully decoded (no flash, no half-painted image).
  const heroBg = document.querySelector("[data-hero-slides]");
  const saveDataHero = !!(navigator.connection && navigator.connection.saveData);
  if (heroBg && !reduceMotion && !saveDataHero) {
    const HOLD = 6500, FADE = 1600;
    const slides = Array.from(heroBg.querySelectorAll(".hm-slide"));
    const ready = slides.map((el, i) => i === 0);
    let cur = 0, timer = 0, visible = true, started = false;
    const build = (el) => {
      const base = el.dataset.slide;
      const pic = document.createElement("picture");
      pic.innerHTML =
        '<source media="(max-width: 700px)" srcset="' + base + '-m.webp" type="image/webp">' +
        '<source media="(max-width: 700px)" srcset="' + base + '-m.jpg">' +
        '<source srcset="' + base + "-1280.webp 1280w, " + base + '-1920.webp 1920w" sizes="100vw" type="image/webp">' +
        '<img src="' + base + '-1920.jpg" srcset="' + base + "-1280.jpg 1280w, " + base + '-1920.jpg 1920w" sizes="100vw" alt="" width="1920" height="1200" decoding="async">';
      el.appendChild(pic);
      const img = pic.querySelector("img");
      const done = () => img.decode ? img.decode() : Promise.resolve();
      return (img.complete ? done() : new Promise((res, rej) => { img.onload = res; img.onerror = rej; }).then(done));
    };
    const go = () => {
      clearTimeout(timer);
      if (!visible || document.hidden) return;
      timer = setTimeout(() => {
        let next = cur;
        for (let k = 1; k < slides.length; k++) {
          const j = (cur + k) % slides.length;
          if (ready[j]) { next = j; break; }
        }
        if (next !== cur) {
          const prev = slides[cur], nxt = slides[next];
          nxt.classList.remove("is-zoom");
          void nxt.offsetWidth; // restart the slow zoom from scale(1) while the slide is still transparent
          prev.classList.remove("is-active");
          prev.classList.add("is-prev");
          nxt.classList.add("is-active", "is-zoom");
          setTimeout(() => { prev.classList.remove("is-prev"); }, FADE + 150);
          setTimeout(() => { if (!prev.classList.contains("is-active")) prev.classList.remove("is-zoom"); }, FADE * 2 + 300);
          cur = next;
        }
        go();
      }, HOLD);
    };
    afterLoad(() => {
      slides.forEach((el, i) => {
        if (i === 0 || !el.dataset.slide) return;
        build(el).then(() => {
          ready[i] = true;
          if (!started) { started = true; go(); }
        }).catch(() => {});
      });
    });
    document.addEventListener("visibilitychange", () => { if (started) go(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((en) => {
        visible = en[0].isIntersecting;
        if (started) go();
      }).observe(heroBg);
    }
  }

  // Scroll reveal: below-the-fold sections and cards ease up into place as they enter the viewport.
  // Content is only hidden once JS has tagged it; anything already on screen at load is left alone.
  if (!reduceMotion && "IntersectionObserver" in window && document.documentElement.classList.contains("js")) {
    const SKIP = "dialog, video, form *, .hm-hero2, .page-hero, [data-no-reveal]";
    const targets = [];
    const okTarget = (el) => {
      if (el.matches(SKIP) || el.matches("script, style, template, br, hr")) return false;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed" || cs.position === "sticky") return false;
      if (cs.transform !== "none" || parseFloat(cs.opacity) < 1) return false;
      return el.getBoundingClientRect().height > 0;
    };
    // A "group" is a grid/list of like items (tiles, cards, columns): its items reveal one by one.
    const isGroup = (el) => {
      const kids = Array.from(el.children);
      if (kids.length < 2 || el.matches("form, figure, picture, a, button, header, p, h1, h2, h3, h4")) return false;
      const d = getComputedStyle(el).display;
      const list = el.matches("ul, ol");
      if (!list && d.indexOf("grid") === -1 && d.indexOf("flex") === -1) return false;
      if ((list || d.indexOf("flex") !== -1) && kids.length < 3) return false;
      const sig = (k) => k.tagName + "." + (k.classList[0] || "");
      const counts = {};
      kids.forEach((k) => { counts[sig(k)] = (counts[sig(k)] || 0) + 1; });
      return Math.max.apply(null, Object.values(counts)) / kids.length >= 0.6;
    };
    const collect = (parent, depth) => {
      Array.from(parent.children).forEach((c) => {
        if (!okTarget(c)) return;
        if (depth < 2 && isGroup(c)) collect(c, depth + 1);
        else targets.push(c);
      });
    };
    document.querySelectorAll("main section, main > .section, .site-footer").forEach((sec) => {
      if (sec.matches(SKIP)) return;
      const box = sec.querySelector(":scope > .container") || sec;
      collect(box, 0);
    });
    const fold = window.innerHeight * 0.94;
    const tagged = targets.filter((el, i, a) => a.indexOf(el) === i && !a.some((o) => o !== el && o.contains(el)) && el.getBoundingClientRect().top > fold);
    const finish = (el) => {
      el.removeAttribute("data-reveal");
      el.classList.remove("is-in");
      el.style.transitionDelay = "";
    };
    const io = new IntersectionObserver((entries) => {
      const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      batch.sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return (Math.round(ra.top / 40) - Math.round(rb.top / 40)) || (ra.left - rb.left);
      });
      batch.forEach((el, i) => {
        io.unobserve(el);
        el.style.transitionDelay = Math.min(i, 5) * 90 + "ms";
        el.classList.add("is-in");
        const end = () => finish(el);
        el.addEventListener("transitionend", (e) => { if (e.target === el && e.propertyName === "transform") end(); });
        setTimeout(end, 1000 + Math.min(i, 5) * 90 + 200);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
    tagged.forEach((el) => { el.setAttribute("data-reveal", ""); io.observe(el); });
    // The last blocks on a page can sit inside the bottom margin forever; reveal them once the page bottoms out.
    const atBottom = () => {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
        io.unobserve(el);
        el.classList.add("is-in");
        setTimeout(() => finish(el), 1100);
      });
      window.removeEventListener("scroll", atBottom);
    };
    if (tagged.length) window.addEventListener("scroll", atBottom, { passive: true });
  }
  // Floating WhatsApp button: step aside while the quote form's submit button is on screen
  // or while someone is typing in the form (mobile keyboard), so it never covers either.
  const wa = document.querySelector(".wa-float");
  if (wa) {
    let overSubmit = false, typing = false;
    const sync = () => wa.classList.toggle("wa-hide", overSubmit || typing);
    const submits = Array.from(document.querySelectorAll('#quote-form [type="submit"], .hm-hero2 .hm-path'));
    if (submits.length && "IntersectionObserver" in window) {
      const seen = new Set();
      let raf = 0;
      const check = () => {
        raf = 0;
        const w = wa.getBoundingClientRect();
        overSubmit = Array.from(seen).some((btn) => {
          const r = btn.getBoundingClientRect();
          return !(w.right + 12 < r.left || w.left - 12 > r.right || w.bottom + 12 < r.top || w.top - 12 > r.bottom);
        });
        sync();
      };
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
      const sio = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
        if (seen.size) { window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); }
        else { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); }
        check();
      });
      submits.forEach((btn) => sio.observe(btn));
    }
    const coarse = window.matchMedia && window.matchMedia("(max-width: 900px)");
    document.addEventListener("focusin", (e) => {
      if (coarse && coarse.matches && e.target.matches && e.target.matches("#quote-form input, #quote-form select, #quote-form textarea")) { typing = true; sync(); }
    });
    document.addEventListener("focusout", () => { typing = false; setTimeout(sync, 150); });
  }
  // Google reviews carousel: prev/next buttons and "Read more" for long reviews.
  document.querySelectorAll(".rv-carousel").forEach((car) => {
    const track = car.querySelector(".rv-track");
    const prev = car.querySelector(".rv-prev");
    const next = car.querySelector(".rv-next");
    if (!track) return;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
      if (prev && next && max <= 0) car.classList.add("rv-static");
    };
    const step = () => {
      const card = track.querySelector(".rv-card");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      const per = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
      return Math.max(per, Math.floor(track.clientWidth / per) * per);
    };
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }));
    if (next) next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }));
    track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", update);
    const clampCheck = () => {
      car.querySelectorAll(".rv-card").forEach((c) => {
        const p = c.querySelector(".rv-text p");
        const btn = c.querySelector(".rv-more");
        if (!p || !btn || c.classList.contains("is-open")) return;
        btn.hidden = p.scrollHeight <= p.clientHeight + 2;
      });
    };
    car.querySelectorAll(".rv-more").forEach((btn) => {
      btn.addEventListener("click", () => {
        const c = btn.closest(".rv-card");
        const open = c.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.textContent = open ? "Show less" : "Read more";
      });
    });
    update(); clampCheck();
    window.addEventListener("resize", clampCheck);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { update(); clampCheck(); });
  });
})();
