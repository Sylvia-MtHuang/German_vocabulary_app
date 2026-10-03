const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const element = {addEventListener() {}};
const context = vm.createContext({document: {querySelector: () => element}, localStorage: {getItem: () => null}});
const source = fs.readFileSync('app.js', 'utf8')
  .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
  .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
vm.runInContext(source, context);
// A real learning-card renderer must use translated text, with canonical English retained.
context.word = {word: 'Bank', article: 'die', meaning: 'bench', example: 'Wir sitzen auf einer Bank.', translation: 'We sit on a bench.'};
vm.runInContext('uiLanguage = "zh";', context);
const markup = vm.runInContext('previewMarkup({word, phase: "learn"})', context);
assert.ok(markup.includes('data-i18n="bench"'), 'Learning meanings must participate in language switching');
assert.ok(markup.includes('data-i18n="We sit on a bench."'), 'Example translations must participate in language switching');
context.translations = JSON.parse(fs.readFileSync('wordbooks/zh-CN.json', 'utf8'));
vm.runInContext('CHINESE_VOCABULARY = translations;', context);
assert.equal(vm.runInContext('t("bench")', context), '长椅');
assert.equal(vm.runInContext('t("bank")', context), '银行');
assert.equal(vm.runInContext('t("Correct answer: {answer}", {answer: "bench"})', context), '正确答案：长椅');
assert.equal(vm.runInContext('t("constructor")', context), 'constructor');
assert.equal(vm.runInContext('t("cold", {term: "Erkältung"})', context), '感冒');
assert.equal(vm.runInContext('t("cold", {term: "kalt"})', context), '寒冷的');
assert.equal(vm.runInContext('t("back", {term: "Rücken"})', context), '背部');
assert.equal(vm.runInContext('t("back", {term: "zurück"})', context), '回来；返回');
assert.equal(vm.runInContext('t("The train departs at quarter to seven.")', context), '火车六点四十五分出发。');
assert.equal(vm.runInContext('t("Is this seat free?")', context), '这个座位有人坐吗？');
const books = JSON.parse(fs.readFileSync('wordbooks/manifest.json', 'utf8'));
let count = 0;
for (const book of books) {
  context.text = fs.readFileSync(book.url, 'utf8');
  const words = vm.runInContext('parseVocabulary(text)', context);
  context.words = words;
  vm.runInContext("WORDS = words;", context);
  for (const word of words) {
    context.probe = word;
    const labels = vm.runInContext("getMeaningChoices({word: probe}).map(choice => t(choice, {term: choice === probe.meaning ? probe.word : WORDS.find(item => item.meaning === choice)?.word}))", context);
    assert.equal(new Set(labels).size, 4, `Distinct Chinese meaning choices: ${book.id}: ${word.id}`);
    for (const text of [word.meaning, word.translation, ...word.memoryAid.map(part => part[1] || part[0])]) {
      if (text) assert.ok(Object.hasOwn(context.translations, text) && /[\u3400-\u9fff]/u.test(context.translations[text]), `${book.id}: ${word.id}: ${text}`);
    }
    count++;
  }
}
context.fixture = ['problem', 'question', 'chair', 'table', 'glass'].map(meaning => context.words.find(word => word.meaning === meaning));
const fixtureLabels = vm.runInContext(`(() => { const original = Math.random; const originalWords = WORDS; try { Math.random = () => .9999; WORDS = fixture; return getMeaningChoices({word: fixture[0]}).map(choice => t(choice, {term: WORDS.find(item => item.meaning === choice).word})); } finally { Math.random = original; WORDS = originalWords; } })()`, context);
assert.equal(new Set(fixtureLabels).size, 4, 'Problem and question must not both appear as identical Chinese choices');
vm.runInContext('uiLanguage = "en";', context);
assert.equal(vm.runInContext('t("bench")', context), 'bench');
console.log(`Chinese meanings, example translations and memory hints cover ${count} entries; English and separate Bank senses preserved.`);
