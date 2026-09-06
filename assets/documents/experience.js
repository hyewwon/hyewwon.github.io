(() => {
  const wraps = [...document.querySelectorAll('.sheet-wrap')];
  let zoom = 1;
  let currentPage = 1;
  let scrollFrame;
  const notify = () => {
    if (parent !== window) parent.postMessage({ type: 'experience-state', page: currentPage, total: wraps.length, zoom }, '*');
  };
  function layout() {
    const scale = Math.min(1.2, Math.max(0.1, (document.documentElement.clientWidth - 44) / 794)) * zoom;
    wraps.forEach(wrap => {
      wrap.style.width = `${794 * scale}px`;
      wrap.style.height = `${1123 * scale}px`;
      wrap.firstElementChild.style.transform = `scale(${scale})`;
    });
  }
  function goTo(page) {
    const target = wraps[page - 1];
    if (!target) return;
    currentPage = page;
    window.scrollTo({ top: target.offsetTop - 22, left: 0, behavior: 'instant' });
    notify();
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || event.data?.type !== 'experience-command') return;
    const { action, page } = event.data;
    if (action === 'page') goTo(Number(page));
    if (['zoom-in', 'zoom-out', 'fit'].includes(action)) {
      zoom = action === 'fit' ? 1 : Math.max(0.75, Math.min(2, zoom + (action === 'zoom-in' ? 0.25 : -0.25)));
      layout();
      goTo(currentPage);
    }
    if (action === 'state') notify();
  });
  window.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      const anchor = window.innerHeight * 0.3;
      const nearest = wraps.reduce((best, wrap, i) => wrap.getBoundingClientRect().top <= anchor ? i + 1 : best, 1);
      if (nearest !== currentPage) { currentPage = nearest; notify(); }
    });
  }, { passive: true });
  window.addEventListener('resize', layout);
  layout();
  notify();
})();
