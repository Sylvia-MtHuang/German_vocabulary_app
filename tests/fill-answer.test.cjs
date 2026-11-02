const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');

test('fill answers accept the displayed noun with its article as well as the bare word', () => {
  const element = {addEventListener() {}};
  const context = vm.createContext({document: {querySelector: () => element}, localStorage: {getItem: () => null}});
  const source = fs.readFileSync('app.js', 'utf8')
    .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
    .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
  vm.runInContext(source, context);
  const results = vm.runInContext(`(() => {
    let submit, result;
    const input = {value:'', focus(){}};
    cardContent.querySelector = selector => selector === '.fill-input' ? input : {addEventListener(type, fn){submit=fn}};
    checkQuiz = correct => {result=correct};
    renderFillQuiz({word:'Snack', article:'der', meaning:'snack', example:'Ein Snack.', translation:'A snack.'});
    return ['der Snack', 'Snack', 'die Snack'].map(value => {
      input.value=value; submit({preventDefault(){}}); return result;
    });
  })()`, context);
  assert.deepEqual(Array.from(results), [true, true, false]);
});
