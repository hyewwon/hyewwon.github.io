(() => {
  "use strict";

  const SPRITE_SHEET = "assets/image/character/sprites/frog-splash-combined-final.png";
  const FRAME_COUNT = 12;
  const FRAME_COLUMNS = 4;

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
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const waveFrames = [0, 1, 2, 1, 2, 0];
  let frogOriginX = 0;
  let frogOriginY = 0;
  let entryX = 0;
  let entryY = 0;
  let animationFrame = 0;
  let startTime = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const range = (value, start, end) => clamp((value - start) / (end - start));
  const smooth = (value) => value * value * (3 - 2 * value);

  const setFrame = (frame) => {
    if (!frogSprite) return;
    const safeFrame = Math.max(0, Math.min(FRAME_COUNT - 1, frame));
    const column = safeFrame % FRAME_COLUMNS;
    const row = Math.floor(safeFrame / FRAME_COLUMNS);
    frogSprite.style.backgroundImage = `url("${SPRITE_SHEET}")`;
    frogSprite.style.backgroundPosition = `${column * (100 / (FRAME_COLUMNS - 1))}% ${row * 50}%`;
    frogSprite.dataset.frame = String(safeFrame + 1);
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
    if (sceneLabel) sceneLabel.textContent = "Portfolio · 2026";
    if (replayButton) replayButton.hidden = false;
    window.setTimeout(() => splash?.setAttribute("aria-hidden", "true"), 760);
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
    setFrame(0);
    frog.style.transform = "translate3d(0, 0, 0)";
    frog.style.opacity = "1";
    window.scrollTo({ top: 0, behavior: "auto" });
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
    [SPRITE_SHEET].map((src) => new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = resolve;
      image.src = src;
    })),
  );

  replayButton?.addEventListener("click", startIntro);
  window.addEventListener("resize", measureStage);
  window.splashIntro = { replay: startIntro };
  preload().then(startIntro);
})();
