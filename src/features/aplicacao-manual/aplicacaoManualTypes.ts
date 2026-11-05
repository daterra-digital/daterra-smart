/**
 * DATERRA Smart - Aplicação Manual (v2.0 PWA SaaS)
 * Contratos de Dados, Tipos de Estado e Configurações de Percurso
 */

export type ManualCalculationMode = 'dose' | 'concentracao';
export type ManualProductState = 'liquido' | 'solido';
export type ManualPlantStage = 'jovem' | 'adulta';
export type ManualAreaMethod = 'area_conhecida' | 'faixa_medida';
export type ManualRecOrigin = 'rotulo' | 'predefinido' | 'editado';

export type ManualStepId =
  | 'start'
  | 'P1_modo'
  | 'P2_estado_produto'
  | 'P3_quantidade_rotulo'
  | 'P4_calda_preparar'
  | 'P5_estado_planta'
  | 'P6_metodo_ensaio'
  | 'P7A_area_conhecida'
  | 'P7B_comprimento_faixa'
  | 'P7C_largura_faixa'
  | 'P8_agua_gasta'
  | 'P9_volume_recomendado_check'
  | 'P9A_volume_recomendado_input'
  | 'P10_calcular_area_check'
  | 'P11_confirmacao'
  | 'P12_resultado';

export interface ManualCalculationState {
  mode?: ManualCalculationMode;
  productState?: ManualProductState;
  
  // Rótulo
  rotuloValue?: number;
  rotuloUnit?: string;

  // Calda a preparar
  caldaPrepararL?: number; // T em Litros

  // Concentração: Estado da planta
  plantStage?: ManualPlantStage;

  // Ensaio de campo
  hasEnsaio?: boolean;
  areaMethod?: ManualAreaMethod;
  areaConhecidaM2?: number; // A em m²
  faixaComprimentoM?: number;
  faixaLarguraM?: number;
  aguaGastaL?: number; // W em Litros

  // Volume recomendado (Concentração Adulta)
  hasRecVolume?: boolean;
  recVolumeLHa?: number; // R em L/ha
  recOrigin?: ManualRecOrigin;

  // Metadados de rastreio
  parentCalculationId?: string | null;
}

export interface FormattedEquivalents {
  primaryValue: string;
  primaryUnit: string;
  secondaryText: string;
  rawSmall: number;
  smallUnit: string;
  rawLarge: number;
  largeUnit: string;
  isLargePrimary: boolean;
}

export interface ManualCalculationOutput {
  isValid: boolean;
  error?: string;
  
  // Quantidade calculada Q
  quantidadePFSmall: number; // mL ou g
  formattedQ: FormattedEquivalents;

  // Grandezas auxiliares
  areaEnsaioM2?: number; // A
  volumeAplicadoLHa?: number; // V em L/ha
  areaTratadaEstimadaM2?: number; // X em m²
  doseEquivalenteTeorica?: number; // C * R / 100 (mL/ha ou g/ha)
  fatorAjusteRV?: number; // R / V

  // Rótulos e metadados
  isSolid: boolean;
  summaryNotes?: string[];
}
