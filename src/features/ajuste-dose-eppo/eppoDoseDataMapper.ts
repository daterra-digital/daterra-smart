import type { StructuredValue } from '../../types/calculator.ts';

export type DoseUnitMode = 'liquid' | 'solid';
export type TreatmentMode = 'total' | 'band';
export type CropStructure = 'sebe' | 'globular';
export type FoliarInputSource = 'manual' | 'history' | 'profiles';

export interface EppoDoseInputsState {
  doseRotulo: number;
  alturaM: number;
  entrelinhaM: number;
  treatmentMode: TreatmentMode;
  cropStructure: CropStructure;
  larguraCopaM: number;
  lwaRef: number;
  capacidadeDeposito: number;
  volumeCaldaLHa: number;
  unitMode: DoseUnitMode;
  foliarInputSource: FoliarInputSource;
  overrideLwa?: number;
  overrideTrv?: number;
  selectedCultureId?: number;
  selectedCultureName?: string;
  selectedEquipmentId?: number;
  selectedEquipmentName?: string;
  historySourceLabel?: string;
}

export interface EppoDoseCalculationResult {
  lwaReal: number;              // m² LWA/ha
  trvReal: number;              // m³ TRV/ha
  racioAjuste: number;          // LWA_real / LWA_ref
  doseAjustada: number;          // L/ha ou kg/ha
  reducaoPercentual: number;      // % poupança face ao rótulo
  hectaresPorDeposito: number;    // ha cobertos por depósito cheio
  produtoPorDeposito: number;     // L ou kg por depósito
  produtoPorDepositoSub: number;  // mL ou g por depósito
  concentracaoPor100L: number;    // L/100L ou kg/100L
  concentracaoPor100LSub: number; // mL/100L ou g/100L
  isValid: boolean;
}

export function calculateLwa(alturaM: number, entrelinhaM: number): number {
  if (alturaM <= 0 || entrelinhaM <= 0 || !isFinite(alturaM) || !isFinite(entrelinhaM)) return 0;
  return Math.round((2 * alturaM * 10000 / entrelinhaM) * 10) / 10;
}

export function calculateTrv(alturaM: number, larguraM: number, entrelinhaM: number): number {
  if (alturaM <= 0 || larguraM <= 0 || entrelinhaM <= 0) return 0;
  return Math.round((alturaM * larguraM * 10000 / entrelinhaM) * 10) / 10;
}

export function calculateEppoDoseComprehensive(
  doseRotulo: number,
  alturaM: number,
  entrelinhaM: number,
  _treatmentMode: TreatmentMode = 'total',
  cropStructure: CropStructure = 'sebe',
  larguraCopaM: number = 0.8,
  lwaRef: number = 10000,
  capacidadeDeposito: number = 1000,
  volumeCaldaLHa: number = 400,
  overrideLwa?: number,
  overrideTrv?: number
): EppoDoseCalculationResult {
  const invalidResult: EppoDoseCalculationResult = {
    lwaReal: 0, trvReal: 0, racioAjuste: 0, doseAjustada: 0, reducaoPercentual: 0,
    hectaresPorDeposito: 0, produtoPorDeposito: 0, produtoPorDepositoSub: 0,
    concentracaoPor100L: 0, concentracaoPor100LSub: 0, isValid: false
  };

  const lwaReal = (overrideLwa && overrideLwa > 0) ? overrideLwa : calculateLwa(alturaM, entrelinhaM);
  const trvReal = (overrideTrv && overrideTrv > 0) ? overrideTrv : (cropStructure === 'globular' ? calculateTrv(alturaM, larguraCopaM, entrelinhaM) : 0);

  if (
    doseRotulo <= 0 || lwaReal <= 0 || lwaRef <= 0 ||
    capacidadeDeposito <= 0 || volumeCaldaLHa <= 0 ||
    !isFinite(doseRotulo) || !isFinite(lwaReal)
  ) {
    return invalidResult;
  }

  const racioAjuste = Math.round((lwaReal / lwaRef) * 1000) / 1000;
  const rawDoseAjustada = doseRotulo * (lwaReal / lwaRef);
  const doseAjustada = Math.round(rawDoseAjustada * 1000) / 1000;

  const rawReducao = ((doseRotulo - doseAjustada) / doseRotulo) * 100;
  const reducaoPercentual = Math.round(rawReducao * 10) / 10;

  const hectaresPorDeposito = Math.round((capacidadeDeposito / volumeCaldaLHa) * 100) / 100;
  const rawProdutoDeposito = hectaresPorDeposito * doseAjustada;
  const produtoPorDeposito = Math.round(rawProdutoDeposito * 100) / 100;
  const produtoPorDepositoSub = Math.round(rawProdutoDeposito * 1000);

  const rawConc100L = (doseAjustada / volumeCaldaLHa) * 100;
  const concentracaoPor100L = Math.round(rawConc100L * 1000) / 1000;
  const concentracaoPor100LSub = Math.round(rawConc100L * 1000 * 10) / 10;

  return {
    lwaReal, trvReal, racioAjuste, doseAjustada, reducaoPercentual,
    hectaresPorDeposito, produtoPorDeposito, produtoPorDepositoSub,
    concentracaoPor100L, concentracaoPor100LSub, isValid: true
  };
}

export function buildEppoDoseStructuredValues(
  inputs: EppoDoseInputsState,
  result: EppoDoseCalculationResult
): { inputs: Record<string, StructuredValue>; outputs: Record<string, StructuredValue> } {
  const unitLabel = inputs.unitMode === 'liquid' ? 'L/ha' : 'kg/ha';

  return {
    inputs: {
      doseRotulo: {
        rawValue: inputs.doseRotulo, unit: unitLabel, dimension: 'application_rate',
        canonicalKey: 'label_dose', label: 'Dose do rótulo recomendada',
        source: 'user_input', localId: 'doseRotulo', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      alturaM: {
        rawValue: inputs.alturaM, unit: 'm', dimension: 'length',
        canonicalKey: 'canopy_height', label: inputs.treatmentMode === 'band' ? 'Altura da faixa tratada' : 'Altura da parede foliar',
        source: 'user_input', localId: 'alturaM', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      entrelinhaM: {
        rawValue: inputs.entrelinhaM, unit: 'm', dimension: 'length',
        canonicalKey: 'row_spacing', label: 'Distância entrelinha',
        source: 'user_input', localId: 'entrelinhaM', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      capacidadeDeposito: {
        rawValue: inputs.capacidadeDeposito, unit: 'L', dimension: 'volume',
        canonicalKey: 'tank_capacity', label: 'Capacidade do depósito',
        source: 'user_input', localId: 'capacidadeDeposito', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      volumeCaldaLHa: {
        rawValue: inputs.volumeCaldaLHa, unit: 'L/ha', dimension: 'application_rate',
        canonicalKey: 'spray_volume', label: 'Volume de calda calibrado',
        source: 'user_input', localId: 'volumeCaldaLHa', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      }
    },
    outputs: {
      doseAjustada: {
        rawValue: result.doseAjustada, unit: unitLabel, dimension: 'application_rate',
        canonicalKey: 'adjusted_dose', label: 'Dose ajustada EPPO PP 1/239',
        source: 'calculated_output', localId: 'doseAjustada', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      produtoPorDeposito: {
        rawValue: result.produtoPorDeposito, unit: inputs.unitMode === 'liquid' ? 'L' : 'kg', dimension: inputs.unitMode === 'liquid' ? 'volume' : 'mass',
        subValue: result.produtoPorDepositoSub, subUnit: inputs.unitMode === 'liquid' ? 'mL' : 'g',
        canonicalKey: 'product_per_tank', label: 'Quantidade total por depósito',
        source: 'calculated_output', localId: 'produtoPorDeposito', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      quantidade_pf: {
        rawValue: result.produtoPorDeposito, unit: inputs.unitMode === 'liquid' ? 'L' : 'kg', dimension: inputs.unitMode === 'liquid' ? 'volume' : 'mass',
        subValue: result.produtoPorDepositoSub, subUnit: inputs.unitMode === 'liquid' ? 'mL' : 'g',
        canonicalKey: 'product_amount', label: 'Pesticida Necessário',
        source: 'calculated_output', localId: 'quantidade_pf', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      concentracaoPor100L: {
        rawValue: result.concentracaoPor100LSub, unit: inputs.unitMode === 'liquid' ? 'mL/100L' : 'g/100L', dimension: 'concentration',
        canonicalKey: 'concentration_per_100l', label: 'Concentração por 100L de água',
        source: 'calculated_output', localId: 'concentracaoPor100L', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      doseRotulo: {
        rawValue: inputs.doseRotulo, unit: unitLabel, dimension: 'application_rate',
        canonicalKey: 'label_dose', label: 'Dose do rótulo recomendada',
        source: 'user_input', localId: 'doseRotulo', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      reducaoPercentual: {
        rawValue: result.reducaoPercentual, unit: '%', dimension: 'percentage',
        canonicalKey: 'reduction_percentage', label: 'Variação face ao rótulo',
        source: 'calculated_output', localId: 'reducaoPercentual', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      },
      lwaReal: {
        rawValue: result.lwaReal, unit: 'm² LWA/ha', dimension: 'foliar_wall_area',
        canonicalKey: 'leaf_wall_area', label: 'Área de parede foliar real',
        source: 'calculated_output', localId: 'lwaReal', calculatorId: 'calc_ajuste_dose_eppo', calculatorVersion: '2.1.0'
      }
    }
  };
}

export function getEppoKeypadConfig(activeKeypad: string | null, inputs: EppoDoseInputsState) {
  const unit = inputs.unitMode === 'liquid' ? 'L/ha' : 'kg/ha';
  if (activeKeypad === 'doseRotulo') return { label: `Dose do Rótulo (${unit})`, initial: inputs.doseRotulo, common: [1.0, 1.5, 2.0, 2.5], min: 0.1, max: 20 };
  if (activeKeypad === 'alturaM') return { label: inputs.treatmentMode === 'band' ? 'Altura da Faixa Tratada (m)' : 'Altura da Parede Foliar (m)', initial: inputs.alturaM, common: [1.0, 1.2, 1.5, 1.8], min: 0.2, max: 5.0 };
  if (activeKeypad === 'entrelinhaM') return { label: 'Distância Entrelinha (m)', initial: inputs.entrelinhaM, common: [2.0, 2.2, 2.5, 3.0], min: 0.8, max: 10.0 };
  if (activeKeypad === 'larguraCopaM') return { label: 'Largura da Copa (m)', initial: inputs.larguraCopaM, common: [0.6, 0.8, 1.0, 1.5], min: 0.2, max: 6.0 };
  if (activeKeypad === 'capacidadeDeposito') return { label: 'Capacidade do Depósito (L)', initial: inputs.capacidadeDeposito, common: [400, 600, 1000, 1500, 2000], min: 50, max: 10000 };
  return { label: 'Volume de Calda Aplicado (L/ha)', initial: inputs.volumeCaldaLHa, common: [200, 300, 400, 500, 800], min: 50, max: 3000 };
}
