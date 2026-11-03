const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'p2game.json'), 'utf8'));
const asset = file => {
  assert.equal(typeof file, 'string');
  const absolute = path.resolve(root, file);
  assert.ok(absolute.startsWith(root + path.sep), 'Asset stays inside the build: ' + file);
  assert.ok(fs.statSync(absolute).isFile(), 'Asset exists: ' + file);
  return absolute;
};
const pngSize = file => {
  const bytes = fs.readFileSync(asset(file));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature: ' + file);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};
assert.equal(manifest.schemaVersion, 1);
assert.match(manifest.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.ok(manifest.name.length >= 2 && manifest.name.length <= 80);
assert.ok(manifest.description.length >= 30 && manifest.description.length <= 2000);
assert.ok(manifest.shortDescription.length >= 10 && manifest.shortDescription.length <= 160);
assert.equal(manifest.engine, 'dom');
assert.equal(manifest.category, 'puzzle');
assert.equal(manifest.ageRating, 'T');
assert.deepEqual(manifest.languages, ['vi']);
for (const control of ['keyboard', 'mouse', 'touch']) {
  assert.equal(typeof manifest.controls[control], 'string', 'Control instructions must be strings: ' + control);
  assert.ok(manifest.controls[control].trim().length > 0);
}
assert.equal(manifest.sdk.version, '1.1');
assert.equal(manifest.sdk.requiresAuth, false);
assert.equal(manifest.sdk.cloudSave, false);
assert.ok(['audio', 'persistent-storage', 'clipboard-write'].every(permission => manifest.permissions.includes(permission)));
assert.ok(!manifest.permissions.includes('external-network'));
assert.deepEqual(manifest.leaderboards, [{ id: 'high-score', name: 'Điểm ca trực', order: 'DESC', maxScore: 1450, minSessionSeconds: 30 }]);
assert.equal(manifest.attestation.ownsRights, true);
assert.equal(manifest.attestation.containsAds, false);
assert.equal(manifest.attestation.containsIap, false);
assert.deepEqual(pngSize(manifest.assets.icon), { width: 512, height: 512 });
const cover = pngSize(manifest.assets.cover);
assert.ok(cover.width >= 1280 && cover.height >= 720 && cover.width * 9 === cover.height * 16);
assert.ok(manifest.assets.screenshots.length >= 1 && manifest.assets.screenshots.length <= 8);
for (const screenshot of manifest.assets.screenshots) {
  const size = pngSize(screenshot);
  assert.ok(size.width >= 960 && size.height >= 540);
}
const html = fs.readFileSync(asset(manifest.entry), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  assert.ok(!/^(?:https?:)?\/\//.test(match[1]), 'Entry uses bundled assets: ' + match[1]);
  asset(match[1]);
}
for (const name of ['game.js', 'audio.js', 'p2game-platform.js']) {
  const source = fs.readFileSync(asset(name), 'utf8');
  assert.doesNotMatch(source, /window\.top|parent\.location|window\.p2game\s*=|serviceWorker\.register|\beval\(/);
}
assert.doesNotMatch(fs.readFileSync(asset('game.js'), 'utf8'), /NGHE THỬ NHẠC/);
const cssPath = asset('assets/fonts/fonts.css');
const fonts = fs.readFileSync(cssPath, 'utf8');
assert.doesNotMatch(fonts, /https?:\/\//);
for (const match of fonts.matchAll(/url\(\.\/([^)]+)\)/g)) asset('assets/fonts/' + match[1]);
console.log('Project P2Game checks passed: manifest, assets, score cap, local fonts and SDK entry.');
console.log('Official platform validation and registered slug/version checks still run on P2Game.');
