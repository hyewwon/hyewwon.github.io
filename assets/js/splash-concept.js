(() => {
  "use strict";

  const SPRITE_SHEET = "assets/image/character/splash/sprites/frog-splash-combined-final.png";
  const ABOUT_SPRITE_SHEET = "assets/image/character/content/about/sprites/frog-about-intro-wave-sheet.png";
  const SKILLS_SPRITE_SHEET = "assets/image/character/content/skills/common/sprites/frog-skills-flow-swim-left-v3-sheet.png";
  const FRAME_COUNT = 12;
  const FRAME_COLUMNS = 4;
  const SKILLS_FRAME_COUNT = 8;
  const SKILLS_IDLE_ROW_POSITION = 85.5;
  const SKILL_LABELS = [
    "Backend Core",
    "Data & Cache",
    "Infrastructure",
    "AI Integration",
    "AI Workflow",
  ];
  const SKILL_TIMES = [2.18, 3.18, 4.18, 5.18, 6.18];
  const ABOUT_FRAME_SCALES = [1, 0.82, 0.73, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const ABOUT_ENTRY_DURATION = 2600;
  const ABOUT_WAVE_FRAME_DURATION = 220;

  const TIMING = {
    waveEnd: 1500,
    launchEnd: 2850,
    entryEnd: 4050,
    waterEnd: 5150,
    revealEnd: 5750,
  };

  const splash = document.querySelector("[data-splash-scroll]");
  const scene = document.querySelector("[data-splash-scene]");
  const header = document.querySelector("[data-scene-header]");
  const sceneLabel = document.querySelector("[data-scene-label]");
  const frog = document.querySelector("[data-splash-frog]");
  const frogSprite = document.querySelector("[data-splash-frog-sprite]");
  const entrySplash = document.querySelector("[data-entry-splash]");
  const progressOutput = document.querySelector("[data-splash-progress]");
  const statusOutput = document.querySelector("[data-splash-status]");
  const replayButton = document.querySelector("[data-replay-intro]");
  const chapterScroll = document.querySelector("[data-chapter-scroll]");
  const aboutSection = document.querySelector("[data-about-section]");
  const aboutContent = document.querySelector(".about-section__content");
  const aboutHeading = document.querySelector(".about-heading");
  const aboutHeadingLayer = document.querySelector("[data-about-heading-layer]");
  const aboutProfileStage = document.querySelector("[data-about-profile-stage]");
  const aboutProfile = document.querySelector(".about-profile");
  const aboutIntro = document.querySelector(".about-intro");
  const aboutIntroLayer = document.querySelector("[data-about-intro-layer]");
  const aboutDepth = document.querySelector(".about-depth");
  const aboutFrog = document.querySelector("[data-about-frog]");
  const aboutFrogSprite = document.querySelector("[data-about-frog-sprite]");
  const skillsIntro = document.querySelector("[data-skills-intro]");
  const skillsTitle = document.querySelector("[data-skills-title]");
  const skillsBubbles = [...document.querySelectorAll(".skills-intro__bubble")];
  const skillsDepth = document.querySelector(".skills-intro__depth");
  const skillsCurrent = document.querySelector("[data-skills-current]");
  const skillsCurrentTrack = document.querySelector("[data-skills-current-track]");
  const skillsCurrentLayers = [...document.querySelectorAll("[data-current-layer]")];
  const skillsCurrentParticles = document.querySelector("[data-current-particles]");
  const skillNavButtons = [...document.querySelectorAll("[data-skill-nav]")];
  const skillCount = document.querySelector("[data-skill-count]");
  const skillsFrog = document.querySelector("[data-skills-frog]");
  const skillsFrogSprite = document.querySelector("[data-skills-frog-sprite]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const waveFrames = [0, 1, 2, 1, 2, 0];
  let frogOriginX = 0;
  let frogOriginY = 0;
  let entryX = 0;
  let entryY = 0;
  let animationFrame = 0;
  let startTime = 0;
  let aboutAnimationFrame = 0;
  let aboutStartTime = 0;
  let aboutStartTimer = 0;
  let skillsAnimationFrame = 0;
  let skillsIdleFrame = -1;
  let activeSkillIndex = -1;
  let chapterTimeline = null;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (value, start, end) => clamp((value - start) / (end - start));
  const smooth = (value) => value * value * (3 - 2 * value);

  const scrollImmediately = (top) => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.getPropertyValue("scroll-behavior");
    const previousScrollPriority = root.style.getPropertyPriority("scroll-behavior");
    root.style.setProperty("scroll-behavior", "auto", "important");
    root.getBoundingClientRect();
    window.scrollTo({ top, behavior: "auto" });
    window.setTimeout(() => {
      if (previousScrollBehavior) {
        root.style.setProperty("scroll-behavior", previousScrollBehavior, previousScrollPriority);
      } else {
        root.style.removeProperty("scroll-behavior");
      }
    }, 80);
  };

  const setFrame = (frame) => {
    if (!frogSprite) return;
    const safeFrame = Math.max(0, Math.min(FRAME_COUNT - 1, frame));
    const column = safeFrame % FRAME_COLUMNS;
    const row = Math.floor(safeFrame / FRAME_COLUMNS);
    frogSprite.style.backgroundImage = `url("${SPRITE_SHEET}")`;
    frogSprite.style.backgroundPosition = `${column * (100 / (FRAME_COLUMNS - 1))}% ${row * 50}%`;
    frogSprite.dataset.frame = String(safeFrame + 1);
  };

  const setAboutFrame = (frame) => {
    if (!aboutFrogSprite) return;
    const safeFrame = Math.max(0, Math.min(FRAME_COUNT - 1, frame));
    const column = safeFrame % FRAME_COLUMNS;
    const row = Math.floor(safeFrame / FRAME_COLUMNS);
    aboutFrogSprite.style.backgroundImage = `url("${ABOUT_SPRITE_SHEET}")`;
    aboutFrogSprite.style.backgroundPosition = `${column * (100 / (FRAME_COLUMNS - 1))}% ${row * 50}%`;
    aboutFrogSprite.style.setProperty("--about-frame-scale", ABOUT_FRAME_SCALES[safeFrame]);
    aboutFrogSprite.dataset.frame = String(safeFrame + 1);
  };

  const setSkillsFrame = (frame) => {
    if (!skillsFrogSprite) return;
    const safeFrame = Math.max(0, Math.min(SKILLS_FRAME_COUNT - 1, Math.round(frame)));
    const column = safeFrame % FRAME_COLUMNS;
    const row = Math.floor(safeFrame / FRAME_COLUMNS);
    const rowPosition = row === 0 ? 0 : SKILLS_IDLE_ROW_POSITION;
    skillsFrogSprite.style.backgroundImage = `url("${SKILLS_SPRITE_SHEET}")`;
    skillsFrogSprite.style.backgroundPosition = `${column * (100 / (FRAME_COLUMNS - 1))}% ${rowPosition}%`;
    skillsFrogSprite.dataset.frame = String(safeFrame + 1);
  };

  const setSkillsMotion = (motion, frame = 0) => {
    if (!skillsFrogSprite) return;
    skillsFrogSprite.dataset.motion = motion;
    if (motion === "enter") setSkillsFrame(Math.min(3, frame));
  };

  const animateSkillsIdle = (timestamp) => {
    if (skillsFrogSprite?.dataset.motion === "idle") {
      const frame = 4 + Math.floor(timestamp / 230) % 4;
      if (frame !== skillsIdleFrame) {
        skillsIdleFrame = frame;
        setSkillsFrame(frame);
      }
    }
    skillsAnimationFrame = window.requestAnimationFrame(animateSkillsIdle);
  };

  const getSkillIndexForTime = (time) => {
    if (time < SKILL_TIMES[0] - 0.12) return -1;
    for (let index = SKILL_TIMES.length - 1; index >= 0; index -= 1) {
      if (time >= SKILL_TIMES[index] - 0.12) return index;
    }
    return 0;
  };

  const updateSkillsPresentation = (time) => {
    const nextSkillIndex = getSkillIndexForTime(time);
    const isInteractive = time >= 1.92;
    skillsCurrent?.classList.toggle("is-interactive", isInteractive);

    if (time >= 1.96 && time < 2.5) {
      const enterProgress = smooth(range(time, 1.96, 2.48));
      setSkillsMotion("enter", Math.floor(enterProgress * 4));
    } else if (time >= 2.48) {
      if (skillsFrogSprite?.dataset.motion !== "idle") {
        skillsIdleFrame = -1;
        skillsFrogSprite.dataset.motion = "idle";
      }
    } else {
      setSkillsMotion("enter", 0);
    }

    if (nextSkillIndex === activeSkillIndex) return;
    activeSkillIndex = nextSkillIndex;

    skillNavButtons.forEach((button, index) => {
      if (index === activeSkillIndex) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });

    if (skillCount && activeSkillIndex >= 0) {
      skillCount.textContent = String(activeSkillIndex + 1).padStart(2, "0");
    }

    if (
      sceneLabel
      && document.body.classList.contains("intro-complete")
      && activeSkillIndex >= 0
    ) {
      sceneLabel.textContent = `Skills · ${SKILL_LABELS[activeSkillIndex]}`;
    }
  };

  const animateAbout = (timestamp) => {
    const elapsed = timestamp - aboutStartTime;
    if (elapsed < ABOUT_ENTRY_DURATION) {
      const frame = Math.min(5, Math.floor(elapsed / (ABOUT_ENTRY_DURATION / 6)));
      setAboutFrame(frame);
    } else {
      aboutSection?.classList.add("is-copy-visible");
      const waveFrame = 6 + Math.floor((elapsed - ABOUT_ENTRY_DURATION) / ABOUT_WAVE_FRAME_DURATION) % 6;
      setAboutFrame(waveFrame);
    }
    aboutAnimationFrame = window.requestAnimationFrame(animateAbout);
  };

  const resetAbout = () => {
    window.clearTimeout(aboutStartTimer);
    window.cancelAnimationFrame(aboutAnimationFrame);
    aboutSection?.classList.remove("is-copy-visible");
    aboutFrog?.classList.remove("is-active");
    setAboutFrame(0);
  };

  const startAbout = () => {
    if (!aboutFrog || !aboutFrogSprite) return;
    aboutFrog.classList.add("is-active");
    if (reducedMotion) {
      setAboutFrame(7);
      aboutSection?.classList.add("is-copy-visible");
      return;
    }
    aboutStartTime = performance.now();
    aboutAnimationFrame = window.requestAnimationFrame(animateAbout);
  };

  const updateChapterLabel = (progress, time = 0) => {
    if (!sceneLabel || !document.body.classList.contains("intro-complete")) return;
    if (time >= SKILL_TIMES[0] - 0.12 && activeSkillIndex >= 0) {
      sceneLabel.textContent = `Skills · ${SKILL_LABELS[activeSkillIndex]}`;
    } else {
      sceneLabel.textContent = progress >= 0.13
        ? "Skills · Introduction"
        : "About · Introduction";
    }
  };

  const setupChapterScroll = () => {
    if (
      !chapterScroll
      || !aboutSection
      || !aboutContent
      || !aboutHeading
      || !aboutHeadingLayer
      || !aboutProfileStage
      || !aboutProfile
      || !aboutIntro
      || !aboutIntroLayer
      || !skillsIntro
      || !skillsTitle
    ) return;

    if (window.gsap && window.ScrollTrigger && !reducedMotion) {
      const gsap = window.gsap;
      gsap.registerPlugin(window.ScrollTrigger);
      gsap.set(aboutSection, { autoAlpha: 1 });
      gsap.set(aboutProfile, { "--profile-shell-opacity": 1 });
      gsap.set(aboutProfileStage, { yPercent: 0, autoAlpha: 1 });
      gsap.set(skillsIntro, { autoAlpha: 0 });
      gsap.set(skillsTitle, {
        yPercent: 24,
        scale: 0.9,
        opacity: 0,
        filter: "blur(10px)",
      });
      gsap.set(skillsBubbles, { opacity: 0, scale: 0.3 });
      gsap.set(skillsCurrent, { autoAlpha: 0 });
      gsap.set(skillsCurrentTrack, { autoAlpha: 0, scaleX: 0.96 });
      gsap.set(skillsCurrentLayers, {
        xPercent: (index) => 6 + index * 4,
      });
      gsap.set(skillsCurrentParticles, { autoAlpha: 0, xPercent: 10 });
      gsap.set(skillsFrog, {
        autoAlpha: 0,
        x: () => window.innerWidth * 0.72,
        y: 0,
        xPercent: -50,
        yPercent: 0,
        rotation: 0,
      });

      chapterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: chapterScroll,
          start: () => chapterScroll.offsetTop,
          end: () => chapterScroll.offsetTop + Math.max(1, chapterScroll.offsetHeight - window.innerHeight),
          scrub: 0.72,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            const time = chapterTimeline?.time() || 0;
            updateSkillsPresentation(time);
            updateChapterLabel(progress, time);
          },
        },
      });

      chapterTimeline
        .to([aboutHeadingLayer, aboutProfileStage, aboutIntroLayer], {
          yPercent: -22,
          autoAlpha: 0,
          duration: 0.58,
          ease: "power1.inOut",
        }, 0.2)
        .to(aboutDepth, {
          yPercent: -22,
          autoAlpha: 0,
          duration: 0.58,
          ease: "power1.inOut",
        }, 0.2)
        .to(skillsIntro, {
          autoAlpha: 1,
          duration: 0.16,
          ease: "none",
        }, 0.94)
        .to(skillsTitle, {
          yPercent: 0,
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.43,
          ease: "power2.out",
        }, 1.08)
        .to(skillsBubbles, {
          opacity: 0.62,
          scale: 1,
          duration: 0.32,
          stagger: 0.025,
          ease: "back.out(1.5)",
        }, 1.25)
        .addLabel("skillsStage", 1.82)
        .to(skillsTitle, {
          yPercent: -20,
          scale: 0.96,
          autoAlpha: 0,
          filter: "blur(7px)",
          duration: 0.34,
          ease: "power2.in",
        }, "skillsStage")
        .to(skillsBubbles, {
          opacity: 0.18,
          scale: 0.76,
          duration: 0.34,
          ease: "power1.inOut",
        }, "skillsStage")
        .to(skillsDepth, {
          autoAlpha: 0,
          duration: 0.25,
          ease: "none",
        }, "skillsStage")
        .to(skillsCurrent, {
          autoAlpha: 1,
          duration: 0.28,
          ease: "none",
        }, 1.93)
        .to(skillsCurrentTrack, {
          autoAlpha: 1,
          scaleX: 1,
          duration: 0.45,
          ease: "power2.out",
        }, 1.94)
        .to(skillsCurrentParticles, {
          autoAlpha: 1,
          duration: 0.35,
          ease: "none",
        }, 2.02)
        .to(skillsFrog, {
          x: 0,
          xPercent: -50,
          autoAlpha: 1,
          rotation: 0,
          duration: 0.58,
          ease: "power2.out",
        }, 1.96)
        .to(skillsCurrentLayers, {
          xPercent: (index) => -18 - index * 8,
          duration: 5.22,
          ease: "none",
        }, 2.02)
        .to(skillsCurrentParticles, {
          xPercent: -24,
          duration: 5.18,
          ease: "none",
        }, 2.04)
        .to({}, { duration: 0.01 }, 7.34);

      SKILL_TIMES.forEach((time, index) => {
        chapterTimeline.addLabel(`skill-${index}`, time);
      });
      updateSkillsPresentation(0);

      return;
    }

    const renderChapterFallback = () => {
      const rect = chapterScroll.getBoundingClientRect();
      const distance = Math.max(1, chapterScroll.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / distance);
      const time = progress * 7.35;
      const aboutExit = smooth(range(time, 0.2, 0.78));
      const skillsEnter = smooth(range(time, 0.94, 1.1));
      const titleEnter = smooth(range(time, 1.08, 1.51));
      const bubbleEnter = smooth(range(time, 1.25, 1.62));
      const titleExit = smooth(range(time, 1.82, 2.16));
      const currentEnter = smooth(range(time, 1.93, 2.21));

      if (progress <= 0.001) {
        [aboutHeadingLayer, aboutIntroLayer, aboutDepth].filter(Boolean).forEach((element) => {
          element.style.removeProperty("transform");
          element.style.removeProperty("opacity");
          element.style.removeProperty("visibility");
        });
        aboutProfileStage.style.removeProperty("transform");
        aboutProfileStage.style.removeProperty("opacity");
        aboutProfileStage.style.removeProperty("visibility");
        aboutProfile.style.setProperty("--profile-shell-opacity", "1");
      } else {
        [aboutHeadingLayer, aboutProfileStage, aboutIntroLayer].forEach((element) => {
          element.style.transform = `translate3d(0, ${(-22 * aboutExit).toFixed(2)}%, 0)`;
          element.style.opacity = (1 - aboutExit).toFixed(3);
          element.style.visibility = aboutExit >= 0.995 ? "hidden" : "visible";
        });
        if (aboutDepth) {
          aboutDepth.style.transform = `translate3d(0, ${(-22 * aboutExit).toFixed(2)}%, 0)`;
          aboutDepth.style.opacity = (1 - aboutExit).toFixed(3);
        }
        aboutProfile.style.setProperty("--profile-shell-opacity", "1");
      }
      skillsIntro.style.opacity = skillsEnter.toFixed(3);
      skillsIntro.style.visibility = skillsEnter <= 0.005 ? "hidden" : "visible";
      skillsTitle.style.transform = `translate3d(0, ${(24 * (1 - titleEnter) - 20 * titleExit).toFixed(2)}%, 0) scale(${(0.9 + titleEnter * 0.1 - titleExit * 0.04).toFixed(3)})`;
      skillsTitle.style.opacity = (titleEnter * (1 - titleExit)).toFixed(3);
      skillsTitle.style.visibility = titleExit >= 0.995 ? "hidden" : "visible";
      skillsTitle.style.filter = `blur(${(10 * (1 - titleEnter) + 7 * titleExit).toFixed(2)}px)`;
      skillsBubbles.forEach((bubble, index) => {
        const staggered = smooth(range(bubbleEnter, index * 0.055, 0.56 + index * 0.055));
        bubble.style.opacity = (staggered * (0.62 - titleExit * 0.44)).toFixed(3);
        bubble.style.transform = `scale(${(0.3 + staggered * 0.7 - titleExit * 0.24).toFixed(3)})`;
      });

      if (skillsCurrent) {
        skillsCurrent.style.opacity = currentEnter.toFixed(3);
        skillsCurrent.style.visibility = currentEnter <= 0.005 ? "hidden" : "visible";
      }
      if (skillsCurrentTrack) {
        skillsCurrentTrack.style.opacity = currentEnter.toFixed(3);
        skillsCurrentTrack.style.visibility = currentEnter <= 0.005 ? "hidden" : "visible";
      }

      const flowProgress = smooth(range(time, 2.02, 7.24));
      skillsCurrentLayers.forEach((layer, index) => {
        const start = 6 + index * 4;
        const end = -18 - index * 8;
        const x = start + (end - start) * flowProgress;
        layer.style.transform = `translate3d(${x.toFixed(2)}%, 0, 0)`;
      });
      if (skillsCurrentParticles) {
        skillsCurrentParticles.style.transform = `translate3d(${(10 - 34 * flowProgress).toFixed(2)}%, 0, 0)`;
      }

      updateSkillsPresentation(time);

      if (skillsFrog) {
        skillsFrog.style.opacity = currentEnter.toFixed(3);
        skillsFrog.style.visibility = currentEnter <= 0.005 ? "hidden" : "visible";
        skillsFrog.style.transform = `translate3d(${((1 - currentEnter) * 72).toFixed(2)}vw, 0, 0) translateX(-50%)`;
      }

      if (skillsDepth) {
        skillsDepth.style.opacity = (1 - titleExit).toFixed(3);
      }
      updateChapterLabel(progress, time);
    };

    window.addEventListener("scroll", renderChapterFallback, { passive: true });
    window.addEventListener("resize", renderChapterFallback);
    renderChapterFallback();

    let previousScrollY = Number.NaN;
    const observeChapterScroll = () => {
      if (window.scrollY !== previousScrollY) {
        previousScrollY = window.scrollY;
        renderChapterFallback();
      }
      window.requestAnimationFrame(observeChapterScroll);
    };
    window.requestAnimationFrame(observeChapterScroll);
  };

  const scrollToSkill = (index) => {
    if (!chapterScroll || index < 0 || index >= SKILL_TIMES.length) return;
    const timelineDuration = chapterTimeline?.duration() || 7.35;
    const targetProgress = clamp((SKILL_TIMES[index] + 0.72) / timelineDuration);
    const chapterTop = chapterScroll.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(1, chapterScroll.offsetHeight - window.innerHeight);
    const trigger = chapterTimeline?.scrollTrigger;
    const targetTop = trigger
      ? trigger.start + (trigger.end - trigger.start) * targetProgress
      : chapterTop + distance * targetProgress;
    if (chapterTimeline && !reducedMotion) {
      window.scrollTo({ top: targetTop, behavior: "smooth" });
      return;
    }

    scrollImmediately(targetTop);

    activeSkillIndex = -1;
    updateSkillsPresentation(SKILL_TIMES[index] + 0.72);
  };

  const measureStage = () => {
    if (!scene || !frog) return;
    const sceneRect = scene.getBoundingClientRect();
    const cliffRect = document.querySelector(".cliff")?.getBoundingClientRect();
    const splashRect = entrySplash?.getBoundingClientRect();
    const size = frog.getBoundingClientRect().width;
    const standingFootRatio = 440 / 512;
    const cliffSurfaceRatio = 54 / 260;
    const cliffSurfaceY = (cliffRect?.top || sceneRect.height * 0.43)
      + (cliffRect?.height || 0) * cliffSurfaceRatio;

    frogOriginX = frog.offsetLeft;
    frogOriginY = cliffSurfaceY - sceneRect.top - size * standingFootRatio;
    entryX = (splashRect?.left || sceneRect.width * 0.4)
      + (splashRect?.width || 0) / 2
      - sceneRect.left
      - (frogOriginX + size / 2);
    entryY = (splashRect?.top || sceneRect.height * 0.78)
      + (splashRect?.height || 0) / 2
      - sceneRect.top
      - (frogOriginY + size / 2);
    frog.style.top = `${frogOriginY.toFixed(2)}px`;
  };

  const renderFrog = (elapsed) => {
    if (!frog || !frogSprite) return;

    if (elapsed < TIMING.waveEnd) {
      const frame = waveFrames[Math.floor(elapsed / 190) % waveFrames.length];
      setFrame(frame);
      frog.style.transform = "translate3d(0, 0, 0)";
      frog.style.opacity = "1";
      return;
    }

    if (elapsed < TIMING.launchEnd) {
      const local = smooth(range(elapsed, TIMING.waveEnd, TIMING.launchEnd));
      const sequence = [2, 3, 3, 4, 5];
      const frame = sequence[Math.min(sequence.length - 1, Math.floor(local * sequence.length))];
      const airborne = range(local, 0.46, 1);
      const x = entryX * 0.57 * airborne;
      const y = -entryY * 0.23 * Math.sin(airborne * Math.PI * 0.8);
      setFrame(frame);
      frog.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      frog.style.opacity = "1";
      return;
    }

    const local = smooth(range(elapsed, TIMING.launchEnd, TIMING.entryEnd));
    const frame = Math.min(5, Math.floor(local * 6));
    const startX = entryX * 0.57;
    const startY = -entryY * 0.135;
    const x = startX + (entryX - startX) * local;
    const y = startY + (entryY - startY) * local * local;
    const opacity = 1 - range(elapsed, TIMING.entryEnd - 260, TIMING.entryEnd + 100);
    setFrame(frame + 6);
    frog.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${(1 - local * 0.09).toFixed(3)})`;
    frog.style.opacity = opacity.toFixed(3);
  };

  const renderSplash = (elapsed) => {
    const splashIn = range(elapsed, TIMING.entryEnd - 270, TIMING.entryEnd - 80);
    const splashOut = 1 - range(elapsed, TIMING.entryEnd - 80, TIMING.entryEnd + 420);
    const opacity = Math.min(splashIn, splashOut);
    if (!entrySplash) return;
    entrySplash.style.opacity = opacity.toFixed(3);
    entrySplash.style.transform = `translate(-50%, -50%) scale(${(0.7 + splashIn * 0.5).toFixed(3)})`;
  };

  const setCopy = (elapsed) => {
    const copyOpacity = 1 - smooth(range(elapsed, TIMING.waveEnd, TIMING.launchEnd - 250));
    scene?.style.setProperty("--copy-opacity", copyOpacity.toFixed(4));
  };

  const setWater = (elapsed) => {
    const waterProgress = smooth(range(elapsed, TIMING.entryEnd - 180, TIMING.waterEnd));
    scene?.style.setProperty("--water-shift", `${(-78 * waterProgress).toFixed(3)}dvh`);
    scene?.classList.toggle("is-copy-underwater", waterProgress > 0.42);
    header?.classList.toggle("is-underwater", waterProgress > 0.55);
  };

  const updateLoadingCopy = (elapsed) => {
    const percent = Math.min(100, Math.round((elapsed / TIMING.waterEnd) * 100));
    if (progressOutput) progressOutput.textContent = `${percent}%`;
    if (!statusOutput) return;
    if (elapsed < TIMING.waveEnd) statusOutput.textContent = "반갑게 인사하는 중";
    else if (elapsed < TIMING.launchEnd) statusOutput.textContent = "연못으로 뛰어드는 중";
    else if (elapsed < TIMING.entryEnd) statusOutput.textContent = "물속으로 들어가는 중";
    else statusOutput.textContent = "포트폴리오를 여는 중";
  };

  const completeIntro = () => {
    window.cancelAnimationFrame(animationFrame);
    splash?.classList.add("is-complete");
    document.body.classList.remove("is-intro-playing");
    document.body.classList.add("intro-complete");
    if (sceneLabel) sceneLabel.textContent = "About · Introduction";
    if (replayButton) replayButton.hidden = false;
    window.setTimeout(() => splash?.setAttribute("aria-hidden", "true"), 760);
    aboutStartTimer = window.setTimeout(startAbout, reducedMotion ? 0 : 680);
    window.requestAnimationFrame(() => window.ScrollTrigger?.refresh());
  };

  const animate = (timestamp) => {
    const elapsed = timestamp - startTime;
    renderFrog(elapsed);
    renderSplash(elapsed);
    setCopy(elapsed);
    setWater(elapsed);
    updateLoadingCopy(elapsed);

    if (elapsed >= TIMING.revealEnd) {
      completeIntro();
      return;
    }
    animationFrame = window.requestAnimationFrame(animate);
  };

  const resetScene = () => {
    window.cancelAnimationFrame(animationFrame);
    resetAbout();
    document.body.classList.add("is-intro-playing");
    document.body.classList.remove("intro-complete");
    splash?.classList.remove("is-complete");
    splash?.removeAttribute("aria-hidden");
    if (replayButton) replayButton.hidden = true;
    if (sceneLabel) sceneLabel.textContent = "Intro · Loading";
    if (progressOutput) progressOutput.textContent = "0%";
    scene?.style.setProperty("--copy-opacity", "1");
    scene?.style.setProperty("--water-shift", "0dvh");
    scene?.classList.remove("is-copy-underwater");
    header?.classList.remove("is-underwater");
    if (entrySplash) entrySplash.style.opacity = "0";
    activeSkillIndex = -1;
    skillsCurrent?.classList.remove("is-interactive");
    setSkillsMotion("enter", 0);
    setFrame(0);
    frog.style.transform = "translate3d(0, 0, 0)";
    frog.style.opacity = "1";
    scrollImmediately(0);
    window.requestAnimationFrame(() => window.ScrollTrigger?.update());
    measureStage();
  };

  const startIntro = () => {
    resetScene();
    if (reducedMotion) {
      window.setTimeout(completeIntro, 450);
      return;
    }
    startTime = performance.now();
    animationFrame = window.requestAnimationFrame(animate);
  };

  const preload = () => Promise.all(
    [
      SPRITE_SHEET,
      ABOUT_SPRITE_SHEET,
      SKILLS_SPRITE_SHEET,
    ].map((src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = src;
    })),
  );

  replayButton?.addEventListener("click", startIntro);
  skillNavButtons.forEach((button, index) => {
    button.addEventListener("click", () => scrollToSkill(index));
  });
  window.addEventListener("resize", measureStage);
  window.splashIntro = { replay: startIntro };
  setupChapterScroll();
  skillsAnimationFrame = window.requestAnimationFrame(animateSkillsIdle);
  preload().then(startIntro);
})();
