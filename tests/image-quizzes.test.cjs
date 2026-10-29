const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');

function app() {
  const element = {addEventListener() {}};
  const context = vm.createContext({document: {querySelector: () => element}, localStorage: {getItem: () => null}});
  const source = fs.readFileSync('app.js', 'utf8')
    .replace(/let state = loadState\(\);/, 'let state = createDefaultState();')
    .replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/, '');
  vm.runInContext(source, context);
  vm.runInContext(`WORDS = [
    {id:'apple', word:'Apfel', article:'der', pos:'noun', meaning:'apple', imagePath:'apple.png'},
    {id:'dog', word:'Hund', article:'der', pos:'noun', meaning:'dog', imagePath:'dog.png'},
    {id:'chair', word:'Stuhl', article:'der', pos:'noun', meaning:'chair', imagePath:'chair.png'},
    {id:'car', word:'Auto', article:'das', pos:'noun', meaning:'car', imagePath:'car.png'}
  ];`, context);
  return expression => vm.runInContext(expression, context);
}

test('fully eligible nouns sample five equally sized random buckets; text fallback stays eligible', () => {
  const run = app();
  const types = run(`JSON.stringify([.01,.21,.41,.61,.81].map(n => { Math.random = () => n; return chooseQuizType(WORDS[0]); }))`);
  assert.deepEqual(JSON.parse(types), ['meaning','article','fill','word-image','image-word']);
  assert.equal(run('Math.random=()=>.99; chooseQuizType(WORDS[0], false)'), 'fill');
  assert.equal(run('WORDS[0].imagePath=""; chooseQuizType(WORDS[0])'), 'fill');
});

test('image choices deduplicate picture paths, bare words and meanings, without folding umlauts', () => {
  const run = app();
  run(`WORDS.push(
    {...WORDS[0], id:'apple-copy', imagePath:'copy.png'},
    {id:'homograph', word:'Apfel', article:'die', pos:'noun', meaning:'different', imagePath:'other.png'},
    {id:'same-image', word:'Foto', imagePath:'apple.png'},
    {id:'synonym', word:'Frucht', meaning:'apple', imagePath:'fruit.png'},
    {id:'umlaut', word:'Äpfel', meaning:'apples', imagePath:'apples.png'}
  ); item={word:WORDS[0], quizType:'image-word'};`);
  const choices = JSON.parse(run('JSON.stringify(getImageChoices(item))'));
  assert.equal(choices.length,4);
  assert.equal(choices.filter(w=>w.id==='apple').length,1);
  assert.ok(choices.every(w=>!['apple-copy','homograph','same-image','synonym'].includes(w.id)));
  assert.equal(run('getImageChoices(item) === getImageChoices(item)'),true);
  run('WORDS = [WORDS[0], WORDS[1], WORDS[2], WORDS[8]];');
  assert.ok(JSON.parse(run('JSON.stringify(getImageChoices({word:WORDS[0]}))')).some(w=>w.word==='Äpfel'));
});

test('short image pools and failed image paths exclude both image types; non-nouns have no article quiz', () => {
  const run = app();
  assert.equal(run('Math.random=()=>.99; WORDS[0].pos="word"; WORDS[0].article=""; chooseQuizType(WORDS[0])'),'image-word');
  assert.equal(run('chooseQuizType(WORDS[0],false)'),'fill');
  assert.equal(run('failedQuizImages.add("dog.png"); chooseQuizType(WORDS[0])'),'fill');
  assert.equal(run('getImageChoices({word:WORDS[0]}).length'),0);
});

test('image-word markup and preview contain article-free labels and generic image alternatives', () => {
  const run = app();
  run('item={word:WORDS[0],phase:"quiz",quizType:"image-word"};');
  const markup = run('imageQuizMarkup(item, false)');
  assert.ok(markup.includes('>Apfel<'));
  assert.ok(!/der Apfel|der Hund|der Stuhl|das Auto/.test(markup));
  assert.ok(!/apple\.png[^>]*alt="[^"]*Apfel/.test(markup));
  assert.ok(!markup.includes('speak-button'));
  const preview=run('previewMarkup(item)');
  assert.ok(preview.includes('>Apfel<'));
  assert.ok(!preview.includes('der Apfel'));
  assert.equal(run('item.quizType="word-image"; imageQuizMarkup(item, false).includes("der Apfel")'),true);
});
