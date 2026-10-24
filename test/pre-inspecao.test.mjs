import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CRITICAL_POINTS_ISO16122 = [
  { id: 'manometro', title: 'Manómetro de Pressão' },
  { id: 'filtros', title: 'Filtros do Circuito' },
  { id: 'tubagens', title: 'Tubagens e Mangueiras' },
  { id: 'bicos', title: 'Bicos e Antigotejo' },
  { id: 'cardan_pto', title: 'Veio Cardan / Proteção PTO' }
];

function evaluateInspecao(answers) {
  const points = CRITICAL_POINTS_ISO16122;
  const totalItems = points.length;

  let conformeCount = 0;
  let anomaliaCount = 0;
  let pendenteCount = 0;

  for (const point of points) {
    const ans = answers[point.id] || 'pendente';
    if (ans === 'conforme') conformeCount++;
    else if (ans === 'anomalia') anomaliaCount++;
    else pendenteCount++;
  }

  const answered = conformeCount + anomaliaCount;
  const conformityPct = Math.round((conformeCount / totalItems) * 100);

  if (anomaliaCount > 0) {
    return {
      totalItems,
      conformeCount,
      anomaliaCount,
      pendenteCount,
      conformityPct,
      status: 'reprovado',
      statusLabel: 'Reprovado com Anomalias',
      alertLevel: 'danger',
      recommendation: `Detetada(s) ${anomaliaCount} anomalia(s) crítica(s). Corrija as peças antes da inspeção IPP oficial.`,
      isValid: answered > 0
    };
  }

  if (pendenteCount === 0) {
    return {
      totalItems,
      conformeCount,
      anomaliaCount,
      pendenteCount,
      conformityPct: 100,
      status: 'aprovado',
      statusLabel: 'Conforme • Aprovado ISO 16122',
      alertLevel: 'success',
      recommendation: 'Pulverizador e depósito em conformidade total com os 5 pontos críticos da norma ISO 16122.',
      isValid: true
    };
  }

  return {
    totalItems,
    conformeCount,
    anomaliaCount,
    pendenteCount,
    conformityPct,
    status: 'atencao',
    statusLabel: 'Em Auditoria • Incompleto',
    alertLevel: 'warning',
    recommendation: `Auditoria em curso: ${conformeCount} de ${totalItems} pontos validados. Conclua os restantes itens.`,
    isValid: answered > 0
  };
}

test('1. Aprovação com 100% de conformidade quando todos os 5 pontos críticos são conformes', () => {
  const answers = {
    manometro: 'conforme',
    filtros: 'conforme',
    tubagens: 'conforme',
    bicos: 'conforme',
    cardan_pto: 'conforme'
  };
  const res = evaluateInspecao(answers);
  assert.equal(res.status, 'aprovado');
  assert.equal(res.conformityPct, 100);
  assert.equal(res.alertLevel, 'success');
  assert.equal(res.anomaliaCount, 0);
  assert.equal(res.isValid, true);
});

test('2. Reprovação imediata se existir pelo menos uma anomalia (ex: Manómetro danificado)', () => {
  const answers = {
    manometro: 'anomalia',
    filtros: 'conforme',
    tubagens: 'conforme',
    bicos: 'conforme',
    cardan_pto: 'conforme'
  };
  const res = evaluateInspecao(answers);
  assert.equal(res.status, 'reprovado');
  assert.equal(res.conformityPct, 80);
  assert.equal(res.anomaliaCount, 1);
  assert.equal(res.alertLevel, 'danger');
  assert.match(res.recommendation, /anomalia/);
});

test('3. Estado de atenção quando a auditoria está incompleta (sem anomalias)', () => {
  const answers = {
    manometro: 'conforme',
    filtros: 'conforme',
    tubagens: 'conforme'
  };
  const res = evaluateInspecao(answers);
  assert.equal(res.status, 'atencao');
  assert.equal(res.conformityPct, 60);
  assert.equal(res.conformeCount, 3);
  assert.equal(res.pendenteCount, 2);
  assert.equal(res.alertLevel, 'warning');
});

test('4. Resiliência com zero respostas (início da inspeção)', () => {
  const res = evaluateInspecao({});
  assert.equal(res.status, 'atencao');
  assert.equal(res.conformityPct, 0);
  assert.equal(res.isValid, false);
});

test('5. Verificação dos 5 pontos críticos da norma ISO 16122', () => {
  const ids = CRITICAL_POINTS_ISO16122.map(p => p.id);
  assert.deepEqual(ids, ['manometro', 'filtros', 'tubagens', 'bicos', 'cardan_pto']);
});

test('6. Verificação de limite máximo de 200 linhas em todos os novos ficheiros de src/features/pre-inspecao/', () => {
  const dir = path.join(rootDir, 'src', 'features', 'pre-inspecao');
  const canonicalFiles = [
    'inspecaoDataMapper.ts',
    'inspecaoStorage.ts',
    'InspecaoHeader.tsx',
    'InspecaoResultCard.tsx',
    'InspecaoChecklistPanel.tsx',
    'InspecaoFooterBar.tsx',
    'InspecaoGuideModal.tsx',
    'PreInspecaoCalculator.tsx'
  ];

  for (const file of canonicalFiles) {
    const fullPath = path.join(dir, file);
    assert.ok(fs.existsSync(fullPath), `Ficheiro ${file} deve existir`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lineCount = content.split('\n').length;
    assert.ok(
      lineCount <= 200,
      `Ficheiro ${file} excede 200 linhas (${lineCount} linhas detectadas)`
    );
  }
});

test('7. Rotas canónicas de Pré-Inspeção registadas em src/App.tsx', () => {
  const appPath = path.join(rootDir, 'src', 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert.ok(appContent.includes('PreInspecaoCalculator'), 'App.tsx deve importar PreInspecaoCalculator');
  assert.ok(appContent.includes('/ferramentas/pre-inspecao'), 'App.tsx deve registar /ferramentas/pre-inspecao');
  assert.ok(appContent.includes('/tools/calc_pre_inspecao'), 'App.tsx deve registar /tools/calc_pre_inspecao');
});
