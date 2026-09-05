import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'playwright.config.ts',
  '.env.example',
  'vercel.json',
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/lib/supabase.ts',
  'supabase/config.toml',
];

const requiredWorkflows = [
  '.github/workflows/application-quality.yml',
  '.github/workflows/runtime-e2e.yml',
  '.github/workflows/security-audit.yml',
  '.github/workflows/supabase-migration-proof.yml',
];

const failures = [];
function fail(message) { failures.push(message); }

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) fail(`Missing required release file: ${file}`);
}
for (const file of requiredWorkflows) {
  if (!existsSync(join(root, file))) fail(`Missing required workflow: ${file}`);
}

if (!existsSync(join(root, 'package-lock.json'))) {
  fail('package-lock.json is missing; reproducible npm ci installation is not yet possible.');
}

const sourceRoot = join(root, 'src');
const ignoredNames = new Set(['node_modules', 'dist', '.git']);
const suspiciousPatterns = [
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bplaceholder\b/i,
  /\bnot\s+implemented\b/i,
  /\bnotimplemented\b/i,
];
const legacyBrandPattern = /العامري|\bAlamri\b|\bAl-Amri\b/i;

function walk(dir) {
  if (!existsSync(dir)) return [];
  const result = [];
  for (const entry of readdirSync(dir)) {
    if (ignoredNames.has(entry)) continue;
    const path = join(dir, entry);
    const info = statSync(path);
    if (info.isDirectory()) result.push(...walk(path));
    else result.push(path);
  }
  return result;
}

for (const file of walk(sourceRoot)) {
  if (!/\.(?:ts|tsx|js|mjs|css|html)$/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  const rel = relative(root, file).replaceAll('\\', '/');
  if (legacyBrandPattern.test(text)) fail(`Legacy branding found in executable source: ${rel}`);
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text) && !/(?:\.test\.|tests?\/)/i.test(rel)) {
      fail(`Suspicious completion marker ${pattern} found in executable source: ${rel}`);
    }
  }
}

// Product identity must remain clean in the shipped HTML/PWA/config artifacts too.
for (const file of ['index.html', 'manifest.webmanifest', 'vercel.json', '.env.example']) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8');
  if (legacyBrandPattern.test(text)) fail(`Legacy branding found in release artifact: ${file}`);
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
for (const script of ['test', 'lint', 'build', 'test:e2e', 'test:release-audit', 'typecheck']) {
  if (!pkg.scripts?.[script]) fail(`Missing package script: ${script}`);
}
if (pkg.engines?.node !== '>=22 <23') {
  fail('Node runtime contract must remain pinned to >=22 <23.');
}

const envExample = readFileSync(join(root, '.env.example'), 'utf8');
for (const key of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY']) {
  if (!new RegExp(`^${key}=`, 'm').test(envExample)) fail(`Missing environment key in .env.example: ${key}`);
}

if (failures.length) {
  console.error('RELEASE AUDIT: FAIL');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log('RELEASE AUDIT: PASS');
console.log(`Checked required files: ${requiredFiles.length + requiredWorkflows.length}`);
console.log('Checked executable source and release artifacts for legacy branding and suspicious completion markers.');
