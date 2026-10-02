const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const element = { addEventListener() {} };
const context = vm.createContext({
  document: { querySelector: () => element },
  localStorage: { getItem: () => null }
});
// Keep the real parser and helpers; omit browser startup and persistence.
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8')
  .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
  .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);
const books = JSON.parse(fs.readFileSync(path.join(root, 'wordbooks/manifest.json'), 'utf8'));
context.images = JSON.parse(fs.readFileSync(path.join(root, 'assets/vocab-images/manifest.json'), 'utf8'));
vm.runInContext('IMAGE_PATHS = parseImageManifest(images);', context);
assert.ok(fs.existsSync(path.join(root, 'assets/vocab-images/das-angebot-v2.png')));
let a2;
for (const book of books) {
  context.text = fs.readFileSync(path.join(root, book.url), 'utf8');
  const words = vm.runInContext('parseVocabulary(text)', context);
  assert.equal(new Set(words.map(word => word.id)).size, words.length, book.id);
  assert.ok(words.every(word => word.meaning && word.example && word.translation), book.id);
  if (book.id === 'goethe-a1' || book.id === 'goethe-a2') {
    assert.equal(words.find(word => word.word === 'Angebot').imagePath, 'assets/vocab-images/das-angebot-v2.png');
  }
  if (book.id === 'goethe-a2') a2 = words;
}
assert.equal(a2.length, 1498);
assert.ok(a2.every(word => word.example.split(/\s+/).length <= 22));
assert.equal(a2.find(word => word.word === 'Bank' && word.meaning === 'bank').plural, 'die Banken');
assert.equal(a2.find(word => word.word === 'Bank' && word.meaning === 'bench').plural, 'die Bänke');
assert.equal(a2.find(word => word.word === 'See' && word.article === 'die').plural, '');
assert.equal(a2.find(word => word.word === 'See' && word.article === 'der').plural, 'die Seen');
assert.equal(a2.find(word => word.word === 'arm').plural, '');
context.a2 = a2;
vm.runInContext('WORDS = a2;', context);
context.bank = a2.find(word => word.word === 'Bank' && word.meaning === 'bank');
const choices = vm.runInContext('getMeaningChoices({word: bank})', context);
assert.equal(new Set(choices).size, 4);
assert.ok(choices.includes('bank'));
assert.ok(!choices.includes('bench'));
context.parents = a2.find(word => word.word === 'Eltern');
assert.equal(context.parents.pluralOnly, true);
assert.equal(context.parents.plural, '');
assert.equal(vm.runInContext('getGenderClass(parents)', context), 'plural');
context.probe = {word: 'ein', example: 'Meine Schwester kauft ein Buch.', translation: 'My sister buys a book.'};
assert.equal(vm.runInContext('blankWordInExample(probe)', context), 'Meine Schwester kauft _____ Buch.');
context.probe = a2.find(word => word.word === 'ankommen');
const recall = vm.runInContext('fillExampleMarkup(probe)', context);
assert.ok(recall.includes('to arrive'));
assert.ok(!recall.includes(context.probe.example));
context.books = books;
vm.runInContext('WORDBOOKS = books; state.selectedWordbookId = "goethe-a1";', context);
const a1Key = vm.runInContext('recordKey("die-bank")', context);
vm.runInContext('state.selectedWordbookId = "goethe-a2";', context);
assert.notEqual(vm.runInContext('recordKey("die-bank")', context), a1Key);
// Exercise mixed session selection with reproducible randomness, without changing progress.
const selectionCheck = JSON.parse(vm.runInContext(`(() => {
  const originalRandom = Math.random;
  const originalWords = WORDS;
  const originalRecords = state.records;
  let seed = 17;
  Math.random = () => ((seed = seed * 16807 % 2147483647) / 2147483647);
  try {
    state.records = {};
    WORDS = ['der', 'die', 'das'].flatMap(article =>
      [1, 2, 3, 4].map(n => ({id: article + n, article, imagePath: 'fixture.png'})));
    const before = WORDS.map(w => w.id);
    const first = pickSessionWords(8).map(w => w.id);
    const second = pickSessionWords(8).map(w => w.id);
    const inputUnchanged = before.join() === WORDS.map(w => w.id).join();
    WORDS = [{id: 'due'}, {id: 'future'}, {id: 'weak'}];
    const now = Date.now();
    Object.assign(getRecord('due'), {seen: true, strength: 5, dueAt: now - 60000, intervalDays: 1});
    Object.assign(getRecord('weak'), {seen: true, strength: 1, dueAt: now - 60000, intervalDays: 1});
    Object.assign(getRecord('future'), {seen: true, strength: 1, dueAt: now + 86400000, intervalDays: 1});
    const priorities = pickSessionWords(3).map(w => w.id);
    WORDS = [{id: 'no-image'}, {id: 'image', imagePath: 'fixture.png'}];
    return JSON.stringify({before, first, second, inputUnchanged, priorities, imageFirst: pickSessionWords(1)[0].id});
  } finally {
    Math.random = originalRandom;
    WORDS = originalWords;
    state.records = originalRecords;
  }
})()`, context));
assert.equal(selectionCheck.first.length, 8);
assert.equal(new Set(selectionCheck.first).size, 8);
assert.ok(selectionCheck.first.every(id => selectionCheck.before.includes(id)));
assert.equal(new Set(selectionCheck.first.map(id => id.slice(0, 3))).size, 3);
assert.notDeepEqual(selectionCheck.first, selectionCheck.second);
assert.equal(selectionCheck.inputUnchanged, true);
assert.deepEqual(selectionCheck.priorities, ['weak', 'due', 'future']);
assert.equal(selectionCheck.imageFirst, 'image');
const imageBatches = [
  ['a2-image-prompts.json', 50],
  ['a2-image-prompts-100.json', 100]
];
const imageHashes = new Set();
const imageIds = new Set();
for (const [file, count] of imageBatches) {
  const batch = JSON.parse(fs.readFileSync(path.join(root, 'assets/vocab-images', file), 'utf8'));
  assert.equal(batch.items.length, count);
  for (const item of batch.items) {
    assert.ok(!imageIds.has(item.id), 'Image batches must cover different words: ' + item.id);
    imageIds.add(item.id);
    assert.equal(item.generated, true, item.term);
    assert.equal(a2.find(word => word.id === item.id).imagePath, 'assets/vocab-images/' + item.file, item.term);
    const png = fs.readFileSync(path.join(root, 'assets/vocab-images', item.file));
    imageHashes.add(crypto.createHash('sha256').update(png).digest('hex'));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', item.term);
    assert.equal(png.readUInt32BE(16), png.readUInt32BE(20), item.term + ' must be square');
    assert.ok(png.readUInt32BE(16) >= 512, item.term);
  }
}
assert.equal(imageHashes.size, 150, 'Each vocabulary image must be independent');
assert.equal(a2.filter(word => word.imagePath && fs.existsSync(path.join(root, word.imagePath))).length, 181);
console.log('Wordbooks, A2 forms, recall clues, progress, randomized sessions and 150 new image bindings: passed');
