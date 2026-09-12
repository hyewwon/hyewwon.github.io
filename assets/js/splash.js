// Frames 4–7 prepare the jump, 8–12 fly/turn, 13–15 enter the portal.
// Share one clock so sprite changes and spatial movement stay in sync.
const FROG_ENTRY_DURATIONS = [180, 220, 220, 260, 220, 180, 170, 170, 180, 180, 180, 180];
const FROG_ENTRY_DURATION = FROG_ENTRY_DURATIONS.reduce((sum, duration) => sum + duration, 0);
const FOCUS_TIMING = { afterEntry: 100, camera: 3400, handoffAt: 3000, expand: 620 };

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
    this.skipButton = root.querySelector("[data-splash-skip]");
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.runToken = 0;
    this.activeAnimations = [];
  }

  init() {
    this.updateClock();
    window.setInterval(() => this.updateClock(), 30000);
    this.skipButton.addEventListener("click", () => this.skip());
    const unlockButton = this.root.querySelector('[data-desktop-unlock]');
    document.addEventListener('desktop-lock', () => {
      if (!this.root.classList.contains('is-unlocked') || this.root.classList.contains('is-guide-active')) return;
      this.setBatteryPopover(false);
      this.root.dataset.desktopLocked = 'true';
      unlockButton.hidden = false;
      this.root.classList.remove('is-unlocked');
      unlockButton.focus({ preventScroll: true });
    });
    unlockButton.addEventListener('click', async () => {
      unlockButton.disabled = true;
      await this.unlock();
      unlockButton.hidden = true;
      unlockButton.disabled = false;
      this.root.querySelector('[data-system-menu-trigger]').focus({ preventScroll: true });
    });
    this.batteryTrigger.addEventListener("click", () => {
      this.setBatteryPopover(
        !this.batteryTrigger.classList.contains("is-active")
      );
    });
    document.addEventListener('desktop-popover-open', event => {
      if (event.detail !== 'battery') this.setBatteryPopover(false);
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

    this.startTimer = window.setTimeout(() => this.run(), 420);
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
    if (isOpen) document.dispatchEvent(new CustomEvent('desktop-popover-open', { detail: 'battery' }));
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
    this.skipButton.disabled = false;
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

  async playDirectEntryFrames(token, pathAnimation) {
    let previousFrame = -1;
    while (token === this.runToken) {
      // Read the actual animation clock, not a parallel chain of setTimeouts.
      // Otherwise a busy browser can show the portal before travel has ended.
      const elapsed = Number(pathAnimation.currentTime) || 0;
      let end = 0;
      let frame = 15;
      for (let index = 0; index < FROG_ENTRY_DURATIONS.length; index += 1) {
        end += FROG_ENTRY_DURATIONS[index];
        if (elapsed < end) {
          frame = index + 4;
          break;
        }
      }
      if (frame !== previousFrame) {
        this.setFrame(frame);
        previousFrame = frame;
      }
      if (elapsed >= FROG_ENTRY_DURATION) return true;
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    }
    return false;
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
    const takeoffAt = FROG_ENTRY_DURATIONS.slice(0, 4).reduce((sum, value) => sum + value, 0);
    const portalAt = FROG_ENTRY_DURATIONS.slice(0, 9).reduce((sum, value) => sum + value, 0);
    const arcHeight = Math.min(44, frogRect.width * 0.35);
    const keyframes = [
      { transform: "translate3d(0, 0, 0)", offset: 0 },
      { transform: "translate3d(0, 0, 0)", offset: takeoffAt / FROG_ENTRY_DURATION },
    ];

    // Sample a continuous arc instead of globally easing a set of holds. Global
    // easing made the frog leave the shelf while it was still crouching.
    for (let step = 1; step <= 48; step += 1) {
      const time = step / 48;
      const progress = time * time * (3 - 2 * time);
      const x = deltaX * progress;
      const y = deltaY * progress - arcHeight * Math.sin(Math.PI * progress);
      keyframes.push({
        transform: `translate3d(${x}px, ${y}px, 0)`,
        offset: (takeoffAt + (portalAt - takeoffAt) * time) / FROG_ENTRY_DURATION,
      });
    }
    // Once the portal appears, anchor it to the monitor while the drawn frog
    // passes through it. Do not translate the portal across the screen as well.
    keyframes.push({ transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`, offset: 1 });

    const animation = this.frog.animate(
      keyframes,
      {
        duration: FROG_ENTRY_DURATION,
        easing: "linear",
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
        duration: FOCUS_TIMING.camera,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "forwards",
      }
    );

    this.activeAnimations.push(animation);
    return { animation, targetTransform };
  }

  async promoteLockScreenToFullscreen(animate = true) {
    const fromRect = this.screen.getBoundingClientRect();
    const cameraScale = fromRect.width / this.screen.offsetWidth;
    const specs = [
      ['.lock-screen__clock', ['top']],
      ['.lock-screen__date', ['fontSize']],
      ['.lock-screen__time', ['fontSize', 'marginTop']],
      ['.lock-screen__profile', ['bottom', 'width']],
      ['.profile-avatar', ['width', 'borderWidth']],
      ['.profile-name', ['fontSize', 'marginTop']],
      ['.lock-loader', ['width', 'marginTop']],
      ['.loader-track', ['height', 'borderWidth']],
      ['.loader-track__value', ['inset']],
      ['.lock-loader__value', ['fontSize', 'minWidth']],
    ];
    const elements = animate ? specs.map(([selector, properties]) => {
      const element = this.screen.querySelector(selector), style = getComputedStyle(element);
      return { element, properties, from: Object.fromEntries(properties.map(property => [property, `${parseFloat(style[property]) * cameraScale}px`])) };
    }) : [];
    this.root.append(this.screen);
    this.screen.classList.add("monitor-screen--fullscreen");

    if (!animate) return;

    const toRect = this.screen.getBoundingClientRect();
    // Measure the final layout before starting any animation. Animate actual
    // bounds and type sizes, not nonuniform scaleX/scaleY on the whole screen:
    // the wallpaper crops continuously and the avatar always stays circular.
    const targets = elements.map(item => ({ ...item, to: Object.fromEntries(item.properties.map(property => [property, getComputedStyle(item.element)[property]])) }));
    const options = { duration: FOCUS_TIMING.expand, easing: 'cubic-bezier(.25, .15, .2, 1)', fill: 'both' };
    const animation = this.screen.animate(
      [
        {
          left: `${fromRect.left}px`, top: `${fromRect.top}px`,
          width: `${fromRect.width}px`, height: `${fromRect.height}px`,
          borderRadius: "10px",
        },
        {
          left: `${toRect.left}px`, top: `${toRect.top}px`,
          width: `${toRect.width}px`, height: `${toRect.height}px`,
          borderRadius: "0",
        },
      ],
      options
    );
    const contents = targets.map(({ element, from, to }) => element.animate([from, to], options));
    const animations = [animation, ...contents];
    this.activeAnimations.push(...animations);
    await Promise.all(animations.map(item => item.finished.catch(() => {})));
    animations.forEach(item => item.cancel());
    this.activeAnimations = this.activeAnimations.filter(item => !animations.includes(item));
  }

  async runReducedMotion(token) {
    this.setFrame(0);
    this.setProgress(100);
    if (!await this.sleep(80, token)) return;
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
    const framesPromise = this.playDirectEntryFrames(token, pathAnimation);
    const progressPromise = this.finishProgress(token);

    await Promise.all([pathAnimation.finished.catch(() => {}), framesPromise, progressPromise]);
    if (token !== this.runToken) return;

    this.frog.style.opacity = "0";
    const canFocus = await this.sleep(FOCUS_TIMING.afterEntry, token);
    if (!canFocus) return;

    this.root.classList.add("is-zooming");
    const { animation: cameraAnimation } = this.animateCameraFocus();
    // Hand off before the camera ease has come to a complete stop.
    if (!await this.sleep(FOCUS_TIMING.handoffAt, token)) return;

    this.camera.style.transform = getComputedStyle(this.camera).transform;
    cameraAnimation.cancel();
    this.root.classList.add("is-handoff");
    await this.promoteLockScreenToFullscreen();
    if (token !== this.runToken) return;

    this.root.classList.remove("is-running", "is-zooming", "is-handoff");
    this.root.classList.add("is-complete", "is-focused");
    await this.scheduleUnlock(token);
  }

  skip() {
    if (this.skipButton.disabled || this.root.classList.contains("is-unlocked")) return;
    // Invalidate every pending sequence task before cancelling its animations.
    this.runToken += 1;
    window.clearTimeout(this.startTimer);
    this.skipButton.disabled = true;
    this.cancelAnimations();
    this.setProgress(100);
    this.frog.style.opacity = "0";
    this.promoteLockScreenToFullscreen(false);
    this.root.classList.remove("is-running", "is-zooming", "is-handoff", "is-unlocking");
    this.root.classList.add("is-complete", "is-focused", "is-unlocked");
    // The normal unlock observer opens About and starts the guide unchanged.
    this.screen.setAttribute("tabindex", "-1");
    this.screen.focus({ preventScroll: true });
  }
}

const splashRoot = document.querySelector("[data-splash]");
if (splashRoot) new SplashSequence(splashRoot).init();
