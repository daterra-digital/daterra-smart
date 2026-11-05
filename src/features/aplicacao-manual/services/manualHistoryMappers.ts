/**
 * DATERRA Smart - Mapeadores de Estruturas Canónicas de Histórico
 * Conversão bidirecional entre Estado da UI e StructuredValue (< 200 LOC)
 */

import type { StructuredValue } from '../../../types/calculator';
import type { ManualCalculationState, ManualCalculationOutput } from '../aplicacaoManualTypes';

export const MANUAL_CALC_ID = 'calc_aplicacao_manual';
export const MANUAL_CALC_VERSION = '1.0.0';

export function buildManualStructuredInputs(state: ManualCalculationState): Record<string, StructuredValue> {
  const inputs: Record<string, StructuredValue> = {};

  const makeVal = (
    localId: string,
    canonicalKey: string,
    label: string,
    rawValue: number | string,
    unit: string,
    dimension: any
  ): StructuredValue => ({
    localId,
    canonicalKey,
    label,
    rawValue,
    unit,
    dimension,
    source: 'user_input',
    calculatorId: MANUAL_CALC_ID,
    calculatorVersion: MANUAL_CALC_VERSION
  });

  if (state.mode) {
    inputs['mode'] = makeVal('mode', 'calculation_mode', 'Modo de Cálculo', state.mode, '', 'text');
  }
  if (state.productState) {
    inputs['productState'] = makeVal('productState', 'product_state', 'Estado do Produto', state.productState, '', 'text');
  }
  if (state.rotuloValue !== undefined) {
    const dim = state.mode === 'dose' ? 'application_rate' : 'concentration';
    inputs['rotuloValue'] = makeVal('rotuloValue', 'label_rate', 'Quantidade do Rótulo', state.rotuloValue, state.rotuloUnit || '', dim);
  }
  if (state.caldaPrepararL !== undefined) {
    inputs['caldaPrepararL'] = makeVal('caldaPrepararL', 'spray_tank_volume', 'Calda a Preparar', state.caldaPrepararL, 'L', 'volume');
  }
  if (state.plantStage) {
    inputs['plantStage'] = makeVal('plantStage', 'plant_stage', 'Estado da Planta', state.plantStage, '', 'text');
  }
  if (state.hasEnsaio) {
    inputs['hasEnsaio'] = makeVal('hasEnsaio', 'has_test', 'Ensaio Realizado', 'true', '', 'text');
    if (state.areaMethod) {
      inputs['areaMethod'] = makeVal('areaMethod', 'area_method', 'Método de Área', state.areaMethod, '', 'text');
    }
    if (state.areaConhecidaM2 !== undefined) {
      inputs['areaConhecidaM2'] = makeVal('areaConhecidaM2', 'known_area', 'Área do Ensaio', state.areaConhecidaM2, 'm²', 'area');
    }
    if (state.faixaComprimentoM !== undefined) {
      inputs['faixaComprimentoM'] = makeVal('faixaComprimentoM', 'strip_length', 'Comprimento da Faixa', state.faixaComprimentoM, 'm', 'length');
    }
    if (state.faixaLarguraM !== undefined) {
      inputs['faixaLarguraM'] = makeVal('faixaLarguraM', 'strip_width', 'Largura da Faixa', state.faixaLarguraM, 'm', 'length');
    }
    if (state.aguaGastaL !== undefined) {
      inputs['aguaGastaL'] = makeVal('aguaGastaL', 'water_used', 'Água Gasta no Ensaio', state.aguaGastaL, 'L', 'volume');
    }
  }
  if (state.recVolumeLHa !== undefined) {
    inputs['recVolumeLHa'] = makeVal('recVolumeLHa', 'recommended_volume', 'Volume Recomendado', state.recVolumeLHa, 'L/ha', 'application_rate');
    inputs['recOrigin'] = makeVal('recOrigin', 'rec_origin', 'Origem do Volume Recomendado', state.recOrigin || 'rotulo', '', 'text');
  }

  return inputs;
}

export function buildManualStructuredOutputs(output: ManualCalculationOutput): Record<string, StructuredValue> {
  const outputs: Record<string, StructuredValue> = {};

  const makeOut = (
    localId: string,
    canonicalKey: string,
    label: string,
    rawValue: number | string,
    unit: string,
    dimension: any,
    subValue?: number | string | null,
    subUnit?: string | null
  ): StructuredValue => ({
    localId,
    canonicalKey,
    label,
    rawValue,
    unit,
    dimension,
    source: 'calculated_output',
    calculatorId: MANUAL_CALC_ID,
    calculatorVersion: MANUAL_CALC_VERSION,
    subValue,
    subUnit
  });

  const eq = output.formattedQ;
  outputs['quantidade_pf'] = makeOut(
    'quantidade_pf',
    'required_product',
    'Produto Necessário',
    eq.isLargePrimary ? eq.rawLarge : eq.rawSmall,
    eq.primaryUnit,
    output.isSolid ? 'mass' : 'volume',
    eq.isLargePrimary ? eq.rawSmall : eq.rawLarge,
    eq.isLargePrimary ? eq.smallUnit : eq.largeUnit
  );

  if (output.volumeAplicadoLHa !== undefined) {
    outputs['volumeAplicadoLHa'] = makeOut('volumeAplicadoLHa', 'applied_volume', 'Volume Aplicado no Ensaio', Math.round(output.volumeAplicadoLHa), 'L/ha', 'application_rate');
  }
  if (output.areaEnsaioM2 !== undefined) {
    outputs['areaEnsaioM2'] = makeOut('areaEnsaioM2', 'test_area', 'Área Medida no Ensaio', output.areaEnsaioM2, 'm²', 'area');
  }
  if (output.areaTratadaEstimadaM2 !== undefined) {
    outputs['areaTratadaEstimadaM2'] = makeOut('areaTratadaEstimadaM2', 'estimated_covered_area', 'Área Estimada a Tratar', Math.round(output.areaTratadaEstimadaM2), 'm²', 'area');
  }
  if (output.doseEquivalenteTeorica !== undefined) {
    outputs['doseEquivalenteTeorica'] = makeOut('doseEquivalenteTeorica', 'equivalent_dose', 'Dose Equivalente Teórica', output.doseEquivalenteTeorica, output.isSolid ? 'g/ha' : 'mL/ha', 'application_rate');
  }

  return outputs;
}
