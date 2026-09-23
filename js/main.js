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

  const form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const phone = (data.get("phone") || "").toString().trim();
      const service = (data.get("service") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();
      const projectType = (data.get("projectType") || "").toString().trim();

      const subject = encodeURIComponent(
        "Quote Request — Alvarado's Custom & Countertops" +
          (service ? " (" + service + ")" : "")
      );
      const body = encodeURIComponent(
        [
          "Name: " + name,
          "Email: " + email,
          "Phone: " + phone,
          "Service: " + service,
          "Project type: " + projectType,
          "",
          "Message:",
          message,
        ].join("\n")
      );

      const success = document.getElementById("form-success");
      if (success) success.classList.add("show");

      window.location.href =
        "mailto:fabricio@alvaradoscc.com?subject=" + subject + "&body=" + body;

      form.reset();
    });
  }
})();
