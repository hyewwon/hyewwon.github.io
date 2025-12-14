const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modal-title");
const modalPeriod = document.getElementById("modal-period");
const modalRole = document.getElementById("modal-role");
const modalStack = document.getElementById("modal-stack");
const modalSummary = document.getElementById("modal-summary");
const modalImpact = document.getElementById("modal-impact");
const yearTag = document.getElementById("year");
const cards = document.querySelectorAll(".portfolio-card");
const closeTriggers = document.querySelectorAll("[data-modal-close]");
const fileTabs = document.querySelectorAll(".file-tab");

const formatText = (label, value) => `${label}: ${value}`;

const openModal = (data) => {
  if (!data) return;
  modalTitle.textContent = data.title;
  modalPeriod.textContent = data.period;
  modalRole.textContent = formatText("Role", data.role);
  modalStack.textContent = formatText("Stack", data.stack);
  modalSummary.textContent = data.summary;
  modalImpact.innerHTML = "";
  if (Array.isArray(data.impact)) {
    data.impact.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      modalImpact.appendChild(li);
    });
  }
  modal.classList.add("is-visible");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("is-visible");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

cards.forEach((card) => {
  card.tabIndex = 0;
  const data = (() => {
    try {
      return JSON.parse(card.dataset.project || "{}");
    } catch (error) {
      console.warn("Failed to parse project data", error);
      return null;
    }
  })();

  card.addEventListener("click", () => openModal(data));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(data);
    }
  });
});

closeTriggers.forEach((trigger) =>
  trigger.addEventListener("click", () => closeModal())
);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-visible")) {
    closeModal();
  }
});

if (yearTag) {
  yearTag.textContent = new Date().getFullYear();
}

const setActiveLink = (hash) => {
  fileTabs.forEach((tab) => {
    if (tab.getAttribute("href") === hash) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
};

const sections = document.querySelectorAll(".page-section");
// sections.forEach((section) => section.classList.add("section-animatable"));
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setActiveLink(`#${entry.target.getAttribute("id")}`);
      // entry.target.classList.add("section-visible");
      // observer.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

sections.forEach((section) => observer.observe(section));

setActiveLink(window.location.hash || "#intro");

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

window.addEventListener("load", () => {
  runTerminalIntro();
});
