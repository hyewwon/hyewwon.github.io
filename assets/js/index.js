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
  new AboutMeHandler().init();
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
