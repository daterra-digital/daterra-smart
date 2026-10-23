// src/utils/environment.ts

/**
 * Utilitário de deteção de ambiente (localhost vs produção/GitHub Pages)
 */
export const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
};

/**
 * Lista das 10 ferramentas homologadas para publicação no GitHub Pages
 */
export const GITHUB_PAGES_ALLOWED_TOOL_IDS = new Set<string>([
  'ajuste_dose_eppo', // Ajuste da Dose (Método EPPO)
  'calc_area_parede_foliar', // Área de Parede Foliar (LWA)
  'verificador_ph', // Consulta de pH
  'calc_concentracao', // Mistura de Calda (Concentração)
  'calc_dose', // Mistura de Calda (Dose)
  'mistura_compatibilidade', // Ordem de Mistura
  'pre_inspecao_dgav', // Pré-Inspeção
  'comparador_bicos', // Tabelas de Débito (Comparador)
  'calc_velocidade_real', // Velocidade Real de Trabalho
  'calc_volume_copa' // Volume de Copa (TRV)
]);

/**
 * Verifica se uma dada ferramenta está autorizada no ambiente atual
 */
export const isToolAllowedInCurrentEnv = (toolId: string): boolean => {
  if (isLocalhost()) return true;
  return GITHUB_PAGES_ALLOWED_TOOL_IDS.has(toolId);
};
