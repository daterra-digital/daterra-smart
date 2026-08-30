/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Interfaces Declarativas de Configuração de Calculadoras
 * Fase 1 - Fundação
 */

import type { PhysicalDimension, StructuredValue } from '../../../types/calculator.ts';

export interface CalculatorFieldDefinition {
  /** Identificador local no âmbito da calculadora (ex: 'volPreparar') */
  id: string;
  /** Chave do catálogo de variáveis canónicas partilhadas (ex: 'tank_volume') */
  canonicalKey: string;
  /** Rótulo visual oficial (ex: 'Volume a Preparar (L)') */
  label: string;
  /** Grandeza física */
  dimension: PhysicalDimension;
  /** Unidade ativa por defeito */
  defaultUnit: string;
  /** Unidades autorizadas na seleção do teclado/campo */
  allowedUnits: string[];
  /** Valor numérico inicial sugerido */
  defaultValue?: number;
  /** Atalhos rápidos (presets) de valores comuns (ex: [50, 100, 200, 500, 1000]) */
  presets?: number[];
  /** Limites agronómicos recomendados e regras de validação do teclado */
  min?: number;
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  allowDecimal?: boolean;
  maxDecimals?: number;
  allowNegative?: boolean;
  allowExpressions?: boolean;
  integerOnly?: boolean;
  step?: number;
  /** Ficheiro de microlearning contextual específico (ex: 'DoseFAQVolumePreparar.md') */
  helpFile?: string;
  /** Tópico de microlearning para filtragem interna */
  helpTopic?: string;
  /** Obrigatoriedade de preenchimento para acionar o cálculo */
  required?: boolean;
  /** Descrição explicativa do campo */
  description?: string;
  /** Tipo de controlo de entrada (por defeito: 'numeric') */
  type?: 'numeric' | 'select';
  /** Opções autorizadas quando o campo é do tipo 'select' */
  options?: CalculatorFieldOption[];
  /** Função de cálculo reativo de atalhos rápidos com base nos valores atuais dos campos */
  getDynamicPresets?: (values: Record<string, number | string>) => number[];
  /** Metadados agronómicos de unidades (ex: distinção líquido/sólido) */
  unitMetadata?: Record<string, UnitMetadataItem>;
}

export interface CalculatorFieldOption {
  value: string;
  label: string;
  description?: string;
  contextualWarning?: string;
}

export type ProductMeasure = 'liquid' | 'solid';

export interface UnitMetadataItem {
  productMeasure: ProductMeasure;
  majorUnit: string;
  minorUnit: string;
  conversionFactor?: number;
}

export interface CalculatorResultDefinition {
  /** Identificador local do resultado */
  id: string;
  /** Chave do catálogo canónico */
  canonicalKey: string;
  /** Rótulo em caixa alta para o cartão de resultado */
  label: string;
  /** Grandeza física do resultado */
  dimension: PhysicalDimension;
  /** Unidade principal do resultado */
  defaultUnit: string;
  /** Indica se é o resultado de maior destaque visual no painel */
  isPrimary: boolean;
  /** Unidade auxiliar opcional de menor escala (ex: 'mL' quando a principal é 'L') */
  subUnit?: string;
  /** Microlearning específico do resultado */
  helpFile?: string;
  /** Mapeamento de microlearning específico por modo (ex: jovem vs adulta) */
  helpFileByMode?: Record<string, string>;
  helpTopic?: string;
  /** Número de casas decimais para formatação */
  formatDecimals?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface CalculatorModeDefinition {
  /** Identificador local do modo (ex: 'jovem', 'adulta') */
  id: string;
  /** Rótulo visual oficial do modo (ex: 'Planta Jovem', 'Planta Adulta') */
  label: string;
  /** Ícone opcional ('sprout' | 'trees' | 'default') */
  icon?: 'sprout' | 'trees' | 'default';
  /** Descrição explicativa do modo */
  description?: string;
  /** Lista ordenada de IDs dos campos de entrada ativos/visíveis neste modo */
  fieldIds: string[];
}

/**
 * Contrato de Configuração Declarativa de uma Calculadora Oficial DATERRA
 */
export interface CalculatorDefinition {
  /** Identificador oficial (ex: 'calc_dose', 'calc_concentracao', 'calc_area_parede_foliar') */
  id: string;
  /** Versão semântica da fórmula */
  version: string;
  /** Título principal (ex: 'Calculadora de Dose') */
  title: string;
  /** Subtítulo descritivo */
  subtitle: string;
  /** Categoria agronómica (ex: 'PULVERIZAÇÃO', 'CALIBRAÇÃO') */
  category: string;
  /** Badge no cabeçalho */
  badgeLabel?: string;
  /** Ficheiro de microlearning geral da ferramenta (ex: 'DoseFAQGeral.md') */
  generalHelpFile?: string;
  /** Modos operacionais da calculadora (ex: 'jovem' vs 'adulta') */
  modes?: CalculatorModeDefinition[];
  /** Modo ativo por defeito */
  defaultModeId?: string;
  /** Campos de entrada declarados */
  fields: CalculatorFieldDefinition[];
  /** Resultados declarados */
  results: CalculatorResultDefinition[];
  /**
   * Função pura de cálculo matemático:
   * Recebe os inputs estruturados e devolve os outputs estruturados.
   * Não depende de DOM, React nem efeitos colaterais.
   */
  calculate: (inputs: Record<string, StructuredValue>) => Record<string, StructuredValue>;
  /**
   * Validação agronómica opcional com avisos ou bloqueios
   */
  validate?: (inputs: Record<string, StructuredValue>) => ValidationResult;
  /** Mensagem explicativa customizada exibida no resultado quando dados forem inválidos ou incompletos */
  invalidResultNotice?: string;
}

