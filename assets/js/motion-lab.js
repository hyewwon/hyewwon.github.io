(() => {
  "use strict";

  const MOTION_LABELS = {
    idle: "대기",
    anticipation: "점프 준비",
    hop: "점프",
    dive: "입수",
    swim: "수영 루프",
    cycle: "전체 사이클",
  };

  const SHEETS = {
    idle: "assets/image/character/sprites/frog-idle-wave-sheet.png?v=2",
    jump: "assets/image/character/sprites/frog-jump-sheet.png",
    dive: "assets/image/character/sprites/frog-dive-sheet.png",
    swim: "assets/image/character/shared/swim/sprites/frog-swim-sheet.png",
  };

  const FRAME_COLUMNS = 3;
  const FRAME_ROWS = 2;

  class FrogMotionLab {
    constructor() {
      this.sprite = document.querySelector("[data-frog-sprite]");
      this.miniSprite = document.querySelector("[data-cycle-frog-sprite]");
      this.shell = document.querySelector("[data-frog-shell]");
      this.miniMount = document.querySelector("[data-cycle-frog-mount]");
      this.readout = document.querySelector("[data-stage-readout]");
      this.navStatus = document.querySelector("[data-nav-status]");
      this.speedControl = document.querySelector("[data-speed-control]");
      this.speedOutput = document.querySelector("[data-speed-output]");
      this.motionButtons = Array.from(document.querySelectorAll("[data-motion]"));
      this.resetButton = document.querySelector('[data-action="reset"]');
      this.cycleCards = Array.from(document.querySelectorAll("[data-cycle-step]"));
      this.speed = 1;
      this.timeline = null;
      this.bubbleTimeline = null;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    async init() {
      if (!this.sprite || !this.shell || !window.gsap) return;

      if (window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
      }

      this.setStatus("24개 프레임 불러오는 중");
      await this.preloadSheets();
      this.bindControls();
      this.configureStage();
      this.createAmbientBubbles();
      this.createScrollCycle();
      this.play("idle");
      this.setStatus("Sprite ready · 24 frames");
      window.frogMotionLab = this;
    }

    preloadSheets() {
      return Promise.all(
        Object.values(SHEETS).map(
          (src) =>
            new Promise((resolve) => {
              const image = new Image();
              image.onload = resolve;
              image.onerror = resolve;
              image.src = src;
            }),
        ),
      );
    }

    configureStage() {
      const { gsap } = window;
      gsap.set(this.shell, { xPercent: -50, transformOrigin: "50% 72%" });
      if (this.miniMount) {
        gsap.set(this.miniMount, { xPercent: -50, transformOrigin: "50% 72%" });
      }
      this.setFrame(this.sprite, "idle", 0);
      this.setFrame(this.miniSprite, "idle", 0);
    }

    bindControls() {
      this.motionButtons.forEach((button) => {
        button.addEventListener("click", () => this.play(button.dataset.motion));
      });

      this.resetButton?.addEventListener("click", () => this.play("idle"));

      this.speedControl?.addEventListener("input", (event) => {
        this.speed = Number(event.target.value) || 1;
        if (this.speedOutput) this.speedOutput.value = `${this.speed.toFixed(1)}×`;
        if (this.timeline) this.timeline.timeScale(this.speed);
      });
    }

    setStatus(message) {
      if (this.navStatus) this.navStatus.textContent = message;
    }

    setActiveButton(name) {
      this.motionButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.motion === name);
      });
      if (this.readout) this.readout.textContent = MOTION_LABELS[name] || name;
    }

    setFrame(target, motion, frame) {
      if (!target || !SHEETS[motion]) return;
      const safeFrame = Math.max(0, Math.min(5, frame));
      const column = safeFrame % FRAME_COLUMNS;
      const row = Math.floor(safeFrame / FRAME_COLUMNS);
      target.style.backgroundImage = `url("${SHEETS[motion]}")`;
      target.style.backgroundPosition = `${column * 50}% ${row * 100}%`;
      target.dataset.sheet = motion;
      target.dataset.frame = String(safeFrame + 1);
    }

    addFrames(timeline, motion, frames, start = 0, step = 0.13, target = this.sprite) {
      frames.forEach((frame, index) => {
        timeline.call(() => this.setFrame(target, motion, frame), null, start + index * step);
      });
      timeline.call(() => {}, null, start + frames.length * step);
      return start + frames.length * step;
    }

    resetPose() {
      const { gsap } = window;
      if (this.timeline) this.timeline.kill();
      this.timeline = null;
      gsap.killTweensOf([
        this.shell,
        this.sprite,
        ".splash-effect",
        ".splash-ring",
        ".splash-drop",
      ]);
      gsap.set(this.shell, {
        xPercent: -50,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
      });
      gsap.set(this.sprite, { scaleX: 1, rotation: 0 });
      gsap.set(".splash-effect", { opacity: 0 });
      gsap.set([".splash-ring", ".splash-drop"], {
        opacity: 0,
        x: 0,
        y: 0,
        scale: 0.25,
      });
      this.setFrame(this.sprite, "idle", 0);
    }

    play(name = "idle") {
      if (!MOTION_LABELS[name]) return;
      this.setActiveButton(name);
      this.resetPose();

      if (this.reducedMotion) {
        const stills = {
          idle: ["idle", 0],
          anticipation: ["jump", 1],
          hop: ["jump", 3],
          dive: ["dive", 4],
          swim: ["swim", 4],
          cycle: ["swim", 4],
        };
        this.setFrame(this.sprite, ...stills[name]);
        this.setStatus(`${MOTION_LABELS[name]} 정지 프레임`);
        return;
      }

      const factories = {
        idle: () => this.createIdle(),
        anticipation: () => this.createAnticipation(),
        hop: () => this.createHop(),
        dive: () => this.createDive(),
        swim: () => this.createSwim(),
        cycle: () => this.createFullCycle(),
      };
      this.timeline = factories[name]();
      this.timeline.timeScale(this.speed);
      this.setStatus(`${MOTION_LABELS[name]} · sprite playback`);
    }

    createIdle() {
      const timeline = window.gsap.timeline({ repeat: -1, repeatDelay: 0.62 });
      this.addFrames(timeline, "idle", [0, 1, 2, 3, 4, 3, 4, 5], 0, 0.16);
      return timeline;
    }

    createAnticipation() {
      const timeline = window.gsap.timeline({ repeat: 1, repeatDelay: 0.32, yoyo: true });
      this.addFrames(timeline, "jump", [0, 1], 0, 0.19);
      timeline.to(this.shell, { y: 14, duration: 0.38, ease: "power2.inOut" }, 0);
      return timeline;
    }

    createHop() {
      const timeline = window.gsap.timeline();
      this.addFrames(timeline, "jump", [0, 1, 2, 3, 4, 5], 0, 0.14);
      timeline
        .to(this.shell, { y: 13, duration: 0.14, ease: "power2.in" }, 0)
        .to(this.shell, { y: -190, rotation: -5, duration: 0.34, ease: "power3.out" }, 0.14)
        .to(this.shell, { y: 0, rotation: 0, duration: 0.36, ease: "power2.in" }, 0.48);
      return timeline;
    }

    addSplash(timeline, at) {
      timeline
        .set(".splash-effect", { opacity: 1 }, at)
        .fromTo(".splash-ring--one", { opacity: 0.9, scale: 0.18 }, {
          opacity: 0, scale: 1.8, duration: 0.7, ease: "power2.out",
        }, at)
        .fromTo(".splash-ring--two", { opacity: 0.7, scale: 0.12 }, {
          opacity: 0, scale: 1.35, duration: 0.62, ease: "power2.out",
        }, at + 0.08)
        .fromTo(".splash-drop--one", { x: -8, y: 0, opacity: 1, scale: 1 }, {
          x: -78, y: -82, opacity: 0, rotation: -24, duration: 0.68, ease: "power2.out",
        }, at)
        .fromTo(".splash-drop--two", { x: 0, y: 0, opacity: 1, scale: 0.8 }, {
          x: 0, y: -105, opacity: 0, rotation: 12, duration: 0.72, ease: "power2.out",
        }, at)
        .fromTo(".splash-drop--three", { x: 8, y: 0, opacity: 1, scale: 1 }, {
          x: 82, y: -72, opacity: 0, rotation: 22, duration: 0.66, ease: "power2.out",
        }, at);
    }

    createDive() {
      const timeline = window.gsap.timeline();
      this.addFrames(timeline, "jump", [1, 2, 3], 0, 0.14);
      this.addFrames(timeline, "dive", [0, 1, 2, 3, 4, 5], 0.42, 0.13);
      timeline
        .to(this.shell, { y: -155, duration: 0.38, ease: "power3.out" }, 0.04)
        .to(this.shell, { y: 340, scale: 0.84, duration: 0.78, ease: "power2.in" }, 0.42)
        .to(this.shell, { y: 430, opacity: 0.82, scale: 0.74, duration: 0.34, ease: "power1.inOut" }, 1.2);
      this.addSplash(timeline, 0.78);
      return timeline;
    }

    createSwim() {
      const { gsap } = window;
      gsap.set(this.shell, { x: -80, y: 205, scale: 0.82 });
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.08 });
      this.addFrames(timeline, "swim", [0, 1, 2, 3, 4, 5], 0, 0.13);
      this.addFrames(timeline, "swim", [0, 1, 2, 3, 4, 5], 0.78, 0.13);
      timeline
        .to(this.shell, { x: 92, y: 180, duration: 0.78, ease: "sine.inOut" }, 0)
        .set(this.sprite, { scaleX: -1 }, 0.78)
        .to(this.shell, { x: -80, y: 215, duration: 0.78, ease: "sine.inOut" }, 0.78)
        .set(this.sprite, { scaleX: 1 }, 1.56);
      return timeline;
    }

    createFullCycle() {
      const { gsap } = window;
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.65 });

      this.addFrames(timeline, "jump", [0, 1, 2, 3, 4], 0, 0.13);
      this.addFrames(timeline, "dive", [0, 1, 2, 3, 4, 5], 0.65, 0.12);
      this.addFrames(timeline, "swim", [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5], 1.5, 0.13);

      timeline
        .to(this.shell, { y: 14, duration: 0.13, ease: "power2.in" }, 0)
        .to(this.shell, { y: -175, duration: 0.4, ease: "power3.out" }, 0.13)
        .to(this.shell, { y: 340, scale: 0.84, duration: 0.85, ease: "power2.in" }, 0.65)
        .set(this.shell, { x: -95, y: 205, scale: 0.77, opacity: 1 }, 1.5)
        .to(this.shell, { x: 110, y: 180, duration: 1.56, ease: "sine.inOut" }, 1.5)
        .to(this.shell, { opacity: 0, duration: 0.3, ease: "power2.in" }, 3.06)
        .set(this.shell, { x: 0, y: 0, scale: 1, opacity: 1 }, 3.36);
      this.addSplash(timeline, 0.99);
      return timeline;
    }

    createAmbientBubbles() {
      if (this.reducedMotion) return;
      const { gsap } = window;
      const bubbles = gsap.utils.toArray(".bubble");
      this.bubbleTimeline = gsap.timeline({ repeat: -1 });
      bubbles.forEach((bubble, index) => {
        this.bubbleTimeline
          .fromTo(bubble, {
            y: 0, x: 0, opacity: 0, scale: 0.65,
          }, {
            y: -280 - index * 25,
            x: index % 2 === 0 ? 26 : -22,
            opacity: 0.76,
            scale: 1.08,
            duration: 3.6 + index * 0.6,
            ease: "none",
          }, index * 0.75)
          .to(bubble, { opacity: 0, duration: 0.35 }, ">-0.35");
      });
    }

    updateMiniSprite(progress) {
      if (!this.miniSprite || !this.miniMount) return;
      const { gsap } = window;
      const segment = Math.min(3, Math.floor(progress * 4));
      const local = Math.min(0.999, progress * 4 - segment);
      const frame = Math.min(5, Math.floor(local * 6));

      if (segment === 0) {
        this.setFrame(this.miniSprite, "jump", Math.min(1, Math.floor(local * 2)));
        gsap.set(this.miniMount, { x: 0, y: local * 10, rotation: 0, scale: 1 });
      } else if (segment === 1) {
        this.setFrame(this.miniSprite, "jump", Math.min(5, frame + 1));
        gsap.set(this.miniMount, { x: 0, y: -75 * Math.sin(local * Math.PI), rotation: -4, scale: 0.96 });
      } else if (segment === 2) {
        this.setFrame(this.miniSprite, "dive", frame);
        gsap.set(this.miniMount, { x: 0, y: -20 + local * 170, rotation: 0, scale: 0.88 });
      } else {
        this.setFrame(this.miniSprite, "swim", frame);
        gsap.set(this.miniMount, { x: -48 + local * 96, y: 140 + Math.sin(local * Math.PI * 2) * 8, rotation: 0, scale: 0.8 });
      }
    }

    createScrollCycle() {
      if (!window.ScrollTrigger || this.reducedMotion) return;
      const { gsap, ScrollTrigger } = window;

      ScrollTrigger.create({
        trigger: document.querySelector("[data-cycle-stack]"),
        start: "top 65%",
        end: "bottom 45%",
        scrub: 0.7,
        onUpdate: (self) => {
          this.updateMiniSprite(self.progress);
          const labels = ["준비", "도약", "입수", "수영"];
          const index = Math.min(labels.length - 1, Math.floor(self.progress * labels.length));
          this.setStatus(`스크롤 사이클 · ${labels[index]}`);
        },
      });

      this.cycleCards.forEach((card, index) => {
        gsap.fromTo(card, { scale: 0.86, opacity: 0.22, y: 80 }, {
          scale: 1,
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            end: "top 32%",
            scrub: 0.65,
          },
        });

        if (index < this.cycleCards.length - 1) {
          gsap.to(card, {
            scale: 0.94,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: this.cycleCards[index + 1],
              start: "top 78%",
              end: "top 32%",
              scrub: 0.65,
            },
          });
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    new FrogMotionLab().init();
  });
})();
