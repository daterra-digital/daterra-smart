/**
 * DATERRA Smart - Roteamento de Perguntas: Aplicação Manual
 * Máquina de Estados Finita e Próximos Passos (< 200 LOC)
 */

import type { ManualCalculationState, ManualStepId } from './aplicacaoManualTypes';

export function getNextManualStep(
  currentStep: ManualStepId,
  state: ManualCalculationState
): ManualStepId {
  switch (currentStep) {
    case 'P1_modo':
      return 'P2_estado_produto';
    case 'P2_estado_produto':
      return 'P3_quantidade_rotulo';
    case 'P3_quantidade_rotulo':
      return 'P4_calda_preparar';
    case 'P4_calda_preparar':
      return state.mode === 'dose' ? 'P6_metodo_ensaio' : 'P5_estado_planta';
    case 'P5_estado_planta':
      return state.plantStage === 'jovem' ? 'P10_calcular_area_check' : 'P6_metodo_ensaio';
    case 'P6_metodo_ensaio':
      return state.areaMethod === 'area_conhecida' ? 'P7A_area_conhecida' : 'P7B_comprimento_faixa';
    case 'P7A_area_conhecida':
      return 'P8_agua_gasta';
    case 'P7B_comprimento_faixa':
      return 'P7C_largura_faixa';
    case 'P7C_largura_faixa':
      return 'P8_agua_gasta';
    case 'P8_agua_gasta':
      if (state.mode === 'dose') return 'P11_confirmacao';
      if (state.plantStage === 'adulta') return 'P9_volume_recomendado_check';
      return 'P11_confirmacao';
    case 'P9_volume_recomendado_check':
      return state.hasRecVolume ? 'P9A_volume_recomendado_input' : 'P11_confirmacao';
    case 'P9A_volume_recomendado_input':
      return 'P11_confirmacao';
    case 'P10_calcular_area_check':
      return state.hasEnsaio ? 'P6_metodo_ensaio' : 'P11_confirmacao';
    default:
      return 'P11_confirmacao';
  }
}
