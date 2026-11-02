const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const { serveGame } = require('./static-game-server.cjs');
const gameRoot = path.resolve(__dirname, '../dist');
const sdkRoot = path.join(path.dirname(require.resolve('@p2game.io/sdk/package.json')), 'dist');
const gameUrl = 'http://127.0.0.1:8080/';
const hostUrl = 'http://127.0.0.1:8081/';
const SAVE = 'tle_floor13_save_v1';
const BEST = 'tle_floor13_best_v1';
const safe = [true, true, true, false, true, true, false, false, false, false, true, true];
const evidence = [null, null, 'log', 'log', 'log', 'registry', 'camera', 'log', 'log', 'camera', 'log', 'camera'];
let gameServer, hostServer, browser;

before(async () => {
  gameServer = await serveGame(gameRoot, 8080, {
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; frame-ancestors http://127.0.0.1:8081"
  });
  hostServer = http.createServer(async (req, res) => {
    if (req.url.startsWith('/__sdk/')) {
      const file = path.resolve(sdkRoot, req.url.slice('/__sdk/'.length));
      if (!file.startsWith(sdkRoot + path.sep)) return res.writeHead(404).end();
      try { const data = await fs.readFile(file); res.writeHead(200, { 'Content-Type': 'text/javascript', 'Content-Length': data.length }).end(data); }
      catch { res.writeHead(404).end(); }
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(`<!doctype html><html><body>
      <iframe id="game" title="The Last Elevator" sandbox="allow-scripts allow-same-origin" allow="autoplay" style="width:1440px;height:1000px;border:0"></iframe>
      <script type="module">
      import { HostBridge } from '/__sdk/host.js';
      const mode = new URL(location.href).searchParams.get('mode');
      window.events = [];
      window.bridge = new HostBridge({
        iframe: document.querySelector('#game'), gameOrigin: '${new URL(gameUrl).origin}',
        context: { protocolVersion: '1.0', gameId: 'the-last-elevator', sessionId: 'local-contract-test',
          player: { id: 'contract-player', displayName: 'Contract test', avatarUrl: null, anonymous: false },
          locale: 'vi', permissions: ['audio', 'persistent-storage'],
          leaderboards: [{ id: 'high-score', name: 'Điểm ca trực', order: 'DESC' }] },
        call: async (type, payload) => {
          window.events.push({ type, payload });
          if (type !== 'leaderboard.submit') throw new Error('Unexpected API call: ' + type);
          if (mode === 'unauthenticated') throw { code: 'UNAUTHENTICATED', message: 'Login required' };
          if (mode === 'rejected') throw { code: 'SCORE_REJECTED', message: 'Score rejected' };
          if (mode === 'delayed') await new Promise(resolve => { window.resolveScore = resolve; });
          return { accepted: true, rank: 1, personalBest: payload.score, improved: true };
        },
        onReady: () => window.events.push({ type: 'ready' }),
        onGameOver: payload => window.events.push({ type: 'game.over', payload })
      });
      document.querySelector('#game').src = '${gameUrl}';
      </script></body></html>`);
  });
  await new Promise((resolve, reject) => { hostServer.once('error', reject); hostServer.listen(8081, '127.0.0.1', resolve); });
  browser = await (process.env.BROWSER === 'webkit' ? webkit : chromium).launch({ headless: true });
});
after(async () => {
  if (browser) await browser.close();
  for (const server of [hostServer, gameServer]) if (server?.listening) await new Promise(resolve => server.close(resolve));
});

async function withHost(mode, run) {
  const context = await browser.newContext({ viewport: { width: 1480, height: 1040 }, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage(), errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.goto(hostUrl + '?mode=' + mode);
    await page.waitForFunction(() => window.events?.some(event => event.type === 'ready'));
    const frame = page.frames().find(frame => frame.url() === gameUrl);
    assert.ok(frame, 'The real game is loaded in a separate-origin sandbox iframe');
    await run(page, frame, requests);
    assert.deepEqual(errors, [], 'No uncaught host or game errors');
  } finally { await context.close(); }
}
async function advance(frame) {
  for (let n = 0; n < 5 && await frame.locator('#overlay').evaluate(el => el.classList.contains('visible')); n++) await frame.locator('#overlay-card .main-cta').click();
}
async function start(frame) { await frame.locator('#overlay-card .main-cta').click(); await advance(frame); }
async function finish(frame, collect = false) {
  for (let i = 0; i < 12; i++) {
    if (collect && evidence[i]) await frame.locator('[data-inspect="' + evidence[i] + '"]').click();
    await frame.locator(safe[i] ? '#admit-btn' : '#deny-btn').click();
    if (i < 11) await advance(frame);
  }
  await frame.locator('#overlay-card .main-cta').click();
  await frame.getByRole('button', { name: collect ? 'MỞ CỬA TẦNG 13' : 'KHÓA TẦNG 13', exact: true }).click();
}

test('p2game: official SDK handshakes, announces ready and loads all game assets under self-only CSP', () => withHost('', async (page, frame, requests) => {
  assert.equal(await frame.evaluate(() => window.p2.isStandalone), false);
  assert.equal(await frame.evaluate(() => window.p2.context.gameId), 'the-last-elevator');
  assert.equal((await page.evaluate(() => window.events)).filter(event => event.type === 'ready').length, 1);
  await start(frame);
  await frame.evaluate(() => document.fonts.ready);
  assert.ok(requests.every(url => new URL(url).hostname === '127.0.0.1'), 'No fonts, SDK or analytics leave the declared game origins');
  assert.equal(await frame.locator('#overlay-card a').count(), 0);
}));

test('p2game: Truth submits the real bounded score before gameOver and emits each once', () => withHost('', async (page, frame) => {
  await start(frame); await finish(frame, true);
  await page.waitForFunction(() => window.events.some(event => event.type === 'game.over'));
  const events = await page.evaluate(() => window.events);
  assert.deepEqual(events.map(event => event.type), ['ready', 'leaderboard.submit', 'game.over']);
  assert.deepEqual(events[1].payload, { leaderboardId: 'high-score', score: 1450, meta: { ending: 'truth', correct: 12, evidence: 10, breach: 0 } });
  assert.deepEqual(events[2].payload, { score: 1450, level: 3 });
  assert.equal(await frame.locator('#overlay-card h2').innerText(), 'THE TRUTH');
  await frame.evaluate(() => window.ElevatorPlatform.finish({ score: 1450, ending: 'truth', correct: 12, evidence: 10, breach: 0 }));
  await page.waitForTimeout(100);
  assert.equal((await page.evaluate(() => window.events)).length, 3);
  assert.match(await frame.locator('#toast').innerText(), /Đã gửi điểm/);
}));

for (const mode of ['unauthenticated', 'rejected']) {
  test(`p2game: ${mode} score preserves the ending, local record and gameOver`, () => withHost(mode, async (page, frame) => {
    await start(frame); await finish(frame);
    await page.waitForFunction(() => window.events.some(event => event.type === 'game.over'));
    assert.equal(await frame.locator('#overlay-card h2').innerText(), 'THE KEEPER');
    assert.deepEqual(await frame.evaluate(key => JSON.parse(localStorage.getItem(key)), BEST), { score: 1200, endings: ['keeper'] });
    assert.match(await frame.locator('#toast').innerText(), mode === 'unauthenticated' ? /Đăng nhập trên P2Game/ : /Chưa gửi được điểm/);
    assert.doesNotMatch(await frame.locator('#toast').innerText(), /Đã gửi điểm/);
    assert.deepEqual((await page.evaluate(() => window.events)).map(event => event.type), ['ready', 'leaderboard.submit', 'game.over']);
  }));
}

test('p2game: host pause prevents hidden decisions and audio restart, resume restores the shift and mute preference', () => withHost('', async (page, frame) => {
  await start(frame); await frame.locator('[data-inspect="registry"]').click();
  await frame.waitForFunction(() => document.querySelector('#background-music').currentTime > 0.1);
  const saved = await frame.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE);
  await page.evaluate(() => window.bridge.emit('lifecycle.pause'));
  await frame.waitForFunction(() => document.querySelector('#game-shell').inert);
  assert.equal(await frame.locator('#background-music').evaluate(el => el.paused), true);
  await frame.locator('#admit-btn').dispatchEvent('click');
  await frame.locator('[data-inspect="camera"]').dispatchEvent('click');
  await frame.locator('body').dispatchEvent('pointerdown');
  assert.deepEqual(await frame.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE), saved);
  assert.equal(await frame.locator('#background-music').evaluate(el => el.paused), true);
  await page.evaluate(() => window.bridge.emit('lifecycle.beforeUnload'));
  assert.deepEqual(await frame.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE), saved);
  await page.evaluate(() => window.bridge.emit('lifecycle.resume'));
  await frame.waitForFunction(() => !document.querySelector('#game-shell').inert);
  await frame.waitForFunction(() => !document.querySelector('#background-music').paused);
  await frame.locator('#sound-toggle').click();
  await page.evaluate(() => { window.bridge.emit('lifecycle.pause'); window.bridge.emit('lifecycle.resume'); });
  await page.waitForTimeout(150);
  assert.equal(await frame.locator('#background-music').evaluate(el => el.paused), true, 'Host resume respects the user mute');
  assert.equal(await frame.locator('#scans-left').innerText(), '01 / 02');
}));

test('p2game: a delayed score response cannot toast into a new replay', () => withHost('delayed', async (page, frame) => {
  await start(frame); await finish(frame);
  await page.waitForFunction(() => typeof window.resolveScore === 'function');
  await frame.getByRole('button', { name: 'CHƠI LẠI →', exact: true }).click();
  await page.evaluate(() => window.resolveScore());
  await page.waitForFunction(() => window.events.some(event => event.type === 'game.over'));
  assert.doesNotMatch(await frame.locator('#toast').innerText(), /Đã gửi điểm|Chưa gửi được điểm/);
  assert.equal(await frame.locator('#overlay-card h2').innerText(), 'CA TRỰC THỨ NHẤT');
}));

test('p2game: the vendored bundle is the unmodified official SDK and standalone remains local', async () => {
  const upstream = path.resolve(sdkRoot, '../umd/p2game-sdk.v1.js');
  assert.deepEqual(await fs.readFile(path.join(gameRoot, 'assets/sdk/p2game-sdk.v1.js')), await fs.readFile(upstream));
  const context = await browser.newContext();
  try {
    const page = await context.newPage(); await page.goto(gameUrl);
    await page.waitForFunction(() => window.p2?.context);
    assert.equal(await page.evaluate(() => window.p2.isStandalone), true);
    await start(page); await finish(page);
    assert.equal(await page.locator('#overlay-card h2').innerText(), 'THE KEEPER');
    assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).score, BEST), 1200);
  } finally { await context.close(); }
});

test('p2game: missing SDK asset leaves standalone gameplay usable without uncaught failures', async () => {
  const context = await browser.newContext();
  try {
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/assets/sdk/p2game-sdk.v1.js', route => route.abort());
    await page.goto(gameUrl); await start(page);
    await page.locator('#admit-btn').click();
    assert.equal(await page.locator('#overlay-card h2').innerText(), 'ACCESS GRANTED');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
