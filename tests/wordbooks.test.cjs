const assert = require('node:assert/strict');
const fs = require('node:fs');
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
console.log('All wordbooks, A2 forms, recall clues and independent progress: passed');
