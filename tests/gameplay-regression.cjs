const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const gameRoot = path.resolve(process.env.GAME_ROOT || path.join(__dirname, '../dist'));
const port = 8080;
const url = `http://127.0.0.1:${port}/`;
const SAVE = 'tle_floor13_save_v1', BEST = 'tle_floor13_best_v1';
const safe = [true, true, true, false, true, true, false, false, false, false, true, true];
const evidence = [null, null, 'log', 'log', 'log', 'registry', 'camera', 'log', 'log', 'camera', 'log', 'camera'];
let server, browser;

before(async () => {
  server = http.createServer(async (req, res) => {
    const files = { '/': 'index.html', '/index.html': 'index.html', '/game.js': 'game.js', '/audio.js': 'audio.js', '/styles.css': 'styles.css', '/assets/elevator-lobby.png': 'assets/elevator-lobby.png', '/assets/elevator-theme.mp3': 'assets/elevator-theme.mp3' };
    const file = files[req.url];
    if (!file) { res.writeHead(404).end(); return; }
    try {
      const content = await fs.readFile(path.join(gameRoot, file));
      const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.mp3': 'audio/mpeg' };
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)], 'Content-Length': content.length }).end(content);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  browser = await (process.env.BROWSER === 'webkit' ? webkit : chromium).launch({ headless: true });
});
after(async () => {
  if (browser) await browser.close();
  if (server && server.listening) await new Promise(resolve => server.close(resolve));
});

async function withPage(run, options = {}) {
  const context = await browser.newContext({ viewport: options.mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  try {
    await context.addInitScript(({ seed, fault, audio, audioFault, media, mediaFault }) => {
      for (const [key, value] of Object.entries(seed || {})) localStorage.setItem(key, JSON.stringify(value));
      if (fault === 'access') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage disabled', 'SecurityError'); } });
      else if (fault) for (const method of fault === 'all' ? ['getItem', 'setItem', 'removeItem'] : [fault]) Storage.prototype[method] = function () { throw new DOMException('Storage disabled', 'SecurityError'); };
      if (media) {
        const probe = window.__mediaProbe = { playAttempts: 0, rejections: [] };
        window.addEventListener('unhandledrejection', event => probe.rejections.push(String(event.reason)));
        if (mediaFault === 'blocked') {
          const play = HTMLMediaElement.prototype.play;
          HTMLMediaElement.prototype.play = function () {
            if (this.id !== 'background-music') return play.call(this);
            probe.playAttempts++;
            return Promise.reject(new DOMException('Playback denied for regression test', 'NotAllowedError'));
          };
        }
      }
      if (audio) {
        const probe = window.__audioProbe = { contexts: [], resumeAttempts: 0, rejections: [] };
        window.addEventListener('unhandledrejection', event => probe.rejections.push(String(event.reason)));
        if (audioFault === 'unavailable') {
          window.AudioContext = undefined;
          window.webkitAudioContext = undefined;
          return;
        }
        const NativeContext = window.AudioContext || window.webkitAudioContext;
        if (!NativeContext) throw new Error('Native WebAudio is required for audio regression tests');
        const connect = AudioNode.prototype.connect;
        AudioNode.prototype.connect = function (destination, ...args) {
          const result = connect.call(this, destination, ...args);
          if (destination === this.context.destination) {
            const record = probe.contexts.find(item => item.context === this.context);
            if (record) connect.call(this, record.analyser);
          }
          return result;
        };
        class ObservedContext extends NativeContext {
          constructor(...args) {
            super(...args);
            const analyser = this.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0;
            probe.contexts.push({ context: this, analyser });
          }
          resume() {
            probe.resumeAttempts++;
            if (audioFault === 'resume') return Promise.reject(new DOMException('Resume denied for regression test', 'NotAllowedError'));
            return super.resume();
          }
        }
        window.AudioContext = ObservedContext;
        window.webkitAudioContext = ObservedContext;
      }
    }, { seed: options.seed, fault: options.fault, audio: options.audio, audioFault: options.audioFault, media: options.media, mediaFault: options.mediaFault });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    if (options.mediaFault === 'network') await page.route('**/assets/elevator-theme.mp3', route => route.abort('failed'));
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await run(page);
    assert.deepEqual(errors, [], 'No uncaught browser errors');
  } finally { await context.close(); }
}
// Tap native PCM in parallel; the production graph still connects to its real destination.
async function audioOutput(p, duration = 500, band = null) {
  return p.evaluate(async ({ duration, band }) => {
    const probe = window.__audioProbe;
    const windows = [];
    const until = performance.now() + duration;
    do {
      let sum = 0, samples = 0, peak = 0, bandPower = 0;
      for (const { context, analyser } of probe.contexts) {
        // A suspended context produces no output even if an analyser retains its last block.
        if (context.state !== 'running') continue;
        const pcm = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(pcm);
        for (const value of pcm) { sum += value * value; peak = Math.max(peak, Math.abs(value)); samples++; }
        if (band) {
          const spectrum = new Float32Array(analyser.frequencyBinCount);
          analyser.getFloatFrequencyData(spectrum);
          const binHz = context.sampleRate / analyser.fftSize;
          for (let bin = Math.ceil(band[0] / binHz); bin <= Math.floor(band[1] / binHz); bin++) {
            const magnitude = 10 ** (spectrum[bin] / 20);
            bandPower += magnitude * magnitude;
          }
        }
      }
      windows.push({ rms: samples ? Math.sqrt(sum / samples) : 0, peak, bandRms: Math.sqrt(bandPower) });
      await new Promise(resolve => setTimeout(resolve, 20));
    } while (performance.now() < until);
    return {
      contexts: probe.contexts.length,
      states: probe.contexts.map(item => item.context.state),
      minRms: Math.min(...windows.map(item => item.rms)),
      maxRms: Math.max(...windows.map(item => item.rms)),
      maxBandRms: Math.max(...windows.map(item => item.bandRms)),
      peak: Math.max(...windows.map(item => item.peak)),
      windows: windows.length,
      resumeAttempts: probe.resumeAttempts,
      rejections: probe.rejections.slice()
    };
  }, { duration, band });
}
function assertAudible(output) {
  assert.ok(output.states.includes('running'), `Native audio is running: ${JSON.stringify(output)}`);
  assert.ok(output.minRms > 0.0001, `Sustained native PCM reaches the destination: ${JSON.stringify(output)}`);
  assert.ok(output.peak > 0.0005, `Audio peak is measurable: ${JSON.stringify(output)}`);
  assert.deepEqual(output.rejections, [], 'No unhandled audio promise rejections');
}
const mediaState = p => p.locator('#background-music').evaluate(media => ({ paused: media.paused, currentTime: media.currentTime, duration: Number.isFinite(media.duration) ? media.duration : null, readyState: media.readyState, networkState: media.networkState, volume: media.volume, loop: media.loop, error: media.error && media.error.code }));
async function waitForMusic(p) {
  await p.waitForFunction(() => {
    const music = document.getElementById('background-music');
    return !music.paused && music.readyState >= 2 && music.currentTime > 0.1;
  });
  await p.waitForFunction(() => [...document.querySelectorAll('[data-audio-status]')].every(label => label.textContent.includes('đang phát')));
}
async function assertNoMediaRejections(p) { assert.deepEqual(await p.evaluate(() => window.__mediaProbe.rejections), [], 'No unhandled media promise rejections'); }
const visibleOverlay = p => p.locator('#overlay').evaluate(e => e.classList.contains('visible'));
const readSave = p => p.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE);
const scan = (p, kind) => p.locator(`[data-inspect="${kind}"]`).click();
async function advance(p) {
  for (let n = 0; n < 5 && await visibleOverlay(p); n++) await p.locator('#overlay-card .main-cta').click();
  assert.equal(await visibleOverlay(p), false);
}
async function start(p) { await p.locator('#overlay-card .main-cta').click(); await advance(p); }
async function decide(p, admit, next = true) { await p.locator(admit ? '#admit-btn' : '#deny-btn').click(); if (next) await advance(p); }
async function toCase(p, index, decisions = safe, collect = false) {
  for (let i = 0; i < index; i++) {
    if (collect && evidence[i]) await scan(p, evidence[i]);
    await decide(p, decisions[i]);
  }
}
async function finale(p, collect = false, decisions = safe, from = 0) {
  for (let i = from; i < 12; i++) {
    if (collect && evidence[i]) await scan(p, evidence[i]);
    await decide(p, decisions[i], i < 11);
  }
  await p.locator('#overlay-card .main-cta').click();
}

for (const [key, title, label, collect] of [
  ['truth', 'THE TRUTH', 'MỞ CỬA TẦNG 13', true],
  ['keeper', 'THE KEEPER', 'KHÓA TẦNG 13', false],
  ['replacement', 'THE REPLACEMENT', 'MỞ CỬA TẦNG 13', false],
  ['silence', 'THE SILENCE', 'CẮT NGUỒN ĐIỆN', false]
]) {
  test(`full playthrough reaches ${title} and records it`, () => withPage(async p => {
    await start(p); await finale(p, collect);
    const s = await readSave(p);
    assert.equal(s.correct, 12); assert.equal(s.breach, 0);
    assert.equal(s.evidence, collect ? 10 : 0);
    assert.equal(s.score, collect ? 1450 : 1200);
    await p.getByRole('button', { name: label, exact: true }).click();
    assert.equal(await p.locator('#overlay-card h2').innerText(), title);
    assert.equal(await readSave(p), null);
    assert.deepEqual(await p.evaluate(key => JSON.parse(localStorage.getItem(key)), BEST), { score: s.score, endings: [key] });
    await p.reload({ waitUntil: 'domcontentloaded' });
    assert.match(await p.locator('#overlay-card').innerText(), new RegExp(String(s.score)));
    assert.equal(await p.getByRole('button', { name: 'TIẾP TỤC CA TRỰC →', exact: true }).count(), 0);
  }));
}

test('reload preserves every scan and prevents a third source', () => withPage(async p => {
  await start(p); await toCase(p, 2);
  await scan(p, 'registry'); await p.reload({ waitUntil: 'domcontentloaded' }); await advance(p);
  assert.equal(await p.locator('#scans-left').innerText(), '01 / 02');
  assert.match(await p.locator('#inspection-report').innerText(), /Ông Bảy/);
  await scan(p, 'camera');
  await p.reload({ waitUntil: 'domcontentloaded' }); await advance(p);
  assert.equal(await p.locator('#scans-left').innerText(), '00 / 02');
  assert.equal(await p.locator('[data-inspect="log"]').isDisabled(), true);
  await p.keyboard.press('3');
  assert.equal((await readSave(p)).evidence, 0);
  await decide(p, true);
  assert.equal(await p.locator('#scans-left').innerText(), '02 / 02');
}));

test('evidence survives reload without duplicate points', () => withPage(async p => {
  await start(p); await toCase(p, 2); await scan(p, 'log');
  assert.equal((await readSave(p)).score, 225);
  await p.reload({ waitUntil: 'domcontentloaded' }); await advance(p);
  assert.equal((await readSave(p)).evidence, 1);
  assert.match(await p.locator('#inspection-report').innerText(), /ĐÃ THU THẬP BẰNG CHỨNG/);
  await p.keyboard.press('3');
  assert.equal((await readSave(p)).score, 225);
  assert.equal(await p.locator('#scans-left').innerText(), '01 / 02');
}));

test('dossier tab navigation never commits a passenger decision', () => withPage(async p => {
  await start(p);
  const before = await readSave(p);
  await p.getByRole('tab', { name: 'Cư dân', exact: true }).focus();
  for (const [key, label] of [['ArrowRight', 'Quy định'], ['End', 'Nhật ký'], ['ArrowRight', 'Cư dân'], ['ArrowLeft', 'Nhật ký'], ['Home', 'Cư dân']]) {
    await p.keyboard.press(key);
    const active = p.getByRole('tab', { name: label, exact: true });
    assert.equal(await active.getAttribute('aria-selected'), 'true');
    assert.equal(await active.evaluate(e => e === document.activeElement), true);
    assert.equal(await p.locator('[role="tab"][tabindex="0"]').count(), 1);
    assert.equal(await visibleOverlay(p), false);
    assert.deepEqual(await readSave(p), before);
  }
  await p.locator('#visitor-name').focus();
  await p.keyboard.press('ArrowRight');
  assert.equal((await readSave(p)).history[0].action, 'admit');
}));

test('opened clues can be reread without extra scans or duplicate evidence, including after reload', () => withPage(async p => {
  await start(p); await toCase(p, 2);
  await scan(p, 'log');
  const first = await p.locator('#inspection-report').innerText();
  await scan(p, 'registry');
  const second = await p.locator('#inspection-report').innerText();
  const before = await readSave(p);
  assert.equal(await p.locator('[data-inspect="log"]').isEnabled(), true);
  assert.equal(await p.locator('[data-inspect="registry"]').isEnabled(), true);
  assert.equal(await p.locator('[data-inspect="camera"]').isDisabled(), true);
  await scan(p, 'log');
  assert.equal(await p.locator('#inspection-report').innerText(), first);
  await p.keyboard.press('1');
  assert.equal(await p.locator('#inspection-report').innerText(), second);
  await p.keyboard.press('3');
  assert.equal(await p.locator('#inspection-report').innerText(), first);
  await p.reload({ waitUntil: 'domcontentloaded' }); await advance(p);
  assert.equal(await p.locator('#inspection-report').innerText(), first);
  await p.keyboard.press('2');
  const after = await readSave(p);
  assert.equal(after.score, before.score);
  assert.equal(after.evidence, before.evidence);
  assert.deepEqual(after.found, before.found);
  assert.deepEqual(after.opened.slice().sort(), before.opened.slice().sort());
  assert.equal(await p.locator('#scans-left').innerText(), '00 / 02');
  await scan(p, 'registry');
  assert.equal(await p.locator('#inspection-report').innerText(), second);
}));

for (const admitted of [false, true]) {
  test(`truth ending respects ${admitted ? 'accepting' : 'losing'} Bay's key after reload`, () => withPage(async p => {
    await start(p);
    const decisions = safe.slice(); decisions[10] = admitted;
    await finale(p, true, decisions);
    const before = await readSave(p);
    assert.equal(before.trust, admitted ? 9 : 6);
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.getByRole('button', { name: 'TIẾP TỤC CA TRỰC →', exact: true }).click();
    await p.getByRole('button', { name: 'MỞ CỬA TẦNG 13', exact: true }).click();
    assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE TRUTH');
    const copy = await p.locator('.ending-copy').innerText();
    if (admitted) assert.match(copy, /Ông Bảy tra chiếc chìa khóa vào ổ cũ/);
    else {
      assert.doesNotMatch(copy, /Ông Bảy tra chiếc chìa khóa vào ổ cũ/);
      assert.match(copy, /mở cửa thủ công/);
      assert.match(copy, /dòng khắc dưới nắp bàn trực/);
      assert.match(copy, /ngắt nguồn chính, giữ nguồn phụ/);
    }
    assert.equal(await readSave(p), null);
    assert.equal(await p.evaluate(k => JSON.parse(localStorage.getItem(k)).score, BEST), before.score);
  }));
}

test('modal traps focus and rejects background inspection events', () => withPage(async p => {
  await start(p); await toCase(p, 2); await decide(p, true, false);
  const before = await readSave(p);
  assert.equal(await p.locator('#game-shell').evaluate(e => e.inert), true);
  for (let i = 0; i < 8; i++) {
    await p.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
    assert.equal(await p.evaluate(() => !!document.activeElement.closest('#overlay')), true);
  }
  // Dispatch directly as well, to verify the state guard independently of focus handling.
  await p.locator('[data-inspect="log"]').dispatchEvent('click');
  await p.keyboard.press('3');
  assert.deepEqual(await readSave(p), before);
  await advance(p);
  assert.equal(await p.locator('#scans-left').innerText(), '02 / 02');
  assert.equal(await p.locator('#game-shell').evaluate(e => e.inert), false);
  assert.equal(await p.evaluate(() => !!document.activeElement.closest('#game-shell')), true);
  await p.keyboard.press('ArrowLeft');
  assert.equal((await readSave(p)).history[3].action, 'deny');
}));

test('transmission signal is independent of passenger safety', () => withPage(async p => {
  await start(p); const observed = new Set();
  for (let i = 0; i < 12; i++) {
    observed.add(`${await p.locator('#signal-value').innerText()}:${safe[i]}`);
    await decide(p, safe[i], i < 11);
  }
  assert.deepEqual([...observed].sort(), ['STABLE:false', 'STABLE:true', 'UNSTABLE:false', 'UNSTABLE:true']);
}));

for (const admitted of [false, true]) {
  test(`clues agree with history after ${admitted ? 'admitting' : 'denying'} Huy, Mai and false Minh`, () => withPage(async p => {
    await start(p);
    const decisions = safe.slice(); decisions[0] = admitted; decisions[1] = admitted; decisions[3] = admitted;
    await toCase(p, 4, decisions); await scan(p, 'log');
    assert.match(await p.locator('#inspection-report').innerText(), admitted ? /đã được cho vào/ : /đã bị từ chối/);
    for (let i = 4; i < 8; i++) await decide(p, decisions[i]);
    const quote = await p.locator('#visitor-dialogue').innerText();
    assert.match(quote, /đêm đầu/);
    assert.doesNotMatch(quote, /tối qua|đêm qua/);
    assert.match(quote, admitted ? /vẫn chưa giao được/ : /bị (?:anh|chị) từ chối/);
    await scan(p, 'registry');
    assert.match(await p.locator('#inspection-report').innerText(), admitted ? /đã hoàn tất/ : /chưa được giao/);
    await scan(p, 'log');
    assert.match(await p.locator('#inspection-report').innerText(), admitted ? /đã nhận đồ/ : /chưa nhận đồ/);
    await decide(p, false); await scan(p, 'log');
    assert.match(await p.locator('#inspection-report').innerText(), admitted ? /có một lượt lên tầng 8/ : /đã bị từ chối/);
  }));
}

for (const fault of ['access', 'all', 'getItem', 'setItem', 'removeItem']) {
  test(`game remains playable when storage fails: ${fault}`, () => withPage(async p => {
    await start(p);
    await p.locator('#sound-toggle').click();
    assert.match(await p.locator('#toast').innerText(), /Âm thanh đã/);
    await finale(p, true);
    assert.match(await p.locator('#overlay-card').innerText(), /Bằng chứng thu thập: 10/);
    await p.getByRole('button', { name: 'MỞ CỬA TẦNG 13', exact: true }).click();
    assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE TRUTH');
    assert.match(await p.locator('#overlay-card').innerText(), /1\/4 kết thúc/);
    await p.reload({ waitUntil: 'domcontentloaded' });
    if (fault === 'removeItem') assert.equal(await p.getByRole('button', { name: 'TIẾP TỤC CA TRỰC →', exact: true }).count(), 0);
  }, { fault }));
}

test('invalid saves and achievement records recover to a new game', async () => {
  const badSaves = [{ i: 0, history: [], found: [] }, { i: 99, history: [], found: [] }, { i: '0', history: [], found: [] }];
  for (const save of badSaves) await withPage(async p => {
    assert.equal(await p.getByRole('button', { name: 'TIẾP TỤC CA TRỰC →', exact: true }).count(), 0);
    assert.doesNotMatch(await p.locator('#overlay-card').innerText(), /NaN|undefined/);
    await start(p); await decide(p, true);
    assert.equal((await readSave(p)).score, 100);
  }, { seed: { [SAVE]: save, [BEST]: { score: '<img src=x>', endings: null } } });
});

test('valid legacy save and achievements remain compatible', () => withPage(async p => {
  await start(p); await toCase(p, 2);
  const saved = await readSave(p); delete saved.opened; delete saved.lastClue;
  await p.evaluate(({ key, value, bestKey }) => { localStorage.setItem(key, JSON.stringify(value)); localStorage.setItem(bestKey, JSON.stringify({ score: 1500, endings: ['keeper', 'silence'] })); }, { key: SAVE, value: saved, bestKey: BEST });
  await p.reload({ waitUntil: 'domcontentloaded' }); await advance(p);
  assert.equal((await readSave(p)).score, 200);
  assert.equal(await p.locator('#scans-left').innerText(), '02 / 02');
  await scan(p, 'log'); assert.equal((await readSave(p)).evidence, 1);
  assert.equal(await p.evaluate(key => JSON.parse(localStorage.getItem(key)).score, BEST), 1500);
}));

test('mobile and keyboard retain functional controls', () => withPage(async p => {
  await start(p);
  assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await p.keyboard.press('1'); assert.equal(await p.locator('#scans-left').innerText(), '01 / 02');
  await p.keyboard.press('2'); assert.equal(await p.locator('#scans-left').innerText(), '00 / 02');
  await p.keyboard.press('ArrowRight'); assert.equal((await readSave(p)).correct, 1);
}, { mobile: true }));

test('mobile long story modals scroll and keep finale and replay controls reachable', () => withPage(async p => {
  await start(p); await finale(p, true);
  const report = path.resolve(__dirname, '../plans/reports');
  const engine = process.env.BROWSER === 'webkit' ? 'webkit' : 'chromium';
  await fs.mkdir(report, { recursive: true });
  async function checkModal() {
    const metrics = await p.locator('#overlay-card').evaluate(e => {
      const box = e.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, height: innerHeight, width: e.clientWidth, scrollWidth: e.scrollWidth, scrollHeight: e.scrollHeight, clientHeight: e.clientHeight };
    });
    assert.ok(metrics.top >= 0 && metrics.bottom <= metrics.height + 1, 'Modal stays inside the mobile viewport');
    assert.ok(metrics.scrollWidth <= metrics.width + 1, 'Narrative has no horizontal overflow');
    return metrics;
  }
  await checkModal();
  await p.locator('#overlay-card').evaluate(e => { e.scrollTop = 0; });
  await p.screenshot({ path: path.join(report, `test-261102-1320-story-mobile-finale-${engine}.png`) });
  const open = p.getByRole('button', { name: 'MỞ CỬA TẦNG 13', exact: true });
  await open.scrollIntoViewIfNeeded();
  await open.click();
  assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE TRUTH');
  const ending = await checkModal();
  assert.ok(ending.scrollHeight > ending.clientHeight, 'Long ending uses the modal scroll area');
  await p.locator('#overlay-card').evaluate(e => { e.scrollTop = 0; });
  await p.screenshot({ path: path.join(report, `test-261102-1320-story-mobile-truth-${engine}.png`) });
  const replay = p.getByRole('button', { name: 'CHƠI LẠI →', exact: true });
  await replay.scrollIntoViewIfNeeded();
  assert.ok(await p.locator('#overlay-card').evaluate(e => e.scrollTop > 0), 'Replay is reachable by scrolling the long ending');
  await replay.click();
  assert.match(await p.locator('#overlay-card').innerText(), /NIGHT 01/);
  await advance(p);
  assert.equal((await readSave(p)).i, 0);
  assert.equal(await p.locator('#visitor-number').innerText(), '#001');
}, { mobile: true }));

test('refusing Minh does not hand over unread repair evidence or make him appear at the final rescue', () => withPage(async p => {
  await start(p); await toCase(p, 4);
  const decisions = safe.slice(); decisions[4] = false;
  await decide(p, false, false);
  const result = await p.locator('#overlay-card .lead').innerText();
  assert.doesNotMatch(result, /(?:gửi|trao|đưa).*(?:bản sao log|tài liệu|hồ sơ).*cho bạn/i);
  assert.match(result, /rời sảnh/);
  assert.match(result, /không trao/);
  assert.equal((await readSave(p)).evidence, 0, 'A refused passenger awards no unread document');
  await advance(p);
  for (let i = 5; i <= 7; i++) {
    await scan(p, evidence[i]);
    await decide(p, decisions[i], i < 7);
  }
  await p.locator('#overlay-card .main-cta').click();
  const summary = await p.locator('#overlay-card').innerText();
  assert.match(summary, /Minh đã rời đi, không trao bản sao/);
  assert.match(summary, /Phiếu cũ lưu sẵn trong máy/);
  assert.equal((await readSave(p)).evidence, 3);
  await advance(p); await finale(p, true, decisions, 8);
  assert.equal((await readSave(p)).trust, 6);
  await p.getByRole('button', { name: 'MỞ CỬA TẦNG 13', exact: true }).click();
  assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE TRUTH');
  const copy = await p.locator('.ending-copy').innerText();
  assert.doesNotMatch(copy, /Minh (?:đứng cạnh|đứng bên|trao|đưa cho|gửi cho|mở cửa)/);
}));

test('refusing Bay on night one keeps his key with him until he is admitted on night three', () => withPage(async p => {
  await start(p); await toCase(p, 2);
  const decisions = safe.slice(); decisions[2] = false;
  await decide(p, false, false);
  const result = await p.locator('#overlay-card .lead').innerText();
  assert.match(result, /chìa khóa/);
  assert.match(result, /mang chùm chìa khóa/);
  assert.match(result, /không để lại chìa khóa/);
  assert.equal((await readSave(p)).evidence, 0);
  await advance(p);
  for (let i = 3; i < 10; i++) {
    if (evidence[i]) await scan(p, evidence[i]);
    await decide(p, decisions[i]);
  }
  await decide(p, true, false);
  assert.match(await p.locator('#overlay-card .lead').innerText(), /chìa khóa/);
  assert.equal((await readSave(p)).evidence, 7, 'Receiving the key does not grant unread case eleven evidence');
  await advance(p); await finale(p, true, decisions, 11);
  assert.equal((await readSave(p)).trust, 6);
  await p.getByRole('button', { name: 'MỞ CỬA TẦNG 13', exact: true }).click();
  assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE TRUTH');
  assert.match(await p.locator('.ending-copy').innerText(), /Ông Bảy tra chiếc chìa khóa vào ổ cũ/);
}));

for (const admitted of [false, true]) {
  test(`An's ${admitted ? 'admitted' : 'refused'} route stays consistent through the Truth rescue`, () => withPage(async p => {
    await start(p); await toCase(p, 5, safe, true);
    const decisions = safe.slice(); decisions[5] = admitted;
    await decide(p, admitted, false);
    const result = await p.locator('#overlay-card .lead').innerText();
    assert.match(result, /An/);
    assert.equal((await readSave(p)).evidence, 3, 'An does not hand over an unread registry record');
    if (admitted) assert.match(result, /An bước vào cabin/);
    else {
      assert.match(result, /An.*chiếu nghỉ tầng 9/);
      assert.doesNotMatch(result, /An (?:bước vào|vào thang máy|đứng cạnh|đứng bên)/);
    }
    await advance(p);
    for (let i = 6; i <= 7; i++) {
      await scan(p, evidence[i]);
      await decide(p, decisions[i], i < 7);
    }
    await p.locator('#overlay-card .main-cta').click();
    assert.match(await p.locator('#overlay-card').innerText(), admitted ? /An đang đợi trong chuyến cabin/ : /An vẫn chờ ở chiếu nghỉ tầng 9/);
    await advance(p); await finale(p, true, decisions, 8);
    assert.equal((await readSave(p)).trust, admitted ? 9 : 6);
    await p.getByRole('button', { name: 'MỞ CỬA TẦNG 13', exact: true }).click();
    assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE TRUTH');
    const copy = await p.locator('.ending-copy').innerText();
    assert.match(copy, /An/);
    assert.match(copy, /mẹ/);
    assert.match(copy, admitted ? /Từ cabin, Bé An/ : /Từ chiếu nghỉ tầng 9, An/);
    if (!admitted) assert.doesNotMatch(copy, /An (?:vẫn |đang )?(?:đứng cạnh|đứng bên|chờ cạnh) bạn/);
  }));
}

for (const admitted of [false, true]) {
  test(`Linh's ${admitted ? 'admitted' : 'refused'} memory remains consistent with the final rescue`, () => withPage(async p => {
    await start(p); await toCase(p, 11, safe, true);
    const decisions = safe.slice(); decisions[11] = admitted;
    await decide(p, admitted, false);
    const result = await p.locator('#overlay-card .lead').innerText();
    assert.match(result, /(?:ký ức|nhớ mình)/);
    assert.equal((await readSave(p)).evidence, 9, 'The last passenger does not award an unread camera record');
    if (admitted) assert.match(result, /vết khói.*chính bạn/);
    else {
      assert.match(result, /khóa lối về bàn G/);
      assert.match(result, /ký ức.*giữ riêng/);
      assert.doesNotMatch(result, /(?:Linh|người kia|cô ấy) (?:bước vào|vào phòng|đứng cạnh|đứng bên)/);
    }
    await p.locator('#overlay-card .main-cta').click();
    assert.equal((await readSave(p)).trust, admitted ? 9 : 6);
    await p.getByRole('button', { name: 'MỞ CỬA TẦNG 13', exact: true }).click();
    assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE TRUTH');
    const copy = await p.locator('.ending-copy').innerText();
    assert.match(copy, /Linh/);
    assert.match(copy, admitted ? /Phần ký ức đã trở về/ : /ký ức bị từ chối ở bàn G/);
    if (!admitted) assert.doesNotMatch(copy, /(?:Linh|người kia|cô ấy) (?:đang |vẫn )?(?:đứng cạnh|đứng bên|đưa tay|trao|đưa cho)/);
  }));
}

test('three distinct nights, repair timing and rescue power instructions agree through the finale', () => withPage(async p => {
  await p.locator('#overlay-card .main-cta').click();
  assert.match(await p.locator('#overlay-card').innerText(), /LINH/);
  assert.match(await p.locator('#overlay-card').innerText(), /2013/);
  await advance(p);
  const clocks = [await p.locator('#clock').innerText()];
  await toCase(p, 2); await scan(p, 'log');
  const power = await p.locator('#inspection-report').innerText();
  assert.match(power, /ngắt nguồn chính/);
  assert.match(power, /giữ nguồn phụ/);
  await decide(p, true); await decide(p, false, false);
  await p.locator('#overlay-card .main-cta').click();
  await p.locator('#overlay-card .main-cta').click();
  const secondNight = await p.locator('#overlay-card').innerText();
  assert.match(secondNight, /đêm mới|đêm thứ hai/i);
  assert.match(secondNight, /đồng hồ.*01:13/);
  await advance(p);
  clocks.push(await p.locator('#clock').innerText());
  await scan(p, 'registry');
  const repair = await p.locator('#inspection-report').innerText();
  const orderTime = repair.match(/lúc (\d{2}):(\d{2})/);
  assert.ok(orderTime, 'Repair work order has an observable time');
  const [hour, minute] = clocks[1].split(':').map(Number);
  assert.ok(Number(orderTime[1]) * 60 + Number(orderTime[2]) < hour * 60 + minute, 'Repair order predates the current second-night clock');
  for (let i = 4; i <= 7; i++) await decide(p, safe[i], i < 7);
  await p.locator('#overlay-card .main-cta').click();
  await p.locator('#overlay-card .main-cta').click();
  const thirdNight = await p.locator('#overlay-card').innerText();
  assert.match(thirdNight, /đêm thứ ba/i);
  assert.match(thirdNight, /đồng hồ.*01:13/);
  await advance(p);
  clocks.push(await p.locator('#clock').innerText());
  for (const clock of clocks) assert.match(clock, /^01:13:/, 'Each night returns to the 01:13 interval');
  await decide(p, false); await decide(p, false); await scan(p, 'log');
  const rescue = await p.locator('#inspection-report').innerText();
  assert.match(rescue, /ngắt nguồn chính/);
  assert.match(rescue, /giữ nguồn phụ/);
  assert.match(rescue, /mở cửa thủ công/);
  await decide(p, true); await decide(p, true, false);
  await p.locator('#overlay-card .main-cta').click();
  const finaleCopy = await p.locator('#overlay-card').innerText();
  assert.match(finaleCopy, /nguồn phụ/);
  assert.match(finaleCopy, /cần.*cứu hộ|cứu hộ.*cần/);
  await p.getByRole('button', { name: 'CẮT NGUỒN ĐIỆN', exact: true }).click();
  assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE SILENCE');
  const silence = await p.locator('.ending-copy').innerText();
  assert.match(silence, /nguồn chính/);
  assert.match(silence, /nguồn phụ/);
}));

test('four observed clues and one contained breach still unlock Truth without Bay key or unread rescue files', () => withPage(async p => {
  await start(p);
  const decisions = safe.slice(); decisions[3] = true; decisions[10] = false;
  const sources = new Set([2, 4, 6, 9]);
  for (let i = 0; i < 12; i++) {
    if (sources.has(i)) await scan(p, evidence[i]);
    await decide(p, decisions[i], i < 11);
  }
  const before = await readSave(p);
  assert.deepEqual(before.found, [3, 5, 7, 10]);
  assert.equal(before.evidence, 4);
  assert.equal(before.breach, 1);
  assert.equal(before.trust, 5);
  assert.equal(before.correct, 10);
  assert.equal(before.wrong, 2);
  assert.equal(before.score, 960);
  await p.locator('#overlay-card .main-cta').click();
  const copy = await p.locator('#overlay-card').innerText();
  assert.match(copy, /BẢY · AN · VÂN · LINH/);
  assert.match(copy, /cần mở cửa cứu hộ/);
  assert.deepEqual(await readSave(p), before, 'Mandatory finale reveals its own roster and lever without awarding unread evidence');
  await p.getByRole('button', { name: 'MỞ CỬA TẦNG 13', exact: true }).click();
  assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE TRUTH');
  const ending = await p.locator('.ending-copy').innerText();
  assert.match(ending, /hủy lượt mượn tên đã lọt vào cabin/);
  assert.match(ending, /dòng khắc dưới nắp bàn trực/);
  assert.match(ending, /mở cửa thủ công/);
  assert.doesNotMatch(ending, /Ông Bảy tra chiếc chìa khóa vào ổ cũ/);
  assert.equal(await readSave(p), null);
}));

test('audio: start and continue gestures produce sustained native ambience after transition cues finish', t => withPage(async p => {
  assert.equal((await audioOutput(p, 100)).peak, 0, 'Welcome screen does not autoplay');
  await start(p);
  await p.waitForTimeout(1600);
  const started = await audioOutput(p, 1200);
  assertAudible(started);
  await decide(p, true);
  await p.reload({ waitUntil: 'domcontentloaded' });
  assert.equal((await audioOutput(p, 100)).peak, 0, 'Reload waits for a new user gesture');
  await p.getByRole('button', { name: 'TIẾP TỤC CA TRỰC →', exact: true }).click();
  await advance(p);
  await p.waitForTimeout(1600);
  const continued = await audioOutput(p, 800);
  assertAudible(continued);
  assert.equal((await readSave(p)).i, 1);
  t.diagnostic(JSON.stringify({ started, continued }));
}, { audio: true }));

test('audio: mute is silent, saved off survives reload and modal unmute restores real output', t => withPage(async p => {
  await start(p);
  assert.equal(await p.locator('#sound-toggle').getAttribute('aria-pressed'), 'true');
  await p.locator('#sound-toggle').click();
  assert.equal(await p.locator('#sound-toggle').getAttribute('aria-pressed'), 'false');
  assert.equal(await p.evaluate(() => localStorage.getItem('tle_floor13_sound')), 'off');
  await p.waitForTimeout(400);
  const muted = await audioOutput(p, 400);
  assert.ok(muted.peak < 0.000001, `Mute stops output: ${JSON.stringify(muted)}`);
  await p.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await p.locator('#overlay-card [data-sound-toggle]').getAttribute('aria-pressed'), 'false');
  await start(p);
  const restoredMute = await audioOutput(p, 400);
  assert.ok(restoredMute.peak < 0.000001, 'Continue respects persisted mute');
  await decide(p, true, false);
  await p.locator('#overlay-card [data-sound-toggle]').click();
  assert.equal(await p.evaluate(() => localStorage.getItem('tle_floor13_sound')), 'on');
  assert.deepEqual(await p.locator('[data-sound-toggle]').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-pressed'))), ['true', 'true']);
  await p.waitForTimeout(1600);
  const unmuted = await audioOutput(p, 800);
  assertAudible(unmuted);
  t.diagnostic(JSON.stringify({ muted, restoredMute, unmuted }));
}, { audio: true }));

test('audio: scan camera door bad night and ending cues produce real native output', t => withPage(async p => {
  await start(p);
  const measured = [];
  async function cue(name, action) {
    await p.waitForTimeout(1600);
    // Measure cue frequencies separately from the random low-frequency fan and motor.
    const bands = { scan: [700, 1400], camera: [500, 1500], door: [450, 900], bad: [140, 190], night: [250, 400], ending: [140, 190] };
    const band = bands[name];
    const ambient = await audioOutput(p, 300, band);
    assertAudible(ambient);
    const sampling = audioOutput(p, 700, band);
    await action();
    const played = await sampling;
    if (name === 'ending') {
      // Ending replaces ambience, so its standalone cue need not be louder than the fan.
      assert.ok(played.maxRms > 0.005 && played.peak > 0.02, `Ending cue reaches the real destination: ${JSON.stringify(played)}`);
    } else assert.ok(played.maxBandRms > ambient.maxBandRms * 1.5, `${name} cue is measurable in its native tone band: ${JSON.stringify({ band, ambient, played })}`);
    measured.push({ name, ambient, played });
  }
  await cue('scan', () => scan(p, 'registry'));
  await cue('camera', () => scan(p, 'camera'));
  await cue('door', () => decide(p, true, false));
  await advance(p);
  await cue('bad', () => decide(p, false, false));
  await advance(p); await decide(p, true); await decide(p, false, false);
  await p.locator('#overlay-card .main-cta').click();
  await cue('night', () => p.locator('#overlay-card .main-cta').click());
  await advance(p); await finale(p, false, safe, 4);
  await cue('ending', () => p.getByRole('button', { name: 'KHÓA TẦNG 13', exact: true }).click());
  assert.equal(await p.locator('#overlay-card h2').innerText(), 'THE KEEPER');
  t.diagnostic(JSON.stringify(measured));
}, { audio: true }));

test('audio: repeated complete playthroughs and replay keep only one live native context', t => withPage(async p => {
  await start(p);
  const samples = [];
  for (let round = 0; round < 2; round++) {
    await finale(p);
    await p.getByRole('button', { name: 'KHÓA TẦNG 13', exact: true }).click();
    if (round === 0) {
      await p.waitForTimeout(2200);
      const finished = await audioOutput(p, 200);
      assert.ok(finished.peak < 0.000001, 'Ambience stops after the ending cue finishes');
      await p.locator('#overlay-card [data-sound-toggle]').click();
      await p.locator('#overlay-card [data-sound-toggle]').click();
      await p.getByRole('button', { name: 'SAO CHÉP THÀNH TÍCH', exact: true }).click();
      const afterToggle = await audioOutput(p, 200);
      assert.ok(afterToggle.peak < 0.000001, 'Sound and share controls do not restart an already finished shift');
      samples.push({ finished, afterToggle });
    }
    await p.getByRole('button', { name: 'CHƠI LẠI →', exact: true }).click();
    await advance(p);
    const output = await audioOutput(p, 150);
    assert.equal(output.states.filter(state => state !== 'closed').length, 1, 'Replay does not leave duplicate native audio contexts alive');
    assert.deepEqual(output.rejections, []);
    samples.push(output);
  }
  await p.waitForTimeout(1600);
  assertAudible(await audioOutput(p, 800));
  t.diagnostic(JSON.stringify(samples));
}, { audio: true }));

test('audio: unavailable WebAudio still permits inspection decisions and modal sound controls', () => withPage(async p => {
  await start(p); await scan(p, 'registry'); await decide(p, true, false);
  await p.locator('#overlay-card [data-sound-toggle]').click();
  await p.locator('#overlay-card [data-sound-toggle]').click();
  assert.equal((await readSave(p)).i, 1);
  assert.equal((await readSave(p)).correct, 1);
  const output = await audioOutput(p, 100);
  assert.equal(output.contexts, 0);
  assert.deepEqual(output.rejections, []);
  await advance(p);
  assert.equal(await p.locator('#visitor-number').innerText(), '#002');
}, { audio: true, audioFault: 'unavailable' }));

test('audio: rejected native resume is handled without breaking the game or leaking promise rejections', t => withPage(async p => {
  // An untrusted click exercises the browser's suspended-context path without an autoplay override.
  await p.locator('#overlay-card .main-cta').dispatchEvent('click');
  await advance(p); await scan(p, 'registry'); await decide(p, true, false);
  await p.locator('#overlay-card [data-sound-toggle]').click();
  await p.locator('#overlay-card [data-sound-toggle]').click();
  const output = await audioOutput(p, 150);
  assert.ok(output.resumeAttempts > 0, 'The rejected resume path was actually exercised');
  assert.deepEqual(output.rejections, [], 'Rejected resume promises are handled');
  assert.equal((await readSave(p)).correct, 1);
  t.diagnostic(JSON.stringify(output));
}, { audio: true, audioFault: 'resume' }));

test('music: native MP3 waits for a gesture then decodes and advances with truthful playing status', t => withPage(async p => {
  await p.waitForTimeout(200);
  const before = await mediaState(p);
  assert.equal(before.paused, true);
  assert.equal(before.currentTime, 0);
  assert.equal(before.readyState, 0, 'preload none leaves the score unloaded before a gesture');
  assert.doesNotMatch(await p.locator('#overlay-card [data-audio-status]').innerText(), /đang phát/);
  await p.locator('#overlay-card .main-cta').click();
  await waitForMusic(p);
  const playing = await mediaState(p);
  t.diagnostic(JSON.stringify({ playing }));
  assert.equal(playing.error, null);
  assert.equal(playing.loop, true);
  assert.equal(playing.volume, 0.8);
  assert.ok(playing.duration > 39 && playing.duration < 41, 'Native decoder reads the real forty-second score');
  await p.waitForTimeout(550);
  const later = await mediaState(p);
  assert.ok(later.currentTime > playing.currentTime + 0.3, `Native media time progresses: ${JSON.stringify({ playing, later })}`);
  await assertNoMediaRejections(p);
  t.diagnostic(JSON.stringify({ before, playing, later }));
}, { media: true }));

test('music: mute reload unmute and ending control the real media element without restarting a finished shift', t => withPage(async p => {
  await start(p); await waitForMusic(p);
  await p.locator('#sound-toggle').click();
  assert.equal((await mediaState(p)).paused, true);
  assert.equal(await p.evaluate(() => localStorage.getItem('tle_floor13_sound')), 'off');
  const mutedTime = (await mediaState(p)).currentTime;
  await p.waitForTimeout(250);
  const afterMute = await mediaState(p);
  t.diagnostic(JSON.stringify({ mutedTime, afterMute }));
  assert.ok(Math.abs(afterMute.currentTime - mutedTime) < 0.05, 'Mute freezes playback time');
  await p.reload({ waitUntil: 'domcontentloaded' });
  await start(p);
  assert.equal((await mediaState(p)).paused, true);
  assert.equal((await mediaState(p)).currentTime, 0);
  await decide(p, true, false);
  await p.locator('#overlay-card [data-sound-toggle]').click();
  await waitForMusic(p);
  const restored = await mediaState(p);
  assert.equal(await p.evaluate(() => localStorage.getItem('tle_floor13_sound')), 'on');
  await advance(p); await finale(p, false, safe, 1);
  await p.getByRole('button', { name: 'KHÓA TẦNG 13', exact: true }).click();
  const finished = await mediaState(p);
  assert.equal(finished.paused, true);
  assert.equal(finished.currentTime, 0);
  assert.match(await p.locator('#overlay-card [data-audio-status]').innerText(), /đã dừng ở kết thúc/);
  await p.locator('#overlay-card [data-sound-toggle]').click();
  await p.locator('#overlay-card [data-sound-toggle]').click();
  await p.getByRole('button', { name: 'SAO CHÉP THÀNH TÍCH', exact: true }).click();
  await p.waitForTimeout(200);
  assert.equal((await mediaState(p)).paused, true);
  assert.equal((await mediaState(p)).currentTime, 0);
  await assertNoMediaRejections(p);
  t.diagnostic(JSON.stringify({ mutedTime, restored, finished }));
}, { media: true }));

test('music: denied media play reports blocked instead of playing and keeps gameplay usable', t => withPage(async p => {
  await start(p);
  await p.waitForFunction(() => [...document.querySelectorAll('[data-audio-status]')].every(label => label.textContent.includes('chưa cho phép phát nhạc')));
  const status = await p.locator('[data-audio-status]').allTextContents();
  assert.ok(status.every(text => !text.includes('đang phát')));
  assert.equal((await mediaState(p)).paused, true);
  await scan(p, 'registry'); await decide(p, true, false);
  assert.equal((await readSave(p)).correct, 1);
  assert.match(await p.locator('#overlay-card [data-audio-status]').innerText(), /chưa cho phép phát nhạc/);
  assert.equal(await p.getByRole('link', { name: 'NGHE THỬ NHẠC', exact: true }).getAttribute('href'), './assets/elevator-theme.mp3');
  assert.ok(await p.evaluate(() => window.__mediaProbe.playAttempts > 0), 'The rejected play path was exercised');
  await assertNoMediaRejections(p);
  t.diagnostic(JSON.stringify({ status, playAttempts: await p.evaluate(() => window.__mediaProbe.playAttempts) }));
}, { media: true, mediaFault: 'blocked' }));

test('music: real score network failure reports failed with playable fallback and a trapped preview link', t => withPage(async p => {
  const failedRequests = [];
  p.on('requestfailed', request => failedRequests.push({ url: request.url(), failure: request.failure() }));
  await start(p);
  await p.waitForTimeout(500);
  t.diagnostic(JSON.stringify({ failedRequests, media: await mediaState(p), status: await p.locator('[data-audio-status]').allTextContents() }));
  await p.waitForFunction(() => [...document.querySelectorAll('[data-audio-status]')].every(label => label.textContent.includes('Không tải/phát được nhạc')), null, { timeout: 5000 });
  const failed = await mediaState(p);
  assert.ok(failed.error, 'The native media element recorded a real failed request');
  assert.equal(failed.paused, true);
  await p.waitForTimeout(1600);
  const fallback = await audioOutput(p, 300);
  assertAudible(fallback);
  assert.ok(fallback.minRms > 0.005, 'Procedural fallback continues when the MP3 cannot load');
  await scan(p, 'registry'); await decide(p, true, false);
  assert.equal((await readSave(p)).correct, 1);
  const link = p.getByRole('link', { name: 'NGHE THỬ NHẠC', exact: true });
  assert.equal(await link.getAttribute('href'), './assets/elevator-theme.mp3');
  assert.equal(await link.getAttribute('target'), '_blank');
  await link.focus(); await p.keyboard.press('Tab');
  assert.equal(await p.evaluate(() => document.activeElement === document.querySelector('#overlay-card button')), true, 'Tab from the last preview link wraps to the first modal control');
  await p.keyboard.press('Shift+Tab');
  assert.equal(await link.evaluate(element => element === document.activeElement), true, 'Shift Tab wraps back to the preview link');
  assert.match(await p.locator('#overlay-card [data-audio-status]').innerText(), /Không tải\/phát được nhạc/);
  await assertNoMediaRejections(p);
  t.diagnostic(JSON.stringify({ failed, fallback }));
}, { media: true, mediaFault: 'network', audio: true }));
