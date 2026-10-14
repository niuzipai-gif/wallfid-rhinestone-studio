// Portable checks for a clean checkout; no npm installation is needed.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
process.chdir(root);
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, args.join(' '));
}
const entries = fs.readdirSync(root);
for (const file of entries.filter(f => f.endsWith('.test.cjs')).sort()) run([file]);
for (const file of entries.filter(f => f.endsWith('.js')).sort()) run(['--check', file]);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (['.git', 'node_modules', '__pycache__'].includes(e.name)) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
let checked = 0;
for (const file of walk(root).filter(f => /\.(html|css|md)$/.test(f))) {
  const text = fs.readFileSync(file, 'utf8');
  const refs = [...text.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1]);
  if (file.endsWith('.css')) refs.push(...[...text.matchAll(/url\(\s*["']?([^\s)'";]+)/g)].map(m => m[1]));
  if (file.endsWith('.md')) refs.push(...[...text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)].map(m => m[1]));
  for (const ref of refs) {
    if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(ref)) continue;
    const local = decodeURIComponent(ref.split(/[?#]/)[0]);
    if (!local) continue;
    const target = path.resolve(path.dirname(file), local);
    assert(target.startsWith(root + path.sep), `Reference outside repository: ${ref}`);
    assert(fs.existsSync(target), `Missing reference in ${path.relative(root, file)}: ${ref}`);
    checked++;
  }
}
console.log(`PASS: JavaScript syntax and ${checked} local website/documentation references.`);
