// src/features/agri-chat/services/geminiClientService.ts
import type { ChatMessage, ActiveExplorationContext } from '../types';
import { buildAssistantSystemPrompt } from './assistantPersona';

interface GeminiResponseResult {
  reply: string;
  sources: string[];
}

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest'
];

export const geminiClientService = {
  isConfigured(): boolean {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    return typeof key === 'string' && key.trim().length > 10;
  },

  async askGemini(
    prompt: string,
    history: ChatMessage[] = [],
    explorationContext?: ActiveExplorationContext
  ): Promise<GeminiResponseResult | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.isConfigured() || !apiKey) {
      return null;
    }

    const systemInstruction = buildAssistantSystemPrompt(explorationContext);
    const recentHistory = history.slice(-6);

    const contents = [
      ...recentHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ];

    for (const model of CANDIDATE_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1200
            }
          })
        });

        if (!response.ok) {
          console.warn(`Modelo ${model} retornou ${response.status}, a tentar alternativa...`);
          continue;
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText && typeof replyText === 'string') {
          return {
            reply: replyText.trim(),
            sources: ['DATERRA Smart Assistente', 'Dicionário Técnico']
          };
        }
      } catch (err) {
        console.warn(`Erro no modelo ${model}:`, err);
      }
    }

    return null;
  }
};
