const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const assetRoot = path.join(root, 'assets/vocab-images');
const batch = JSON.parse(fs.readFileSync(path.join(assetRoot, 'custom-schritte-plus-b1-2-revisions-20261020.json'), 'utf8'));

assert.equal(batch.status, 'approved');
assert.equal(batch.approvalScope, 'publish');
assert.equal(batch.approvedOn, '2026-10-20');
assert.equal(batch.items.length, 15);

const images = batch.items.filter(item => item.action !== 'text-only');
const textOnly = batch.items.filter(item => item.action === 'text-only');
assert.equal(images.length, 13);
assert.deepEqual(textOnly.map(item => item.id).sort(), ['duzen', 'siezen']);
assert.ok(images.every(item => item.originalFile && item.file && item.generated && item.reviewed));

const manifest = new Map(JSON.parse(fs.readFileSync(path.join(assetRoot, 'manifest.json'), 'utf8')).map(item => [item.id, item.file]));
for (const item of images) assert.equal(manifest.get(item.id), item.file, `published mapping: ${item.id}`);
for (const item of textOnly) assert.ok(!manifest.has(item.id), `text-only mapping: ${item.id}`);

const hashes = new Set();
for (const item of images) {
  const png = fs.readFileSync(path.join(assetRoot, item.file));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', item.id);
  assert.equal(png.readUInt32BE(16), png.readUInt32BE(20), `${item.id} must be square`);
  assert.ok(png.readUInt32BE(16) >= 1024, item.id);
  const hash = crypto.createHash('sha256').update(png).digest('hex');
  assert.ok(!hashes.has(hash), `duplicate revision: ${item.id}`);
  hashes.add(hash);
}

const guide = fs.readFileSync(path.join(root, 'IMAGE_PROMPTS.md'), 'utf8');
assert.match(guide, /Direct feedback revision workflow/);
assert.match(guide, /complete person or group/);
assert.match(guide, /green bubble/);
assert.match(guide, /duzen.*siezen.*text-only/s);

console.log('Schritte PLUS B1.2 feedback revisions: 13 reviewed images, 2 text-only entries, and durable preferences passed.');
