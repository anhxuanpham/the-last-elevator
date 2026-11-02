const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');
const { serveGame } = require('../tests/static-game-server.cjs');
(async () => {
  const root = path.resolve(__dirname, '../dist');
  const output = path.join(root, 'assets/store');
  await fs.mkdir(output, { recursive: true });
  const server = await serveGame(root, 8082);
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:8082/');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(output, 'cover.png') });
    await page.locator('#overlay-card .main-cta').click();
    await page.locator('#overlay-card .main-cta').click();
    await page.screenshot({ path: path.join(output, 'gameplay.png') });
    await page.locator('[data-inspect="registry"]').click();
    await page.screenshot({ path: path.join(output, 'inspection.png') });
    // Render the game's existing vector/text brand at the required store size.
    await page.addStyleTag({ content: '.brand-mark{flex:none;width:512px;height:512px;font-size:320px;border-width:12px;background:#080d12}.brand-mark span{font-size:105px;bottom:10px;right:20px}' });
    await page.locator('.brand-mark').screenshot({ path: path.join(output, 'icon.png') });
    console.log('Captured cover, gameplay, inspection and 512px brand icon from the game.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
