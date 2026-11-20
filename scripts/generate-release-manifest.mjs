// scripts/generate-release-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function getLisbonDateParts() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Lisbon',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  return {
    ptDate: `${parts.day}/${parts.month}/${parts.year}`,
    ymd: `${parts.year}${parts.month}${parts.day}`,
    isoDate: `${parts.year}-${parts.month}-${parts.day}`
  };
}

function cleanCommitMessage(msg) {
  const stripped = msg.replace(/^(feat|fix|refactor|perf|security|chore|docs|style|test)(\([^)]+\))?:\s*/i, '').trim();
  if (!stripped) return '';
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function buildDeltaChangelog() {
  const headTags = new Set(runGit('git tag --points-at HEAD').split(/\r?\n/).filter(Boolean));
  const allReleaseTags = runGit('git tag --sort=-creatordate -l "v*"').split(/\r?\n/).filter(Boolean);
  const previousTag = allReleaseTags.find((tag) => !headTags.has(tag)) || '';

  const logCmd = previousTag
    ? `git log ${previousTag}..HEAD --pretty=format:%s`
    : 'git log -n 15 --pretty=format:%s';
  const rawSubjects = runGit(logCmd).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

  const prioritized = rawSubjects.filter((s) => /^(feat|fix|perf|security|refactor)(\([^)]+\))?:/i.test(s));
  const pool = prioritized.length > 0 ? prioritized : rawSubjects;
  const seen = new Set();
  const items = [];
  for (const line of pool) {
    const clean = cleanCommitMessage(line);
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      items.push(clean);
      if (items.length >= 8) break;
    }
  }
  return items.length > 0 ? items : ['Melhorias de estabilidade, desempenho e conformidade técnica.'];
}

const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
const releaseBase = String(pkg.releaseBase || '1.001').trim();
const envRaw = (process.env.VITE_DATERRA_ENV || '').toLowerCase();
const envType = ['dev', 'rc', 'pages', 'prod'].includes(envRaw)
  ? envRaw
  : (process.env.DEPLOY_TARGET === 'cpanel' ? 'prod' : 'pages');

const { ptDate, ymd, isoDate } = getLisbonDateParts();
const commitsToday = Number(runGit(`git rev-list --count --since="${isoDate} 00:00:00" HEAD`)) || 1;
const commitHash = runGit('git rev-parse --short HEAD') || 'local';

const manifest = {
  name: 'DATERRA Smart',
  releaseBase,
  envType,
  version: `${releaseBase}-${envType}`,
  releaseDate: ptDate,
  buildNumber: `${ymd}.${commitsToday}`,
  commitHash,
  canonicalPagesTag: `v${releaseBase}-pages`,
  canonicalRcTag: `v${releaseBase}-rc`,
  canonicalProdTag: `v${releaseBase}-prod`,
  changelog: buildDeltaChangelog()
};

const outPath = path.resolve('src/config/releaseManifest.generated.json');
fs.writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`[release-manifest] ${manifest.version} (${manifest.commitHash}) · ${manifest.changelog.length} novidades.`);
