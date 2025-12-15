/* ==============================
 *  Base Utils
 * ============================== */
const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));
const by = (tag, className) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
};

/* ==============================
 *  init
 * ============================== */
document.addEventListener("DOMContentLoaded", ()=>{
  new FileTabHandler().init();
  new ProjectModalHandler().init();
})

/* ==============================
 *  handler
 * ============================== */
class FileTabHandler {
  constructor () {
    this.fileTabs = qsa(".file-tab");
    this.pages = qsa(".page-section");

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.setActiveLink(`#${entry.target.id}`);
        });
      }, { threshold: 0.5 });
  }

  init() {
    this.setActiveLink(window.location.hash || "#intro");
    this.pages.forEach((page) =>{
      this.observer.observe(page)
    })
  }

  setActiveLink(hash) {
    this.fileTabs.forEach((tab) => {
      if (tab.getAttribute("href") === hash) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }
}

class ProjectModalHandler{
  constructor () {
    this.projectCards = qsa(".portfolio-card");
    
    this.modal = qs("#projectModal");
    this.title = qs(".modal-title", this.modal);
    this.period = qs(".modal-period", this.modal);
    this.rol = qs(".modal-role", this.modal);
    this.stack = qs(".modal-stack", this.modal);
    this.summary = qs(".modal-summary", this.modal);
    this.impact = qs(".modal-impact", this.modal);
  }

  init() {
    this.projectCards.forEach((card) => {
      card.tabIndex = 0;
      const data = (() => {
        try {
          return JSON.parse(card.dataset.project || "{}");
        } catch (error) {
          console.warn("Failed to parse project data", error);
          return null;
        }
      })();

      card.addEventListener("click", () => this.openModal(data));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.openModal(data);
        }
      });
    })

    const closeTriggers = document.querySelectorAll("[data-modal-close]");
    closeTriggers.forEach((trigger) =>
      trigger.addEventListener("click", () => closeModal())
    );

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("is-visible")) {
        closeModal();
      }
    });
    
  }

  formatText = (label, value) => `${label}: ${value}`;

  openModal(data) {
    if(!data) return;
    this.title.textContent = data.title;
    // this.period.textContent = data.period;
    this.rol.textContent = this.formatText("Role", data.role);
    this.stack.textContent = this.formatText("Stack", data.stack);
    // this.summary.textContent = data.summary;

    this.impact.innerHTML = "";
    if (Array.isArray(data.impact)) {
      data.impact.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        this.impact.appendChild(li);
      });
    }
    this.modal.classList.add("is-visible");
    this.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  closeModal() {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
}





const yearTag = document.getElementById("year");

if (yearTag) {
  yearTag.textContent = new Date().getFullYear();
}


const terminalLines = Array.from(
  document.querySelectorAll(".hero-terminal .terminal-line")
);
const terminalCommands = Array.from(
  document.querySelectorAll(".terminal-command[data-type-text]")
);
const heroTerminal = document.querySelector(".hero-terminal");
let terminalHeightLocked = false;

const lockTerminalHeight = () => {
  if (!heroTerminal || terminalHeightLocked) return;
  const measuredHeight = heroTerminal.scrollHeight;
  if (!measuredHeight) return;
  heroTerminal.style.height = `${measuredHeight}px`;
  terminalHeightLocked = true;
};

const getCursor = (command) => {
  if (!command) return null;
  const sibling = command.nextElementSibling;
  if (sibling && sibling.classList.contains("terminal-cursor")) {
    return sibling;
  }
  return null;
};

const setCursorActive = (command, isActive) => {
  const cursor = getCursor(command);
  if (!cursor) return;
  cursor.classList.toggle("is-active", Boolean(isActive));
};

const sleep = (duration = 300) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const typeText = (element, text, speed = 70) =>
  new Promise((resolve) => {
    if (!element || !text) {
      resolve();
      return;
    }
    let index = 0;
    const tick = () => {
      element.textContent = text.slice(0, index);
      index += 1;
      if (index <= text.length) {
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    };
    tick();
  });

const runTerminalIntro = async () => {
  if (!terminalCommands.length) return;
  // lockTerminalHeight();
  const outputBlocks = document.querySelectorAll("[data-terminal-output]");
  const linkOutputs = document.querySelectorAll("[data-terminal-link]");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    terminalLines.forEach((line) => line.classList.remove("terminal-line--pending"));
    terminalCommands.forEach((command) => {
      const text = command.dataset.typeText || "";
      command.textContent = text;
      setCursorActive(command, false);
    });
    outputBlocks.forEach((block) => block.classList.add("is-visible"));
    linkOutputs.forEach((link) => link.classList.add("is-visible"));
    document.body.classList.remove("has-terminal-anim");
    return;
  }

  document.body.classList.add("has-terminal-anim");
  // lockTerminalHeight();

  terminalLines.forEach((line, index) => {
    if (index === 0) {
      line.classList.remove("terminal-line--pending");
    } else {
      line.classList.add("terminal-line--pending");
    }
  });

  outputBlocks.forEach((block) => block.classList.remove("is-visible"));
  linkOutputs.forEach((link) => link.classList.remove("is-visible"));
  terminalCommands.forEach((command) => {
    command.textContent = "";
    setCursorActive(command, false);
  });

  for (const command of terminalCommands) {
    const line = command.closest(".terminal-line");
    if (line) line.classList.remove("terminal-line--pending");

    const text = command.dataset.typeText || "";
    const speed = text.includes("cat intro") ? 55 : 80;
    setCursorActive(command, true);
    await typeText(command, text, speed);
    setCursorActive(command, false);

    const revealTarget = command.dataset.revealTarget;
    if (revealTarget) {
      const block = document.querySelector(revealTarget);
      if (block) {
        block.classList.add("is-visible");
      }
    }

    const link = line?.querySelector("[data-terminal-link]");
    if (link) {
      link.classList.add("is-visible");
    }

    await sleep(text.includes("cat intro") ? 600 : 450);

    if (line) {
      const currentIndex = terminalLines.indexOf(line);
      const nextLine = terminalLines[currentIndex + 1];
      if (nextLine) {
        nextLine.classList.remove("terminal-line--pending");
      }
    }

    await sleep(250);
  }

  document.body.classList.remove("has-terminal-anim");
};

// window.addEventListener("load", () => {
//   runTerminalIntro();
// });
