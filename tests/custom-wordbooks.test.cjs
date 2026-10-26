const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const storage = new Map();
const element = {
  addEventListener() {},
  classList: {add() {}, remove() {}, toggle() {}},
  querySelectorAll: () => [],
  setAttribute() {}
};
const context = vm.createContext({
  document: {querySelector: () => element, documentElement: {lang: 'en'}},
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  }
});
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8')
  .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
  .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);

const books = JSON.parse(fs.readFileSync(path.join(root, 'wordbooks/manifest.json'), 'utf8'));
const custom = books.find(book => book.id === 'custom');
assert.equal(custom.title, 'Schritte PLUS B1.2');
assert.equal(custom.group, 'custom');

context.text = fs.readFileSync(path.join(root, 'vocabulary.txt'), 'utf8');
const words = vm.runInContext('parseVocabulary(text)', context);
assert.equal(words.length, 91);
assert.ok(words.every(word => word.meaning && word.meaningZh));
assert.ok(words.every(word => word.example && word.translation && word.translationZh));
assert.match(words.find(word => word.id === 'die-distanz').example, /Distanz/);

context.manifestBooks = books;
context.savedBooks = [
  {id: 'custom', title: 'Schritte PLUS B1.2', text: 'die Distanz | distance | Distanz ist wichtig. | Distance matters.'},
  {id: 'custom-mein-kurs', title: 'Mein Kurs', text: 'lernen | to learn | Ich lerne. | I learn.'}
];
const merged = JSON.parse(vm.runInContext('JSON.stringify(mergeCustomWordbooks(manifestBooks, savedBooks))', context));
assert.equal(merged.filter(book => book.id === 'custom').length, 1);
assert.equal(merged.find(book => book.id === 'custom').text, context.savedBooks[0].text);
assert.equal(merged.find(book => book.id === 'custom-mein-kurs').title, 'Mein Kurs');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.match(html, /id="customWordbookView"/);
assert.match(html, /id="customWordbookFile"[^>]+accept="\.txt,text\/plain"/);
assert.match(html, /id="customWordbookTitle"/);
assert.doesNotMatch(html, /schritte-plus-b1-2-image-feedback\.html/);
assert.match(fs.readFileSync(path.join(root, '.gitignore'), 'utf8'), /^\.local-review\/$/m);

console.log('Custom wordbook manager, Schritte PLUS B1.2 content and re-import model: passed');
