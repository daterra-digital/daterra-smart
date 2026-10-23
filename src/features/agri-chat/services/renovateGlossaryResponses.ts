// src/features/agri-chat/services/renovateGlossaryResponses.ts
import { findGlossaryTerm, getRelevantTermsForText, getProhibitedRules } from './renovateGlossaryService';
import type { ChatActionCard } from '../types';

export interface RenovateResponseResult {
  reply: string;
  sources: string[];
  actionCard?: ChatActionCard;
}

/**
 * Avalia se a mensagem do utilizador é uma pergunta direta sobre a definição ou significado de um termo do Dicionário Técnico.
 * Se for uma questão agronómica ou de campo geral (mesmo contendo termos como 'cuba'), retorna null para permitir
 * que o motor inteligente (Gemini) responda com foco total no problema prático do agricultor.
 */
export function checkRenovateGlossaryResponse(messageText: string): RenovateResponseResult | null {
  const trimmed = messageText.trim();
  const lower = trimmed.toLowerCase();

  // Apenas interceta se o utilizador estiver expressamente a perguntar pela definição ou for um termo isolado
  const isDirectDefinitionQuery =
    /^(o que é|o que significa|qual a definição|o que quer dizer|definir|tradução de)\b/i.test(lower) ||
    lower.split(/\s+/).length <= 2;

  if (!isDirectDefinitionQuery) {
    return null;
  }

  // 1. Caso especial: pergunta direta sobre "cuba" (ex: "o que é cuba?", "cuba?")
  if (/\bcubas?\b/i.test(lower)) {
    const depositoTerm = findGlossaryTerm('deposito');
    return {
      reply: `Compreendo perfeitamente a sua questão! Na linguagem prática de campo e em várias regiões de Portugal — em especial no Norte —, é muito natural e corrente ouvir-se o termo **"cuba"** para designar o recipiente onde se prepara e transporta a calda.\n\n` +
        `Nos manuais e na documentação técnica oficial de aplicação de produtos fitofarmacêuticos, o termo padronizado é **Depósito**.\n\n` +
        `• **Definição Técnica:** ${depositoTerm?.definition || 'Elemento do equipamento destinado a conter a calda ou o produto a aplicar.'}\n` +
        `• **Correspondências no Dicionário Técnico:**\n` +
        `  - Português (pt-PT): **Depósito** *(na prática de campo também frequentemente designado por cuba)*\n` +
        `  - Francês (fr-FR): *Cuve*\n` +
        `  - Inglês (en-GB): *Spray tank*\n\n` +
        `Ambos comunicam a mesma realidade, mas nos cálculos e registos da DATERRA Smart utilizamos **Depósito** para manter total sintonia com as fichas técnicas e a regulamentação.`,
      sources: ['Dicionário Técnico']
    };
  }

  // 2. Verificação de Pergunta Direta sobre Termo Proibido (ex: "o que é dossel?", "o que é ponta?")
  const prohibitedRules = getProhibitedRules();
  for (const rule of prohibitedRules) {
    for (const bad of rule.prohibited) {
      const badRegex = new RegExp(`\\b${bad}\\b`, 'i');
      if (badRegex.test(lower)) {
        return {
          reply: `Uma partilha técnica útil: embora o termo *"${bad}"* seja por vezes utilizado em contexto informal ou em traduções diretas, no contexto agronómico em Portugal recomendamos a utilização de **${rule.preferred}**.\n\n` +
            `• **Termo Recomendado:** **${rule.preferred}**\n` +
            `• **Porquê esta distinção?** A utilização de **${rule.preferred}** assegura total clareza e sintonia entre técnicos, operadores e a documentação oficial do setor.`,
          sources: ['Dicionário Técnico']
        };
      }
    }
  }

  // 3. Verificação de Pergunta Direta sobre Termo do Glossário
  const relevantTerms = getRelevantTermsForText(messageText, 2);
  if (relevantTerms.length > 0) {
    const term = relevantTerms[0];
    return {
      reply: `No **Dicionário Técnico**, a definição de **${term.pt}** é:\n\n` +
        `• **Definição Técnica:** ${term.definition}\n` +
        `• **Equivalências:**\n` +
        `  - Inglês (en-GB): *${term.en}*\n` +
        `  - Francês (fr-FR): *${term.fr}*\n` +
        `  - Português (pt-PT): **${term.pt}**`,
      sources: ['Dicionário Técnico']
    };
  }

  // 4. Pesquisa direta de termo específico
  const singleTermMatch = findGlossaryTerm(trimmed.replace(/[?.,!]/g, '').trim());
  if (singleTermMatch && singleTermMatch.pt.length > 3) {
    return {
      reply: `Ficha do Dicionário Técnico — **${singleTermMatch.pt}**:\n\n` +
        `• **Definição:** ${singleTermMatch.definition}\n` +
        `• **Designações:** en-GB: *${singleTermMatch.en}* | fr-FR: *${singleTermMatch.fr}* | pt-PT: **${singleTermMatch.pt}**`,
      sources: ['Dicionário Técnico']
    };
  }

  return null;
}
