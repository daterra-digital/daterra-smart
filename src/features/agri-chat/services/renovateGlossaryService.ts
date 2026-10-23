// src/features/agri-chat/services/renovateGlossaryService.ts
import rawGlossary from '../data/renovateGlossary.json';

export interface RenovateProhibitedRule {
  id: string;
  rawRule: string;
  term: string;
  prohibited: string[];
  preferred: string;
}

export interface RenovateGlossaryTerm {
  id: string;
  en: string;
  fr: string;
  pt: string;
  definition: string;
}

export interface RenovateGlossaryPayload {
  metadata: {
    source: string;
    sourceUrl: string;
    lastSyncedAt: string;
    totalProhibitedRules: number;
    totalTerms: number;
  };
  prohibitedRules: RenovateProhibitedRule[];
  terms: RenovateGlossaryTerm[];
}

const glossaryData = rawGlossary as RenovateGlossaryPayload;

/**
 * Retorna as regras de termos desaconselhados do Dicionário Técnico
 */
export function getProhibitedRules(): RenovateProhibitedRule[] {
  return glossaryData.prohibitedRules || [];
}

/**
 * Retorna todos os 162+ termos técnicos oficiais
 */
export function getAllGlossaryTerms(): RenovateGlossaryTerm[] {
  return glossaryData.terms || [];
}

/**
 * Pesquisa um termo por ID ou por palavra-chave em PT, EN ou FR
 */
export function findGlossaryTerm(query: string): RenovateGlossaryTerm | undefined {
  if (!query || !query.trim()) return undefined;
  const q = query.trim().toLowerCase();

  return glossaryData.terms.find(t => 
    t.id.toLowerCase() === q ||
    t.pt.toLowerCase().includes(q) ||
    t.en.toLowerCase().includes(q) ||
    t.fr.toLowerCase().includes(q)
  );
}

/**
 * Identifica termos do glossário mencionados numa determinada pergunta ou texto
 */
export function getRelevantTermsForText(text: string, maxItems = 6): RenovateGlossaryTerm[] {
  if (!text || !text.trim()) return [];
  const lowerText = text.toLowerCase();
  const matches: RenovateGlossaryTerm[] = [];

  for (const term of glossaryData.terms) {
    const mainPt = term.pt.split('/')[0].split('(')[0].trim().toLowerCase();
    const mainEn = term.en.split('/')[0].split('(')[0].trim().toLowerCase();
    const mainFr = term.fr.split('/')[0].split('(')[0].trim().toLowerCase();

    if (
      (mainPt.length > 3 && lowerText.includes(mainPt)) ||
      (mainEn.length > 3 && lowerText.includes(mainEn)) ||
      (mainFr.length > 3 && lowerText.includes(mainFr))
    ) {
      matches.push(term);
      if (matches.length >= maxItems) break;
    }
  }

  return matches;
}

/**
 * Gera o bloco de diretrizes terminológicas oficiais para o System Prompt do Gemini
 */
export function generateGeminiTerminologyPromptSnippet(): string {
  const rulesList = glossaryData.prohibitedRules
    .map(r => `• ${r.rawRule}`)
    .join('\n');

  return [
    `### DIRETRIZES DO DICIONÁRIO TÉCNICO:`,
    `É proibido utilizar termos de português do Brasil ou termos informais desaconselhados.`,
    rulesList,
    `Se o utilizador colocar dúvidas em inglês (en-GB) ou francês (fr-FR), traduza os conceitos com precisão para o vocabulário oficial em pt-PT (ex: "tank" -> "depósito", "nozzle" -> "bico", "drift" -> "arrastamento / deriva", "boom" -> "barra de pulverização").`
  ].join('\n');
}

/**
 * Retorna metadados de sincronização do glossário
 */
export function getGlossaryMetadata() {
  return glossaryData.metadata;
}
