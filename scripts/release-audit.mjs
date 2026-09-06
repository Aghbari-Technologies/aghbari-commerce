import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'package.json',
  'package-lock.json',
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

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const lockPath = join(root, 'package-lock.json');
if (existsSync(lockPath)) {
  try {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    if (lock.lockfileVersion !== 3) fail(`package-lock.json must use lockfileVersion 3 (found ${lock.lockfileVersion}).`);
    const rootPackage = lock.packages?.[''];
    if (!rootPackage) fail('package-lock.json is missing its root package entry.');
    if (rootPackage?.name !== pkg.name) fail(`Lockfile root name mismatch: ${rootPackage?.name} !== ${pkg.name}`);
    if (rootPackage?.version !== pkg.version) fail(`Lockfile root version mismatch: ${rootPackage?.version} !== ${pkg.version}`);
    for (const section of ['dependencies', 'devDependencies']) {
      for (const [name, version] of Object.entries(pkg[section] ?? {})) {
        const locked = rootPackage?.[section]?.[name];
        if (locked !== version) fail(`Lockfile ${section} mismatch for ${name}: ${locked} !== ${version}`);
      }
    }
  } catch (error) {
    fail(`package-lock.json is not valid JSON: ${error.message}`);
  }
}

const sourceRoot = join(root, 'src');
const ignoredNames = new Set(['node_modules', 'dist', '.git']);
const suspiciousPatterns = [
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bplaceholder\b/i,
  /\bnot\s+implemented\b/i,
  /\bnotimplemented\b/i,
  /\b(?:mock|fake|sample)\s+(?:data|api|response|success)\b/i,
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

const sourceFiles = walk(sourceRoot).filter((file) => /\.(?:ts|tsx|js|mjs|css|html)$/.test(file));
for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  const rel = relative(root, file).replaceAll('\\', '/');
  if (legacyBrandPattern.test(text)) fail(`Legacy branding found in executable source: ${rel}`);
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text) && !/(?:\.test\.|tests?\/)/i.test(rel)) {
      fail(`Suspicious completion/mock marker ${pattern} found in executable source: ${rel}`);
    }
  }
}

for (const file of ['index.html', 'manifest.webmanifest', 'vercel.json', '.env.example']) {
  const path = join(root, file);
  if (!existsSync(path)) continue;
  const text = readFileSync(path, 'utf8');
  if (legacyBrandPattern.test(text)) fail(`Legacy branding found in release artifact: ${file}`);
}

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

const migrationRoot = join(root, 'supabase', 'migrations');
const migrationText = walk(migrationRoot)
  .filter((file) => file.endsWith('.sql'))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
const rpcCalls = new Set();
for (const file of sourceFiles.filter((path) => /\.(?:ts|tsx|js|mjs)$/.test(path))) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\.rpc\(\s*['"]([a-z0-9_]+)['"]/gi)) rpcCalls.add(match[1]);
}
const missingRpcs = [...rpcCalls].filter((name) => {
  const functionPattern = new RegExp(`(?:create|replace)\\s+function\\s+(?:public\\.)?${name}\\s*\\(`, 'i');
  return !functionPattern.test(migrationText);
});
for (const name of missingRpcs) fail(`RPC contract missing from migration history: ${name}`);

if (failures.length) {
  console.error('RELEASE AUDIT: FAIL');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log('RELEASE AUDIT: PASS');
console.log(`Checked required files: ${requiredFiles.length + requiredWorkflows.length}`);
console.log(`Checked ${rpcCalls.size} literal frontend RPC contracts against migration history.`);
console.log('Checked lockfile/package manifest synchronization.');
console.log('Checked executable source and release artifacts for legacy branding and suspicious completion/mock markers.');
