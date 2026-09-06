(() => {
  const viewer = document.querySelector('[data-experience-window]');
  if (!viewer) return;
  const frame = viewer.querySelector('[data-preview-document]');
  const status = viewer.querySelector('[data-preview-status]');
  const thumbs = [...viewer.querySelectorAll('[data-preview-page]')];
  const info = viewer.querySelector('.preview-info');
  const sidebarButton = viewer.querySelector('[data-preview-action="sidebar"]');
  const infoButton = viewer.querySelector('[data-preview-action="info"]');
  const launcher = document.querySelector('[data-experience-open]');
  function send(action, page) { frame.contentWindow?.postMessage({ type: 'experience-command', action, page }, '*'); }
  function toggleSidebar(hide) {
    viewer.classList.toggle('is-sidebar-hidden', hide);
    sidebarButton.setAttribute('aria-expanded', String(!hide));
  }
  toggleSidebar(window.matchMedia('(max-width: 600px)').matches);
  viewer.addEventListener('click', event => {
    const thumb = event.target.closest('[data-preview-page]');
    if (thumb) send('page', Number(thumb.dataset.previewPage));
    const control = event.target.closest('[data-preview-action]');
    if (!control) return;
    const action = control.dataset.previewAction;
    if (['zoom-in', 'zoom-out', 'fit'].includes(action)) send(action);
    if (action === 'sidebar') toggleSidebar(!viewer.classList.contains('is-sidebar-hidden'));
    if (action === 'close') { viewer.classList.add('is-closed'); launcher.focus(); }
    if (action === 'expand') control.setAttribute('aria-pressed', String(viewer.classList.toggle('is-expanded')));
    if (action === 'info') { info.hidden = !info.hidden; infoButton.setAttribute('aria-expanded', String(!info.hidden)); }
  });
  launcher.addEventListener('click', () => {
    viewer.classList.remove('is-closed');
    viewer.querySelector('[data-preview-action="close"]').focus();
  });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') { info.hidden = true; infoButton.setAttribute('aria-expanded', 'false'); }
  });
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.data?.type !== 'experience-state') return;
    const { page, total, zoom } = event.data;
    if (!Number.isInteger(page) || page < 1 || page > thumbs.length) return;
    status.textContent = `${page}/${total}페이지`;
    thumbs.forEach(thumb => {
      const active = Number(thumb.dataset.previewPage) === page;
      thumb.classList.toggle('is-current', active);
      if (active) thumb.setAttribute('aria-current', 'page');
      else thumb.removeAttribute('aria-current');
    });
    viewer.querySelector('[data-preview-action="zoom-out"]').disabled = zoom <= .75;
    viewer.querySelector('[data-preview-action="zoom-in"]').disabled = zoom >= 2;
  });
  frame.addEventListener('load', () => send('state'));
})();
