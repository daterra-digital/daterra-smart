/**
 * DATERRA Smart - Modo de Avaliação de Release Candidates (RC)
 * Permite avaliar em localhost específico (:5175) com etiquetas 'PAGES' e 'RC'.
 * As etiquetas são automaticamente suprimidas em V-PAGES e produção.
 * (< 200 LOC)
 */

export const CURRENT_RC_VERSION = '1.0.1-rc1';

export const CANONICAL_PAGES_TOOL_IDS = new Set([
  'ajuste_dose_eppo',
  'calc_aplicacao_manual',
  'calc_area_parede_foliar',
  'verificador_ph',
  'calc_ph',
  'calc_concentracao',
  'calc_dose',
  'mistura_compatibilidade',
  'ordem_mistura',
  'pre_inspecao_dgav',
  'calc_pre_inspecao',
  'comparador_bicos',
  'calc_tabelas_debito',
  'calc_velocidade_real',
  'calc_volume_copa'
]);

export function isRcEvaluationMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Regra de Blindagem: Em GitHub Pages ou cPanel as etiquetas NUNCA são renderizadas
  const isPublicHost = window.location.hostname.includes('github.io') || 
                       window.location.hostname.includes('daterra.com.pt');
  if (isPublicHost) return false;

  // Ativo no localhost dedicado (:5175), no modo Vite 'rc', ou quando a versão é -rc*
  const isRcPort = window.location.port === '5175';
  const isRcEnv = import.meta.env?.MODE === 'rc' || import.meta.env?.VITE_RELEASE_MODE === 'rc';
  const isRcVersion = CURRENT_RC_VERSION.includes('-rc');

  return isRcPort || isRcEnv || isRcVersion;
}

export function getToolReleaseBadge(toolId: string): 'PAGES' | 'RC' | null {
  if (!isRcEvaluationMode()) return null;
  return CANONICAL_PAGES_TOOL_IDS.has(toolId) ? 'PAGES' : 'RC';
}
