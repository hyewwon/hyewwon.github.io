class SplashSequence {
  constructor(root) {
    this.root = root;
    this.camera = root.querySelector("[data-camera]");
    this.frog = root.querySelector("[data-frog]");
    this.screen = root.querySelector("[data-screen]");
    this.screenHome = this.screen.parentElement;
    this.progressValue = root.querySelector("[data-progress-value]");
    this.progressLabel = root.querySelector("[data-progress-label]");
    this.progressTrack = root.querySelector("[data-progress-track]");
    this.lockDate = root.querySelector("[data-lock-date]");
    this.lockTime = root.querySelector("[data-lock-time]");
    this.desktopTime = root.querySelector("[data-desktop-time]");
    this.batteryTrigger = root.querySelector("[data-battery-trigger]");
    this.batteryPopover = root.querySelector("[data-battery-popover]");
    this.skillFilters = [...root.querySelectorAll("[data-skill-filter]")];
    this.skillCards = [...root.querySelectorAll("[data-skill-card]")];
    this.skillsTitle = root.querySelector("[data-skills-title]");
    this.skillsCount = root.querySelector("[data-skills-count]");
    this.replayButton = root.querySelector("[data-replay]");
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.runToken = 0;
    this.activeAnimations = [];
  }

  init() {
    this.updateClock();
    window.setInterval(() => this.updateClock(), 30000);
    this.replayButton.addEventListener("click", () => this.run());
    this.batteryTrigger.addEventListener("click", () => {
      this.setBatteryPopover(
        !this.batteryTrigger.classList.contains("is-active")
      );
    });
    this.skillFilters.forEach((filter) => {
      filter.addEventListener("click", () => this.setSkillsFilter(filter));
    });
    this.setSkillsFilter(
      this.skillFilters.find((filter) => filter.dataset.skillFilter === "all")
    );
    window.addEventListener("pointerdown", (event) => {
      if (!this.batteryTrigger.classList.contains("is-active")) return;
      if (
        this.batteryTrigger.contains(event.target) ||
        this.batteryPopover.contains(event.target)
      ) {
        return;
      }

      this.setBatteryPopover(false);
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.setBatteryPopover(false);
    });
    window.addEventListener("resize", () => {
      if (this.root.classList.contains("is-focused")) return;
      if (!this.root.classList.contains("is-running")) this.reset();
    });

    window.setTimeout(() => this.run(), 420);
  }

  updateClock() {
    const now = new Date();
    const date = new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(now);
    const time = new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    const desktopDate = new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
    }).format(now);
    const desktopWeekday = new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
    }).format(now);
    const desktopClock = new Intl.DateTimeFormat("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);

    this.lockDate.textContent = date;
    this.lockTime.textContent = time;
    this.lockTime.dataset.liquidTime = time;
    this.lockTime.dateTime = now.toISOString();
    this.desktopTime.textContent = `${desktopDate} (${desktopWeekday}) ${desktopClock}`;
    this.desktopTime.dateTime = now.toISOString();
  }

  sleep(duration, token) {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(token === this.runToken), duration);
    });
  }

  setFrame(index) {
    const columns = 4;
    const rows = 4;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = column * (100 / (columns - 1));
    const y = row * (100 / (rows - 1));
    this.frog.style.backgroundPosition = `${x}% ${y}%`;
  }

  setProgress(value) {
    const safeValue = Math.max(0, Math.min(100, Math.round(value)));
    this.progressValue.style.transform = `scaleX(${safeValue / 100})`;
    this.progressLabel.textContent = `${safeValue}%`;
    this.progressTrack.setAttribute("aria-valuenow", String(safeValue));
  }

  cancelAnimations() {
    this.activeAnimations.forEach((animation) => animation.cancel());
    this.activeAnimations = [];
  }

  setBatteryPopover(isOpen) {
    this.batteryTrigger.classList.toggle("is-active", isOpen);
    this.batteryTrigger.setAttribute("aria-expanded", String(isOpen));
    this.batteryPopover.classList.toggle("is-open", isOpen);
    this.batteryPopover.setAttribute("aria-hidden", String(!isOpen));
    this.batteryPopover.inert = !isOpen;
  }

  setSkillsFilter(activeFilter) {
    if (!activeFilter) return;

    const category = activeFilter.dataset.skillFilter;
    let visibleCount = 0;

    this.skillFilters.forEach((filter) => {
      const isActive = filter === activeFilter;
      filter.classList.toggle("is-active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });

    this.skillCards.forEach((card) => {
      const categories = card.dataset.categories.split(" ");
      const isVisible = category === "all" || categories.includes(category);
      card.classList.toggle("is-hidden", !isVisible);
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    this.skillsTitle.textContent = activeFilter.dataset.skillTitle;
    this.skillsCount.textContent = String(visibleCount);
  }

  reset() {
    this.cancelAnimations();
    if (this.screen.parentElement !== this.screenHome) {
      this.screenHome.append(this.screen);
    }
    this.screen.classList.remove("monitor-screen--fullscreen");
    this.root.classList.remove(
      "is-running",
      "is-complete",
      "is-zooming",
      "is-handoff",
      "is-focused",
      "is-unlocking",
      "is-unlocked"
    );
    this.setBatteryPopover(false);
    this.camera.style.removeProperty("transform");
    this.frog.style.removeProperty("opacity");
    this.frog.style.removeProperty("transform");
    this.frog.style.removeProperty("filter");
    this.setFrame(0);
    this.setProgress(0);
  }

  async animateLoading(token) {
    const checkpoints = [
      [160, 4],
      [420, 11],
      [800, 23],
      [1300, 38],
      [2000, 50],
    ];

    let previousTime = 0;
    for (const [time, value] of checkpoints) {
      const isCurrent = await this.sleep(time - previousTime, token);
      if (!isCurrent) return false;
      this.setProgress(value);
      previousTime = time;
    }

    return true;
  }

  async animateWave(token) {
    const waveFrames = [0, 1, 2, 3, 2, 1];
    let index = 0;

    while (token === this.runToken && this.root.classList.contains("is-running")) {
      this.setFrame(waveFrames[index % waveFrames.length]);
      index += 1;
      const isCurrent = await this.sleep(180, token);
      if (!isCurrent || this.progressTrack.getAttribute("aria-valuenow") === "50") break;
    }
  }

  async playDirectEntryFrames(token) {
    const durations = [180, 220, 220, 260, 220, 180, 170, 170, 180, 180, 180, 180];

    for (let frame = 4; frame < 16; frame += 1) {
      if (token !== this.runToken) return false;
      this.setFrame(frame);
      const isCurrent = await this.sleep(durations[frame - 4], token);
      if (!isCurrent) return false;
    }

    return true;
  }

  animateFrogPath() {
    const frogRect = this.frog.getBoundingClientRect();
    const screenRect = this.screen.getBoundingClientRect();
    const targetX = screenRect.left + screenRect.width * 0.48;
    const targetY = screenRect.top + screenRect.height * 0.54;
    const frogX = frogRect.left + frogRect.width * 0.5;
    const frogY = frogRect.top + frogRect.height * 0.5;
    const deltaX = targetX - frogX;
    const deltaY = targetY - frogY;

    const animation = this.frog.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)", offset: 0 },
        {
          transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)",
          offset: 0.31,
        },
        {
          transform: `translate3d(${deltaX * 0.12}px, ${deltaY * 0.12 - 28}px, 0) scale(1) rotate(-1deg)`,
          offset: 0.38,
        },
        {
          transform: `translate3d(${deltaX * 0.36}px, ${deltaY * 0.36 - 40}px, 0) scale(1) rotate(-1deg)`,
          offset: 0.56,
        },
        {
          transform: `translate3d(${deltaX * 0.62}px, ${deltaY * 0.66 - 44}px, 0) scale(1) rotate(0deg)`,
          offset: 0.72,
        },
        {
          transform: `translate3d(${deltaX * 0.82}px, ${deltaY * 0.86 - 26}px, 0) scale(0.99) rotate(0deg)`,
          offset: 0.86,
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.96) rotate(0deg)`,
          offset: 1,
        },
      ],
      {
        duration: 2340,
        easing: "cubic-bezier(0.3, 0.08, 0.16, 1)",
        fill: "forwards",
      }
    );

    this.activeAnimations.push(animation);
    return animation;
  }

  async finishProgress(token) {
    const checkpoints = [
      [300, 60],
      [420, 72],
      [480, 84],
      [520, 94],
      [620, 100],
    ];

    for (const [duration, value] of checkpoints) {
      const isCurrent = await this.sleep(duration, token);
      if (!isCurrent) return false;
      this.setProgress(value);
    }

    return true;
  }

  getCameraFocusTransform() {
    const cameraRect = this.camera.getBoundingClientRect();
    const screenRect = this.screen.getBoundingClientRect();
    const targetScreenWidth = Math.min(window.innerWidth * 0.9, 1360);
    const scale = Math.min(
      targetScreenWidth / screenRect.width,
      (window.innerHeight * 0.86) / screenRect.height
    );
    const localScreenCenterX = screenRect.left - cameraRect.left + screenRect.width / 2;
    const localScreenCenterY = screenRect.top - cameraRect.top + screenRect.height / 2;
    const x = window.innerWidth / 2 - cameraRect.left - localScreenCenterX * scale;
    const y = window.innerHeight / 2 - cameraRect.top - localScreenCenterY * scale;

    return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }

  animateCameraFocus() {
    const targetTransform = this.getCameraFocusTransform();
    const animation = this.camera.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(1)", offset: 0 },
        { transform: targetTransform, offset: 1 },
      ],
      {
        duration: 4000,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "forwards",
      }
    );

    this.activeAnimations.push(animation);
    return { animation, targetTransform };
  }

  async promoteLockScreenToFullscreen(animate = true) {
    const fromRect = this.screen.getBoundingClientRect();
    this.root.append(this.screen);
    this.screen.classList.add("monitor-screen--fullscreen");

    if (!animate) return;

    const toRect = this.screen.getBoundingClientRect();
    const x = fromRect.left - toRect.left;
    const y = fromRect.top - toRect.top;
    const scaleX = fromRect.width / toRect.width;
    const scaleY = fromRect.height / toRect.height;
    const animation = this.screen.animate(
      [
        {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})`,
          transformOrigin: "top left",
          borderRadius: "0.65rem",
        },
        {
          transform: "translate3d(0, 0, 0) scale(1, 1)",
          transformOrigin: "top left",
          borderRadius: "0",
        },
      ],
      {
        duration: 880,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "both",
      }
    );

    this.activeAnimations.push(animation);
    await animation.finished;
    animation.cancel();
  }

  async runReducedMotion(token) {
    this.setFrame(0);
    this.setProgress(100);
    await this.sleep(80, token);
    await this.promoteLockScreenToFullscreen(false);
    this.root.classList.remove("is-running");
    this.root.classList.add("is-complete", "is-focused");
    await this.scheduleUnlock(token);
  }

  async scheduleUnlock(token) {
    const canUnlock = await this.sleep(650, token);
    if (!canUnlock) return;

    await this.unlock();
  }

  async unlock() {
    if (
      !this.root.classList.contains("is-focused") ||
      this.root.classList.contains("is-unlocking") ||
      this.root.classList.contains("is-unlocked")
    ) {
      return;
    }

    const token = this.runToken;
    this.root.classList.add("is-unlocking");

    const isCurrent = await this.sleep(520, token);
    if (!isCurrent) return;

    this.root.classList.remove("is-unlocking");
    this.root.classList.add("is-unlocked");
  }

  async run() {
    this.runToken += 1;
    const token = this.runToken;
    this.reset();
    this.root.classList.add("is-running");

    if (this.reducedMotion.matches) {
      await this.runReducedMotion(token);
      return;
    }

    const loadingPromise = this.animateLoading(token);
    const wavePromise = this.animateWave(token);
    const loadingComplete = await loadingPromise;
    await wavePromise;

    if (!loadingComplete || token !== this.runToken) return;

    const pathAnimation = this.animateFrogPath();
    const framesPromise = this.playDirectEntryFrames(token);
    const progressPromise = this.finishProgress(token);

    await Promise.all([pathAnimation.finished, framesPromise, progressPromise]);
    if (token !== this.runToken) return;

    this.frog.style.opacity = "0";
    const canFocus = await this.sleep(320, token);
    if (!canFocus) return;

    this.root.classList.add("is-zooming");
    const { animation: cameraAnimation, targetTransform } = this.animateCameraFocus();
    await cameraAnimation.finished;
    if (token !== this.runToken) return;

    this.camera.style.transform = targetTransform;
    cameraAnimation.cancel();
    this.root.classList.add("is-handoff");
    await this.promoteLockScreenToFullscreen();
    if (token !== this.runToken) return;

    this.root.classList.remove("is-running", "is-zooming", "is-handoff");
    this.root.classList.add("is-complete", "is-focused");
    await this.scheduleUnlock(token);
  }
}

const splashRoot = document.querySelector("[data-splash]");
if (splashRoot) new SplashSequence(splashRoot).init();
