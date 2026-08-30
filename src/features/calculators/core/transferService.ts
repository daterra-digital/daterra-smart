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
  // Apenas registos válidos da Calculadora de Dose são processados
  if (!record || record.calculatorId !== 'calc_dose' || record.isDeleted) {
    return [];
  }

  const previews: ToolTransferPreview[] = [];

  // ==========================================
  // ALVO: CALCULADORA DE CONCENTRAÇÃO
  // ==========================================
  const concPreview = evaluateDoseToConcentracao(record);
  // Regra de elegibilidade estrita: só adiciona se tiver pelo menos 1 campo compatível efetivo
  if (concPreview && concPreview.compatibleFields.length > 0) {
    previews.push(concPreview);
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
    targetLabel: 'Concentração Recomendada do PF',
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
