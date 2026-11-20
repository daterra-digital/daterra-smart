// scripts/clean-release-bundle.mjs
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const indexHtml = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtml)) {
  console.error('[clean-release-bundle] Erro: dist/index.html não encontrado.');
  process.exit(1);
}

const generatedManifest = path.resolve('src/config/releaseManifest.generated.json');
if (fs.existsSync(generatedManifest)) {
  fs.copyFileSync(generatedManifest, path.join(distDir, 'release-manifest.json'));
}

const envRaw = (process.env.VITE_DATERRA_ENV || '').toLowerCase();
const envType = ['dev', 'rc', 'pages', 'prod'].includes(envRaw)
  ? envRaw
  : (process.env.DEPLOY_TARGET === 'cpanel' ? 'prod' : 'pages');

const ALLOWED_ROOT_FILES = new Set([
  'index.html',
  'manifest.webmanifest',
  'registerSW.js',
  'sw.js',
  'release-manifest.json',
  'favicon.ico',
  'favicon.svg',
  'daterra-favicon.png',
  'apple-touch-icon.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'icon-daterra-mono.png',
  'icon-daterra-light.png',
  'icon-daterra-dark.png',
  'icons.svg',
  'daterra-logo.svg',
  'daterra-smart-logo.svg'
]);

if (envType === 'pages') ALLOWED_ROOT_FILES.add('404.html');
if (envType === 'prod') ALLOWED_ROOT_FILES.add('.htaccess');

function isAllowedRootFile(name) {
  return ALLOWED_ROOT_FILES.has(name) || /^workbox-[A-Za-z0-9_-]+\.js$/.test(name);
}

let removedCount = 0;
function cleanDir(dir, relPrefix = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (rel === 'assets') {
        cleanDir(full, rel);
      } else {
        fs.rmSync(full, { recursive: true, force: true });
        removedCount++;
      }
      continue;
    }
    if (relPrefix === 'assets') {
      if (entry.name.endsWith('.map') || entry.name.startsWith('.')) {
        fs.rmSync(full, { force: true });
        removedCount++;
      }
      continue;
    }
    if (!isAllowedRootFile(entry.name)) {
      fs.rmSync(full, { force: true });
      removedCount++;
    }
  }
}

cleanDir(distDir);
console.log(`[clean-release-bundle] Ambiente=${envType} · dist/ higienizado (${removedCount} item(ns) removido(s)).`);
