const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const storage = new Map();
const element = () => ({
  addEventListener() {},
  classList: {add() {}, remove() {}, toggle() {}},
  dataset: {},
  querySelectorAll: () => [],
  setAttribute() {},
  textContent: '',
  innerHTML: '',
  disabled: false,
  className: ''
});
const context = vm.createContext({
  document: {
    querySelector: () => element(),
    querySelectorAll: () => [],
    documentElement: {lang: 'en'},
    body: {classList: {add() {}, remove() {}}}
  },
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  },
  fetch: async () => { throw new Error('Unexpected fetch'); }
});
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8')
  .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
  .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);

async function run() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'wordbooks/manifest.json'), 'utf8'));
  const unit8 = manifest.find(book => book.id === 'custom-unit-8');
  const unit9 = manifest.find(book => book.id === 'custom-unit-9');
  assert.deepEqual(
    [unit8.rangeStart, unit8.rangeCount, unit8.cardCount],
    [0, 42, 42],
    'Unit 8 must expose the first 42 cards'
  );
  assert.deepEqual(
    [unit9.rangeStart, unit9.rangeCount, unit9.cardCount],
    [42, 49, 49],
    'Unit 9 must expose the final 49 cards'
  );

  context.manifest = manifest;
  const normalized = JSON.parse(vm.runInContext('JSON.stringify(manifest.map(normalizeWordbook).filter(Boolean))', context));
  context.normalized = normalized;
  const withAll = JSON.parse(vm.runInContext('JSON.stringify(withCustomAggregate(normalized))', context));
  assert.equal(withAll.filter(book => book.id === 'custom-all').length, 1);
  assert.equal(withAll[0].aggregate, true);
  assert.equal(withAll[0].cardCount, 91);

  context.units = [
    {id: 'custom-alpha', title: 'Alpha', group: 'custom', text: 'die Bank | bench | Die Bank ist frei. | The bench is free.'},
    {id: 'custom-beta', title: 'Beta', group: 'custom', text: 'die Bank | bank | Die Bank ist offen. | The bank is open.'}
  ];
  const duplicateCards = JSON.parse(await vm.runInContext(`(async () => JSON.stringify([
    ...await loadUnitWords(units[0]),
    ...await loadUnitWords(units[1])
  ]))()`, context));
  assert.equal(duplicateCards.length, 2);
  assert.deepEqual(duplicateCards.map(word => word.id), ['die-bank', 'die-bank']);
  assert.deepEqual(duplicateCards.map(word => word.unitId), ['custom-alpha', 'custom-beta']);

  context.manifestBooks = [{
    id: 'custom-unit-8', title: 'Course Unit 8', url: 'vocabulary.txt', group: 'custom',
    rangeStart: 0, rangeCount: 42, cardCount: 42
  }];
  context.savedBooks = [{
    id: 'ignored-new-id', title: 'course unit 8',
    text: 'lernen | to learn | Ich lerne. | I learn.'
  }];
  const replaced = JSON.parse(vm.runInContext('JSON.stringify(mergeCustomWordbooks(manifestBooks, savedBooks))', context))[0];
  assert.equal(replaced.id, 'custom-unit-8');
  assert.match(replaced.text, /^lernen/);
  assert.equal(replaced.cardCount, 1);
  assert.equal(replaced.rangeStart, 0, 'replacement text starts at its first card');
  assert.equal(replaced.rangeCount, 0, 'replacement text must not keep the old 42-card slice');

  context.aggregateUnits = [
    {id: 'custom-valid', title: 'Valid', group: 'custom', text: 'lernen | to learn | Ich lerne. | I learn.', cardCount: 1},
    {id: 'custom-empty', title: 'Empty', group: 'custom', text: '', cardCount: 0}
  ];
  await vm.runInContext(`(async () => {
    WORDBOOKS = withCustomAggregate(aggregateUnits);
    state.selectedWordbookId = 'custom-all';
    await loadSelectedWordbook();
  })()`, context);
  assert.equal(vm.runInContext('WORDS.length', context), 1, 'a bad unit must not discard valid aggregate cards');
  assert.equal(vm.runInContext('WORDS[0].unitId', context), 'custom-valid');

  vm.runInContext(`
    state.records = {
      'custom::lernen': {seen: true, strength: 8, dueAt: 123, correct: 4, wrong: 1},
      'arbeiten': {seen: true, strength: 6, dueAt: 456, correct: 2, wrong: 0}
    };
    legacyPrefixedWord = {id: 'lernen', unitId: 'custom-unit-8', legacyId: 'custom'};
    legacyBareWord = {id: 'arbeiten', unitId: 'custom-unit-9', legacyId: 'custom'};
  `, context);
  assert.equal(vm.runInContext('getRecord(legacyPrefixedWord).strength', context), 8);
  assert.equal(vm.runInContext("state.records['custom-unit-8::lernen'].correct", context), 4);
  assert.equal(vm.runInContext('getRecord(legacyBareWord).strength', context), 6);
  assert.equal(vm.runInContext("state.records['custom-unit-9::arbeiten'].correct", context), 2);

  context.fetch = async () => ({ok: true, json: async () => manifest});
  await vm.runInContext(`(async () => {
    state.selectedWordbookId = 'custom';
    await loadWordbooks();
  })()`, context);
  assert.equal(vm.runInContext('state.selectedWordbookId', context), 'custom-all');
  assert.equal(vm.runInContext("WORDBOOKS.filter(book => book.id === 'custom-all').length", context), 1);

  console.log('Custom TXT units, dynamic aggregate, replacement and progress migration: passed');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
