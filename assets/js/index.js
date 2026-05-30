const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

let zIndex = 5;
let lastScrollWindow = null;

const setClock = () => {
  const clock = qs("#clock");
  if (!clock) return;

  const now = new Date();
  clock.textContent = now.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const runSpotlightIntro = () => {
  const title = qs("[data-spotlight-text]");
  if (!title) return;

  const text = title.dataset.spotlightText || title.textContent;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    title.textContent = text;
    document.body.classList.add("spotlight-complete");
    return;
  }

  title.textContent = "Spotlight 검색";

  window.setTimeout(() => {
    title.textContent = "";
    document.body.classList.add("spotlight-typing");

    let index = 0;
    const typeNext = () => {
      title.textContent = text.slice(0, index + 1);
      index += 1;

      if (index < text.length) {
        window.setTimeout(typeNext, 58);
        return;
      }

      window.setTimeout(() => {
        document.body.classList.remove("spotlight-typing");
        document.body.classList.add("spotlight-complete");
      }, 320);
    };

    typeNext();
  }, 520);
};

const moveCursorTo = (key) => {
  const cursor = qs("[data-cursor-guide]");
  const appButton =
    qs(`.dock [data-open-window="${key}"]`) ||
    qs(`[data-open-window="${key}"]`);

  if (!cursor || !appButton) return;

  const rect = appButton.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  cursor.style.setProperty("--x", `${x}px`);
  cursor.style.setProperty("--y", `${y}px`);
};

const openWindow = (key, options = {}) => {
  const target = qs(`[data-window="${key}"]`);
  if (!target) return;

  moveCursorTo(key);

  window.setTimeout(() => {
    if (options.single !== false) {
      qsa("[data-window]").forEach((windowEl) => {
        if (windowEl !== target) {
          windowEl.classList.remove("is-open", "is-front");
        }
      });
    }

    target.classList.add("is-open", "is-front");
    target.style.zIndex = String(++zIndex);
    document.body.classList.add("has-window");

    qsa("[data-open-window]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.openWindow === key);
    });
  }, options.instant ? 0 : 360);
};

const closeWindow = (key) => {
  const target = qs(`[data-window="${key}"]`);
  if (!target) return;

  target.classList.remove("is-open", "is-front");
  qsa(`[data-open-window="${key}"]`).forEach((button) => {
    button.classList.remove("is-active");
  });

  const hasOpenWindow = Boolean(qs("[data-window].is-open"));
  document.body.classList.toggle("has-window", hasOpenWindow);
};

const bindApps = () => {
  qsa("[data-open-window]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.openWindow;
      openWindow(key, { single: false });
    });
  });

  qsa("[data-close-window]").forEach((button) => {
    button.addEventListener("click", () => {
      closeWindow(button.dataset.closeWindow);
    });
  });

  qsa("[data-window]").forEach((windowEl) => {
    windowEl.addEventListener("pointerdown", () => {
      windowEl.style.zIndex = String(++zIndex);
      qsa("[data-window]").forEach((item) => item.classList.remove("is-front"));
      windowEl.classList.add("is-front");
    });
  });
};

const bindScrollOpen = () => {
  const triggers = qsa("[data-scroll-window]");
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      const key = visible.target.dataset.scrollWindow;
      if (!key || key === lastScrollWindow) return;

      lastScrollWindow = key;
      openWindow(key);
    },
    {
      threshold: [0.35, 0.55, 0.75],
      rootMargin: "-18% 0px -22% 0px",
    }
  );

  triggers.forEach((trigger) => observer.observe(trigger));
};

const bindProjects = () => {
  const detail = qs("[data-project-detail]");
  if (!detail || typeof PORTFOLIO_PROJECTS === "undefined") return;

  qsa("[data-project]").forEach((button) => {
    button.addEventListener("click", () => {
      const project = PORTFOLIO_PROJECTS[button.dataset.project];
      if (!project) return;

      qsa("[data-project]").forEach((item) => {
        item.classList.toggle("is-selected", item === button);
      });

      detail.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      `;
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setClock();
  window.setInterval(setClock, 30_000);
  runSpotlightIntro();
  moveCursorTo("about");
  bindApps();
  bindScrollOpen();
  bindProjects();
});
