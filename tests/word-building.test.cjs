const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const element = {addEventListener() {}};
const context = vm.createContext({document: {querySelector: () => element}, localStorage: {getItem: () => null}});
const source = fs.readFileSync('app.js', 'utf8').replace(/let state = loadState\(\);/, 'let state = createDefaultState();').replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);
for (const [term, hint] of [['das Geld (Sg.)', 'Forms: das Geld (Sg.)'], ['sportlich', 'Forms: sportlich'], ['die Handtasche', 'in der Handtasche means in the handbag. Forms: die Handtasche, -n']]) {
  context.line = `${term} | meaning | Beispiel. | Example. | memory=${hint}`;
  assert.equal(vm.runInContext('memoryAidMarkup(parseVocabulary(line)[0])', context), '', term);
  const card = vm.runInContext('previewMarkup({word: parseVocabulary(line)[0], phase: "learn"})', context);
  assert.doesNotMatch(card, /class="memory-aid"/, term);
  assert.match(card, /Beispiel\./, term);
}
context.line = 'der Einkaufswagen | shopping cart | Beispiel. | Example.';
assert.match(vm.runInContext('memoryAidMarkup(parseVocabulary(line)[0])', context), /einkaufen/);
context.line = 'Testwort | test | Beispiel. | Example. | memory=Think of a test.';
assert.match(vm.runInContext('memoryAidMarkup(parseVocabulary(line)[0])', context), /Think of a test/);
console.log('Word-building hints: redundant legacy notes hidden; meaningful and custom hints preserved.');
