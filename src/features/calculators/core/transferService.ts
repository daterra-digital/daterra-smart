/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Serviço Canónico de Compatibilidade e Transferência de Dados ("Usar noutra ferramenta")
 * Fase 6A & Fase 6B - Regras Estritas de Elegibilidade Operacional
 * 
 * REGRAS CANÓNICAS ESTRITAS:
 * 1. Uma ferramenta só é elegível se possuir pelo menos 1 campo compatível efetivo (compatibleFields.length > 0).
 * 2. Campos com nomes semelhantes (ex: "Volume a Preparar", "Volume Aplicado", "Dose") NÃO são
 *    automaticamente compatíveis sem comprovação de mesmo significado operacional e utilização efetiva no destino.
 * 3. Enquanto não existirem variáveis com significado operacional idêntico e modo que as utilize sem inferência,
 *    a transferência Dose -> Concentração está totalmente desativada (zero campos compatíveis).
 * 4. Não permite conversão direta entre L/ha e mL/hL sem indicação de rótulo e parâmetros da cultura.
 */

import type { CalculationHistoryRecord } from '../../../types/calculator.ts';
import type {
  ToolTransferPreview,
  FieldTransferCandidate,
  UnfilledTargetField,
  IncompatibleSourceValue
} from './transferTypes.ts';

/**
 * Mensagem oficial quando não existem valores compatíveis para uma ferramenta
 */
export const NO_COMPATIBLE_FIELDS_NOTICE =
  'Não existem valores compatíveis para transferir para esta ferramenta.';

/**
 * Avalia as ferramentas compatíveis e mapeamentos seguros para um registo histórico.
 * REGRA DE ELEGIBILIDADE:
 * Se o resultado for zero campos transferíveis (compatibleFields.length === 0), a ferramenta não é elegível.
 */
export function evaluateCalculationTransfer(record: CalculationHistoryRecord): ToolTransferPreview[] {
  // Apenas registos válidos não eliminados são processados
  if (!record || record.isDeleted) {
    return [];
  }

  const previews: ToolTransferPreview[] = [];

  // ==========================================
  // 1. ORIGEM: CALCULADORA DE DOSE
  // ==========================================
  if (record.calculatorId === 'calc_dose') {
    const concPreview = evaluateDoseToConcentracao(record);
    // Regra de elegibilidade estrita: só adiciona se tiver pelo menos 1 campo compatível efetivo
    if (concPreview && concPreview.compatibleFields.length > 0) {
      previews.push(concPreview);
    }
  }

  // ==========================================
  // 2. ORIGEM: CALCULADORA DE VOLUME DE COPA (TRV)
  // ==========================================
  if (record.calculatorId === 'calc_volume_copa') {
    const caldaPreview = evaluateVolumeCopaToCaldaTrv(record);
    if (caldaPreview && caldaPreview.compatibleFields.length > 0) {
      previews.push(caldaPreview);
    }
  }

  return previews;
}

/**
 * Verifica rapidamente se um registo histórico possui algum destino de transferência elegível.
 */
export function hasEligibleTransferTargets(record: CalculationHistoryRecord | null | undefined): boolean {
  if (!record) return false;
  return evaluateCalculationTransfer(record).length > 0;
}

/**
 * Avalia transferência canónica de Dose por Hectare para Concentração da Calda.
 * 
 * REGRA CANÓNICA ESTRITA:
 * Enquanto não existirem variáveis de destino realmente compatíveis entre a Dose e a Concentração,
 * não há campos transferíveis (compatibleFields permanece vazio).
 */
export function evaluateDoseToConcentracao(record: CalculationHistoryRecord): ToolTransferPreview {
  const compatibleFields: FieldTransferCandidate[] = [];
  const unfilledTargetFields: UnfilledTargetField[] = [];
  const incompatibleSourceValues: IncompatibleSourceValue[] = [];

  const inputs = record.inputs;
  const outputs = record.outputs;

  // 1. Campo 'volPrepararDose' (tank_volume | volume | L)
  // REGRA: O volume de calda de um pulverizador de grande cultura não é automaticamente
  // compatível com o volume de preparação de calda localizada por concentração sem contexto de cultura.
  const volPrep = inputs['volPrepararDose'];
  if (volPrep) {
    incompatibleSourceValues.push({
      sourceFieldId: 'volPrepararDose',
      sourceCanonicalKey: 'tank_volume',
      sourceDimension: 'volume',
      sourceLabel: 'Volume a Preparar no Depósito',
      sourceValue: volPrep,
      reasonPt:
        'O volume a preparar para aplicação por área de solo não possui equivalência direta validada para preparação de calda por concentração.'
    });
  }

  // 2. Campo 'volCalda' (spray_volume_rate | application_rate | L/ha)
  // REGRA: Não é utilizado no modo padrão (Planta Jovem) e possui significado operacional distinto.
  const volCalda = inputs['volCalda'];
  if (volCalda) {
    incompatibleSourceValues.push({
      sourceFieldId: 'volCalda',
      sourceCanonicalKey: 'spray_volume_rate',
      sourceDimension: 'application_rate',
      sourceLabel: 'Volume de Calda Aplicado',
      sourceValue: volCalda,
      reasonPt:
        'O débito de calda por hectare não é utilizado no modo de Planta Jovem nem pode ser inferido para a Concentração sem calibração específica.'
    });
  }

  // 3. Campo 'doseValue' (product_dose_rate | application_rate | L/ha ou kg/ha)
  // REGRA: Incompatível com concentração (%) ou mL/hL.
  const doseVal = inputs['doseValue'];
  if (doseVal) {
    incompatibleSourceValues.push({
      sourceFieldId: 'doseValue',
      sourceCanonicalKey: 'product_dose_rate',
      sourceDimension: 'application_rate',
      sourceLabel: 'Dose Recomendada por Hectare',
      sourceValue: doseVal,
      reasonPt:
        'A dose por área de solo tem dimensão e significado físico diferente da concentração do produto na calda.'
    });
  }

  // 4. Resultados de Saída de Dose: 'quantidade_pf' e 'area_tratada_ha'
  const pfOut = outputs['quantidade_pf'];
  if (pfOut) {
    incompatibleSourceValues.push({
      sourceFieldId: 'quantidade_pf',
      sourceCanonicalKey: 'product_commercial_quantity',
      sourceDimension: pfOut.dimension,
      sourceLabel: 'Quantidade Necessária de Produto',
      sourceValue: pfOut,
      reasonPt:
        'Resultado de saída operacional do depósito. Não constitui parâmetro de entrada para a Concentração.'
    });
  }

  const areaOut = outputs['area_tratada_ha'];
  if (areaOut) {
    incompatibleSourceValues.push({
      sourceFieldId: 'area_tratada_ha',
      sourceCanonicalKey: 'treated_area',
      sourceDimension: 'area',
      sourceLabel: 'Área Tratada por Depósito',
      sourceValue: areaOut,
      reasonPt:
        'Resultado de autonomia operacional do pulverizador. Não constitui parâmetro de entrada para a Concentração.'
    });
  }

  // 5. Campos da Calculadora de Concentração
  unfilledTargetFields.push({
    targetFieldId: 'concValue',
    targetCanonicalKey: 'concentration',
    targetDimension: 'concentration',
    targetLabel: 'Concentração Recomendada do Produto',
    targetUnit: 'mL/hL, g/hL ou %',
    reasonPt: 'Definida exclusivamente no rótulo oficial autorizado do produto.'
  });

  return {
    targetCalculatorId: 'calc_concentracao',
    targetCalculatorTitle: 'Calculadora de Concentração',
    targetCalculatorCategory: 'PULVERIZAÇÃO',
    isTransferReady: false,
    compatibleFields, // zero campos compatíveis
    unfilledTargetFields,
    incompatibleSourceValues,
    operationalNoticePt: NO_COMPATIBLE_FIELDS_NOTICE
  };
}

/**
 * Avalia transferência canónica de Volume de Copa (TRV) para Volume de Calda por TRV.
 * 
 * REGRAS CANÓNICAS ESTRITAS:
 * 1. O resultado consolidado 'volumeCopa' (tree_row_volume | m³ TRV/ha) é transferido
 *    diretamente para o campo 'volumeCopaTrv' da Calculadora de Volume de Calda por TRV.
 * 2. O campo 'coeficienteVolumeCalda' (k) NÃO é transferido automaticamente, devendo
 *    ser fornecido pelo técnico ou equipamento (unfilledTargetFields).
 * 3. As medições elementares de copa (altura, largura, entrelinha) são incompatíveis como
 *    entradas diretas da calda, pois a calda consome o TRV consolidado.
 */
export function evaluateVolumeCopaToCaldaTrv(record: CalculationHistoryRecord): ToolTransferPreview {
  const compatibleFields: FieldTransferCandidate[] = [];
  const unfilledTargetFields: UnfilledTargetField[] = [];
  const incompatibleSourceValues: IncompatibleSourceValue[] = [];

  const trvOutput = record.outputs['volumeCopa'];
  if (
    trvOutput &&
    trvOutput.rawValue !== undefined &&
    trvOutput.rawValue !== null &&
    Number(trvOutput.rawValue) > 0
  ) {
    compatibleFields.push({
      sourceFieldId: 'volumeCopa',
      sourceCanonicalKey: 'tree_row_volume',
      sourceDimension: 'tree_row_volume',
      sourceLabel: 'Volume de Copa (TRV)',
      sourceValue: trvOutput,

      targetFieldId: 'volumeCopaTrv',
      targetCanonicalKey: 'tree_row_volume',
      targetDimension: 'tree_row_volume',
      targetLabel: 'Volume de Copa (TRV)',
      targetUnit: 'm³ TRV/ha',

      status: 'direct_match',
      reasonPt:
        'O volume de copa calculado (m³ TRV/ha) é a grandeza canónica direta de entrada para a estimativa de volume de calda por TRV.',
      previewValue: trvOutput.rawValue,
      previewUnit: 'm³ TRV/ha'
    });
  }

  // Campo k da Calculadora de Calda TRV
  unfilledTargetFields.push({
    targetFieldId: 'coeficienteVolumeCalda',
    targetCanonicalKey: 'spray_volume_coefficient',
    targetDimension: 'volume_per_volume',
    targetLabel: 'Coeficiente de Volume de Calda (k)',
    targetUnit: 'L/m³',
    reasonPt:
      'O coeficiente k deve ser definido com base na calibração do equipamento ou recomendação técnica.'
  });

  // Parâmetros elementares de medição de copa
  if (record.inputs['alturaCopa']) {
    incompatibleSourceValues.push({
      sourceFieldId: 'alturaCopa',
      sourceCanonicalKey: 'canopy_height',
      sourceDimension: 'length',
      sourceLabel: 'Altura da copa',
      sourceValue: record.inputs['alturaCopa'],
      reasonPt:
        'Parâmetro geométrico elementar de medição. A ferramenta de destino recebe diretamente o resultado consolidado do Volume de Copa (TRV).'
    });
  }

  if (record.inputs['larguraCopa']) {
    incompatibleSourceValues.push({
      sourceFieldId: 'larguraCopa',
      sourceCanonicalKey: 'canopy_width',
      sourceDimension: 'length',
      sourceLabel: 'Largura média da copa',
      sourceValue: record.inputs['larguraCopa'],
      reasonPt:
        'Parâmetro geométrico elementar de medição. A ferramenta de destino recebe diretamente o resultado consolidado do Volume de Copa (TRV).'
    });
  }

  if (record.inputs['distanciaEntrelinhas']) {
    incompatibleSourceValues.push({
      sourceFieldId: 'distanciaEntrelinhas',
      sourceCanonicalKey: 'row_spacing',
      sourceDimension: 'length',
      sourceLabel: 'Distância entrelinhas',
      sourceValue: record.inputs['distanciaEntrelinhas'],
      reasonPt:
        'Parâmetro geométrico elementar de medição. A ferramenta de destino recebe diretamente o resultado consolidado do Volume de Copa (TRV).'
    });
  }

  return {
    targetCalculatorId: 'calc_volume_calda_trv',
    targetCalculatorTitle: 'Volume de Calda Adequado por TRV',
    targetCalculatorCategory: 'CALIBRAÇÃO',
    isTransferReady: compatibleFields.length > 0,
    compatibleFields,
    unfilledTargetFields,
    incompatibleSourceValues,
    operationalNoticePt:
      'Apenas o Volume de Copa (TRV) consolidado será transferido. O coeficiente k deve ser definido manualmente.'
  };
}

