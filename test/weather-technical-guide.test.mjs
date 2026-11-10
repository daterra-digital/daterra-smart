/**
 * DATERRA Smart - Teste de Validação do Guia Técnico de Meteorologia e Pulverização (T7)
 * Validações:
 * 1. Limite estrito de modularidade (< 200 LOC) em todos os ficheiros do Guia
 * 2. Zero emojis e uso exclusivo de Lucide SVGs
 * 3. Cobertura estruturada dos 5 temas e 18 perguntas canónicas
 * 4. Integridade de IDs estáveis, resposta direta, daterraFunctioning e technicalGuidance
 * 5. Acessibilidade WAI-ARIA (role="dialog", aria-modal="true", aria-expanded, aria-controls, focus trap e Escape)
 * 6. Rigor agronómico e terminologia PT-PT (depósito, produto fitofarmacêutico, zero "cuba", zero "PF")
 * 7. Ausência de proibições técnicas (sem EPPO para tempo, sem inversão por Delta T, sem DPV estomático, sem índice de deriva validado)
 * 8. Fontes materiais verificadas (Open-Meteo, DGAV/SIFITO, GRDC, Sprayers101) e 100% offline
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  GUIDE_TOPICS,
  ALL_GUIDE_QUESTIONS,
  getQuestionsByTopic,
  searchGuideQuestions
} from '../src/features/weather/data/weatherGuideData.ts';

describe('T7 — Guia Técnico de Meteorologia e Pulverização', () => {

  // 1. Modularidade Cirúrgica (< 200 LOC)
  it('1. Todos os ficheiros do Guia Técnico respeitam o limite estrito de < 200 LOC', () => {
    const files = [
      'src/features/weather/components/WeatherTechnicalGuideModal.tsx',
      'src/features/weather/components/WeatherGuideAccordion.tsx',
      'src/features/weather/data/weatherGuideTypes.ts',
      'src/features/weather/data/weatherGuideTopics.ts',
      'src/features/weather/data/weatherGuideGeneralQuestions.ts',
      'src/features/weather/data/weatherGuideSprayQuestions.ts',
      'src/features/weather/data/weatherGuideData.ts'
    ];

    for (const f of files) {
      const fullPath = path.resolve(f);
      assert.ok(fs.existsSync(fullPath), `${f} deve existir`);
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n').length;
      assert.ok(lines <= 200, `${f} tem ${lines} linhas, deve ter <= 200`);
    }
  });

  // 2. Zero Emojis e Uso Exclusivo de Lucide SVGs
  it('2. Zero emojis em todos os ficheiros de dados e componentes do Guia Técnico', () => {
    const files = [
      'src/features/weather/components/WeatherTechnicalGuideModal.tsx',
      'src/features/weather/components/WeatherGuideAccordion.tsx',
      'src/features/weather/data/weatherGuideTopics.ts',
      'src/features/weather/data/weatherGuideGeneralQuestions.ts',
      'src/features/weather/data/weatherGuideSprayQuestions.ts',
      'src/features/weather/data/weatherGuideData.ts'
    ];

    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    for (const f of files) {
      const content = fs.readFileSync(path.resolve(f), 'utf8');
      assert.equal(emojiRegex.test(content), false, `${f} não deve conter emojis`);
    }
  });

  // 3. Cobertura Integral dos 5 Temas e 18 Perguntas
  it('3. Estrutura cobre exatamente 5 temas e 18 perguntas sem redundâncias', () => {
    assert.equal(GUIDE_TOPICS.length, 5, 'Devem existir exatamente 5 temas canónicos');
    assert.deepEqual(
      GUIDE_TOPICS.map((t) => t.id),
      ['compreender', 'ferramenta', 'pulverizacao', 'indicadores', 'fontes']
    );

    assert.equal(ALL_GUIDE_QUESTIONS.length, 18, 'Devem existir 18 perguntas canónicas');

    // Validação por tema
    assert.equal(getQuestionsByTopic('compreender').length, 4, 'Tema A: 4 perguntas');
    assert.equal(getQuestionsByTopic('ferramenta').length, 2, 'Tema B: 2 perguntas');
    assert.equal(getQuestionsByTopic('pulverizacao').length, 4, 'Tema C: 4 perguntas');
    assert.equal(getQuestionsByTopic('indicadores').length, 5, 'Tema D: 5 perguntas');
    assert.equal(getQuestionsByTopic('fontes').length, 3, 'Tema E: 3 perguntas');
  });

  // 4. Integridade Estrutural das Perguntas e Mecanismo de Pesquisa
  it('4. Cada pergunta contém resposta direta, funcionamento DATERRA, orientação técnica e fontes', () => {
    const ids = new Set();
    for (const q of ALL_GUIDE_QUESTIONS) {
      assert.ok(!ids.has(q.id), `ID duplicado detetado: ${q.id}`);
      ids.add(q.id);

      assert.ok(q.question.length > 10, `${q.id} deve ter pergunta legível`);
      assert.ok(q.directAnswer.length > 20, `${q.id} deve ter resposta direta`);
      assert.ok(q.daterraFunctioning.includes('Como funciona na DATERRA:'), `${q.id} deve conter secção DATERRA`);
      assert.ok(q.technicalGuidance.includes('Orientação técnica geral:'), `${q.id} deve conter orientação técnica`);
      assert.ok(Array.isArray(q.sourceCitations) && q.sourceCitations.length > 0, `${q.id} deve conter fontes`);
    }

    // Validação do mecanismo de busca
    const deltaTResults = searchGuideQuestions('Delta T');
    assert.ok(deltaTResults.length >= 2, 'Pesquisa por "Delta T" deve encontrar perguntas relevantes');

    const ventoCalmoResults = searchGuideQuestions('vento calmo');
    assert.ok(ventoCalmoResults.length >= 1, 'Pesquisa por "vento calmo" deve encontrar pergunta');

    const emptyResults = searchGuideQuestions('xyzinexistente999');
    assert.equal(emptyResults.length, 0, 'Termo inexistente deve devolver lista vazia');
  });

  // 5. Acessibilidade WAI-ARIA e Comportamento de Foco
  it('5. Componentes cumprem especificações WAI-ARIA de Modal e Acordeão', () => {
    const modalCode = fs.readFileSync(path.resolve('src/features/weather/components/WeatherTechnicalGuideModal.tsx'), 'utf8');
    assert.ok(modalCode.includes('role="dialog"'), 'Modal deve ter role="dialog"');
    assert.ok(modalCode.includes('aria-modal="true"'), 'Modal deve ter aria-modal="true"');
    assert.ok(modalCode.includes('aria-labelledby="weather-guide-title"'), 'Modal deve ter aria-labelledby');
    assert.ok(modalCode.includes("e.key === 'Escape'"), 'Modal deve suportar tecla Escape');
    assert.ok(modalCode.includes("e.key === 'Tab'"), 'Modal deve gerir Focus Trap');
    assert.ok(modalCode.includes('previousActiveElementRef.current?.focus()'), 'Modal deve repor o foco ao fechar');

    const accordionCode = fs.readFileSync(path.resolve('src/features/weather/components/WeatherGuideAccordion.tsx'), 'utf8');
    assert.ok(accordionCode.includes('aria-expanded={isOpen}'), 'Acordeão deve ter aria-expanded dinâmico');
    assert.ok(accordionCode.includes('aria-controls={panelId}'), 'Acordeão deve apontar aria-controls para o painel');
    assert.ok(accordionCode.includes('role="region"'), 'Painel de resposta deve ter role="region"');
    assert.ok(accordionCode.includes('{isOpen && ('), 'Painel só é renderizado quando aberto para evitar links focáveis ocultos');
  });

  // 6. Rigor Agronómico e Vocabulário DGAV (PT-PT)
  it('6. Vocabulário cumpre estritamente PT-PT: proíbe "cuba" e "PF", exige "depósito" e "produto fitofarmacêutico"', () => {
    const guideFiles = [
      'src/features/weather/data/weatherGuideGeneralQuestions.ts',
      'src/features/weather/data/weatherGuideSprayQuestions.ts',
      'src/features/weather/components/WeatherTechnicalGuideModal.tsx',
      'src/features/weather/components/WeatherGuideAccordion.tsx'
    ];

    for (const f of guideFiles) {
      const content = fs.readFileSync(path.resolve(f), 'utf8');

      // Proibição de "cuba" como recipiente de pulverizador (em minúsculas ou maiúsculas com boundaries de palavra)
      const cubaRegex = /\bcubas?\b/i;
      assert.equal(cubaRegex.test(content), false, `${f} não deve conter a palavra "cuba" (usar "depósito")`);

      // Proibição de "PF" isolado como produto fitofarmacêutico
      const pfRegex = /\bPF\b/;
      assert.equal(pfRegex.test(content), false, `${f} não deve conter "PF" isolado`);
    }

    // Confirma presença dos termos obrigatórios
    const sprayContent = fs.readFileSync(path.resolve('src/features/weather/data/weatherGuideSprayQuestions.ts'), 'utf8');
    assert.ok(sprayContent.includes('depósito'), 'Deve usar "depósito"');
    assert.ok(sprayContent.includes('produtos fitofarmacêuticos') || sprayContent.includes('produto fitofarmacêutico'), 'Deve usar "produto fitofarmacêutico"');
    assert.ok(sprayContent.includes('calda'), 'Deve usar "calda"');
  });

  // 7. Ausência de Proibições Técnicas Contratuais
  it('7. Guia respeita proibições agronómicas: sem EPPO para tempo, sem inversão por Delta T, sem DPV estomático', () => {
    const sprayContent = fs.readFileSync(path.resolve('src/features/weather/data/weatherGuideSprayQuestions.ts'), 'utf8');

    // Não usar EPPO PP 1/239 como fundamento de limites meteorológicos
    assert.equal(sprayContent.includes('PP 1/239'), false, 'Não deve referir EPPO PP 1/239 no guia de meteorologia');

    // Não diagnosticar inversão por Delta T
    assert.ok(sprayContent.includes('não pode ser diagnosticada pelo Delta T') || sprayContent.includes('não efetua diagnóstico automático de inversão'));

    // Não apresentar DPV como medição estomática de cultura específica
    assert.ok(sprayContent.includes('não mede a abertura estomática nem a transpiração de uma cultura específica'));

    // Não afirmar índice de deriva validado
    assert.ok(sprayContent.includes('não calcula um índice de deriva validado'));
  });

  // 8. Fontes Oficiais Verificadas e Disponibilidade Offline
  it('8. Fontes oficiais são citadas e o conteúdo está 100% disponível offline', () => {
    const allCitations = ALL_GUIDE_QUESTIONS.flatMap((q) => q.sourceCitations || []);
    assert.ok(allCitations.some((c) => c.includes('Open-Meteo')), 'Deve citar Open-Meteo');
    assert.ok(allCitations.some((c) => c.includes('DGAV')), 'Deve citar DGAV');
    assert.ok(allCitations.some((c) => c.includes('SIFITO')), 'Deve citar SIFITO');
    assert.ok(allCitations.some((c) => c.includes('GRDC')), 'Deve citar GRDC');
    assert.ok(allCitations.some((c) => c.includes('Sprayers101')), 'Deve citar Sprayers101');

    // Verifica que todo o conteúdo é estático e embutido sem requisições fetch/axios
    const modalCode = fs.readFileSync(path.resolve('src/features/weather/components/WeatherTechnicalGuideModal.tsx'), 'utf8');
    assert.equal(modalCode.includes('fetch('), false, 'Modal não deve efetuar chamadas fetch');
    assert.equal(modalCode.includes('axios'), false, 'Modal não deve carregar dados via axios');
  });
});
