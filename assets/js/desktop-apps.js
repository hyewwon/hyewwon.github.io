(() => {
  const panel = document.querySelector('[data-apps-panel]');
  const launcher = document.querySelector('[data-apps-open]');
  const splash = document.querySelector('[data-splash]');
  if (!panel || !launcher || !splash) return;
  const dock = document.querySelector('[data-desktop-dock]');
  const search = panel.querySelector('[data-apps-search]');
  const more = panel.querySelector('[data-apps-more]');
  const options = panel.querySelector('[data-apps-options]');
  function setOptions(show) { options.hidden = !show; more.setAttribute('aria-expanded', String(show)); }
  const items = [...panel.querySelectorAll('[data-apps-item]')];
  const categories = [...panel.querySelectorAll('[data-apps-category]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let category = 'all', motion = null, opened = false;
  const allowed = () => splash.classList.contains('is-unlocked') && !splash.classList.contains('is-guide-active') && !dock.hidden && !dock.inert;
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    items.forEach(item => { item.hidden = !(category === 'all' || item.dataset.category === category) || !item.dataset.search.toLocaleLowerCase().includes(query); });
    const count = items.filter(item => !item.hidden).length;
    panel.querySelector('[data-apps-count]').textContent = `${count}개의 앱`;
    panel.querySelector('[data-apps-empty]').hidden = count !== 0;
    panel.querySelector('[data-apps-heading]').textContent = query ? '검색 결과' : category === 'all' ? '모든 앱' : categories.find(button => button.dataset.appsCategory === category).textContent;
    categories.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.appsCategory === category)));
  }
  function animate(show) {
    motion?.cancel();
    const animation = panel.animate(show ? [
      { opacity: 0, transform: 'translate(-50%, -46%) scale(.94)' },
      { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
    ] : [{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%, -48%) scale(.97)' }],
    { duration: reduced.matches ? 1 : show ? 240 : 160, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    motion = animation;
    animation.finished.then(() => {
      if (motion !== animation) return;
      if (!opened) panel.hidden = true;
      motion = null;
      animation.cancel();
    }).catch(() => {});
  }
  function close(restore = true, immediate = false) {
    if (!opened && panel.hidden) return;
    opened = false;
    setOptions(false);
    panel.inert = true;
    launcher.setAttribute('aria-expanded', 'false');
    if (immediate) { motion?.cancel(); motion = null; panel.hidden = true; }
    else animate(false);
    if (restore && !dock.hidden) launcher.focus({ preventScroll: true });
  }
  function show() {
    if (!allowed()) return;
    opened = true;
    search.value = ''; category = 'all'; filter();
    panel.hidden = false; panel.inert = false;
    launcher.setAttribute('aria-expanded', 'true');
    animate(true); search.focus({ preventScroll: true });
  }
  launcher.addEventListener('click', () => opened ? close() : show());
  more.addEventListener('click', () => setOptions(options.hidden));
  panel.querySelector('[data-apps-close]').addEventListener('click', () => close());
  search.addEventListener('input', filter);
  categories.forEach(button => button.addEventListener('click', () => { category = button.dataset.appsCategory; filter(); }));
  panel.addEventListener('click', event => {
    const item = event.target.closest('[data-apps-item]');
    if (!item || !opened || !allowed()) return;
    // About's existing handler runs on its button. Other apps keep their Dock handlers.
    const name = item.dataset.appsItem;
    if (name !== 'about') dock.querySelector(`[data-${name}-open]`).click();
    close(false);
    const target = name === 'about' ? document.querySelector('.about-window') : document.querySelector(`[data-${name}-window]`);
    target?.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
  });
  panel.addEventListener('keydown', event => {
    const visible = items.filter(item => !item.hidden);
    if (event.target === search && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault();
      if (event.key === 'Enter') visible[0]?.click(); else visible[0]?.focus();
      return;
    }
    const index = visible.indexOf(event.target);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const columns = matchMedia('(max-width: 480px)').matches ? 2 : 4;
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? visible.length - 1 : ((index + delta) % visible.length + visible.length) % visible.length;
    visible[next]?.focus();
  });
  document.addEventListener('pointerdown', event => {
    if (!options.hidden && !event.target.closest('.desktop-apps__options')) setOptions(false);
    if (opened && !panel.contains(event.target) && !launcher.contains(event.target)) close(false);
  });
  document.addEventListener('keydown', event => {
    if (opened && event.key === 'Escape') {
      event.preventDefault();
      if (!options.hidden) { setOptions(false); more.focus(); } else close();
    }
  });
  new MutationObserver(() => { if (!allowed()) close(false, true); }).observe(splash, { attributes: true, attributeFilter: ['class'] });
})();
