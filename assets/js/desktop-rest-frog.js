(() => {
  const button = document.querySelector('[data-guide-restart]');
  if (!button) return;
  const canvas = button.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const frames = Array.from({ length: 6 }, (_, index) => {
    const image = new Image();
    image.src = `assets/image/character/pages/desktop/restart-guide/frames-v2/frame-${String(index + 1).padStart(2, '0')}.png`;
    return image;
  });
  let ready = false, timer, hovered = false, focused = false, current = -1;
  const visible = () => ready && !button.hidden && !document.hidden;
  function paint(index) {
    if (!ready || index === current) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frames[index], 0, 0, canvas.width, canvas.height);
    current = index;
    button.dataset.pose = String(index);
  }
  function stop() { clearTimeout(timer); }
  function sequence(poses, delay, complete) {
    stop();
    let index = 0;
    function next() {
      if (!visible()) return;
      paint(poses[index++]);
      timer = setTimeout(index < poses.length ? next : complete, delay);
    }
    next();
  }
  function idle() {
    stop();
    paint(0);
    if (!visible() || reduced.matches) return;
    timer = setTimeout(() => sequence([1, 2, 1, 0], 90, idle), 2600 + Math.random() * 1800);
  }
  function greet() {
    stop();
    if (!visible()) return;
    if (reduced.matches) { paint(4); return; }
    sequence([3, 4, 5, 4, 5, 4], 160, () => {
      // Hold a friendly pose instead of waving continuously at the reader.
      if (!hovered && !focused) idle();
    });
  }
  function updateInteraction() {
    if (hovered || focused) greet();
    else if (visible() && !reduced.matches && current >= 3) sequence([4, 3, 0], 130, idle);
    else idle();
  }
  button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; updateInteraction(); } });
  button.addEventListener('pointerleave', () => { hovered = false; updateInteraction(); });
  button.addEventListener('focus', () => { focused = true; updateInteraction(); });
  button.addEventListener('blur', () => { focused = false; updateInteraction(); });
  function updateVisibility() {
    stop();
    if (button.hidden || document.hidden) { hovered = focused = false; paint(0); return; }
    updateInteraction();
  }
  new MutationObserver(updateVisibility).observe(button, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', updateVisibility);
  reduced.addEventListener('change', updateInteraction);
  Promise.all(frames.map(image => image.decode())).then(() => {
    ready = true;
    updateVisibility();
  }).catch(() => {
    // Keep the restart control usable even if a sprite cannot be decoded.
    const fallback = new Image();
    fallback.src = 'assets/image/character/pages/desktop/guide-polish-v1/about/frame-15.png';
    fallback.onload = () => context.drawImage(fallback, 0, 0, canvas.width, canvas.height);
  });
})();
