/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Contrato de Tipos para o DaterraKeypad Unificado e Mudanças de Domínio
 */

export type UnitChangeAction = 'preserve' | 'convert' | 'reset';

export interface UnitChangeResolution {
  /** Ação prescrita pela camada de domínio da calculadora */
  action: UnitChangeAction;
  /** Novo valor caso action === 'convert' */
  convertedValue?: number;
  /** Aviso ou mensagem explicativa i18n para exibição imediata */
  noticeKey?: string;
  /** Texto livre de fallback caso a chave não esteja disponível */
  noticeText?: string;
}

export interface UnifiedKeypadField {
  id: string;
  label: string;
  /** Valor numérico ou vazio (se resetado ou em digitação inicial) */
  value: number | '';
  /** Expressão visível no visor (ex.: "200 + 150", "12,5" ou "0") */
  rawExpression: string;
  /** Unidade ativa do campo */
  unit: string;
  /** Lista de unidades permitidas */
  availableUnits: string[];
  /** Callback puro de domínio fornecido pela calculadora para gerir alterações de unidade */
  onUnitChange?: (oldUnit: string, newUnit: string, currentValue: number | '') => UnitChangeResolution;
  /** Atalhos rápidos (presets numéricos) */
  presets?: number[];
  /** Se o campo é de preenchimento obrigatório */
  required?: boolean;
  /** Limite inferior aceitável */
  min?: number;
  /** Limite superior aceitável */
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  /** Casas decimais preferenciais */
  decimalPlaces?: number;
  /** Chave de ajuda para microlearning associado */
  helpKey?: string;
  description?: string;
}

export interface UnifiedKeypadResult {
  label: string;
  primaryValue: string | number;
  primaryUnit: string;
  secondaryText?: string;
  subValue?: string | number | null;
  subUnit?: string | null;
  isValid: boolean;
  /** Se a expressão matemática está completa ou ainda em digitação transitória */
  isComplete?: boolean;
  /** Mensagem ou estado contextual a apresentar no mostrador */
  statusMessage?: string;
}

export interface KeypadModeOption {
  id: string;
  label: string;
  fieldIds?: string[];
}

export interface DaterraUnifiedKeypadModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  /** Lista opcional de modos da calculadora (ex: 'Planta Jovem' vs 'Planta Adulta') */
  modes?: KeypadModeOption[];
  activeModeId?: string;
  onModeChange?: (modeId: string) => void;
  /** Campo inicial a selecionar aquando da abertura */
  initialFieldId?: string;
  /** Campos da calculadora a editar */
  fields: UnifiedKeypadField[];
  /** Descarte total de alterações */
  onCancel: () => void;
  /** Confirmação e devolução dos campos validados */
  onConfirm: (
    confirmedFields: Record<string, { value: number; unit: string; rawExpression: string }>,
    confirmedModeId?: string
  ) => void;
  /** Função de cálculo reativo em tempo real para o mostrador superior */
  onCalculate: (
    currentValues: Record<string, { value: number; unit: string }>,
    modeId?: string
  ) => UnifiedKeypadResult;
}
