/**
 * DATERRA Smart - Validação Declarativa do Teclado DaterraKeypad
 * Função pura e desacoplada de validação contextual por campo.
 * Sem dependências de JSX ou DOM, permitindo testes nativos e separação arquitetural.
 */

export interface KeypadValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  allowDecimal?: boolean;
  maxDecimals?: number;
  allowNegative?: boolean;
  allowExpressions?: boolean;
  integerOnly?: boolean;
  unit?: string;
}

/**
 * Função pura de validação do valor introduzido no teclado DaterraKeypad.
 * Garante separação arquitetural estrita: valida sintaxe, regras numéricas e limites absolutos do campo,
 * sem impor limites agronómicos globais nem bloquear avisos atípicos.
 */
export function validateKeypadValue(
  value: number,
  expression: string,
  evalError: boolean,
  rules?: KeypadValidationRules
): { isValid: boolean; reason?: string } {
  // 1. Erro sintático ou erro de avaliação (ex: divisão por zero, sintaxe inválida)
  if (evalError) return { isValid: false, reason: 'syntax_error' };

  // 2. Campo obrigatório vazio
  const trimmed = expression ? expression.trim() : '';
  if (!trimmed) {
    if (rules?.required ?? true) return { isValid: false, reason: 'empty' };
  }

  // 3. Expressão incompleta terminando em operador ou separador decimal pendente (ex: '5 +', '2,')
  if (/[+\-*/.,]$/.test(trimmed)) {
    return { isValid: false, reason: 'incomplete_expression' };
  }

  // 4. Garantia de número finito
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return { isValid: false, reason: 'not_finite' };
  }

  // 5. Se expressões matemáticas não forem permitidas no campo
  const allowExpressions = rules?.allowExpressions ?? true;
  if (!allowExpressions && /[+\-*/]/.test(trimmed)) {
    return { isValid: false, reason: 'expressions_not_allowed' };
  }

  // 6. Controlo de polaridade (negativos)
  const allowNegative = rules?.allowNegative ?? false;
  if (!allowNegative && value < 0) {
    return { isValid: false, reason: 'negative_not_allowed' };
  }

  // 7. Mínimo (Inclusivo ou Exclusivo)
  if (rules?.min !== undefined) {
    const minInclusive = rules.minInclusive ?? true;
    if (minInclusive ? value < rules.min : value <= rules.min) {
      return { isValid: false, reason: 'below_min' };
    }
  }

  // 8. Máximo (Inclusivo ou Exclusivo)
  if (rules?.max !== undefined) {
    const maxInclusive = rules.maxInclusive ?? true;
    if (maxInclusive ? value > rules.max : value >= rules.max) {
      return { isValid: false, reason: 'above_max' };
    }
  }

  // 9. Inteiros vs Decimais
  const allowDecimal = rules?.allowDecimal ?? (rules?.integerOnly ? false : true);
  if (rules?.integerOnly || !allowDecimal) {
    if (!Number.isInteger(value)) {
      return { isValid: false, reason: 'decimal_not_allowed' };
    }
    if (trimmed.includes(',') || trimmed.includes('.')) {
      return { isValid: false, reason: 'decimal_not_allowed' };
    }
  }

  // 10. Controlo de Casas Decimais (maxDecimals) analisando cada literal numérico da expressão
  if (allowDecimal && rules?.maxDecimals !== undefined) {
    const tokens = trimmed.replace(/,/g, '.').match(/\d+(?:\.\d+)?/g) || [];
    for (const token of tokens) {
      const parts = token.split('.');
      if (parts.length === 2 && parts[1].length > rules.maxDecimals) {
        return { isValid: false, reason: 'max_decimals_exceeded' };
      }
    }
  }

  return { isValid: true };
}
