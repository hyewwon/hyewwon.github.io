(() => {
  const splash = document.querySelector('[data-splash]');
  const trigger = document.querySelector('[data-notifications-trigger]');
  const panel = document.querySelector('[data-notifications-panel]');
  if (!splash || !trigger || !panel) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let closeTimer;
  const allowed = () => splash.classList.contains('is-unlocked') && !splash.classList.contains('is-guide-active');
  const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';
  function close(restoreFocus = false, immediate = false) {
    clearTimeout(closeTimer);
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    if (restoreFocus || panel.contains(document.activeElement)) trigger.focus({ preventScroll: true });
    panel.inert = true;
    if (immediate || reducedMotion.matches) panel.hidden = true;
    else closeTimer = setTimeout(() => { panel.hidden = true; }, 280);
  }
  function show() {
    if (!allowed()) return;
    clearTimeout(closeTimer);
    document.dispatchEvent(new CustomEvent('desktop-popover-open', { detail: 'notifications' }));
    panel.hidden = false;
    panel.inert = false;
    // Establish the closed frame before transitioning from display:none.
    void panel.offsetWidth;
    panel.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    panel.querySelector('[data-notifications-close]').focus({ preventScroll: true });
  }
  trigger.addEventListener('click', () => isOpen() ? close(true) : show());
  panel.querySelector('[data-notifications-close]').addEventListener('click', () => close(true));
  panel.addEventListener('click', event => {
    const app = event.target.closest('[data-notification-app]');
    if (app && allowed()) {
      close(false, true);
      document.dispatchEvent(new CustomEvent('desktop-menu-action', { detail: { action: 'open', index: Number(app.dataset.notificationApp) } }));
    } else if (event.target.closest('a')) close(true);
  });
  document.addEventListener('pointerdown', event => {
    if (isOpen() && !panel.contains(event.target) && !trigger.contains(event.target)) close();
  });
  document.addEventListener('focusin', event => {
    if (isOpen() && !panel.contains(event.target) && !trigger.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen()) { event.preventDefault(); close(true); }
  });
  document.addEventListener('desktop-popover-open', event => { if (event.detail !== 'notifications') close(false, true); });
  function sync() { trigger.disabled = !allowed(); if (trigger.disabled) close(false, true); }
  new MutationObserver(sync).observe(splash, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
