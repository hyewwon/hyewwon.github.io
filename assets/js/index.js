const journey = document.querySelector("[data-journey]");
const steps = Array.from(document.querySelectorAll("[data-step]"));
const journeyVideo = document.querySelector("[data-journey-video]");
const progressDots = Array.from(document.querySelectorAll("[data-progress-dot]"));
const stageNumber = document.querySelector("[data-stage-number]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeStage = -1;
let ticking = false;
let previousProgress = 0;
let videoPrimed = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setActiveStage(nextStage) {
  const stage = clamp(nextStage, 0, steps.length - 1);
  if (stage === activeStage) return;

  activeStage = stage;
  journey?.setAttribute("data-active-stage", String(stage));

  steps.forEach((step, index) => {
    const isCurrent = index === stage;
    step.classList.toggle("is-current", isCurrent);
    if (isCurrent) step.setAttribute("aria-current", "step");
    else step.removeAttribute("aria-current");
  });

  progressDots.forEach((dot, index) => {
    const isCurrent = index === stage;
    dot.classList.toggle("is-current", isCurrent);
    if (isCurrent) dot.setAttribute("aria-current", "step");
    else dot.removeAttribute("aria-current");
  });

  if (stageNumber) stageNumber.textContent = String(stage + 1).padStart(2, "0");
}

function updateJourney() {
  if (!journey || !steps.length) return;

  const rect = journey.getBoundingClientRect();
  const scrollable = Math.max(journey.offsetHeight - window.innerHeight, 1);
  const progress = clamp(-rect.top / scrollable, 0, 1);
  const viewportAnchor = window.innerHeight * 0.5;
  const stage = steps.reduce((closestIndex, step, index) => {
    const stepRect = step.getBoundingClientRect();
    const distance = Math.abs(stepRect.top + stepRect.height * 0.5 - viewportAnchor);
    const closestRect = steps[closestIndex].getBoundingClientRect();
    const closestDistance = Math.abs(closestRect.top + closestRect.height * 0.5 - viewportAnchor);
    return distance < closestDistance ? index : closestIndex;
  }, 0);
  const direction = progress >= previousProgress ? 1 : -1;

  journey.style.setProperty("--journey-progress", progress.toFixed(4));
  journey.style.setProperty("--journey-wash-opacity", (0.08 + progress * 0.14).toFixed(4));
  journey.style.setProperty("--journey-bg-y", `${(-180 * progress).toFixed(2)}px`);
  journey.style.setProperty("--journey-line-x", `${(-100 + progress * 100).toFixed(2)}%`);
  journey.style.setProperty("--caustic-rotate", `${(progress * 5).toFixed(2)}deg`);
  journey.dataset.scrollDirection = direction > 0 ? "forward" : "backward";
  syncJourneyVideo(progress);
  setActiveStage(stage);
  previousProgress = progress;
}

function requestJourneyUpdate() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateJourney();
    ticking = false;
  });
}

function syncJourneyVideo(progress) {
  if (!journeyVideo || journeyVideo.readyState < 1) return;
  const duration = Number.isFinite(journeyVideo.duration) ? journeyVideo.duration : 10;
  const targetTime = clamp(progress, 0, 1) * Math.max(duration - 0.04, 0);
  if (Math.abs(journeyVideo.currentTime - targetTime) < 1 / 30) return;
  journeyVideo.currentTime = targetTime;
}

function primeJourneyVideo() {
  if (!journeyVideo || videoPrimed) return;
  videoPrimed = true;

  const playPromise = journeyVideo.play();
  if (!playPromise) return;

  playPromise
    .then(() => {
      journeyVideo.pause();
      requestJourneyUpdate();
    })
    .catch(() => {
      videoPrimed = false;
    });
}

function createParticles() {
  const field = document.querySelector("[data-particle-field]");
  if (!field || prefersReducedMotion.matches) return;

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 28; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.setProperty("--particle-x", `${5 + Math.random() * 90}%`);
    particle.style.setProperty("--particle-size", `${2 + Math.random() * 7}px`);
    particle.style.setProperty("--particle-duration", `${8 + Math.random() * 10}s`);
    particle.style.setProperty("--particle-delay", `${Math.random() * -16}s`);
    particle.style.setProperty("--particle-drift", `${-36 + Math.random() * 72}px`);
    fragment.appendChild(particle);
  }
  field.appendChild(fragment);
}

function initFlowField() {
  const canvas = document.querySelector("[data-flow-field]");
  const stage = canvas?.closest(".journey-stage");
  const context = canvas?.getContext("2d");
  if (!canvas || !stage || !context) return;

  let width = 0;
  let height = 0;
  let lines = [];
  let animationFrame = 0;
  let isVisible = true;
  const pointer = { x: -1000, y: -1000, active: false };
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  function createLine() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      length: 22 + Math.random() * 34,
      speed: 0.08 + Math.random() * 0.18,
      curve: -7 + Math.random() * 14,
      alpha: 0.07 + Math.random() * 0.11,
      moss: Math.random() > 0.72,
    };
  }

  function resizeFlowField() {
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const lineCount = clamp(Math.round((width * height) / 14000), 44, 82);
    lines = Array.from({ length: lineCount }, createLine);
  }

  function getFlowAngle(x, y, time) {
    const horizontalCurrent = Math.sin(y * 0.009 + time * 0.00022) * 0.42;
    const crossCurrent = Math.cos(x * 0.006 - time * 0.00016) * 0.28;
    let angle = horizontalCurrent + crossCurrent - 0.08;

    if (pointer.active) {
      const deltaX = x - pointer.x;
      const deltaY = y - pointer.y;
      const distance = Math.hypot(deltaX, deltaY);
      const radius = 190;
      if (distance < radius) {
        const force = (1 - distance / radius) * 0.82;
        const swirlAngle = Math.atan2(deltaY, deltaX) + Math.PI / 2;
        angle += (swirlAngle - angle) * force;
      }
    }

    return angle;
  }

  function drawFlowField(time = 0) {
    context.clearRect(0, 0, width, height);
    context.lineCap = "round";
    context.lineWidth = 1;

    lines.forEach((line) => {
      const angle = getFlowAngle(line.x, line.y, time);
      const endX = line.x + Math.cos(angle) * line.length;
      const endY = line.y + Math.sin(angle) * line.length;
      const controlX = (line.x + endX) / 2 - Math.sin(angle) * line.curve;
      const controlY = (line.y + endY) / 2 + Math.cos(angle) * line.curve;
      const progressBoost = 0.82 + previousProgress * 0.28;

      context.strokeStyle = line.moss
        ? `rgba(134, 183, 74, ${line.alpha * progressBoost})`
        : `rgba(225, 239, 218, ${line.alpha * progressBoost})`;
      context.beginPath();
      context.moveTo(line.x, line.y);
      context.quadraticCurveTo(controlX, controlY, endX, endY);
      context.stroke();

      if (!prefersReducedMotion.matches) {
        line.x += Math.cos(angle) * line.speed;
        line.y += Math.sin(angle) * line.speed * 0.35;
        if (line.x > width + line.length) line.x = -line.length;
        if (line.x < -line.length) line.x = width + line.length;
        if (line.y > height + line.length) line.y = -line.length;
        if (line.y < -line.length) line.y = height + line.length;
      }
    });

    if (!prefersReducedMotion.matches && isVisible) {
      animationFrame = window.requestAnimationFrame(drawFlowField);
    }
  }

  if (hasFinePointer && !prefersReducedMotion.matches) {
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });
    stage.addEventListener("pointerleave", () => {
      pointer.active = false;
    });
  }

  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible && !prefersReducedMotion.matches) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(drawFlowField);
    }
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeFlowField).observe(stage);
  } else {
    window.addEventListener("resize", resizeFlowField);
  }

  resizeFlowField();
  drawFlowField();
}

function initPointerParallax() {
  if (!journey || prefersReducedMotion.matches || window.matchMedia("(pointer: coarse)").matches) return;

  journey.addEventListener("pointermove", (event) => {
    const x = ((event.clientX / window.innerWidth) - 0.5) * 22;
    const y = ((event.clientY / window.innerHeight) - 0.5) * 22;
    journey.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
    journey.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
    journey.style.setProperty("--pointer-x-soft", `${(x * 0.35).toFixed(2)}px`);
    journey.style.setProperty("--pointer-y-soft", `${(y * 0.35).toFixed(2)}px`);
    journey.style.setProperty("--pointer-x-tiny", `${(x * 0.18).toFixed(2)}px`);
    journey.style.setProperty("--pointer-y-tiny", `${(y * 0.18).toFixed(2)}px`);
    journey.style.setProperty("--pointer-x-inverse", `${(x * -0.18).toFixed(2)}px`);
    journey.style.setProperty("--pointer-y-inverse", `${(y * -0.18).toFixed(2)}px`);
  });

  journey.addEventListener("pointerleave", () => {
    journey.style.setProperty("--pointer-x", "0px");
    journey.style.setProperty("--pointer-y", "0px");
    journey.style.setProperty("--pointer-x-soft", "0px");
    journey.style.setProperty("--pointer-y-soft", "0px");
    journey.style.setProperty("--pointer-x-tiny", "0px");
    journey.style.setProperty("--pointer-y-tiny", "0px");
    journey.style.setProperty("--pointer-x-inverse", "0px");
    journey.style.setProperty("--pointer-y-inverse", "0px");
  });
}

function initMagneticLinks() {
  if (prefersReducedMotion.matches || window.matchMedia("(pointer: coarse)").matches) return;
  const links = document.querySelectorAll(".contact-pill, .contact-links a");

  links.forEach((link) => {
    link.addEventListener("pointermove", (event) => {
      const rect = link.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.14;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.18;
      link.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
      link.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
    });

    link.addEventListener("pointerleave", () => {
      link.style.setProperty("--magnetic-x", "0px");
      link.style.setProperty("--magnetic-y", "0px");
    });
  });
}

function initReveal() {
  const revealItems = document.querySelectorAll(".reveal");
  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8%" },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function init() {
  document.documentElement.classList.add("has-js");
  document.querySelectorAll("[data-year]").forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });

  journeyVideo?.addEventListener("canplay", primeJourneyVideo, { once: true });
  if (journeyVideo?.readyState >= 3) primeJourneyVideo();
  createParticles();
  initFlowField();
  initPointerParallax();
  initMagneticLinks();
  initReveal();
  updateJourney();

  window.addEventListener("scroll", requestJourneyUpdate, { passive: true });
  window.addEventListener("resize", requestJourneyUpdate);
}

init();
