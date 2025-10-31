// scripts/generate-manifest.mjs
// Genera manifest.json ({ path, size, sha1 }) y src_index.md (árbol con links RAW pinneados al commit actual).
// Uso: node scripts/generate-manifest.mjs
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const REPO_USER = 'l0339831';
const REPO_NAME = 'midinerocrece_v5';

const EXCLUDES = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.idea',
  '.DS_Store',
  '.turbo',
  '.next',
]);

async function sha1File(absPath) {
  const data = await fs.readFile(absPath);
  const h = createHash('sha1');
  h.update(data);
  return h.digest('hex');
}

async function walk(dir, baseDir) {
  const out = [];
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const it of items) {
    if (EXCLUDES.has(it.name)) continue;
    const abs = path.join(dir, it.name);
    const rel = path.relative(baseDir, abs).replace(/\\/g, '/');
    if (it.isDirectory()) {
      out.push(...await walk(abs, baseDir));
    } else if (it.isFile()) {
      const stat = await fs.stat(abs);
      out.push({ path: rel, size: stat.size, abs });
    }
  }
  return out;
}

async function main() {
  const root = process.cwd();
  let rev = 'main';
  try {
    rev = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch { /* fallback main */ }

  const files = await walk(root, root);

  // Build manifest entries
  const entries = [];
  for (const f of files) {
    const sha1 = await sha1File(f.abs);
    entries.push({ path: f.path, size: f.size, sha1 });
  }
  entries.sort((a, b) => a.path.localeCompare(b.path));

  // Write manifest.json
  const manifest = { repo: `${REPO_USER}/${REPO_NAME}`, commit: rev, generatedAt: new Date().toISOString(), files: entries };
  await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // Build src_index.md
  // Group by directory to render a simple tree with RAW links pinned to commit
  const lines = [];
  lines.push('# src_index.md');
  lines.push('');
  lines.push(`Repositorio: ${REPO_USER}/${REPO_NAME}`);
  lines.push(`Commit: \`${rev}\``);
  lines.push('');
  lines.push('> Índice auto-generado con enlaces RAW al commit actual.');
  lines.push('');

  // Render simple tree (directories collapsed into headings)
  const byDir = new Map();
  for (const e of entries) {
    const dir = path.posix.dirname(e.path);
    const name = path.posix.basename(e.path);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir).push({ name, path: e.path });
  }

  const sortedDirs = Array.from(byDir.keys()).sort();
  for (const dir of sortedDirs) {
    lines.push(`## ${dir === '.' ? 'root' : dir}`);
    const filesInDir = byDir.get(dir).sort((a, b) => a.name.localeCompare(b.name));
    for (const f of filesInDir) {
      const raw = `https://raw.githubusercontent.com/${REPO_USER}/${REPO_NAME}/${rev}/${encodeURI(f.path)}`;
      lines.push(`- [${f.name}](${raw})`);
    }
    lines.push('');
  }

  await fs.writeFile(path.join(root, 'src_index.md'), lines.join('\n'), 'utf8');

  console.log('OK: manifest.json y src_index.md generados.');
}

main().catch(err => {
  console.error('ERROR generate-manifest:', err);
  process.exit(1);
});
