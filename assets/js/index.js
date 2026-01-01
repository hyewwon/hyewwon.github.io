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

class ProjectShowcaseHandler {
  constructor() {
    this.section = qs("#portfolio");
    this.listItems = this.section ? qsa(".portfolio-list-item", this.section) : [];
    this.title = this.section ? qs("[data-project-title]", this.section) : null;
    this.stack = this.section ? qs("[data-project-stack]", this.section) : null;
    this.stackInline = this.section ? qs("[data-project-stack-inline]", this.section) : null;
    this.stackSecondary = this.section ? qs("[data-project-stack-secondary]", this.section) : null;
    this.period = this.section ? qs("[data-project-period]", this.section) : null;
    this.role = this.section ? qs("[data-project-role]", this.section) : null;
    this.periodInline = this.section ? qs("[data-project-period-inline]", this.section) : null;
    this.publisher = this.section ? qs("[data-project-publisher]", this.section) : null;
    this.badge = this.section ? qs("[data-project-badge]", this.section) : null;
    this.impactCount = this.section ? qs("[data-project-impact-count]", this.section) : null;
    this.summary = this.section ? qs("[data-project-summary]", this.section) : null;
    this.impact = this.section ? qs("[data-project-impact]", this.section) : null;
  }

  init() {
    if (!this.section || !this.listItems.length) return;

    this.listItems.forEach((item) => {
      item.addEventListener("click", () => this.selectItem(item));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.selectItem(item);
        }
      });
    });

    this.selectItem(this.listItems[0], { silent: true });
  }

  parseData(item) {
    try {
      return JSON.parse(item.dataset.project || "{}");
    } catch (error) {
      console.warn("Failed to parse project data", error);
      return null;
    }
  }

  selectItem(target, options = {}) {
    if (!target) return;
    const data = this.parseData(target);
    if (!data) return;

    this.listItems.forEach((item) => {
      const isActive = item === target;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    this.renderDetails(data);

    if (!options.silent) {
      target.focus();
    }
  }

  renderDetails(data) {
    const fallback = "-";
    if (this.title) this.title.textContent = data.title || "프로젝트를 선택하세요";

    const stackText = data.stack || "Stack 정보가 곧 업데이트됩니다.";
    if (this.stack) this.stack.textContent = stackText;
    if (this.stackInline) this.stackInline.textContent = stackText;
    if (this.stackSecondary) this.stackSecondary.textContent = stackText;

    const periodText = data.period || fallback;
    if (this.period) this.period.textContent = periodText;
    if (this.periodInline) this.periodInline.textContent = periodText;

    const roleText = data.role || fallback;
    if (this.role) this.role.textContent = roleText;
    if (this.publisher) this.publisher.textContent = roleText;

    if (this.badge) this.badge.textContent = this.createBadge(data.title);

    if (this.summary) {
      this.summary.textContent =
        data.summary || "프로젝트 설명이 준비되는 대로 업데이트할 예정입니다.";
    }

    if (!this.impact) return;
    this.impact.innerHTML = "";

    if (Array.isArray(data.impact) && data.impact.length) {
      if (this.impactCount) {
        this.impactCount.textContent = `Impact ${data.impact.length}`;
      }
      data.impact.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = entry;
        this.impact.appendChild(li);
      });
    } else {
      if (this.impactCount) {
        this.impactCount.textContent = "Impact 0";
      }
      const li = document.createElement("li");
      li.textContent = "성과 정보가 곧 추가됩니다.";
      this.impact.appendChild(li);
    }
  }

  createBadge(title = "") {
    if (!title) return "PR";
    const words = title.split(" ").filter(Boolean);
    if (!words.length) return title.slice(0, 2).toUpperCase();
    const initials = words.slice(0, 2).map((word) => word[0]);
    return initials.join("").toUpperCase();
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
  new ProjectShowcaseHandler().init();
  new AboutMeHandler().init();
  new SkillsHandler().init();
});
