const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sourceBatches = [1, 2, 3].map(part =>
  JSON.parse(fs.readFileSync(path.join(root, `assets/vocab-images/custom-schritte-plus-b1-2-images-part${part}-20261019.json`), 'utf8'))
);
assert.ok(sourceBatches.every(batch => batch.status === 'approved'));
assert.ok(sourceBatches.every(batch => batch.approvalScope === 'publish'));
assert.ok(sourceBatches.every(batch => batch.approvedOn === '2026-10-20'));
const originalItems = sourceBatches.flatMap(batch => batch.items);
const revisionItems = JSON.parse(fs.readFileSync(path.join(root, 'assets/vocab-images/custom-schritte-plus-b1-2-revisions-20261020.json'), 'utf8')).items;
const currentItems = new Map(originalItems.map(item => [item.id, item]));
for (const item of revisionItems) {
  if (item.action === 'text-only') currentItems.delete(item.id);
  else currentItems.set(item.id, item);
}
const batches = [...currentItems.values()];
assert.equal(batches.length, 31);
assert.ok(batches.every(item => item.generated && item.reviewed));

const element = {addEventListener() {}};
const context = vm.createContext({
  document: {querySelector: () => element},
  localStorage: {getItem: () => null}
});
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8')
  .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
  .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);
context.images = JSON.parse(fs.readFileSync(path.join(root, 'assets/vocab-images/manifest.json'), 'utf8'));
vm.runInContext('IMAGE_PATHS = parseImageManifest(images);', context);

const parseBook = file => {
  context.text = fs.readFileSync(path.join(root, file), 'utf8');
  return vm.runInContext('parseVocabulary(text)', context);
};
const custom = new Map(parseBook('vocabulary.txt').map(word => [word.id, word]));
const b1 = new Map(parseBook('wordbooks/goethe-b1.txt').map(word => [word.id, word]));
const hashes = new Set();
let sharedCount = 0;

for (const item of batches) {
  const word = custom.get(item.id);
  assert.ok(word, item.id);
  assert.equal(word.imagePath, `assets/vocab-images/${item.file}`, item.id);
  const png = fs.readFileSync(path.join(root, word.imagePath));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), png.readUInt32BE(20), item.id);
  assert.ok(png.readUInt32BE(16) >= 1024, item.id);
  const hash = crypto.createHash('sha256').update(png).digest('hex');
  assert.ok(!hashes.has(hash), `duplicate image: ${item.id}`);
  hashes.add(hash);
  if (b1.has(item.id)) {
    assert.equal(b1.get(item.id).imagePath, word.imagePath, `shared image: ${item.id}`);
    sharedCount += 1;
  }
}

assert.ok(sharedCount >= 10, `expected shared Goethe B1 bindings, got ${sharedCount}`);
console.log(`Schritte PLUS B1.2: 31 approved square unique images bound globally; ${sharedCount} are shared with Goethe B1.`);
