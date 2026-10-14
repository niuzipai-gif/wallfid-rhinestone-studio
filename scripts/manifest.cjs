// File-integrity inventory. Run --write after intentional release changes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const excluded = new Set(['.git', 'node_modules', '__pycache__', '.DS_Store']);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (excluded.has(e.name) || /^\.env(?:\.|$)/.test(e.name) || e.name.endsWith('.log')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const actual = Object.fromEntries(walk(root)
  .filter(p => p !== path.join(root, 'release-manifest.json'))
  .map(p => [path.relative(root, p).split(path.sep).join('/'), crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])
  .sort((a, b) => a[0].localeCompare(b[0], 'en')));
const target = path.join(root, 'release-manifest.json');
if (process.argv.includes('--write')) {
  fs.writeFileSync(target, JSON.stringify(actual, null, 2) + '\n');
  console.log(`Updated release manifest: ${Object.keys(actual).length} files.`);
} else {
  const expected = JSON.parse(fs.readFileSync(target, 'utf8'));
  assert.deepEqual(actual, expected, 'Release inventory changed; review changes and run npm run manifest.');
  console.log(`PASS: ${Object.keys(actual).length} release file hashes match.`);
}
