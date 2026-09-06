// Print the same HTML document used by the Preview window, preserving Korean text.
// Requires Playwright + Chromium. PLAYWRIGHT_MODULE_PATH may point to a shared runtime.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href : 'playwright');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.pdf': 'application/pdf' };
const server = createServer(async (req, res) => {
  try {
    const path = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await browser.newPage({ viewport: { width: 1100, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto(`${base}/assets/documents/experience.html`);
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await mkdir(resolve(root, 'output/pdf'), { recursive: true });
  await page.pdf({ path: resolve(root, 'output/pdf/kimhyewon-experience.pdf'), preferCSSPageSize: true, printBackground: true, tagged: true });
  await mkdir(resolve(root, 'assets/documents/thumbnails'), { recursive: true });
  execFileSync('pdftoppm', ['-scale-to', '420', '-png', resolve(root, 'output/pdf/kimhyewon-experience.pdf'), resolve(root, 'assets/documents/thumbnails/experience')]);
  console.log('Exported output/pdf/kimhyewon-experience.pdf');
  if (process.argv.includes('--verify')) {
    await mkdir(resolve(root, 'tmp/pdfs'), { recursive: true });
    await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [width, height] of [[1440, 900], [1280, 720], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${base}/splash.html`);
      const viewer = page.locator('[data-experience-window]');
      await viewer.waitFor({ state: 'visible' });
      await page.locator('.splash.is-unlocked').waitFor();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-experience-window]')).opacity === '1');
      await page.screenshot({ path: resolve(root, `tmp/pdfs/desktop-${width}.png`) });
      const bounds = await viewer.boundingBox();
      if (bounds.x < 0 || bounds.y < 30 || bounds.x + bounds.width > width + 1 || bounds.y + bounds.height > height + 1) throw Error(`Window overflow at ${width}: ${JSON.stringify(bounds)}`);
      const documentBounds = await page.locator('[data-preview-document]').boundingBox();
      if (documentBounds.width < 200) throw Error(`Document collapsed at ${width}`);
      if (width >= 600) {
        await page.getByRole('button', { name: '3페이지: GNC Solution', exact: true }).click();
        await page.locator('[data-preview-status]').filter({ hasText: '3/3페이지' }).waitFor();
        await page.getByRole('button', { name: '문서 확대', exact: true }).click();
        await page.getByRole('button', { name: '문서를 창 너비에 맞추기', exact: true }).click();
      }
      await page.getByRole('button', { name: '경력 창 닫기', exact: true }).click();
      await page.getByRole('button', { name: '경력기술서 미리보기 열기', exact: true }).click();
      await viewer.waitFor({ state: 'visible' });
      const images = await page.locator('.preview-thumbnail img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0));
      if (!images) throw Error('Missing PDF thumbnails');
      console.log(`Verified ${width}×${height}: bounds, navigation, reopen, thumbnails`);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`${base}/splash.html`);
    await page.locator('.splash.is-unlocked').waitFor({ timeout: 25000 });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-experience-window]')).opacity === '1');
    const response = await page.request.get(`${base}/output/pdf/kimhyewon-experience.pdf`);
    if (!response.ok() || !(await response.body()).subarray(0, 4).equals(Buffer.from('%PDF'))) throw Error('PDF download is invalid');
    console.log('Verified normal splash sequence and PDF download');
    if (errors.length) throw Error(errors.join('\n'));
  }
} finally {
  await browser?.close();
  server.close();
}
