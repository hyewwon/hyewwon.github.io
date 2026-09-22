(() => {
  const trigger = document.querySelector('[data-controls-trigger]');
  const panel = document.querySelector('[data-controls-panel]');
  const splash = document.querySelector('[data-splash]');
  if (!trigger || !panel || !splash) return;
  const wifi = panel.querySelector('[data-control-wifi]');
  const bluetooth = panel.querySelector('[data-control-bluetooth]');
  const brightness = panel.querySelector('[data-control-brightness]');
  const sound = panel.querySelector('[data-control-sound]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let motion;
  const allowed = () => splash.classList.contains('is-unlocked') && !splash.classList.contains('is-guide-active');
  function close(focus = false) {
    motion?.cancel(); panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus({ preventScroll: true });
  }
  function state(button, enabled) {
    button.setAttribute('aria-checked', String(enabled));
    button.querySelector('[data-control-state]').textContent = enabled ? '켬' : '끔';
  }
  trigger.addEventListener('click', () => {
    if (!panel.hidden) return close(true);
    if (!allowed()) return;
    document.dispatchEvent(new CustomEvent('desktop-popover-open', { detail: 'controls' }));
    state(wifi, document.querySelector('[data-wifi-toggle]')?.getAttribute('aria-checked') === 'true');
    panel.hidden = false; trigger.setAttribute('aria-expanded', 'true');
    motion = panel.animate([{ opacity: 0, transform: 'translateY(-5px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: reduced.matches ? 1 : 180, easing: 'ease-out' });
    wifi.focus({ preventScroll: true });
  });
  wifi.addEventListener('click', () => document.dispatchEvent(new CustomEvent('desktop-wifi-set', { detail: wifi.getAttribute('aria-checked') !== 'true' })));
  document.addEventListener('desktop-wifi-state', event => state(wifi, event.detail));
  bluetooth.addEventListener('click', () => state(bluetooth, bluetooth.getAttribute('aria-checked') !== 'true'));
  function updateRange(input) {
    const value = Number(input.value);
    input.style.setProperty('--value', `${(value - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`);
    input.setAttribute('aria-valuetext', `${value}%`);
  }
  brightness.addEventListener('input', () => {
    updateRange(brightness);
    splash.style.setProperty('--desktop-dim', String((100 - Number(brightness.value)) / 100 * .65));
  });
  sound.addEventListener('input', () => {
    updateRange(sound);
    // UI-only feedback; never changes system volume or plays audio.
    document.dispatchEvent(new CustomEvent('desktop-sound-change', { detail: Number(sound.value) }));
  });
  [brightness, sound].forEach(updateRange);
  document.addEventListener('pointerdown', event => { if (!panel.hidden && !panel.contains(event.target) && !trigger.contains(event.target)) close(); });
  document.addEventListener('keydown', event => { if (!panel.hidden && event.key === 'Escape') { event.preventDefault(); close(true); } });
  document.addEventListener('desktop-popover-open', event => { if (event.detail !== 'controls') close(); });
  function sync() { trigger.disabled = !allowed(); if (trigger.disabled) close(); }
  new MutationObserver(sync).observe(splash, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
