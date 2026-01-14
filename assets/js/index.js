/* ==============================
 *  Base Utils
 * ============================== */
const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));
/* ==============================
 *  Renderer
 * ============================== */
class Randerer {
  constructor() {
    this.skillGrid = qs("[data-skill-grid]");
  }

  init() {
    this.renderSkills();
  }

  renderSkills() {
    this.skillGrid.innerHTML = "";
    Object.entries(SKILLS).forEach(([key, value]) => {
      this.skillGrid.appendChild(this.createSkillGroup(key, value || {}));
    });
  }

  createSkillGroup(key, group) {
    const article = document.createElement("article");
    article.className = "skill-card";
    article.dataset.skillGroup = key;
    article.innerHTML = `
      <div class="skill-card__meta">
        <span class="skill-card__label">${group.label}</span>
      </div>
      <p class="skill-card__summary">${group.summary}</p>
      <ul class="skill-icon-list"></ul>
    ` 
    group.items.forEach(item => {
      qs('.skill-icon-list', article).appendChild(this.createSkillItem(item));
    });
    return article;
  }

  createSkillItem(skill) {
    const li = document.createElement("li");
    li.className = "skill-icon-item";
    li.innerHTML = `
      <div class="skill-icon">
        <img src="${skill.img_url}" alt="" loading="lazy" />
      </div>
      <div class="skill-info">
        <span class="skill-name">${skill.name}</span>
        <span class="skill-note">${skill.note}</span>
      </div>
    `
    return li
  }

}
/* ==============================
 *  Event handler
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
    this.fileTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const href = tab.getAttribute("href");
        if (href) this.setActiveLink(href);
      });
    });
    window.addEventListener("hashchange", () => {
      this.setActiveLink(window.location.hash || "#intro");
    });
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

class AboutMeHandler {
  constructor() {
    this.container = qs("#intro");
    this.terminal = qs(".hero-terminal", this.container);
    
  }
  
  init() {
    this.runTerminal();
  }
  sleep = (duration = 300) => new Promise((resolve) => setTimeout(resolve, duration));

  getCursor(command) {
    if (!command) return null;
    const sibling = command.nextElementSibling;
    if (sibling && sibling.classList.contains("terminal-cursor")) {
      return sibling;
    }
    return null;
  }

  setCursorActive(command, isActive) {
    const cursor = this.getCursor(command);
    if(!cursor) return;

    cursor.classList.toggle("is-active", Boolean(isActive));
  }

  typeCommand (elem, text, speed = 70) {
    return new Promise((resolve) => {
      if(!elem || !text) {
        resolve();
        return;
      }

      let index = 0;
      const tick = () =>{
        elem.textContent = text.slice(0, index);
        index += 1;
        if(index <= text.length) {
          setTimeout(tick, speed);
        }else {
          resolve();
        }
      };

      tick();
    })
  }

  async runTerminal() {
    const lines = Array.from(qsa(".terminal-line", this.terminal));
    const commands = Array.from(qsa(".terminal-command[data-type-text]"));

    if(!commands.length) return;

    const outputs = qsa(".terminal-output", this.terminal);

    document.body.classList.add("has-terminal-anim");
    
    lines.forEach((line, index) => {
      if (index === 0) {
        line.classList.remove("terminal-line--pending");
      } else {
        line.classList.add("terminal-line--pending");
      }
    });

    outputs.forEach((block) => block.classList.remove("is-visible"));

    commands.forEach((command) => {
        command.textContent = "";
        this.setCursorActive(command, false);
    });

  for (const command of commands) {
    const line = command.closest(".terminal-line");
    line.classList.remove("terminal-line--pending");

    const text = command.dataset.typeText || "";
    this.setCursorActive(command, true);

    await this.typeCommand(command, text, 55);
    
    this.setCursorActive(command, false);

    const target = command.dataset.target;
    if (target) {
      const block = document.querySelector(target);
      if (block) {
        block.classList.add("is-visible");
      }
    }

    await this.sleep(250);

    if (line) {
      const currentIndex = lines.indexOf(line);
      const nextLine = lines[currentIndex + 1];
      if (nextLine) {
        nextLine.classList.remove("terminal-line--pending");
      }
    }

    await this.sleep(250);
  }

  document.body.classList.remove("has-terminal-anim");
};

}

class SkillsHandler {
  constructor() {
    this.section = qs("#skills");
    this.filters = this.section ? qsa("[data-skill-filter]", this.section) : [];
    this.cards = this.section ? qsa("[data-skill-group]", this.section) : [];
  }

  init() {
    if (!this.section) return;
    this.bindFilterEvents();
  }

  bindFilterEvents() {
    if (!this.filters.length) return;

    this.filters.forEach((button) => {
      button.addEventListener("click", () => {
        this.setActiveFilter(button);
      });
    });

    this.setActiveFilter(
      this.filters.find((button) => button.classList.contains("is-active")) ||
        this.filters[0]
    );
  }

  setActiveFilter(targetButton) {
    if (!targetButton) return;

    const target = targetButton.dataset.skillFilter || "all";
    this.filters.forEach((button) => {
      const isActive = button === targetButton || button.dataset.skillFilter === target;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (!this.cards.length) return;

    this.cards.forEach((card) => {
      const group = card.dataset.skillGroup || "";
      const shouldMute = target !== "all" && group !== target;
      card.classList.toggle("is-muted", shouldMute);
    });
  }
}

/* ==============================
 *  Tooltip manager
 * ============================== */
class TooltipManager {
  constructor() {
    this.tooltip = document.createElement("div");
    this.tooltip.className = "tooltip-bubble";
    this.tooltip.setAttribute("role", "tooltip");
    document.body.appendChild(this.tooltip);

    this.currentTarget = null;
    this.hideTimer = null;

    this.handlePointerOver = this.handlePointerOver.bind(this);
    this.handlePointerOut = this.handlePointerOut.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleReposition = this.handleReposition.bind(this);
  }

  init() {
    document.addEventListener("pointerover", this.handlePointerOver);
    document.addEventListener("pointerout", this.handlePointerOut);
    document.addEventListener("focusin", this.handleFocus);
    document.addEventListener("focusout", this.handleBlur);
    window.addEventListener("scroll", this.handleReposition, true);
    window.addEventListener("resize", this.handleReposition);
  }

  handlePointerOver(event) {
    const target = event.target.closest("[data-tooltip]");
    if (!target) return;
    if (this.currentTarget === target && this.tooltip.classList.contains("is-visible")) return;
    this.show(target);
  }

  handlePointerOut(event) {
    if (!this.currentTarget) return;
    const target = event.target.closest("[data-tooltip]");
    if (!target || target !== this.currentTarget) return;
    const related = event.relatedTarget;
    if (related && target.contains(related)) return;
    this.scheduleHide();
  }

  handleFocus(event) {
    const target = event.target.closest("[data-tooltip]");
    if (!target) return;
    this.show(target);
  }

  handleBlur(event) {
    if (!this.currentTarget) return;
    if (event.target === this.currentTarget) {
      this.hide();
    }
  }

  handleReposition() {
    if (!this.tooltip.classList.contains("is-visible")) return;
    this.positionTooltip();
  }

  show(target) {
    if (!target.dataset.tooltip || target.dataset.tooltipDisabled === "true") return;
    this.currentTarget = target;
    this.tooltip.textContent = target.dataset.tooltip || "";
    const placement = target.dataset.tooltipPlacement || "top";
    this.tooltip.dataset.placement = placement;
    this.tooltip.classList.add("is-visible");
    this.positionTooltip();
    clearTimeout(this.hideTimer);
  }

  scheduleHide() {
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.hide(), 80);
  }

  hide() {
    clearTimeout(this.hideTimer);
    this.tooltip.classList.remove("is-visible");
    this.currentTarget = null;
  }

  positionTooltip() {
    if (!this.currentTarget) return;

    const rect = this.currentTarget.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const placement = this.tooltip.dataset.placement || "top";
    const offset = Number(this.currentTarget.dataset.tooltipOffset || 12);
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (placement) {
      case "bottom":
        top = rect.bottom + offset + scrollY;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2 + scrollX;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipRect.height / 2 + scrollY;
        left = rect.left - tooltipRect.width - offset + scrollX;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipRect.height / 2 + scrollY;
        left = rect.right + offset + scrollX;
        break;
      case "top":
      default:
        top = rect.top - tooltipRect.height - offset + scrollY;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2 + scrollX;
        break;
    }

    const minLeft = scrollX + 8;
    const maxLeft = scrollX + window.innerWidth - tooltipRect.width - 8;
    const minTop = scrollY + 8;
    const maxTop = scrollY + window.innerHeight - tooltipRect.height - 8;

    this.tooltip.style.left = `${Math.min(Math.max(left, minLeft), maxLeft)}px`;
    this.tooltip.style.top = `${Math.min(Math.max(top, minTop), maxTop)}px`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const renderer = new Randerer();
  try {
    renderer.init();
  } catch (error) {
    console.error(error);
  }

  new FileTabHandler().init();
  new AboutMeHandler().init();
  new SkillsHandler().init();
  new TooltipManager().init();
});
