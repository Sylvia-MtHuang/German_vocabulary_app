const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const element = {addEventListener() {}};
const context = vm.createContext({document: {querySelector: () => element}, localStorage: {getItem: () => null}});
const source = fs.readFileSync('app.js', 'utf8')
  .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
  .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);
assert.equal(vm.runInContext('parseTerm("das heißt").article',context),undefined,'Expression must not be treated as a noun');
assert.equal(vm.runInContext('parseTerm("die e-card").article',context),'die');
assert.equal(vm.runInContext('parseTerm("die ec-Karte").article',context),'die');
assert.equal(vm.runInContext('parseTerm("der erste März").article',context),undefined,'A date phrase is not a noun headword');
const books = JSON.parse(fs.readFileSync('wordbooks/manifest.json', 'utf8'));
assert.ok(books.some(book => book.id === 'goethe-b1'), 'B1 must be selectable');
context.text = fs.readFileSync('wordbooks/goethe-b1.txt', 'utf8');
const words = vm.runInContext('parseVocabulary(text)', context);
const entries = JSON.parse(fs.readFileSync('reports/b1-source-entries.json', 'utf8'));
const canonical = word => word.article ? `${word.article} ${word.word}` : word.word;
const terms = new Set(words.map(canonical));
for (const entry of entries) assert.ok(terms.has(entry.term), `Missing source term: ${entry.term}`);
assert.ok(entries.some(entry => entry.references.some(ref => ref.section === 'thematic')));
assert.ok(entries.some(entry => entry.references.some(ref => ref.page === 102)));
assert.equal(new Set(words.map(word => word.id)).size, words.length);
assert.ok(words.every(word => word.meaning && word.example && word.translation));
assert.ok(words.every(word => word.example.split(/\s+/).length <= 22));
const newTerms = new Set(entries.filter(entry => !entry.existing).map(entry => entry.term));
assert.ok(words.filter(word => newTerms.has(canonical(word))).every(word => !/das Wort|üben .*Wort|sagt .*„|spricht über das Wort/i.test(word.example)), 'New examples must illustrate everyday use');
for (const term of ['der Bankomat', 'das Velo', 'das Znüni', 'die Primarschule', 'der Ammann', 'sich erkälten', 'sichern', 'sichtbar', 'übertreiben', 'besitzen', 'parkieren', 'schlafen', 'transportieren', 'unten', 'linke', 'links', 'rechte', 'rechts', 'selbe', 'selbst', 'dieselbe', 'dasselbe', 'ökologisch', '-speise', 'zweitausendundvier']) {
  assert.ok(terms.has(term), term);
}
assert.ok(!terms.has('sich er') && !terms.has('sich ern') && !terms.has('sich tbar'));
const find = term => words.find(word => canonical(word) === term);
assert.equal(find('der Abschluss').plural, 'die Abschlüsse');
assert.equal(find('der Abfall').plural, 'die Abfälle');
assert.equal(find('das Abenteuer').plural, 'die Abenteuer');
assert.equal(find('der Hauptbahnhof').plural, 'die Hauptbahnhöfe');
assert.equal(find('der Bauernhof').plural, 'die Bauernhöfe');
assert.equal(find('der Notausgang').plural, 'die Notausgänge');
assert.equal(find('der Zeitpunkt').plural, 'die Zeitpunkte');
assert.ok(!find('das Benzin').plural && !find('die Medizin').plural);
assert.equal(find('die Daten').pluralOnly, true);
assert.equal(find('die Abgase').pluralOnly, true);
assert.equal(find('die Kosten').pluralOnly, true);
assert.ok(words.some(word => canonical(word) === 'die Bank' && word.meaning === 'bank'));
assert.ok(words.some(word => canonical(word) === 'die Bank' && word.meaning === 'bench'));
const translations = JSON.parse(fs.readFileSync('wordbooks/zh-CN.json', 'utf8'));
for (const word of words) {
  for (const text of [word.meaning, word.translation]) assert.ok(Object.hasOwn(translations, text) && /[\u3400-\u9fff]/u.test(translations[text]), `${word.id}: ${text}`);
}
context.translations=translations;
vm.runInContext('CHINESE_VOCABULARY = translations; uiLanguage = "zh";',context);
assert.equal(vm.runInContext('t("Goethe-Institut B1 level")',context),'歌德 B1 词库');
context.books=books;
vm.runInContext('WORDBOOKS=books;state.selectedWordbookId="goethe-a2";',context);
const a2Key=vm.runInContext('recordKey("die-bank")',context);
vm.runInContext('state.selectedWordbookId="goethe-b1";',context);
assert.notEqual(vm.runInContext('recordKey("die-bank")',context),a2Key);
console.log(`B1: ${words.length} cards; all ${entries.length} source terms covered, local Chinese translations, plurals and separate progress passed.`);
