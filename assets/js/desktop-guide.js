(() => {
  const splash = document.querySelector('[data-splash]');
  const guide = document.querySelector('[data-desktop-guide]');
  if (!splash || !guide) return;
  const screen = document.querySelector('[data-screen]');
  const about = screen.querySelector('.about-window');
  const skills = screen.querySelector('[data-skills-window]');
  const experience = screen.querySelector('[data-experience-window]');
  const projects = screen.querySelector('[data-projects-window]');
  const windows = [about, skills, experience, projects];
  const steps = [
    { title: 'About me', text: '안녕하세요!\n저의 포트폴리오에 오신 걸 환영해요.\n제가 하나씩 소개해 드릴게요.\n먼저, 저에 대한 소개부터 시작하겠습니다!' },
    { title: 'Skills', text: '지금까지 경험한 기술과 도구를 정리했어요.\n왼쪽 카테고리를 눌러 하나씩 살펴보세요!' },
    { title: 'Experience', text: '지금까지의 경력과 어떤 경험을 쌓아왔는지 정리했어요.\n왼쪽 페이지를 선택해 하나씩 살펴보세요.' },
    { title: 'Projects', text: '직접 참여한 프로젝트들이에요.\n관심 있는 프로젝트를 눌러 자세히 살펴보세요.' },
  ];
  const nextButton = guide.querySelector('[data-guide-next]');
  const previousButton = guide.querySelector('[data-guide-previous]');
  const dock = screen.querySelector('[data-desktop-dock]');
  const finderLauncher = screen.querySelector('[data-about-open]');
  const skillsLauncher = screen.querySelector('[data-skills-open]');
  const desktopItems = [dock];
  const dockApps = [finderLauncher, skillsLauncher, screen.querySelector('[data-experience-open]'), screen.querySelector('[data-projects-open]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const actor = screen.querySelector('[data-guide-actor]');
  // Reuse one painted surface instead of replacing a CSS image/texture on
  // every pose. Clearing and drawing happen synchronously in the same frame.
  const actorCanvas = document.createElement('canvas');
  actorCanvas.width = actorCanvas.height = 384;
  actorCanvas.className = 'desktop-guide-actor__canvas';
  const actorContext = actorCanvas.getContext('2d');
  if (actorContext) {
    actor.append(actorCanvas);
    actorContext.imageSmoothingEnabled = true;
    actorContext.imageSmoothingQuality = 'high';
  }
  let paintedFrame = null;
  const guideFrog = guide.querySelector('.desktop-guide__frog');
  const bubble = guide.querySelector('.desktop-guide__bubble');
  const windowControlSelector = '[data-about-close], [data-skills-close], [data-preview-action="close"], [data-preview-action="expand"], [data-store-action="close"], [data-store-action="expand"]';
  const windowControls = windows.flatMap(panel => [...panel.querySelectorAll(windowControlSelector)]);
  const originalDisabled = new Map(windowControls.map(button => [button, button.disabled]));
  const loadFrames = (path, count = 16) => Array.from({ length: count }, (_, index) => {
    const image = new Image(); image.src = `${path}${String(index + 1).padStart(2, '0')}.png`; return image;
  });
  const aboutFrames = loadFrames('assets/image/character/pages/desktop/guide-polish-v1/about/frame-', 17);
  const skillsFrames = loadFrames('assets/image/character/pages/desktop/guide-polish-v1/skills/frame-', 17);
  const introReady = Promise.all(aboutFrames.map(image => image.decode())).then(() => true, () => false);
  const skillsReady = Promise.all(skillsFrames.map(image => image.decode())).then(() => true, () => false);
  const experienceFrames = Array.from({ length: 16 }, (_, index) => {
    const image = new Image();
    image.src = `assets/image/character/pages/desktop/guide-polish-v1/experience/frame-${String(index + 1).padStart(2, '0')}.png`;
    return image;
  });
  const experienceReady = Promise.all(experienceFrames.map(image => image.decode())).then(() => true, () => false);
  const projectsFrames = Array.from({ length: 16 }, (_, index) => {
    const image = new Image();
    image.src = `assets/image/character/pages/desktop/guide-polish-v1/projects/frame-${String(index + 1).padStart(2, '0')}.png`;
    return image;
  });
  const projectsReady = Promise.all(projectsFrames.map(image => image.decode())).then(() => true, () => false);
  const outroFrames = loadFrames('assets/image/character/pages/desktop/outro-guide/frames-v2/frame-', 8);
  outroFrames.push(aboutFrames[16]); // Exact neutral blink, not a newly resized face.
  const outroReady = Promise.all(outroFrames.map(image => image.decode())).then(() => true, () => false);
  const introDurations = [100,120,120,140,260,130,130,180,160,180,160,180,180,140,400];
  const introTotal = introDurations.reduce((sum, value) => sum + value, 0);
  const introGreetingAt = 1180;
  const introEntranceMs = 620;
  let introRaf, introElapsed = null, actorPath;
  let travelRaf, travel = null;
  let experienceRaf, experienceMotion = null;
  let projectsRaf, projectsMotion = null;
  let outroRaf, outroMotion = null, ending = false;
  let idleTimer, returnRest = false;
  let unlocked = false, active = false, busy = false, step = 0;
  let revealTimer, generation = 0, layoutQueued = false;
  const visited = new Set();
  const windowStack = [...windows];
  // Keep the relative order of background apps instead of resetting them all
  // to one z-index (which lets DOM order hide the previously focused window).
  function focusWindow(panel) {
    const index = windowStack.indexOf(panel);
    if (index < 0) return;
    windowStack.splice(index, 1);
    windowStack.push(panel);
    windowStack.forEach((item, position) => { item.style.zIndex = String(3 + position); });
  }
  const motions = new Set();
  // Dock launches are independent of guide transitions and of other apps.
  const dockMotions = new Map();
  function cancelDockMotion(panel) {
    const pending = dockMotions.get(panel);
    if (!pending) return;
    dockMotions.delete(panel);
    pending.forEach(animation => animation.cancel());
    panel.classList.remove('is-dock-opening');
  }
  function animateDockOpen(panel, launcher) {
    if (reducedMotion.matches) return;
    cancelDockMotion(panel);
    panel.classList.add('is-dock-opening');
    const target = panel.getBoundingClientRect();
    const source = launcher.getBoundingClientRect();
    const dx = source.left + source.width / 2 - target.left - target.width / 2;
    const dy = source.top + source.height / 2 - target.top - target.height / 2;
    const base = getComputedStyle(panel).transform;
    const transform = base === 'none' ? '' : `${base} `;
    const scale = Math.max(.08, Math.min(.22, source.width / target.width));
    const entrance = panel.animate([
      { opacity: 0, transform: `${transform}translate(${dx}px, ${dy}px) scale(${scale})` },
      { opacity: 1, offset: .35 },
      { opacity: 1, transform: base },
    ], { duration: 480, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'both' });
    const animations = [entrance];
    const icon = launcher.querySelector('img');
    if (icon) {
      const pose = getComputedStyle(icon).transform;
      animations.push(icon.animate([
        { transform: pose },
        { transform: `${pose === 'none' ? '' : pose} translateY(-10px)`, offset: .38 },
        { transform: pose },
      ], { duration: 400, easing: 'ease-in-out' }));
    }
    dockMotions.set(panel, animations);
    entrance.finished.catch(() => {}).then(() => {
      if (dockMotions.get(panel) === animations) cancelDockMotion(panel);
    });
  }
  const snapPixel = value => Math.round(value * (window.devicePixelRatio || 1)) / (window.devicePixelRatio || 1);
  function setFrame(motion, frame) {
    const images = { about: aboutFrames, skills: skillsFrames, experience: experienceFrames, projects: projectsFrames, outro: outroFrames }[motion];
    frame = Math.max(0, Math.min(images.length - 1, Math.floor(frame) || 0));
    const image = images[frame];
    // Never replace the last valid pose with an empty/unavailable image.
    if (!image.complete || !image.naturalWidth) return;
    const frameKey = `${motion}:${frame}`;
    if (paintedFrame !== frameKey) {
      if (actorContext) {
        actorContext.clearRect(0, 0, 384, 384);
        actorContext.drawImage(image, 0, 0, 384, 384);
        actor.classList.add('has-canvas-frame');
      } else {
        actor.style.setProperty('--guide-frame', `url("${image.src}")`);
      }
      paintedFrame = frameKey;
      actor.dataset.motion = motion;
      actor.dataset.frame = String(frame + 1);
    }
    pointBubble();
  }
  let bubblePointerFrame;
  let lastPointerGeometry = '';
  function pointBubble() {
    // Frame setters run before the actor's position setters. Measure once
    // after both have run, rather than retaining the previous pose's position.
    if (bubblePointerFrame) return;
    bubblePointerFrame = requestAnimationFrame(() => {
      bubblePointerFrame = null;
      updateBubblePointer();
      // CSS/WAAPI entrance transforms may finish after the sprite's last
      // frame (especially with reduced motion). Track the displayed bounds
      // until the guide is dismissed, including those compositor movements.
      if (active && !guide.hidden && !document.hidden) pointBubble();
    });
  }
  function updateBubblePointer() {
    if (!active || actor.hidden || guide.hidden) return;
    // About's reserved frog slot stays aligned with the bubble while the
    // separate sprite layer is entering or the desktop is still transforming.
    const a = (step === 0 ? guideFrog : actor).getBoundingClientRect(), b = bubble.getBoundingClientRect();
    if (!b.width || !b.height) return;
    const geometry = [step,a.x,a.y,a.width,a.height,b.x,b.y,b.width,b.height].join(':');
    if (geometry === lastPointerGeometry) return;
    lastPointerGeometry = geometry;
    const x = a.x + a.width * .5, y = a.y + a.height * .5;
    const dx = x - (b.x + b.width / 2), dy = y - (b.y + b.height / 2);
    const vertical = Math.abs(dy) / b.height > Math.abs(dx) / b.width;
    bubble.dataset.tail = vertical ? (dy < 0 ? 'top' : 'bottom') : (dx < 0 ? 'left' : 'right');
    const position = vertical ? Math.max(22, Math.min(b.width - 22, x - b.x)) : Math.max(22, Math.min(b.height - 22, y - b.y));
    bubble.style.setProperty('--tail-offset', `${snapPixel(position)}px`);
    const anchorX = vertical ? b.x + position : dx < 0 ? b.x : b.right;
    const anchorY = vertical ? (dy < 0 ? b.y : b.bottom) : b.y + position;
    bubble.style.setProperty('--tail-angle', `${Math.atan2(y - anchorY, x - anchorX) * 180 / Math.PI + 90}deg`);
    const slope = vertical
      ? (x - anchorX) / Math.max(1, Math.abs(y - anchorY)) * (dy < 0 ? -1 : 1)
      : (y - anchorY) / Math.max(1, Math.abs(x - anchorX)) * (dx < 0 ? -1 : 1);
    bubble.style.setProperty('--tail-skew', `${Math.atan(Math.max(-1.2, Math.min(1.2, slope))) * 180 / Math.PI}deg`);
  }
  function idleBlink(token, motion, rest, closed) {
    clearTimeout(idleTimer);
    const valid = () => token === generation && active && unlocked && !actor.hidden;
    const schedule = () => {
      if (!valid() || reducedMotion.matches) return;
      idleTimer = setTimeout(() => {
        if (!valid()) return;
        if (document.hidden) { schedule(); return; }
        setFrame(motion, closed); actor.dataset.phase = 'blink';
        idleTimer = setTimeout(() => {
          if (!valid()) return;
          setFrame(motion, rest); actor.dataset.phase = 'rest'; schedule();
        }, 150);
      }, 1900 + Math.random() * 700);
    };
    schedule();
  }
  function paintReturnRest() {
    const target = actorTarget();
    actor.style.width = actor.style.height = `${snapPixel(target.size)}px`;
    actor.style.transform = `translate3d(${snapPixel(target.x)}px, ${snapPixel(target.y)}px, 0)`;
    pointBubble();
  }
  function playReturn(token, onReady) {
    returnRest = true;
    guide.classList.add('has-animated-frog'); actor.hidden = false;
    actor.classList.remove('is-mirrored', 'is-travelling');
    const motion = ['about', 'skills', 'experience', 'projects'][step], rest = step < 2 ? 15 : 13;
    setFrame(motion, rest); actor.dataset.phase = 'rest'; paintReturnRest();
    const entrance = animatePanel(actor, [{ opacity: 0 }, { opacity: 1 }], 220);
    entrance.finished.then(() => {
      if (token !== generation || !active) return;
      motions.delete(entrance); entrance.cancel(); onReady();
      idleBlink(token, motion, rest, step < 2 ? 16 : 14);
    }).catch(() => {});
  }
  function actorTarget() {
    if (ending) return outroTarget();
    const size = snapPixel(guideFrog.offsetWidth * 384 / 320);
    const inset = (size - guideFrog.offsetWidth) / 2;
    if (step === 3) {
      const sideSize = screen.clientWidth >= 900 ? 101 : 56;
      const left = projects.offsetLeft + 8;
      const right = projects.offsetLeft + projects.offsetWidth - sideSize - 12;
      const startX = projectsMotion ? projectsMotion.from.x * screen.clientWidth / projectsMotion.viewport.width : left;
      const landingX = Math.max(left, Math.min(right, startX));
      return { x: Math.min(right, landingX + sideSize * .75), landingX,
        y: projects.offsetTop - sideSize * 326 / 384, size: sideSize };
    }
    if (step === 2) {
      const sideSize = screen.clientWidth >= 900 ? size : 56;
      const fromY = experienceMotion ? experienceMotion.from.y * screen.clientHeight / experienceMotion.viewport.height : experience.offsetTop + 92;
      const fromX = experienceMotion ? experienceMotion.from.x * screen.clientWidth / experienceMotion.viewport.width : null;
      const outside = fromX!==null && fromX>=8 && fromX+sideSize<=experience.offsetLeft-12;
      return { x: outside ? fromX : experience.offsetLeft - sideSize - 12,
        y: Math.max(experience.offsetTop + 40, Math.min(fromY, screen.clientHeight - sideSize - (screen.clientWidth >= 900 ? guide.offsetHeight + 36 : 40))), size: sideSize };
    }
    if (step === 1) {
      if (screen.clientWidth >= 1180) {
        // Restore the upper-left OUTSIDE position: the pointing hand should
        // aim into the window, not pass above its top edge.
        return { x: skills.offsetLeft - size - 16,
          y: skills.offsetTop - inset, size };
      }
      // A dedicated perch above the window keeps the traffic lights and
      // category controls clear. The mobile bubble stays below the content.
      return { x: skills.offsetLeft + 8,
        y: Math.max(34, skills.offsetTop - size * .85), size };
    }
    return { x: guide.offsetLeft + guideFrog.offsetLeft - inset,
      y: guide.offsetTop + guideFrog.offsetTop - inset, size };
  }
  function snapshotActor() {
    if (actor.hidden) return null;
    const matrix = new DOMMatrix(getComputedStyle(actor).transform);
    return { x: matrix.m41, y: matrix.m42, size: actor.offsetWidth,
      motion: actor.dataset.motion || 'about', frame: Number(actor.dataset.frame) - 1 };
  }
  function paintTravel() {
    if (!travel) return;
    const target = actorTarget();
    const launchAt = 420, landingAt = launchAt + travel.duration;
    const p = Math.max(0, Math.min(1, (travel.elapsed - launchAt) / travel.duration));
    const horizontal = p * p * (3 - 2 * p);
    const size = snapPixel(travel.from.size + (target.size - travel.from.size) * horizontal);
    const startX = Math.max(0, Math.min(screen.clientWidth - size, travel.from.x * screen.clientWidth / travel.viewport.width));
    const startY = Math.max(0, Math.min(screen.clientHeight - size, travel.from.y * screen.clientHeight / travel.viewport.height));
    // A quadratic arc reaches a point above the destination and descends
    // into contact. No shrinking or mid-flight pause to fake the jump.
    const controlY = Math.max(34, Math.min(startY, target.y) - Math.min(150, screen.clientHeight * .16));
    const x = startX + (target.x - startX) * horizontal;
    const y = (1-p)**2 * startY + 2*(1-p)*p*controlY + p*p*target.y;
    actor.style.width = actor.style.height = `${size}px`;
    // Keep continuous subpixel movement in flight, but align the resting
    // bitmap with physical pixels rather than leaving it on a fractional texel.
    actor.style.transform = `translate3d(${snapPixel(x)}px, ${snapPixel(y)}px, 0)`;
    actor.classList.toggle('is-mirrored', !travel.present && travel.elapsed >= 160 && travel.elapsed < landingAt + 180);
    if (travel.elapsed < 160 && travel.from.motion === 'experience') {
      setFrame('experience', 13);
      actor.dataset.phase = 'handoff';
    } else if (travel.elapsed < 160 && travel.from.motion === 'about') {
      const lowered = travel.from.frame >= 8 && travel.from.frame < 14 ? 12 : 15;
      setFrame('about', travel.elapsed < 80 ? lowered : 15);
      actor.dataset.phase = 'handoff';
    } else if (travel.elapsed < 160) {
      setFrame('skills', travel.elapsed < 80 ? 13 : 11);
      actor.dataset.phase = 'handoff';
    } else if (travel.elapsed < launchAt) {
      setFrame('skills', Math.min(3, Math.floor((travel.elapsed - 160) / 65)));
      actor.dataset.phase = 'anticipation';
    } else if (travel.elapsed < landingAt) {
      setFrame('skills', Math.min(8, 4 + Math.floor(p * 5)));
      actor.dataset.phase = 'airborne';
    } else {
      const frame = Math.min(15, 9 + Math.floor((travel.elapsed - landingAt + .001) / 90));
      if (!travel.present && frame >= 11) setFrame('about', 15);
      else setFrame('skills', frame);
      actor.dataset.phase = frame < 11 ? 'landing' : frame < 15 ? 'presenting' : 'rest';
    }
  }
  function playTravel(from, present, token, onReady) {
    guide.classList.add('has-animated-frog');
    actor.hidden = false;
    actor.classList.add('is-travelling');
    const target = actorTarget();
    const start = from || { ...target, x: Math.min(screen.clientWidth - target.size, target.x + 100), y: target.y + 40, motion: 'about', frame: 15 };
    const distance = Math.hypot(target.x - start.x, target.y - start.y);
    travel = { from: start, present, elapsed: 0, viewport: { width: screen.clientWidth, height: screen.clientHeight },
      duration: Math.max(620, Math.min(1000, 500 + distance * .65)) };
    const total = 420 + travel.duration + 540;
    const started = performance.now();
    let revealed = false;
    function tick(now) {
      if (token !== generation || !active || !unlocked) return;
      travel.elapsed = reducedMotion.matches ? total : Math.max(0, Math.min(total, now - started));
      paintTravel();
      if (!revealed && travel.elapsed >= 420 + travel.duration + 180) {
        revealed = true;
        onReady();
      }
      if (travel.elapsed < total) travelRaf = requestAnimationFrame(tick);
      else { actor.classList.remove('is-travelling'); idleBlink(token, present ? 'skills' : 'about', 15, 16); }
    }
    travelRaf = requestAnimationFrame(tick);
  }
  function paintExperience() {
    if (!experienceMotion) return;
    const motion = experienceMotion, target = actorTarget();
    const walkAt = 720, arrived = walkAt + motion.walkMs;
    const p = Math.max(0, Math.min(1, (motion.elapsed - walkAt) / Math.max(1,motion.walkMs)));
    const eased = p * p * (3 - 2 * p);
    const size = Math.round(motion.from.size + (target.size - motion.from.size) * eased);
    const sx = Math.max(0, Math.min(screen.clientWidth - size, motion.from.x * screen.clientWidth / motion.viewport.width));
    const sy = Math.max(34, Math.min(screen.clientHeight - size, motion.from.y * screen.clientHeight / motion.viewport.height));
    const x = sx + (target.x - sx) * eased;
    // A grounded walk, not a jump arc. One small footfall bob per stride.
    const y = sy + (target.y - sy) * eased - (p>0 && p<1 ? Math.abs(Math.sin((motion.elapsed-walkAt)/140*Math.PI))*1 : 0);
    actor.style.width = actor.style.height = `${size}px`;
    // Align all sprite samples with physical pixels, including in motion.
    actor.style.transform = `translate3d(${snapPixel(x)}px, ${snapPixel(y)}px, 0)`;
    const frame = motion.elapsed < 360 ? Math.min(2, Math.floor(motion.elapsed / 120))
      : !motion.walkMs ? motion.frame
      : motion.elapsed < walkAt ? 3 + Math.floor((motion.elapsed-360)/120)
      : motion.elapsed < arrived ? 6 + Math.floor((motion.elapsed-walkAt)/140)%4
      : motion.elapsed < arrived + 480 ? Math.min(13,10+Math.floor((motion.elapsed-arrived)/120)) : motion.frame;
    setFrame('experience', frame);
    // The turn is painted into distinct front/profile/rear frames. Travel
    // starts only after the back is visible; turn back only AFTER arriving.
    actor.classList.remove('is-mirrored');
    actor.dataset.phase = motion.elapsed < 360 ? 'lower-hand' : motion.walkMs&&motion.elapsed<walkAt?'turn-away'
      : motion.walkMs&&motion.elapsed < arrived ? 'walk-out'
      : motion.walkMs&&motion.elapsed < arrived + 480 ? 'turn-to-window' : frame===13?'rest':'blink';
  }
  function playExperience(from, token, onReady) {
    const target = actorTarget();
    const start = from || {...target};
    experienceMotion = { from: start, walkMs: 0,
      elapsed: 0, frame: 13, viewport: {width:screen.clientWidth,height:screen.clientHeight} };
    // Resolve the target AFTER saving the starting position: already-outside
    // frogs must not walk in place toward a stale default destination.
    const destination=actorTarget();
    const distance = Math.hypot(destination.x-start.x,destination.y-start.y);
    experienceMotion.walkMs=distance>4?Math.max(560,Math.min(1800,distance*8)):0;
    const total = experienceMotion.walkMs ? 720 + experienceMotion.walkMs + 480 : 360;
    guide.classList.add('has-animated-frog');
    actor.hidden = false;
    actor.classList.remove('is-mirrored');
    actor.classList.add('is-travelling');
    const valid = () => token===generation && active && unlocked && step===2;
    const started=performance.now();let revealed=false;
    function tick(now){
      if (!valid()) return;
      // A newly scheduled callback may receive the current refresh's
      // timestamp, slightly earlier than performance.now() at setup.
      experienceMotion.elapsed=reducedMotion.matches?total:Math.max(0,Math.min(total,now-started));
      paintExperience();
      if(!revealed&&experienceMotion.elapsed>=Math.min(720,total)){revealed=true;onReady();}
      if(experienceMotion.elapsed<total)experienceRaf=requestAnimationFrame(tick);
      else{actor.classList.remove('is-travelling');idleBlink(token, 'experience', 13, 14);}
    }
    experienceRaf=requestAnimationFrame(tick);
  }
  function paintProjects() {
    if (!projectsMotion) return;
    const motion = projectsMotion, target = actorTarget();
    const launchAt = 600, landingAt = 1200, walkAt = 1500;
    const walkEnd = walkAt + motion.walkMs;
    const jump = Math.max(0, Math.min(1, (motion.elapsed - launchAt) / 600));
    const size = Math.round(motion.from.size + (target.size - motion.from.size) * jump);
    const sx = Math.max(8, Math.min(screen.clientWidth-size-8, motion.from.x * screen.clientWidth/motion.viewport.width));
    const sy = Math.max(34, Math.min(screen.clientHeight-size-8, motion.from.y * screen.clientHeight/motion.viewport.height));
    const landingX = target.landingX;
    const controlY = Math.max(34, Math.min(sy, target.y) - Math.min(24, target.size * .25));
    let x = sx, y = sy, frame = 0, phase = 'handoff';
    if (motion.elapsed >= walkAt) {
      const p = Math.max(0, Math.min(1, (motion.elapsed - walkAt) / motion.walkMs));
      // Foot contact and travel share the same interval. No moving during
      // anticipation, landing, or the final standing pose.
      x = landingX + (target.x - landingX) * p; y = target.y;
      frame = p < 1 ? 8 + Math.floor((motion.elapsed-walkAt)/140)%4 : motion.elapsed < walkEnd+160 ? 12 : motion.frame;
      phase = p < 1 ? 'walk-right' : frame===12 ? 'settle' : frame===14 ? 'blink' : 'rest';
    } else if (motion.elapsed >= landingAt) {
      x = landingX; y = target.y; frame = motion.elapsed < 1360 ? 6 : 7; phase = 'landing';
    } else if (motion.elapsed >= launchAt) {
      const eased = jump*jump*(3-2*jump);
      x = sx + (landingX-sx)*eased;
      y = (1-jump)**2*sy + 2*(1-jump)*jump*controlY + jump*jump*target.y;
      frame = Math.min(5,3+Math.floor(jump*3)); phase = 'airborne';
    } else if (motion.elapsed >= 240) {
      frame = motion.elapsed < 420 ? 1 : 2; phase = 'anticipation';
    }
    actor.style.width = actor.style.height = `${size}px`;
    actor.style.transform = `translate3d(${snapPixel(x)}px, ${snapPixel(y)}px, 0)`;
    actor.classList.remove('is-mirrored');
    setFrame('projects',frame); actor.dataset.phase=phase;
  }
  function playProjects(from, token, onReady) {
    const target=actorTarget();
    const landingX=target.landingX;
    projectsMotion={from:from||{x:landingX,y:target.y+80,size:target.size},elapsed:0,frame:13,
      walkMs:840, // A few steps, not a full-width traversal.
      viewport:{width:screen.clientWidth,height:screen.clientHeight}};
    const total=1500+projectsMotion.walkMs+360;
    guide.classList.add('has-animated-frog');actor.hidden=false;actor.classList.add('is-travelling');
    const valid=()=>token===generation&&active&&unlocked&&step===3;
    const started=performance.now();let revealed=false;
    function tick(now){
      if(!valid())return;
      projectsMotion.elapsed=reducedMotion.matches?total:Math.max(0,Math.min(total,now-started));
      paintProjects();
      // Let people read and navigate as soon as the frog has landed.
      if(!revealed&&projectsMotion.elapsed>=1500){revealed=true;onReady();}
      if(projectsMotion.elapsed<total)projectsRaf=requestAnimationFrame(tick);
      else{actor.classList.remove('is-travelling');idleBlink(token, 'projects', 13, 14);}
    }
    projectsRaf=requestAnimationFrame(tick);
  }
  function animatePanel(panel, frames, duration) {
    const motion = panel.animate(frames, { duration: reducedMotion.matches ? 1 : duration, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
    motions.add(motion);
    return motion;
  }

  function syncAccessibility() {
    dock.hidden = !unlocked || active;
    dock.inert = dock.hidden || splash.dataset.exploreTransition === 'revealing';
    windowControls.forEach(button => {
      button.disabled = active || originalDisabled.get(button);
      if (active) button.setAttribute('aria-disabled', 'true'); else button.removeAttribute('aria-disabled');
    });
    windows.forEach((panel, index) => {
      const hidden = !unlocked || panel.classList.contains('is-closed') || panel.classList.contains('is-tour-leaving') || (active && index !== step);
      panel.inert = hidden;
      panel.setAttribute('aria-hidden', String(hidden));
      dockApps[index].setAttribute('aria-expanded', String(!hidden));
    });
  }
  function paintActor() {
    if (!actorPath || introElapsed === null) return;
    let frame = 0, end = introDurations[0];
    while (frame < 15 && introElapsed >= end) end += introDurations[++frame];
    setFrame('about', frame);
    const ease = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
    const [from, to, progress] = introElapsed < 740
      ? [actorPath.start, actorPath.peek, ease(introElapsed / 480)]
      : [actorPath.peek, actorPath.target, ease((introElapsed - 740) / 440)];
    const x = from.x + (to.x - from.x) * progress;
    const y = from.y + (to.y - from.y) * progress;
    actor.style.transform = `translate3d(${snapPixel(x)}px, ${snapPixel(y)}px, 0)`;
    pointBubble();
  }
  function playAboutIntro(token, onReady) {
    guide.classList.add('has-animated-frog');
    actor.hidden = false;
    introElapsed = 0;
    layout();
    const started = performance.now();
    let guideRevealed = false;
    function tick(now) {
      if (generation !== token || !active || !unlocked) return;
      const elapsed = now - started;
      // Shorten only the peek/entrance; keep the hand wave at its original pace.
      const timeline = elapsed < introEntranceMs
        ? elapsed * introGreetingAt / introEntranceMs
        : introGreetingAt + elapsed - introEntranceMs;
      introElapsed = reducedMotion.matches ? introTotal : Math.min(introTotal, timeline);
      paintActor();
      if (!guideRevealed && introElapsed >= introGreetingAt) {
        guideRevealed = true;
        onReady(); // Reading and navigation need not wait for the wave to finish.
      }
      if (introElapsed < introTotal) introRaf = requestAnimationFrame(tick);
      else { actor.dataset.phase = 'rest'; idleBlink(token, 'about', 15, 16); }
    }
    introRaf = requestAnimationFrame(tick);
  }
  function layout() {
    if (!unlocked || visited.size === 0) return;
    if (ending) { layoutOutro(); return; }
    const width = screen.clientWidth, height = screen.clientHeight;
    // Every window shares a center, regardless of its size or tour step.
    // Reserve guide space without adding an offset for successive windows.
    const compact = width < 1180;
    const shortLandscape = height <= 500 && width >= 600;
    const experienceActive = active && step === 2;
    const guideWidth = experienceActive ? (width >= 900 ? 208 : Math.min(640,width-32)) : active && step === 3 ? (compact ? Math.min(shortLandscape?672:384,width-32) : 208)
      : compact ? Math.min(shortLandscape ? 672 : 384, width - 32) : step === 0 ? 352 : 304;
    const guideReserve = compact ? (shortLandscape ? 164 : width < 360 ? 236 : 216) : 0;
    const frameWidth = Math.min(1000, width - (!active || compact ? 32 : 2 * (guideWidth + 40)));
    const perchReserve = active && step === 1 && compact ? 76 : 0;
    const availableHeight = Math.max(120, height - (!active ? 148 : compact ? 80 + guideReserve + perchReserve : 96));
    const frameHeight = active && step === 1 && !compact ? Math.min(640, height - 168) : Math.min(640, availableHeight);
    const centerX = width / 2;
    const centerY = !active ? 48 + availableHeight / 2 : compact ? 48 + perchReserve + availableHeight / 2 : active && step === 1
      ? Math.max(height / 2, 120 + frameHeight / 2) : height / 2;
    if (active) splash.classList.toggle('is-guide-compact', compact);
    guide.style.width = `${guideWidth}px`;
    for (const index of visited) {
      const panel = windows[index];
      if(index===2){
        // Experience is a reading window, not constrained by the tour's two
        // side columns. Keep its larger bounds when another step is in front.
        if(active&&!experienceActive)continue;
        const rail=experienceActive?(width>=900?232:80):16;
        const ew=Math.min(1280,width-rail-24);
        const et=48;
        const bottom=!active?100:experienceActive&&width<900?guide.offsetHeight+28:24;
        const eh=Math.max(120,height-et-bottom);
        panel.style.setProperty('--tour-width',`${ew}px`);
        panel.style.setProperty('--tour-height',`${eh}px`);
        panel.style.setProperty('--tour-left',`${experienceActive?Math.max(rail,(width-ew-rail-24)/2+rail):(width-ew)/2}px`);
        panel.style.setProperty('--tour-top',`${et}px`);
        continue;
      }
      if(index===3){
        // A larger project-reading area; still smaller than Experience.
        const rail=active&&!compact?232:16;
        const pw=Math.min(1100,width-rail-(compact?16:24));
        // Reserve only the frog's top-edge perch, never the whole guide.
        const perchTop = active && step===3 ? (width>=900?126:88) : 48;
        const pt=compact?perchTop:Math.max(perchTop,(height-Math.min(720,availableHeight))/2);
        const bottom=!active?height-100:compact?48+availableHeight:height-24;
        const ph=Math.min(720,Math.max(120,bottom-pt));
        panel.style.setProperty('--tour-width',`${pw}px`);
        panel.style.setProperty('--tour-height',`${ph}px`);
        panel.style.setProperty('--tour-left',`${active&&!compact?rail+(width-pw-rail-24)/2:(width-pw)/2}px`);
        panel.style.setProperty('--tour-top',`${pt}px`);
        continue;
      }
      panel.style.setProperty('--tour-width', `${frameWidth}px`);
      panel.style.setProperty('--tour-height', `${frameHeight}px`);
      // About retains its portrait size; center its actual rendered bounds too.
      panel.style.setProperty('--tour-left', `${centerX - panel.offsetWidth / 2}px`);
      panel.style.setProperty('--tour-top', `${centerY - panel.offsetHeight / 2}px`);
    }
    if (!active) return;
    const panel = windows[step];
    const left = experienceActive ? (width>=900?panel.offsetLeft-guide.offsetWidth-16:(width-guide.offsetWidth)/2) : step===3 ? (!compact?panel.offsetLeft-guide.offsetWidth-16:(width-guide.offsetWidth)/2) : compact ? (width - guide.offsetWidth) / 2 : step === 1
      ? panel.offsetLeft - guide.offsetWidth - 24 : panel.offsetLeft + panel.offsetWidth + 24;
    const top = experienceActive ? (width>=900?actorTarget().y+actorTarget().size+12:panel.offsetTop+panel.offsetHeight+12) : step===3 ? (!compact?Math.max(48,actorTarget().y+actorTarget().size+16):panel.offsetTop+panel.offsetHeight+12) : compact ? centerY + frameHeight / 2 + 12 : step === 1
      ? panel.offsetTop : panel.offsetTop + panel.offsetHeight - guide.offsetHeight;
    guide.style.left = `${Math.round(left)}px`;
    guide.style.top = `${Math.round(Math.max(48, top))}px`;
    if (travel) paintTravel();
    if (experienceMotion) paintExperience();
    if (projectsMotion) paintProjects();
    if (step === 0 && introElapsed !== null) {
      // v4 adds 32px padding around the original 320px art. Compensate only
      // the sprite box, preserving the on-screen size of the original frog.
      const size = snapPixel(guideFrog.offsetWidth * 384 / 320);
      const inset = (size - guideFrog.offsetWidth) / 2;
      const target = { x: guide.offsetLeft + guideFrog.offsetLeft - inset,
        y: guide.offsetTop + guideFrog.offsetTop - inset };
      const right = about.offsetLeft + about.offsetWidth;
      const bottom = about.offsetTop + about.offsetHeight;
      const below = compact || width - right < size * .7;
      const x = Math.max(8, Math.min(width - size - 8, right - size * .8));
      actorPath = below
        ? { start: { x, y: bottom - size }, peek: { x, y: bottom - size * .48 }, target }
        : { start: { x: right - size, y: bottom - size * .92 },
          peek: { x: right - size * .52, y: bottom - size * .92 }, target };
      actor.style.width = `${size}px`;
      actor.style.height = `${size}px`;
      paintActor();
    }
    if (returnRest) paintReturnRest();
    pointBubble();
  }
  function scheduleLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    queueMicrotask(() => { layoutQueued = false; layout(); });
  }
  function cancelReveal(preserveActor = false) {
    desktopItems.forEach(item => { item.inert = false; });
    delete splash.dataset.exploreTransition;
    cancelAnimationFrame(outroRaf);
    outroMotion = null;
    ending = false;
    clearTimeout(idleTimer);
    returnRest = false;
    clearTimeout(revealTimer);
    cancelAnimationFrame(introRaf);
    cancelAnimationFrame(travelRaf);
    cancelAnimationFrame(experienceRaf);
    cancelAnimationFrame(projectsRaf);
    projectsMotion = null;
    experienceMotion = null;
    travel = null;
    introElapsed = null;
    actorPath = null;
    actor.hidden = !preserveActor;
    if (!preserveActor) {
      delete actor.dataset.phase;
      actor.classList.remove('is-mirrored');
    }
    actor.classList.toggle('is-travelling', preserveActor);
    guide.classList.toggle('has-animated-frog', preserveActor);
    motions.forEach(motion => motion.cancel());
    motions.clear();
    windows.forEach(panel => panel.classList.remove('is-tour-leaving'));
    generation += 1;
    busy = false;
    guide.classList.remove('is-guide-visible');
    guide.classList.remove('is-outro-preparing');
    guide.inert = true;
  }
  async function showStep(index, initial = false, focus = true) {
    if (!unlocked) return;
    const goingBack = active && index < step;
    const outgoing = windows[step];
    const actorFrom = !initial ? snapshotActor() : null;
    cancelReveal(Boolean(actorFrom));
    const token = generation;
    active = true; busy = true;
    splash.classList.add('is-guide-active');
    dock.hidden = true;
    syncAccessibility();

    // Exit first, then change the active index. Never expose the previous
    // window underneath a closing panel, even for a single refresh.
    if (!initial && !outgoing.classList.contains('is-closed')) {
      outgoing.classList.add('is-tour-leaving'); outgoing.inert = true;
      const exit = animatePanel(outgoing, [
        { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
        { opacity: 0, transform: 'translate3d(0,8px,0) scale(.985)' },
      ], 200);
      if (goingBack && actorFrom) animatePanel(actor, [{ opacity: 1 }, { opacity: 0 }], 180);
      await exit.finished.catch(() => {});
      if (token !== generation || !unlocked || !active) return;
      // Change underlying visibility before releasing the animation's fill.
      outgoing.classList.add('is-closed', 'is-tour-background');
      outgoing.classList.remove('is-tour-leaving');
      motions.delete(exit); exit.cancel();
      if (goingBack) actor.hidden = true;
    }
    step = index;
    visited.add(index);
    guide.hidden = false;
    guide.dataset.step = String(index);
    windows.forEach((panel, i) => {
      panel.classList.toggle('is-closed', i !== index);
      panel.classList.toggle('is-tour-background', i !== index);
      panel.classList.toggle('is-tour-entering', i === index);
      panel.classList.remove('is-tour-leaving');
      if (visited.has(i)) panel.classList.add('is-tour-positioned');
      panel.style.zIndex = i === index ? '5' : '1';
    });
    guide.querySelector('#desktop-guide-title').textContent = steps[index].title;
    guide.querySelector('[data-guide-message]').textContent = steps[index].text;
    const count = guide.querySelector('[data-guide-count]');
    count.textContent = `${index + 1} / ${steps.length}`;
    count.setAttribute('aria-label', `전체 ${steps.length}단계 중 ${index + 1}단계`);
    previousButton.disabled = index === 0;
    previousButton.hidden = false;
    guide.querySelector('[data-guide-skip]').textContent = '건너뛰기';
    nextButton.textContent = '다음 →';
    nextButton.setAttribute('aria-label', index === 3 ? '다음: 마무리 안내' : `다음: ${steps[index + 1].title}`);
    syncAccessibility(); layout();
    const entering = animatePanel(windows[index], [
      { opacity: 0, transform: 'translate3d(0,8px,0) scale(.985)' },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' },
    ], initial ? 340 : 280);
    await entering.finished.catch(() => {});
    if (token !== generation || !active || !unlocked) return;
    windows[index].classList.remove('is-tour-entering');
    motions.delete(entering); entering.cancel();
    // Discard the outgoing actor fade only after it is hidden.
    if (goingBack) {
      motions.forEach(motion => motion.cancel()); motions.clear();
    }
    function revealGuide() {
      if (token !== generation || !active || !unlocked) return;
      layout();
      guide.classList.add('is-guide-visible');
      if (step === 0) pointBubble();
      guide.inert = false; busy = false;
      if (focus) nextButton.focus({ preventScroll: true });
    }
    revealTimer = setTimeout(async () => {
      if (token !== generation || !active || !unlocked) return;
      if (goingBack) {
        const ready = await [introReady, skillsReady, experienceReady, projectsReady][index];
        if (token !== generation || !active || !unlocked) return;
        if (ready) { playReturn(token, revealGuide); return; }
      }
      if(index===3){
        let timeout;
        const ready=await Promise.race([projectsReady,new Promise(resolve=>{timeout=setTimeout(()=>resolve(false),350);})]);
        clearTimeout(timeout);
        if(token!==generation||!active||!unlocked)return;
        if(ready){playProjects(actorFrom,token,revealGuide);return;}
        actor.hidden=true;guide.classList.remove('has-animated-frog');
      }
      if(index===2){
        let timeout;
        const ready=await Promise.race([experienceReady,new Promise(resolve=>{timeout=setTimeout(()=>resolve(false),350);})]);
        clearTimeout(timeout);
        if(token!==generation||!active||!unlocked)return;
        if(ready){playExperience(actorFrom,token,revealGuide);return;}
        actor.hidden=true;guide.classList.remove('has-animated-frog');
      }
      if (index === 1 || (index === 0 && actorFrom)) {
        let timeout;
        const ready = await Promise.race([skillsReady, new Promise(resolve => {
          timeout = setTimeout(() => resolve(false), 350);
        })]);
        clearTimeout(timeout);
        if (token !== generation || !active || !unlocked) return;
        if (ready) { playTravel(actorFrom, index === 1, token, revealGuide); return; }
        actor.hidden = true;
        guide.classList.remove('has-animated-frog');
      }
      if (index === 0) {
        // A failed/slow sprite must never block navigation. Keep the original
        // static frog as a fallback. Works on file:// without fetching JSON.
        let timeout;
        const ready = await Promise.race([introReady, new Promise(resolve => {
          timeout = setTimeout(() => resolve(false), 350);
        })]);
        clearTimeout(timeout);
        if (token !== generation || !active || !unlocked) return;
        if (ready) { playAboutIntro(token, revealGuide); return; }
      }
      revealGuide();
    }, 0);
  }
  function outroTarget() {
    const width = screen.clientWidth, height = screen.clientHeight;
    const size = width >= 900 ? 101 : 84;
    const stacked = width < 900;
    const total = size + 18 + guide.offsetHeight;
    return { x: (width - size) / 2,
      y: stacked ? Math.max(48, (height - total) / 2) : (height - size) / 2, size };
  }
  function layoutOutro() {
    const width = screen.clientWidth, height = screen.clientHeight;
    splash.classList.remove('is-guide-compact');
    guide.style.width = `${Math.min(360, width - 32)}px`;
    const target = outroTarget();
    guide.style.left = `${snapPixel(width < 900 ? (width - guide.offsetWidth) / 2 : target.x + target.size + 20)}px`;
    guide.style.top = `${snapPixel(width < 900 ? target.y + target.size + 18 : Math.max(48, Math.min(height - guide.offsetHeight - 16, height / 2 - guide.offsetHeight / 2)))}px`;
    paintOutro();
    pointBubble();
  }
  function paintOutro() {
    if (!outroMotion) return;
    const { from, viewport, elapsed } = outroMotion, target = outroTarget();
    const t = Math.max(0, Math.min(1, (elapsed - 280) / 780));
    const ease = t * t * (3 - 2 * t);
    const size = from.size + (target.size - from.size) * ease;
    const startX = from.x * screen.clientWidth / viewport.width;
    const startY = from.y * screen.clientHeight / viewport.height;
    const x = startX + (target.x - startX) * ease;
    // Constant anatomical scale per frame; only the stage moves. A short
    // upward impulse flows into a longer fall, with no mid-flight hold.
    const y = startY + (target.y - startY) * t * t - Math.sin(Math.PI * t) * Math.min(48, screen.clientHeight * .07);
    actor.style.width = actor.style.height = `${snapPixel(size)}px`;
    actor.style.transform = `translate3d(${snapPixel(x)}px, ${snapPixel(y)}px, 0)`;
    if (elapsed < 1460) {
      const frame = elapsed < 100 ? 0 : elapsed < 280 ? 1 : elapsed < 420 ? 2 : elapsed < 740 ? 3 : elapsed < 1060 ? 4 : elapsed < 1230 ? 5 : elapsed < 1360 ? 6 : 7;
      if (elapsed < 100 && from.motion) setFrame(from.motion, from.frame);
      else setFrame(outroMotion.ready ? 'outro' : 'about', outroMotion.ready ? frame : 15);
    }
    pointBubble();
  }
  async function showOutro() {
    const from = snapshotActor() || actorTarget();
    cancelReveal(true);
    const token = generation;
    active = true; busy = true;
    // Fade the old Projects bubble in place before replacing its contents.
    // Otherwise the conclusion briefly flashes at its new position mid-jump.
    const bubbleExit = animatePanel(guide, [{ opacity: 1 }, { opacity: 0 }], 160);
    await bubbleExit.finished.catch(() => {});
    if (token !== generation || !active || !unlocked) return;
    guide.classList.add('is-outro-preparing');
    motions.delete(bubbleExit); bubbleExit.cancel();
    ending = true;
    guide.dataset.step = 'outro';
    guide.querySelector('#desktop-guide-title').textContent = '안내가 끝났어요!';
    guide.querySelector('[data-guide-message]').textContent = '이제 자유롭게 둘러보세요!\n자유롭게 둘러보기를 누르면 원하는 창을 열어볼 수 있어요.\n처음부터 다시 보려면 다시 보기를 눌러주세요.';
    const count = guide.querySelector('[data-guide-count]');
    count.textContent = '완료'; count.setAttribute('aria-label', '포트폴리오 안내 완료');
    previousButton.hidden = true;
    guide.querySelector('[data-guide-skip]').textContent = '다시 보기';
    nextButton.textContent = '자유롭게 둘러보기';
    nextButton.setAttribute('aria-label', '안내를 마치고 자유롭게 둘러보기');
    // Reset the bubble's layout before measuring the new centered scene.
    layoutOutro();
    let timeout;
    const ready = await Promise.race([outroReady, new Promise(resolve => { timeout = setTimeout(() => resolve(false), 350); })]);
    clearTimeout(timeout);
    if (token !== generation || !active || !unlocked) return;
    outroMotion = { from, ready, elapsed: 0, viewport: { width: screen.clientWidth, height: screen.clientHeight } };
    actor.hidden = false; actor.classList.remove('is-mirrored');
    guide.classList.add('has-animated-frog');
    setFrame(from.motion || (ready ? 'outro' : 'about'), from.motion ? from.frame : ready ? 0 : 15);
    const started = performance.now();
    let closing = false;
    const closeWindows = () => {
      closing = true;
      projects.classList.add('is-tour-leaving'); projects.inert = true;
      const exit = animatePanel(projects, [{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(8px) scale(.985)' }], 240);
      exit.finished.then(() => {
        if (token !== generation || !ending) return;
        windows.forEach(panel => { panel.classList.add('is-closed', 'is-tour-background'); panel.classList.remove('is-tour-leaving', 'is-tour-entering'); });
        motions.delete(exit); exit.cancel(); syncAccessibility();
      }).catch(() => {});
    };
    function tick(now) {
      if (token !== generation || !active || !unlocked || !ending) return;
      outroMotion.elapsed = reducedMotion.matches ? 1460 : Math.min(1460, now - started);
      if (!closing && outroMotion.elapsed >= 280) closeWindows();
      paintOutro();
      actor.dataset.phase = outroMotion.elapsed < 280 ? 'anticipation' : outroMotion.elapsed < 1060 ? 'airborne' : 'landing';
      if (outroMotion.elapsed < 1460) { outroRaf = requestAnimationFrame(tick); return; }
      setFrame(ready ? 'outro' : 'about', ready ? 7 : 15);
      actor.dataset.phase = 'rest';
      guide.classList.remove('is-outro-preparing');
      guide.classList.add('is-guide-visible'); guide.inert = false; busy = false;
      layoutOutro(); nextButton.focus({ preventScroll: true });
      idleBlink(token, ready ? 'outro' : 'about', ready ? 7 : 15, ready ? 8 : 16);
    }
    outroRaf = requestAnimationFrame(tick);
  }
  async function enterFreeExplore(focus = false) {
    if (busy || !active || !ending) return;
    busy = true;
    guide.inert = true;
    clearTimeout(idleTimer);
    const token = ++generation;
    splash.dataset.exploreTransition = 'leaving';
    // Keep the current pose and position throughout the fade. Hiding the
    // actor or clearing its canvas first would create a one-frame disappearance.
    const actorTransform = getComputedStyle(actor).transform;
    const exits = [
      animatePanel(guide, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(5px)' }], 300),
      animatePanel(actor, [{ opacity: 1, transform: actorTransform }, { opacity: 0, transform: `${actorTransform} translateY(6px)` }], 340),
    ];
    await Promise.all(exits.map(animation => animation.finished.catch(() => {})));
    if (token !== generation || !active || !unlocked) return;

    // Commit hidden guide state and create filled entrance animations in the
    // same task, so launchers never paint fully visible before their first frame.
    finish(false);
    const revealToken = generation;
    splash.dataset.exploreTransition = 'revealing';
    const entrances = desktopItems.filter(item => !item.hidden).map((item, index) => {
      item.inert = true;
      const animation = item.animate([
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: reducedMotion.matches ? 1 : 400, delay: reducedMotion.matches ? 0 : index * 65,
        easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
      motions.add(animation);
      return animation;
    });
    await Promise.all(entrances.map(animation => animation.finished.catch(() => {})));
    if (revealToken !== generation || !unlocked || active) return;
    desktopItems.forEach(item => { item.inert = false; });
    entrances.forEach(animation => { motions.delete(animation); animation.cancel(); });
    delete splash.dataset.exploreTransition;
    if (focus) finderLauncher.focus({ preventScroll: true });
  }
  function finish(focus = false) {
    cancelReveal();
    active = false;
    guide.hidden = true;
    splash.classList.remove('is-guide-compact', 'is-guide-active');
    screen.style.removeProperty('--desktop-guide-height');
    windows.forEach(panel => panel.classList.remove('is-tour-background', 'is-tour-leaving', 'is-tour-entering'));
    layout();
    syncAccessibility();
    if (focus) finderLauncher.focus({ preventScroll: true });
  }
  function open(panel) {
    const wasClosed = panel.classList.contains('is-closed');
    if (active) finish();
    if (wasClosed) cancelDockMotion(panel);
    panel.classList.remove('is-closed');
    visited.add(windows.indexOf(panel));
    if (!panel.classList.contains('is-expanded')) panel.classList.add('is-tour-positioned');
    layout();
    focusWindow(panel);
    syncAccessibility();
    if (wasClosed) animateDockOpen(panel, dockApps[windows.indexOf(panel)]);
  }
  function resetWindows() {
    visited.clear();
    windowStack.splice(0, windowStack.length, ...windows);
    windows.forEach((panel, index) => {
      cancelDockMotion(panel);
      panel.classList.remove('is-tour-positioned', 'is-tour-leaving', 'is-tour-background', 'is-tour-entering', 'is-expanded');
      panel.querySelectorAll('[aria-pressed]').forEach(button => {
        if (button.matches(windowControlSelector)) button.setAttribute('aria-pressed', 'false');
      });
      panel.classList.toggle('is-closed', index !== 0);
      panel.style.removeProperty('z-index');
    });
  }
  function onStateChange() {
    const next = splash.classList.contains('is-unlocked');
    if (next === unlocked) return;
    unlocked = next;
    if (unlocked) { resetWindows(); showStep(0, true, false); }
    else { finish(); resetWindows(); }
    syncAccessibility();
  }
  guide.querySelector('[data-guide-skip]').addEventListener('click', () => {
    if (busy) return;
    if (ending) { resetWindows(); showStep(0, true); }
    else finish(true);
  });
  previousButton.addEventListener('click', () => { if (!busy && step > 0) showStep(step - 1); });
  nextButton.addEventListener('click', event => {
    if (busy) return;
    if (ending) enterFreeExplore(event.detail === 0);
    else if (step === steps.length - 1) showOutro();
    else showStep(step + 1);
  });
  finderLauncher.addEventListener('click', () => open(about));
  about.querySelector('[data-about-close]').addEventListener('click', () => {
    if (active) return;
    cancelDockMotion(about);
    about.classList.add('is-closed');
    syncAccessibility();
    finderLauncher.focus({ preventScroll: true });
  });
  dock.addEventListener('keydown', event => {
    const buttons = [...dock.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
  });
  skillsLauncher.addEventListener('click', () => {
    open(skills);
    skills.querySelector('[data-skill-filter]').focus({ preventScroll: true });
  });
  skills.querySelector('[data-skills-close]').addEventListener('click', () => {
    if (active) return;
    skills.classList.add('is-closed');
    syncAccessibility();
    skillsLauncher.focus({ preventScroll: true });
  });
  for (const [selector, panel] of [['[data-experience-open]', experience], ['[data-projects-open]', projects]]) {
    screen.querySelector(selector).addEventListener('click', () => open(panel), { capture: true });
  }
  for (const panel of windows) {
    panel.addEventListener('pointerdown', () => {
      if (!active) focusWindow(panel);
    });
    panel.addEventListener('click', event => {
      if (event.target.closest('[data-preview-action="expand"], [data-store-action="expand"]')) {
        if (active) return;
        cancelDockMotion(panel);
        panel.classList.remove('is-tour-positioned');
      }
    }, { capture: true });
    new MutationObserver(() => {
      if (panel.classList.contains('is-closed')) cancelDockMotion(panel);
      syncAccessibility();
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    new ResizeObserver(scheduleLayout).observe(panel);
  }
  new MutationObserver(onStateChange).observe(splash, { attributes: true, attributeFilter: ['class'] });
  screen.addEventListener('click', event => {
    if (active && event.target.closest(windowControlSelector)) {
      event.preventDefault(); event.stopImmediatePropagation();
    }
  }, { capture: true });
  new ResizeObserver(scheduleLayout).observe(guide);
  guide.addEventListener('transitionend', event => {
    if (step === 0 && event.target === guide && event.propertyName === 'transform') pointBubble();
  });
  new ResizeObserver(scheduleLayout).observe(screen);
  window.addEventListener('resize', scheduleLayout);
  window.addEventListener('resize', () => windows.forEach(cancelDockMotion));
  reducedMotion.addEventListener('change', () => windows.forEach(cancelDockMotion));
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && active) finish(true); });
  syncAccessibility();
  onStateChange();
})();
