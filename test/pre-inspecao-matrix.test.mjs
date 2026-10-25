import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const featureDir = path.join(rootDir, 'src', 'features', 'pre-inspecao');

test('1. Matriz de Equipamentos: Suporta os 5 Tipos Canónicos e 2 Estilos de Avaliação', async () => {
  const { EQUIPMENT_OPTIONS, isDroneEquipment, MANDATORY_DRONE_WARNING } = await import(
    `file://${path.join(featureDir, 'data', 'equipmentConfigs.ts')}`
  );
  const { getCategoriesByEquipment } = await import(
    `file://${path.join(featureDir, 'data', 'inspectionDataLoader.ts')}`
  );

  const canonicalIds = [
    'barras_horizontais',
    'culturas_arbustivas',
    'pistolas_pulverizacao',
    'pulverizador_fixo',
    'drones_uas'
  ];

  for (const id of canonicalIds) {
    const opt = EQUIPMENT_OPTIONS.find((o) => o.id === id);
    assert.ok(opt, `Equipamento ${id} deve constar em EQUIPMENT_OPTIONS`);
    assert.equal(opt.disabled, false, `Equipamento ${id} deve estar ativo`);

    const catsIso = getCategoriesByEquipment(id, 'iso_16122');
    assert.ok(catsIso.length >= 5, `Equipamento ${id} deve ter pelo menos 5 categorias em ISO 16122`);

    const catsDgav = getCategoriesByEquipment(id, 'dgav_oficial');
    assert.ok(catsDgav.length >= 5, `Equipamento ${id} deve ter pelo menos 5 categorias em DGAV`);
  }

  assert.equal(isDroneEquipment('drones_uas'), true);
  assert.equal(
    MANDATORY_DRONE_WARNING,
    'Os requisitos apresentados resultam da adaptação técnica das diretrizes gerais da Norma ISO 16122'
  );
});

test('2. Avaliação da Matriz de Conformidade (Taxa de Conformidade e Alertas DGAV)', async () => {
  const { evaluateInspectionMatrix } = await import(
    `file://${path.join(featureDir, 'engine', 'inspecaoEvaluator.ts')}`
  );
  const { getCategoriesByEquipment } = await import(
    `file://${path.join(featureDir, 'data', 'inspectionDataLoader.ts')}`
  );

  const categories = getCategoriesByEquipment('barras_horizontais', 'iso_16122');
  const allSubIds = categories.flatMap((c) => c.subperguntas.map((s) => s.id));

  // Cenário 1: Tudo Conforme
  const allConforme = {};
  for (const id of allSubIds) allConforme[id] = 'conforme';
  const resAprovado = evaluateInspectionMatrix(categories, allConforme, 'iso_16122');
  assert.equal(resAprovado.status, 'aprovado');
  assert.equal(resAprovado.conformityPct, 100);
  assert.equal(resAprovado.alertLevel, 'success');
  assert.equal(resAprovado.anomaliaCount, 0);

  // Cenário 2: Anomalia Crítica no estilo DGAV (alerta de anomalia grave)
  const withAnomaly = { ...allConforme, [allSubIds[0]]: 'anomalia' };
  const resReprovado = evaluateInspectionMatrix(categories, withAnomaly, 'dgav_oficial');
  assert.equal(resReprovado.status, 'reprovado');
  assert.equal(resReprovado.alertLevel, 'danger');
  assert.equal(resReprovado.anomaliaCount, 1);
  assert.match(resReprovado.recommendation, /anomalia\(s\) grave\(s\)/);

  // Cenário 3: Em Auditoria (Taxa de Conformidade Parcial)
  const partial = { [allSubIds[0]]: 'conforme', [allSubIds[1]]: 'conforme' };
  const expectedPct = Math.round((2 / allSubIds.length) * 100);
  const resAtencao = evaluateInspectionMatrix(categories, partial, 'iso_16122');
  assert.equal(resAtencao.status, 'atencao');
  assert.equal(resAtencao.alertLevel, 'warning');
  assert.equal(resAtencao.conformeCount, 2);
  assert.equal(resAtencao.conformityPct, expectedPct);
  assert.equal(resAtencao.pendenteCount, allSubIds.length - 2);
});

test('3. Geração de Relatório Oficial em PDF com Tabela Exaustiva e Paginação Dinâmica', async () => {
  const { generatePreInspecaoPdf } = await import(
    `file://${path.join(featureDir, 'pdf', 'inspecaoPdfGenerator.ts')}`
  );
  const { getCategoriesByEquipment } = await import(
    `file://${path.join(featureDir, 'data', 'inspectionDataLoader.ts')}`
  );
  const { evaluateInspectionMatrix } = await import(
    `file://${path.join(featureDir, 'engine', 'inspecaoEvaluator.ts')}`
  );

  const categories = getCategoriesByEquipment('barras_horizontais', 'iso_16122');
  const allSubIds = categories.flatMap((c) => c.subperguntas.map((s) => s.id));
  const answers = {};
  allSubIds.forEach((id, idx) => {
    answers[id] = idx === 0 ? 'anomalia' : 'conforme';
  });
  const calcResult = evaluateInspectionMatrix(categories, answers, 'iso_16122', 'barras_horizontais');

  const pdfBytes = await generatePreInspecaoPdf({
    equipmentId: 'barras_horizontais',
    equipmentTitle: 'Barras Horizontais',
    evaluationStyle: 'iso_16122',
    categories,
    answers,
    calcResult
  });

  assert.ok(pdfBytes instanceof Uint8Array, 'PDF deve retornar Uint8Array');
  assert.ok(pdfBytes.length > 5000, 'PDF com tabela exaustiva deve ter tamanho superior a 5 KB');

  const parsedDoc = await PDFDocument.load(pdfBytes);
  const pageCount = parsedDoc.getPageCount();
  assert.ok(pageCount >= 2, `PDF exaustivo deve gerar múltiplas páginas (obtido: ${pageCount} páginas)`);

  const firstPage = parsedDoc.getPage(0);
  assert.equal(firstPage.getWidth(), 595.28);
  assert.equal(firstPage.getHeight(), 841.89);
});

test('4. Cabeçalho de Co-Branding no PDF (2 Colunas com Fallback e Custom Partner)', async () => {
  const { generatePreInspecaoPdf } = await import(
    `file://${path.join(featureDir, 'pdf', 'inspecaoPdfGenerator.ts')}`
  );
  const { getCategoriesByEquipment } = await import(
    `file://${path.join(featureDir, 'data', 'inspectionDataLoader.ts')}`
  );
  const { evaluateInspectionMatrix } = await import(
    `file://${path.join(featureDir, 'engine', 'inspecaoEvaluator.ts')}`
  );

  const categories = getCategoriesByEquipment('culturas_arbustivas', 'dgav_oficial');
  const answers = {};
  const calcResult = evaluateInspectionMatrix(categories, answers, 'dgav_oficial', 'culturas_arbustivas');

  // Caso A: Com Co-Branding ativo
  const pdfBytesWithCoBranding = await generatePreInspecaoPdf({
    equipmentId: 'culturas_arbustivas',
    equipmentTitle: 'Culturas Arbustivas & Arbóreas',
    evaluationStyle: 'dgav_oficial',
    categories,
    answers,
    calcResult,
    coBranding: {
      isEnabled: true,
      companyName: 'Centro IPP Ribatejo & Oeste',
      address: 'Zona Agrária de Santarém',
      postalCode: '2000-000 Santarém',
      phone: '+351 243 999 888',
      email: 'inspecoes@ipp-ribatejo.pt',
      website: 'www.ipp-ribatejo.pt',
      logoUrl: null,
      primaryColor: '#114037',
      secondaryColor: '#3CA64C',
      textColor: '#FFFFFF'
    }
  });
  const docA = await PDFDocument.load(pdfBytesWithCoBranding);
  assert.ok(docA.getPageCount() >= 2);

  // Caso B: Fallback limpo (sem Co-Branding)
  const pdfBytesFallback = await generatePreInspecaoPdf({
    equipmentId: 'culturas_arbustivas',
    equipmentTitle: 'Culturas Arbustivas & Arbóreas',
    evaluationStyle: 'dgav_oficial',
    categories,
    answers,
    calcResult,
    coBranding: null
  });
  const docB = await PDFDocument.load(pdfBytesFallback);
  assert.ok(docB.getPageCount() >= 2);
});

test('5. Limite Modular Estrito: Todos os ficheiros TypeScript em src/features/pre-inspecao/ têm <= 200 linhas', () => {
  function getTsFilesRecursively(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getTsFilesRecursively(fullPath));
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const files = getTsFilesRecursively(featureDir);
  assert.ok(files.length >= 13, 'Devem existir ficheiros modulares');

  for (const file of files) {
    const rel = path.relative(rootDir, file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    assert.ok(
      lines <= 200,
      `Ficheiro ${rel} excede 200 linhas de código (${lines} linhas encontradas)`
    );
  }
});

test('6. Microlearning e Guia Didático: Estrutura Legal, ISO 16122 e Descodificador Técnico', () => {
  const guideDir = path.join(featureDir, 'components', 'guide');
  assert.ok(fs.existsSync(guideDir), 'Diretório de componentes do guia deve existir');

  // Secção Legal
  const legalFile = path.join(guideDir, 'InspecaoLegalSection.tsx');
  assert.ok(fs.existsSync(legalFile), 'InspecaoLegalSection deve existir');
  const legalContent = fs.readFileSync(legalFile, 'utf8');
  assert.ok(legalContent.includes('Diretiva 2009/128/CE'), 'Deve referir Diretiva 2009/128/CE');
  assert.ok(legalContent.includes('Lei n.º 26/2013'), 'Deve referir Lei n.º 26/2013');
  assert.ok(legalContent.includes('Decreto-Lei n.º 86/2010'), 'Deve referir Decreto-Lei n.º 86/2010');
  assert.ok(legalContent.includes('Decreto-Lei n.º 78/2020'), 'Deve referir Decreto-Lei n.º 78/2020');
  assert.ok(legalContent.includes('Centros IPP'), 'Deve referir Centros IPP');
  assert.ok(legalContent.includes('Defeito Grande (Grave)'), 'Deve classificar defeitos graves');

  // Secção ISO
  const isoFile = path.join(guideDir, 'InspecaoIsoSection.tsx');
  assert.ok(fs.existsSync(isoFile), 'InspecaoIsoSection deve existir');
  const isoContent = fs.readFileSync(isoFile, 'utf8');
  assert.ok(isoContent.includes('ISO 16122-1'), 'Deve incluir Parte 1');
  assert.ok(isoContent.includes('ISO 16122-2'), 'Deve incluir Parte 2');
  assert.ok(isoContent.includes('ISO 16122-3'), 'Deve incluir Parte 3');
  assert.ok(isoContent.includes('ISO 16122-4'), 'Deve incluir Parte 4');
  assert.ok(
    isoContent.includes('Os requisitos apresentados resultam da adaptação técnica das diretrizes gerais da Norma ISO 16122'),
    'Deve incluir ressalva regulamentar para Drones/UAV'
  );

  // Secção Descodificador Técnico
  const techFile = path.join(guideDir, 'InspecaoTechTermsSection.tsx');
  assert.ok(fs.existsSync(techFile), 'InspecaoTechTermsSection deve existir');
  const techContent = fs.readFileSync(techFile, 'utf8');
  assert.ok(techContent.includes('Compensação de Retornos'), 'Deve explicar Retornos Compensados');
  assert.ok(techContent.includes('Queda de Pressão'), 'Deve explicar Queda de Pressão');
  assert.ok(techContent.includes('Pulsações & Câmara de Ar'), 'Deve explicar Pulsações');
  assert.ok(techContent.includes('Deformação Geométrica da Barra'), 'Deve explicar Deformação de Barra');
  assert.ok(techContent.includes('Desvio de Débito'), 'Deve explicar Desvio de Débito');

  // Modal Principal
  const modalFile = path.join(featureDir, 'InspecaoGuideModal.tsx');
  const modalContent = fs.readFileSync(modalFile, 'utf8');
  assert.ok(modalContent.includes('min-h-[48px]'), 'Tabs e botões devem cumprir ISO 9241-210 (alvo >= 48px)');
});
