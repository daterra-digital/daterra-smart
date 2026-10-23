// scripts/sync-renovate-glossary.mjs
// Script para sincronizar o Dicionário Técnico a partir do Google Docs publicado na Web.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_DOCS_PUB_URL =
  'https://docs.google.com/document/d/e/2PACX-1vQRyHqXXSQFQ-B2XEy3yasisKf-Ejho3KhXE0Yw_GbNYbebSZNTu71X_ewgTttD9PTl9zUj2RNUUSde/pub';

const OUTPUT_JSON_PATH = path.resolve(
  __dirname,
  '../src/features/agri-chat/data/renovateGlossary.json'
);

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function syncGlossary() {
  console.log(`🌐 A transferir Dicionário Técnico do Google Docs...`);
  console.log(`🔗 URL: ${GOOGLE_DOCS_PUB_URL}`);

  const response = await fetch(GOOGLE_DOCS_PUB_URL);
  if (!response.ok) {
    throw new Error(`Falha HTTP ao descarregar documento: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
  let match;
  const rawItems = [];

  while ((match = liRegex.exec(html)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\u00a0/g, ' ')
      .trim();
    if (text) rawItems.push(text);
  }

  console.log(`📑 Encontrados ${rawItems.length} itens no documento.`);

  const prohibitedRules = [];
  const terms = [];
  const skipped = [];

  for (let item of rawItems) {
    if (item.includes('Canopy:')) {
      item = item.substring(item.indexOf('Canopy:'));
    }

    // Regras Proibidas
    if (item.includes('NUNCA traduzir') || item.includes('Tree Row Volume (TRV)')) {
      let term = '';
      let prohibited = [];
      let preferred = '';

      if (item.startsWith('Canopy:')) {
        term = 'Canopy';
        prohibited = ['dossel'];
        preferred = 'Copa ou Parede vegetativa';
      } else if (item.startsWith('Nozzle:')) {
        term = 'Nozzle';
        prohibited = ['ponta', 'boquilha'];
        preferred = 'Bico';
      } else if (item.startsWith('Flow rate')) {
        term = 'Flow rate / Nozzle flow rate';
        prohibited = ['caudal'];
        preferred = 'Débito ou Débito do bico';
      } else if (item.startsWith('Tree Row Volume')) {
        term = 'Tree Row Volume (TRV)';
        prohibited = [];
        preferred = 'Volume de vegetação por hectare';
      }

      prohibitedRules.push({
        id: slugify(term || item.slice(0, 20)),
        rawRule: item,
        term,
        prohibited,
        preferred
      });
      continue;
    }

    // Termos do glossário com formato: EN / FR / PT - Definição
    const dashIndex = item.indexOf(' - ');
    if (dashIndex === -1) {
      skipped.push({ item, reason: 'Sem traço separador de definição' });
      continue;
    }

    const termsPart = item.substring(0, dashIndex).trim();
    const definition = item.substring(dashIndex + 3).trim();
    const parts = termsPart.split(' / ').map(p => p.trim());

    if (parts.length < 3) {
      skipped.push({ item, reason: 'Menos de 3 línguas (EN/FR/PT)' });
      continue;
    }

    const en = parts[0];
    const fr = parts[1];
    const pt = parts.slice(2).join(' / ');

    terms.push({
      id: slugify(pt.split('(')[0].trim()),
      en,
      fr,
      pt,
      definition
    });
  }

  const glossaryPayload = {
    metadata: {
      source: 'Dicionário Técnico',
      sourceUrl: GOOGLE_DOCS_PUB_URL,
      lastSyncedAt: new Date().toISOString(),
      totalProhibitedRules: prohibitedRules.length,
      totalTerms: terms.length
    },
    prohibitedRules,
    terms
  };

  const outputDir = path.dirname(OUTPUT_JSON_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(glossaryPayload, null, 2), 'utf8');

  console.log(`✅ Sincronização concluída com sucesso!`);
  console.log(`📊 Regras Proibidas: ${prohibitedRules.length}`);
  console.log(`📚 Termos Traduzidos: ${terms.length}`);
  if (skipped.length > 0) {
    console.log(`⚠️ Itens não processados: ${skipped.length}`);
  }
  console.log(`💾 Ficheiro gravado em: ${OUTPUT_JSON_PATH}`);
}

syncGlossary().catch(err => {
  console.error('❌ Erro na sincronização do glossário:', err);
  process.exit(1);
});
