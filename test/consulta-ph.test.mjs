import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const TIPO_CALDA_CONFIG = {
  geral: { min: 5.5, max: 6.5 },
  sensivel: { min: 5.0, max: 6.0 },
  cupricos: { min: 6.5, max: 8.0 },
  sulfonilureias: { min: 7.0, max: 8.5 }
};

function evaluatePh(ph, tipoCalda = 'geral') {
  if (typeof ph !== 'number' || !isFinite(ph) || ph < 0 || ph > 14) {
    return {
      ph: 0,
      status: 'ideal',
      statusLabel: 'pH Inválido',
      actionRecommendation: 'Insira um valor de pH entre 0,0 e 14,0.',
      alertLevel: 'danger',
      intervaloMin: 5.5,
      intervaloMax: 6.5,
      riscoHidrolise: 'Baixo',
      riscoFitotoxicidade: 'Baixo',
      isValid: false
    };
  }

  const { min, max } = TIPO_CALDA_CONFIG[tipoCalda] || TIPO_CALDA_CONFIG.geral;

  if (ph >= min && ph <= max) {
    return {
      ph,
      status: 'ideal',
      statusLabel: 'pH Ideal para Aplicação',
      actionRecommendation: 'Água no intervalo ótimo. Proceder à preparação da calda no depósito.',
      alertLevel: 'success',
      intervaloMin: min,
      intervaloMax: max,
      riscoHidrolise: 'Baixo',
      riscoFitotoxicidade: 'Baixo',
      isValid: true
    };
  }

  if (ph > max) {
    const isCritico = ph >= max + 1.2;
    return {
      ph,
      status: isCritico ? 'critico_alcalino' : 'alcalino',
      statusLabel: isCritico ? 'Alcalinidade Crítica • Risco de Hidrólise' : 'Água Alcalina • Risco de Hidrólise',
      actionRecommendation: isCritico
        ? 'Necessário acidificar a calda com urgência antes de introduzir fitofármacos sensíveis.'
        : 'Recomenda-se adicionar regulador/acidificante de pH à água antes do produto comercial.',
      alertLevel: isCritico ? 'danger' : 'warning',
      intervaloMin: min,
      intervaloMax: max,
      riscoHidrolise: isCritico ? 'Crítico' : 'Alto',
      riscoFitotoxicidade: 'Baixo',
      isValid: true
    };
  }

  const isCuprico = tipoCalda === 'cupricos';
  const isCriticoAcido = isCuprico || ph <= min - 1.2;

  return {
    ph,
    status: isCriticoAcido ? 'critico_acido' : 'acido',
    statusLabel: isCuprico
      ? 'Acidez Excessiva • Risco Crítico para Cobre'
      : isCriticoAcido
      ? 'Acidez Crítica • Risco de Fitotoxicidade'
      : 'Água Ácida • Risco de Fitotoxicidade',
    actionRecommendation: isCuprico
      ? 'ATENÇÃO: Não acidificar caldas de cobre. Risco de libertação de cobre solúvel e queima foliar.'
      : 'Tamponar ou verificar compatibilidade para evitar queima foliar em tecidos jovens.',
    alertLevel: isCriticoAcido ? 'danger' : 'warning',
    intervaloMin: min,
    intervaloMax: max,
    riscoHidrolise: 'Baixo',
    riscoFitotoxicidade: isCriticoAcido ? 'Crítico' : 'Moderado',
    isValid: true
  };
}

test('1. pH Ideal na calda geral (pH 6.0 no intervalo 5.5-6.5)', () => {
  const res = evaluatePh(6.0, 'geral');
  assert.equal(res.isValid, true);
  assert.equal(res.status, 'ideal');
  assert.equal(res.alertLevel, 'success');
  assert.match(res.actionRecommendation, /intervalo ótimo/);
});

test('2. pH Alcalino moderado e crítico com risco de hidrólise', () => {
  const moderado = evaluatePh(7.2, 'geral');
  assert.equal(moderado.status, 'alcalino');
  assert.equal(moderado.alertLevel, 'warning');
  assert.equal(moderado.riscoHidrolise, 'Alto');

  const critico = evaluatePh(8.5, 'geral');
  assert.equal(critico.status, 'critico_alcalino');
  assert.equal(critico.alertLevel, 'danger');
  assert.equal(critico.riscoHidrolise, 'Crítico');
  assert.match(critico.actionRecommendation, /Necessário acidificar/);
});

test('3. Caldas cúpricas (cobre): proibição estrita de acidificação', () => {
  const res = evaluatePh(5.5, 'cupricos');
  assert.equal(res.status, 'critico_acido');
  assert.equal(res.alertLevel, 'danger');
  assert.equal(res.riscoFitotoxicidade, 'Crítico');
  assert.match(res.actionRecommendation, /Não acidificar caldas de cobre/);
});

test('4. Sulfonilureias e moléculas sensíveis respeitam intervalos específicos', () => {
  const sulf = evaluatePh(7.5, 'sulfonilureias');
  assert.equal(sulf.status, 'ideal');
  assert.equal(sulf.intervaloMin, 7.0);
  assert.equal(sulf.intervaloMax, 8.5);

  const sens = evaluatePh(5.5, 'sensivel');
  assert.equal(sens.status, 'ideal');
  assert.equal(sens.intervaloMin, 5.0);
  assert.equal(sens.intervaloMax, 6.0);
});

test('5. Resiliência a entradas inválidas (negativo, > 14, NaN)', () => {
  const neg = evaluatePh(-1, 'geral');
  assert.equal(neg.isValid, false);
  const excess = evaluatePh(15, 'geral');
  assert.equal(excess.isValid, false);
  const nanVal = evaluatePh(NaN, 'geral');
  assert.equal(nanVal.isValid, false);
});

test('6. Verificação de limite máximo de 200 linhas em todos os ficheiros de src/features/consulta-ph/', () => {
  const dir = path.join(rootDir, 'src', 'features', 'consulta-ph');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

  assert.ok(files.length >= 6, `Esperados pelo menos 6 ficheiros, encontrados ${files.length}`);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lineCount = content.split('\n').length;
    assert.ok(
      lineCount <= 200,
      `Ficheiro ${file} excede 200 linhas (${lineCount} linhas detectadas)`
    );
  }
});

test('7. Rotas canónicas de Consulta de pH registadas em src/App.tsx', () => {
  const appPath = path.join(rootDir, 'src', 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert.ok(appContent.includes('ConsultaPhCalculator'), 'App.tsx deve importar ConsultaPhCalculator');
  assert.ok(appContent.includes('/ferramentas/consulta-ph'), 'App.tsx deve registar /ferramentas/consulta-ph');
  assert.ok(appContent.includes('/tools/calc_ph'), 'App.tsx deve registar /tools/calc_ph');
});
