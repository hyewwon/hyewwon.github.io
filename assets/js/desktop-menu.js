(() => {
  const splash = document.querySelector('[data-splash]');
  const trigger = document.querySelector('[data-system-menu-trigger]');
  const menu = document.querySelector('[data-system-menu]');
  if (!splash || !trigger || !menu) return;
  const recentToggle = menu.querySelector('[data-system-recent-toggle]');
  const recentMenu = menu.querySelector('[data-system-recent]');
  // Sibling surfaces sample the same wallpaper, without nested backdrop-filter compositing.
  menu.after(recentMenu);
  const labels = ['Hyewon에 관하여', '사진 · Skills', '미리보기 · Experience', 'App Store · Projects'];
  const icons = ['about-this-mac.png', 'photos.png', 'preview.png', 'app-store.png'];
  const panels = ['.about-window', '[data-skills-window]', '[data-experience-window]', '[data-projects-window]'].map(selector => document.querySelector(selector));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let recent = [], motion, recentCloseTimer;
  try {
    const stored = JSON.parse(sessionStorage.getItem('hyewwon-recent-apps') || '[]');
    if (Array.isArray(stored)) recent = [...new Set(stored.filter(index => Number.isInteger(index) && labels[index]))].slice(0, 4);
  } catch { /* Storage may be unavailable for local files/private browsing. */ }
  const allowed = () => splash.classList.contains('is-unlocked') && !splash.classList.contains('is-guide-active');
  function renderRecent() {
    recentMenu.replaceChildren();
    if (!recent.length) {
      const empty = document.createElement('span');
      empty.className = 'desktop-system-menu__empty';
      empty.textContent = '최근 사용한 앱이 없어요.';
      recentMenu.append(empty);
    }
    recent.forEach(index => {
      const button = document.createElement('button');
      button.type = 'button'; button.role = 'menuitem';
      button.dataset.recentApp = index;
      const icon = document.createElement('img');
      icon.src = `assets/image/desktop/dock/${icons[index]}`;
      icon.alt = ''; icon.width = 20; icon.height = 20; icon.draggable = false;
      const label = document.createElement('span');
      label.textContent = labels[index];
      button.append(icon, label);
      recentMenu.append(button);
    });
  }
  document.addEventListener('desktop-app-used', event => {
    const index = event.detail.index;
    if (!allowed() || !labels[index]) return;
    recent = [index, ...recent.filter(item => item !== index)].slice(0, 4);
    try { sessionStorage.setItem('hyewwon-recent-apps', JSON.stringify(recent)); } catch { /* In-memory history still works. */ }
    renderRecent();
  });
  function close(restoreFocus = false) {
    motion?.cancel();
    menu.hidden = true;
    closeRecent();
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }
  function show() {
    if (!allowed()) return;
    document.dispatchEvent(new CustomEvent('desktop-popover-open', { detail: 'system' }));
    document.querySelector('[data-apps-close]')?.click();
    renderRecent();
    menu.querySelector('[data-system-action="close"]').disabled = !panels.some(panel => !panel.classList.contains('is-closed'));
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    motion = menu.animate([{ opacity: 0, transform: 'translateY(-4px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: reducedMotion.matches ? 1 : 160, easing: 'cubic-bezier(.22,1,.36,1)' });
    menu.querySelector('[role="menuitem"]').focus({ preventScroll: true });
  }
  function showRecent(focus = false) {
    clearTimeout(recentCloseTimer);
    recentMenu.hidden = false;
    recentToggle.setAttribute('aria-expanded', 'true');
    positionRecent();
    if (focus) recentMenu.querySelector('button')?.focus();
  }
  function positionRecent() {
    if (recentMenu.hidden) return;
    const host = menu.parentElement;
    const hostRect = host.getBoundingClientRect();
    const scale = hostRect.width / host.clientWidth || 1;
    const anchor = recentToggle.getBoundingClientRect();
    const main = menu.getBoundingClientRect();
    const right = (main.right - hostRect.left) / scale + 4;
    const fits = right + recentMenu.offsetWidth <= host.clientWidth - 8;
    recentMenu.style.left = `${fits ? right : Math.max(8, host.clientWidth - recentMenu.offsetWidth - 8)}px`;
    recentMenu.style.top = `${Math.max(8, Math.min((fits ? anchor.top - hostRect.top : anchor.bottom - hostRect.top) / scale - (fits ? 6 : -4), host.clientHeight - recentMenu.offsetHeight - 8))}px`;
  }
  function closeRecent() {
    clearTimeout(recentCloseTimer);
    if (recentMenu.contains(document.activeElement)) recentToggle.focus({ preventScroll: true });
    recentMenu.hidden = true;
    recentToggle.setAttribute('aria-expanded', 'false');
  }
  function scheduleRecentClose() {
    clearTimeout(recentCloseTimer);
    // Leave a short corridor to cross the gap into the submenu without flickering.
    recentCloseTimer = setTimeout(closeRecent, 180);
  }
  trigger.addEventListener('click', () => menu.hidden ? show() : close(true));
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); show(); }
  });
  recentToggle.addEventListener('pointerenter', () => showRecent());
  recentToggle.addEventListener('pointerleave', scheduleRecentClose);
  recentMenu.addEventListener('pointerenter', () => clearTimeout(recentCloseTimer));
  recentMenu.addEventListener('pointerleave', scheduleRecentClose);
  menu.querySelectorAll('[data-system-action]').forEach(button => button.addEventListener('pointerenter', closeRecent));
  recentToggle.addEventListener('click', () => showRecent(true));
  function onMenuClick(event) {
    const button = event.target.closest('[data-system-action], [data-recent-app]');
    if (!button || button.disabled || !allowed()) return;
    const action = button.dataset.systemAction;
    close(true);
    if (action === 'lock') document.dispatchEvent(new Event('desktop-lock'));
    else if (action === 'restart') location.reload();
    else document.dispatchEvent(new CustomEvent('desktop-menu-action', { detail: {
      action: action === 'close' ? 'close' : 'open',
      index: action === 'about' ? 0 : action === 'projects' ? 3 : Number(button.dataset.recentApp)
    } }));
  }
  function onMenuKeydown(event) {
    const inRecent = recentMenu.contains(event.target);
    if (event.key === 'ArrowRight' && event.target === recentToggle) { event.preventDefault(); showRecent(true); return; }
    if ((event.key === 'ArrowLeft' || event.key === 'Escape') && !recentMenu.hidden) {
      event.preventDefault(); event.stopPropagation(); closeRecent(); recentToggle.focus(); return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const items = [...(inRecent ? recentMenu : menu).querySelectorAll('[role="menuitem"]')].filter(item => !item.disabled && (inRecent || !recentMenu.contains(item)));
    const index = items.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  }
  [menu, recentMenu].forEach(surface => {
    surface.addEventListener('click', onMenuClick);
    surface.addEventListener('keydown', onMenuKeydown);
  });
  window.addEventListener('resize', positionRecent);
  document.addEventListener('pointerdown', event => {
    if (!menu.hidden && !menu.contains(event.target) && !recentMenu.contains(event.target) && !trigger.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); close(true); } });
  function sync() { trigger.disabled = !allowed(); if (trigger.disabled) close(); }
  document.addEventListener('desktop-popover-open', event => { if (event.detail !== 'system') close(); });
  new MutationObserver(sync).observe(splash, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
