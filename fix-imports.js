const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = '/Users/appdev/dev/jerur-next';
const exts = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];

function resolveAtPath(atPath) {
  const candidates = [
    path.join(root, atPath),
    path.join(root, 'src', atPath),
    path.join(root, 'app', atPath),
    path.join(root, 'app/api', atPath),
  ];
  for (const base of candidates) {
    for (const ext of exts) {
      if (fs.existsSync(base + ext)) return base;
    }
  }
  return null;
}

function relPath(fromFile, absTarget) {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, absTarget);
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

const files = execSync(
  `find ${root}/src ${root}/app ${root}/lib ${root}/hooks ${root}/utils ${root}/validator ${root}/Store -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null`
).toString().trim().split('\n').filter(Boolean);

let changed = 0;
const unresolved = new Set();

for (const file of files) {
  let content;
  try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
  // handle both single and double quoted @/ imports
  if (!content.includes("'@/") && !content.includes('"@/')) continue;
  const orig = content;

  // Fix single-quoted
  content = content.replace(/from '@\/([^']+)'/g, (match, atPath) => {
    const abs = resolveAtPath(atPath);
    if (!abs) { unresolved.add(`@/${atPath}  (${file.replace(root+'/','')}`); return match; }
    return `from '${relPath(file, abs)}'`;
  });
  // Fix double-quoted
  content = content.replace(/from "@\/([^"]+)"/g, (match, atPath) => {
    const abs = resolveAtPath(atPath);
    if (!abs) { unresolved.add(`@/${atPath}  (${file.replace(root+'/','')}`); return match; }
    return `from "${relPath(file, abs)}"`;
  });
  // Fix dynamic import single-quoted
  content = content.replace(/import\('@\/([^']+)'\)/g, (match, atPath) => {
    const abs = resolveAtPath(atPath);
    if (!abs) { unresolved.add(`@/${atPath}  (${file.replace(root+'/','')}`); return match; }
    return `import('${relPath(file, abs)}')`;
  });

  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('Fixed:', file.replace(root + '/', ''));
  }
}

console.log('\nTotal files fixed:', changed);
if (unresolved.size) {
  console.log('\nUnresolved:');
  [...unresolved].sort().forEach(u => console.log(' ', u));
}
