(() => {
  const splash = document.querySelector('[data-splash]');
  const trigger = document.querySelector('[data-wifi-trigger]');
  const panel = document.querySelector('[data-wifi-popover]');
  if (!splash || !trigger || !panel) return;
  const toggle = panel.querySelector('[data-wifi-toggle]');
  const otherToggle = panel.querySelector('[data-wifi-other-toggle]');
  const other = panel.querySelector('[data-wifi-other]');
  const networks = panel.querySelector('[data-wifi-networks]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const names = ['Hyewon Wi-Fi', 'Portfolio Guest', 'Frog Studio'];
  let enabled = true, selected = names[0], animation;
  // Deliberately local demo data: no network scan, credentials, or OS settings access.
  names.forEach((name, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'wifi-popover__network';
    button.dataset.wifiNetwork = name;
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a14 14 0 0 1 18 0M6 12a9 9 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle cx="12" cy="19" r=".6"/></svg><span></span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10" width="12" height="10" rx="2"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg>';
    button.querySelector('span').textContent = name;
    button.addEventListener('click', () => {
      if (!enabled) return;
      selected = selected === name ? null : name;
      render();
    });
    (index === 0 ? panel.querySelector('[data-wifi-known]') : panel.querySelector('[data-wifi-other-list]')).append(button);
  });
  function setExpanded(element, expanded) {
    element.classList.toggle('is-expanded', expanded);
    element.inert = !expanded;
    element.setAttribute('aria-hidden', String(!expanded));
  }
  function render() {
    toggle.setAttribute('aria-checked', String(enabled));
    trigger.classList.toggle('is-off', !enabled);
    setExpanded(networks, enabled);
    panel.querySelector('[data-wifi-status]').textContent = !enabled ? 'Wi-Fi 꺼짐' : selected ? `${selected}에 연결됨` : '연결된 네트워크 없음';
    panel.querySelectorAll('[data-wifi-network]').forEach(button => button.setAttribute('aria-pressed', String(enabled && button.dataset.wifiNetwork === selected)));
  }
  function close(focus = false) {
    animation?.cancel();
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    setExpanded(other, false); otherToggle.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus({ preventScroll: true });
  }
  function show() {
    if (!splash.classList.contains('is-unlocked')) return;
    document.dispatchEvent(new CustomEvent('desktop-popover-open', { detail: 'wifi' }));
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    animation = panel.animate([{ opacity: 0, transform: 'translateY(-4px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: reducedMotion.matches ? 1 : 160, easing: 'cubic-bezier(.22,1,.36,1)' });
    toggle.focus({ preventScroll: true });
  }
  trigger.addEventListener('click', () => panel.hidden ? show() : close(true));
  toggle.addEventListener('click', () => { enabled = !enabled; render(); });
  otherToggle.addEventListener('click', () => {
    const expanded = otherToggle.getAttribute('aria-expanded') !== 'true';
    otherToggle.setAttribute('aria-expanded', String(expanded));
    setExpanded(other, expanded);
  });
  document.addEventListener('pointerdown', event => { if (!panel.hidden && !panel.contains(event.target) && !trigger.contains(event.target)) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(true); } });
  document.addEventListener('desktop-popover-open', event => { if (event.detail !== 'wifi') close(); });
  new MutationObserver(() => { if (!splash.classList.contains('is-unlocked')) close(); }).observe(splash, { attributes: true, attributeFilter: ['class'] });
  render();
})();
