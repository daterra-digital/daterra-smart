// src/features/agri-chat/services/agriChatService.ts
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../../lib/firebaseClient';
import type { ChatMessage, SkillId, ActiveExplorationContext } from '../types';
import { explorationContextService } from './explorationContextService';
import { generateLocalAgronomicResponse } from './agronomicResponses';
import { checkRenovateGlossaryResponse } from './renovateGlossaryResponses';
import { geminiClientService } from './geminiClientService';

const LOCAL_STORAGE_KEY_SUBSCRIPTIONS = 'daterra_chat_active_skills';

export const agriChatService = {
  getUserSkillAccess(): Record<SkillId, boolean> {
    const defaultAccess: Record<SkillId, boolean> = {
      geral: true,
      fitofarmacos: false,
      rega: false,
      fertilizacao: false,
      solos: false,
      legislacao: false,
      globalgap: false,
      haccp: false,
      fisiologia: false,
      'calibracao-equipamentos': false
    };

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SUBSCRIPTIONS);
      if (stored) {
        return { ...defaultAccess, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Erro ao carregar direitos locais de skills:', e);
    }
    return defaultAccess;
  },

  unlockSkillLocally(skillId: SkillId): void {
    const current = this.getUserSkillAccess();
    current[skillId] = true;
    localStorage.setItem(LOCAL_STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(current));
  },

  async sendMessage(
    messageText: string,
    activeSkill: SkillId,
    conversationHistory: ChatMessage[] = [],
    explorationContext?: ActiveExplorationContext
  ): Promise<ChatMessage> {
    const isSpecialistKeyword = /(matérias? ativas?|substâncias? ativas?|fungicida comercial|dose por hl|apv|homologação)/i.test(messageText);

    // 1. Guardrail na Skill Geral se for perguntada matéria ativa específica
    if (activeSkill === 'geral' && isSpecialistKeyword) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `O controlo eficaz assenta no conhecimento da biologia da praga e na seleção rigorosa da estratégia (preventiva, curativa ou erradicante). Contudo, a consulta exata do catálogo oficial de matérias ativas autorizadas, limites máximos de resíduos e intervalos de segurança em vigor requer a ativação da **Skill Especialista Fitofármacos**.`,
        skillId: 'geral',
        isGuardrailTriggered: true,
        suggestedSkillId: 'fitofarmacos',
        sources: ['Diretiva Uso Sustentável', 'Boas Práticas Fitossanitárias'],
        explorationContext,
        createdAt: new Date().toISOString()
      };
    }

    const contextPrompt = explorationContextService.formatContextForPrompt(explorationContext);
    const enrichedMessage = contextPrompt ? `${contextPrompt}\n\nQUESTÃO: ${messageText}` : messageText;

    // 2. Invocação Firebase Cloud Function se autenticado
    try {
      if (auth.currentUser) {
        const callAgriChat = httpsCallable<any, { reply?: string }>(functions, 'agriChat');
        const response = await callAgriChat({
          message: enrichedMessage,
          skillId: activeSkill,
          history: conversationHistory.slice(-4),
          explorationContext
        });

        if (response.data?.reply) {
          return {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response.data.reply,
            skillId: activeSkill,
            sources: ['Base de Conhecimento Oficial DATERRA'],
            explorationContext,
            createdAt: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Cloud Function offline, a recorrer ao motor de regras local:', err);
    }

    // 3. Verificação de Termos do Dicionário Técnico
    const glossaryResult = checkRenovateGlossaryResponse(messageText);
    if (glossaryResult) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: glossaryResult.reply,
        skillId: activeSkill,
        sources: glossaryResult.sources,
        explorationContext,
        actionCard: glossaryResult.actionCard,
        createdAt: new Date().toISOString()
      };
    }

    // 4. Invocação Direta da Inteligência Gemini (com Persona DATERRA) se chave presente
    if (geminiClientService.isConfigured()) {
      try {
        const geminiResult = await geminiClientService.askGemini(enrichedMessage, conversationHistory, explorationContext);
        if (geminiResult) {
          return {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: geminiResult.reply,
            skillId: activeSkill,
            sources: geminiResult.sources,
            explorationContext,
            createdAt: new Date().toISOString()
          };
        }
      } catch (geminiErr) {
        console.warn('Gemini offline, a recorrer ao motor local de contingência:', geminiErr);
      }
    }

    // 5. Motor Inteligente Local com Respostas Ricas e Rigor Regulamentar
    const result = generateLocalAgronomicResponse(messageText, activeSkill, explorationContext);

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.reply,
      skillId: activeSkill,
      sources: result.sources,
      explorationContext,
      actionCard: result.actionCard,
      createdAt: new Date().toISOString()
    };
  }
};
