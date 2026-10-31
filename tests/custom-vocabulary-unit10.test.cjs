const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const element = {addEventListener() {}};
const context = vm.createContext({document: {querySelector: () => element}, localStorage: {getItem: () => null}});
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8')
  .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
  .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);
context.text = fs.readFileSync(path.join(root, 'wordbooks/custom-unit-10.txt'), 'utf8');
const words = vm.runInContext('parseVocabulary(text)', context);
const books = JSON.parse(fs.readFileSync(path.join(root, 'wordbooks/manifest.json'), 'utf8'));
const chapter = books.find(book => book.id === 'custom-unit-10');
assert.equal(chapter.cardCount, 52);
assert.equal(chapter.url, 'wordbooks/custom-unit-10.txt');
assert.equal(words.length, 52);
assert.equal(new Set(words.map(word => word.id)).size, 52);
assert.ok(words.every(word => word.meaning && word.meaningZh && word.example && word.translation && word.translationZh && word.memoryAid.length));
assert.equal(words[0].singularOnly, true);
assert.equal(words.find(word => word.id === 'die-schlange').meaning, 'queue; line; snake');
assert.equal(words.find(word => word.id === 'das-handtuch').plural, 'die Handtücher');
for (const [id, feminine] of [['der-sieger', 'Siegerin'], ['der-konsument', 'Konsumentin'], ['der-dieb', 'Diebin']]) {
  assert.ok(words.find(word => word.id === id).memoryAid.some(aid => aid[1].includes(feminine)), id);
}
const batch = JSON.parse(fs.readFileSync(path.join(root, 'assets/vocab-images/custom-schritte-plus-b1-2-unit10-images-20261029.json'), 'utf8'));
assert.deepEqual(batch.items.map(item => item.id), Array.from(words, word => word.id));
assert.equal(batch.items.filter(item => item.file).length, 49);
assert.deepEqual(batch.items.filter(item => !item.file).map(item => item.id), ['sowohl-als-auch', 'weder-noch', 'einerseits']);
context.translations = JSON.parse(fs.readFileSync(path.join(root, 'wordbooks/zh-CN.json'), 'utf8'));
vm.runInContext('CHINESE_VOCABULARY = translations;', context);
for (const word of words) {
  context.probe = word;
  vm.runInContext('uiLanguage = "en";', context);
  const english = vm.runInContext('memoryAidMarkup(probe)', context);
  assert.doesNotMatch(english, /[\u3400-\u9fff]/u, `English hint must not contain Chinese: ${word.id}`);
  vm.runInContext('uiLanguage = "zh";', context);
  const chinese = vm.runInContext('memoryAidMarkup(probe)', context);
  assert.match(chinese, /[\u3400-\u9fff]/u, `Chinese hint must remain available: ${word.id}`);
}
context.probe = words.find(word => word.id === 'benoetigen');
vm.runInContext('uiLanguage = "en";', context);
assert.match(vm.runInContext('memoryAidMarkup(probe)', context), /brauchen/);
assert.match(vm.runInContext('memoryAidMarkup(probe)', context), /hat benötigt/);
const revisions = JSON.parse(fs.readFileSync(path.join(root, 'assets/vocab-images/custom-unit10-person-blue-revisions-20261031.json'), 'utf8'));
const overrides = new Map(revisions.items.map(item => [item.id, item.file]));
const images = JSON.parse(fs.readFileSync(path.join(root, 'assets/vocab-images/manifest.json'), 'utf8'));
const mappings = new Map(images.filter(item => typeof item !== 'string').map(item => [item.id, item.file]));
assert.equal(batch.status, 'approved');
assert.equal(batch.approvalScope, 'publish');
assert.equal(revisions.status, 'approved');
assert.equal(revisions.approvalScope, 'publish');
const hashes = new Set();
for (const item of batch.items.filter(item => item.file)) {
  const file = overrides.get(item.id) || item.file;
  const word = words.find(word => word.id === item.id);
  assert.equal(word.imagePath, `assets/vocab-images/${file}`, item.id);
  assert.equal(mappings.get(`custom-unit10-${item.id}`), file, item.id);
  const png = fs.readFileSync(path.join(root, 'assets/vocab-images', file));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', item.id);
  assert.equal(png.readUInt32BE(16), png.readUInt32BE(20), item.id);
  assert.ok(png.readUInt32BE(16) >= 1024, item.id);
  hashes.add(crypto.createHash('sha256').update(png).digest('hex'));
}
assert.equal(hashes.size, 49);
console.log('Unit 10: 52 bilingual cards, source usages and forms, 49 image plans and 3 text-only expressions passed.');
