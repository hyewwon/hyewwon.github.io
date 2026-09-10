import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const { chromium } = createRequire(import.meta.url)(process.argv[2] || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await Promise.all(['early', 'loading', 'jump', 'zoom', 'handoff', 'reduced', 'normal'].map(async phase => {
    const page = await browser.newPage({ viewport: { width: phase === 'loading' ? 390 : 1440, height: 900 }, reducedMotion: phase === 'reduced' ? 'reduce' : 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => { if (request.url().startsWith('file:')) errors.push(`Missing local resource: ${request.url()}`); });
    await page.goto(new URL('../splash.html', import.meta.url).href, { waitUntil: 'domcontentloaded' });
    if (phase === 'loading') await page.waitForFunction(() => +document.querySelector('[data-progress-track]').getAttribute('aria-valuenow') >= 11);
    if (phase === 'jump') await page.waitForFunction(() => +document.querySelector('[data-progress-track]').getAttribute('aria-valuenow') > 50);
    if (phase === 'zoom' || phase === 'handoff') await page.waitForFunction(name => document.querySelector('[data-splash]').classList.contains(name), phase === 'zoom' ? 'is-zooming' : 'is-handoff');
    if (phase !== 'normal') {
      if (phase === 'early' || phase === 'reduced') {
        // Exercise the pre-start timer race and repeated activation.
        await page.locator('[data-splash-skip]').evaluate(button => { button.click(); button.click(); });
      } else {
        await page.locator('[data-splash-skip]').click();
      }
    }
    await page.waitForFunction(() => document.querySelector('[data-splash]').classList.contains('is-unlocked'));
    await page.locator('.desktop-guide.is-guide-visible').waitFor();
    await page.waitForTimeout(1200);
    const state = await page.evaluate(() => {
      const root = document.querySelector('[data-splash]'), screen = root.querySelector('[data-screen]');
      const rect = screen.getBoundingClientRect();
      return { unlocked: root.classList.contains('is-unlocked'), running: root.classList.contains('is-running'), full: Math.abs(rect.width - innerWidth) < 1 && Math.abs(rect.height - innerHeight) < 1, step: document.querySelector('[data-desktop-guide]').dataset.step, progress: document.querySelector('[data-progress-track]').getAttribute('aria-valuenow') };
    });
    assert.deepEqual(state, { unlocked: true, running: false, full: true, step: '0', progress: '100' });
    assert.deepEqual(errors, []);
    console.log('PASS', phase);
    await page.close();
  }));
} finally { await browser.close(); }
