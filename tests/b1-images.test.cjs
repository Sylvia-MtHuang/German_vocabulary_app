const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const b=JSON.parse(fs.readFileSync('assets/vocab-images/b1-image-prompts-100-20261004.json','utf8'));
assert.equal(b.status,'approved');assert.equal(b.approvalScope,'publish');assert.equal(b.items.length,100);
const ctx=vm.createContext({document:{querySelector:()=>({addEventListener(){}})},localStorage:{getItem:()=>null}});
vm.runInContext(fs.readFileSync('app.js','utf8').replace(/let state = loadState\(\);/,'let state = createDefaultState();').replace(/loadVoices\(\);\s*syncCountPicker\(\);\s*loadVocabulary\(\);\s*$/,''),ctx);
ctx.images=JSON.parse(fs.readFileSync('assets/vocab-images/manifest.json','utf8'));vm.runInContext('IMAGE_PATHS=parseImageManifest(images);',ctx);
ctx.text=fs.readFileSync('wordbooks/goethe-b1.txt','utf8');const words=vm.runInContext('parseVocabulary(text)',ctx),byId=new Map(words.map(w=>[w.id,w]));
const ids=new Set(),files=new Set(),hashes=new Set();
for(const i of b.items){
 assert(i.generated&&i.reviewed,i.term);assert(!ids.has(i.id));ids.add(i.id);assert(!files.has(i.file));files.add(i.file);
 const word=byId.get(i.id);assert(word,i.id);assert.equal(word.imagePath,'assets/vocab-images/'+i.file);assert.equal(i.term,word.article+' '+word.word);assert.equal(i.meaning,word.meaning);assert.equal(i.color,{der:'blue',die:'pink',das:'green'}[word.article]);
 const png=fs.readFileSync(word.imagePath);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(png.readUInt32BE(16),png.readUInt32BE(20));assert(png.readUInt32BE(16)>=1024);
 const hash=crypto.createHash('sha256').update(png).digest('hex');assert(!hashes.has(hash));hashes.add(hash);
}
assert.equal(hashes.size,100);console.log('100 approved B1 images: actual parser bindings, article hues, square dimensions and unique files/hashes passed. B1 total illustrated cards: '+words.filter(w=>w.imagePath).length);
