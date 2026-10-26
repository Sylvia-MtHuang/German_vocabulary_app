const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const assetRoot = path.join(root, 'assets/vocab-images');
const batch = JSON.parse(fs.readFileSync(path.join(assetRoot, 'custom-schritte-plus-b1-2-unit9-images-20261025.json'), 'utf8'));

assert.equal(batch.status, 'approved');
assert.equal(batch.approvalScope, 'publish');
assert.equal(batch.approvedOn, '2026-10-26');
assert.equal(batch.items.length, 49);

const images = batch.items.filter(item => item.action !== 'text-only');
const textOnly = batch.items.filter(item => item.action === 'text-only');
assert.equal(images.length, 45);
assert.deepEqual(textOnly.map(item => item.id).sort(), ['als-ob', 'bevor', 'nachdem', 'wie-wenn']);
assert.ok(batch.items.every(item => item.generated && item.reviewed));

const element = {addEventListener() {}};
const context = vm.createContext({
  document: {querySelector: () => element},
  localStorage: {getItem: () => null}
});
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8')
  .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
  .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);

const manifestEntries = JSON.parse(fs.readFileSync(path.join(assetRoot, 'manifest.json'), 'utf8'));
const manifest = new Map(manifestEntries.map(item => typeof item === 'string'
  ? [path.basename(item, path.extname(item)), item]
  : [item.id, item.file]));
context.images = manifestEntries;
vm.runInContext('IMAGE_PATHS = parseImageManifest(images);', context);
context.text = fs.readFileSync(path.join(root, 'vocabulary.txt'), 'utf8');
const books = JSON.parse(fs.readFileSync(path.join(root, 'wordbooks/manifest.json'), 'utf8'));
const unit9 = books.find(book => book.id === 'custom-unit-9');
const allWords = vm.runInContext('parseVocabulary(text)', context);
const words = allWords.slice(unit9.rangeStart, unit9.rangeStart + unit9.rangeCount);
const custom = new Map(words.map(word => [word.id, word]));

assert.equal(allWords.length, 91);
assert.equal(words.length, 49);
assert.equal(custom.size, 49);
assert.ok(words.every(word => word.meaning && word.meaningZh));
assert.ok(words.every(word => word.example && word.translation && word.translationZh));

const hashes = new Set();
for (const item of images) {
  const word = custom.get(item.id);
  assert.ok(word, item.id);
  assert.equal(manifest.get(item.id), item.file, `manifest mapping: ${item.id}`);
  assert.equal(word.imagePath, `assets/vocab-images/${item.file}`, `word binding: ${item.id}`);
  const png = fs.readFileSync(path.join(assetRoot, item.file));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', item.id);
  assert.equal(png.readUInt32BE(16), png.readUInt32BE(20), `${item.id} must be square`);
  assert.ok(png.readUInt32BE(16) >= 1024, item.id);
  const hash = crypto.createHash('sha256').update(png).digest('hex');
  assert.ok(!hashes.has(hash), `duplicate image: ${item.id}`);
  hashes.add(hash);
}

for (const item of textOnly) {
  assert.ok(custom.has(item.id), item.id);
  assert.equal(custom.get(item.id).imagePath, '', `text-only binding: ${item.id}`);
  assert.ok(!manifest.has(item.id), `text-only manifest mapping: ${item.id}`);
}

assert.equal(unit9.cardCount, 49);
assert.equal(unit9.source, 'Schritte PLUS B1.2 · Unit 9');

console.log('Schritte PLUS B1.2 Unit 9: 49 entries, 45 reviewed images and 4 text-only cards passed.');
