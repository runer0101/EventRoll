#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getStagedFiles() {
  const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
  return out.split(/\r?\n/).filter(Boolean);
}

function walkAllFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', '.git', '.husky'].includes(ent.name)) continue;
      results.push(...walkAllFiles(p));
    } else {
      results.push(path.relative(process.cwd(), p));
    }
  }
  return results;
}

const regexes = [
  /aws[_-]?secret[_-]?access[_-]?key/i,
  /aws[_-]?access[_-]?key/i,
  /aws_account_id/i,
  /-----BEGIN (RSA |)PRIVATE KEY-----/i,
  /-----BEGIN OPENSSH PRIVATE KEY-----/i,
  /ghp_[0-9A-Za-z_]{36}/,
  /GITHUB[_-]?TOKEN/i,
  /\bAPI[_-]?KEY\b\s*[:=]\s*(['"])(?![<`])[^'"\n]{8,}\1/i,
  // Match likely secret assignments with literal values, not runtime variables like token = jwt.sign(...)
  /\b(?:PASSWORD|PASSWD|SECRET|TOKEN)\b\s*[:=]\s*(['"])(?![<`])[^'"\n]{8,}\1/,
  /mongo(db)?(uri)?=|mongodb(?:\+srv)?:\/\//i,
  /-----BEGIN PGP PRIVATE KEY BLOCK-----/i,
];

function checkFile(absPath) {
  const content = fs.readFileSync(absPath, { encoding: 'utf8' });
  const matches = [];
  for (const rx of regexes) {
    const m = content.match(rx);
    if (m) {
      const snippet = m[0];
      // If this is the secret-assignment pattern, ignore common safe cases
      if (rx.toString().includes('PASSWD|SECRET|TOKEN')) {
        if (/process\.env|<REPLACE|`|formulario\.|usuario\.|nuevaPassword|VITE_/i.test(snippet)) continue;
      }
      matches.push({ rx: rx.toString(), snippet });
    }
  }
  return matches;
}

function rel(p) { return path.relative(process.cwd(), p); }

(function main() {
  try {
    const args = process.argv.slice(2);
    const scanAll = args.includes('--scan-all');
    const files = scanAll ? walkAllFiles(process.cwd()) : getStagedFiles();
    if (files.length === 0) {
      console.log(scanAll ? 'No hay archivos para escanear.' : 'No hay archivos en stage.');
      process.exit(0);
    }

    let found = false;
    // Ignore our own security tooling and generated reports to prevent false positives
    const ignoredPaths = [
      '.husky',
      '.gitleaks.toml',
      '.github/workflows',
      'docs/PURGE_HISTORY.md',
      'backend/scripts/check-secrets.cjs',
      'backend/scripts/check-secrets.js',
      'backend/scripts/cambiar-password.js',
      'scripts/generate-scan-report.cjs',
      'scripts/generate-replacements-from-gitleaks.js',
      'README.md',
      'dist/',
      'replacements.txt'
    ];

    for (const f of files) {
      // Normalize path separators to forward slashes so ignores work on Windows
      const nf = f.replace(/\\+/g, '/');
      if (ignoredPaths.some(p => nf.includes(p))) continue;
      if (nf.endsWith('.png') || nf.endsWith('.jpg') || nf.endsWith('.jpeg') || nf.endsWith('.exe') || nf.endsWith('.dll')) continue;
      const abs = path.resolve(process.cwd(), f);
      if (!fs.existsSync(abs)) continue;
      const matches = checkFile(abs);
      if (matches.length > 0) {
        if (!found) console.error('\nSe han detectado posibles secretos en archivos staged:');
        found = true;
        console.error('\n  - ' + rel(abs));
        for (const m of matches) {
          console.error('      patrón: ' + m.rx + ' → "' + m.snippet.replace(/\n/g, ' ') + '"');
        }
      }
    }

    if (found) {
      console.error('\nBloqueando commit. Por favor:');
      console.error('- Elimina los secretos del código y usa variables de entorno o un vault.');
      console.error('- Añade archivos de credenciales a .gitignore.');
      console.error('- Para forzar un commit temporal, usa `git reset HEAD <file>` y re-aplica los cambios sin el secreto.');
      process.exit(1);
    }

    console.log('Chequeo de secretos: OK');
    process.exit(0);

  } catch (err) {
    console.error('Error corriendo el chequeo de secretos:', err.message);
    process.exit(2);
  }
})();