const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function renderInsights() {
  const grid = qs("[data-insight-grid]");
  if (!grid || !window.INSIGHTS && typeof INSIGHTS === "undefined") return;

  grid.innerHTML = INSIGHTS.map((item, index) => `
    <article class="insight-card reveal" style="--delay: ${index * 70}ms">
      <span>${item.tag}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join("");
}

function renderStrategies() {
  const stack = qs("[data-strategy-stack]");
  if (!stack || typeof STRATEGIES === "undefined") return;

  stack.innerHTML = STRATEGIES.map((item, index) => `
    <article class="strategy-item reveal" style="--delay: ${index * 90}ms">
      <div>
        <div class="strategy-label">${item.label}</div>
        <p>${item.metric}</p>
      </div>
      <div>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
        <div class="chip-row">
          ${item.stack.map((skill) => `<span>${skill}</span>`).join("")}
        </div>
      </div>
    </article>
  `).join("");
}

function renderProjects() {
  const list = qs("[data-project-list]");
  if (!list || typeof PROJECTS === "undefined") return;

  list.innerHTML = PROJECTS.map((item, index) => `
    <article class="project-proof reveal" style="--delay: ${index * 70}ms">
      <div class="project-copy">
        <span>${item.category}</span>
        <h3>${item.title}</h3>
        <dl>
          <div>
            <dt>Period</dt>
            <dd>${item.period}</dd>
          </div>
          <div>
            <dt>Problem</dt>
            <dd>${item.problem}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>${item.role}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>${item.stack.join(" / ")}</dd>
          </div>
        </dl>
      </div>
      <div class="project-visual" data-category="${item.category}">
        <div class="mini-flow" aria-label="${item.title} flow">
          ${item.flow.split(" -> ").map((step) => `<span>${step}</span>`).join("")}
        </div>
      </div>
    </article>
  `).join("");
}

function initReveal() {
  const revealItems = qsa(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px"
  });

  revealItems.forEach((item) => observer.observe(item));

  window.requestAnimationFrame(() => {
    revealItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        item.classList.add("is-visible");
        observer.unobserve(item);
      }
    });
  });
}

function initParallax() {
  const layers = qsa("[data-parallax]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!layers.length || reduceMotion) return;

  let ticking = false;

  const update = () => {
    const viewport = window.innerHeight || 1;
    layers.forEach((layer) => {
      const speed = Number(layer.dataset.parallax || 0);
      const rect = layer.getBoundingClientRect();
      const centerOffset = rect.top + rect.height / 2 - viewport / 2;
      const y = centerOffset * speed;
      layer.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    });
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

function initContactOverlay() {
  const overlay = qs("[data-contact-overlay]");
  const openButton = qs("[data-open-contact]");
  const closeButton = qs("[data-close-contact]");
  const copyButton = qs("[data-copy-link]");
  const feedback = qs("[data-copy-feedback]");
  if (!overlay || !openButton) return;

  const open = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (feedback) feedback.textContent = "";
  };

  openButton.addEventListener("click", open);
  if (closeButton) closeButton.addEventListener("click", close);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      close();
    }
  });

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        if (feedback) feedback.textContent = "Link copied";
      } catch (error) {
        if (feedback) feedback.textContent = "Copy failed";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderInsights();
  renderStrategies();
  renderProjects();
  initReveal();
  initParallax();
  initContactOverlay();
});
