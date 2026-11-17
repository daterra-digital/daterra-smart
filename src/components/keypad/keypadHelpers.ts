import { parseExpression } from '../../features/calculators/core/expressionParser';
import type { KeypadValidationRules } from '../keypadValidation';

export function formatKeypadInitialExpression(initialValue?: string | number | null): string {
  if (initialValue === undefined || initialValue === null) return '';
  const trimmed = String(initialValue).trim();
  if (!trimmed) return '';
  return trimmed.replace(/\./g, ',');
}

export function applyKeypadCharacter(
  prev: string,
  rawChar: string,
  allowNegative = false
): string {
  const char = rawChar === '.' ? ',' : rawChar;
  const isOperator = char === '+' || char === '-' || char === '*' || char === '/';

  if (prev === '') {
    if (char === ',') return '0,';
    if (char === '-') return '-';
    if (isOperator) return `0${char}`;
    return char;
  }

  if (prev === '0') {
    if (char === ',') return '0,';
    if (char === '-' && allowNegative) return '-';
    if (isOperator) return `0${char}`;
    return char;
  }

  return `${prev}${char}`;
}

export function applyKeypadBackspace(prev: string): string {
  return prev.length <= 1 ? '' : prev.slice(0, -1);
}

export function evaluateKeypadExpression(expression: string): {
  evaluatedResult: number;
  evalError: boolean;
} {
  const trimmed = expression ? expression.trim() : '';
  if (!trimmed) {
    return { evaluatedResult: 0, evalError: false };
  }

  // Tolera digitação transitória terminada num operador/vírgula único (validação mantém OK desativado via incomplete_expression).
  const evalTarget = /[+\-*/.,]$/.test(trimmed) ? trimmed.slice(0, -1).trim() : trimmed;
  if (!evalTarget) {
    return { evaluatedResult: 0, evalError: false };
  }

  const parsed = parseExpression(evalTarget);
  if (parsed.error || !parsed.isComplete || parsed.value === null || !Number.isFinite(parsed.value)) {
    return { evaluatedResult: 0, evalError: true };
  }

  return { evaluatedResult: parsed.value, evalError: false };
}

export function getKeypadValidationMessage(
  reason: string | undefined,
  evalError: boolean,
  rules: KeypadValidationRules | undefined,
  unitSuffix: string,
  formatNum: (n: number) => string
): string | null {
  if (evalError) return 'Expressão numérica inválida.';
  if (!reason) return null;

  switch (reason) {
    case 'below_min':
      return rules?.min !== undefined ? `Valor mínimo: ${formatNum(rules.min)}${unitSuffix}` : 'Valor abaixo do mínimo.';
    case 'above_max':
      return rules?.max !== undefined ? `Valor máximo: ${formatNum(rules.max)}${unitSuffix}` : 'Valor acima do máximo.';
    case 'empty':
      return 'Introduza um valor.';
    case 'incomplete_expression':
      return 'Conclua o número ou expressão antes de confirmar.';
    case 'negative_not_allowed':
      return 'Este campo não admite valores negativos.';
    case 'decimal_not_allowed':
      return 'Este campo admite apenas números inteiros.';
    case 'max_decimals_exceeded':
      return rules?.maxDecimals !== undefined
        ? `Máximo de ${rules.maxDecimals} casa(s) decimal(is).`
        : 'Número de casas decimais excedido.';
    case 'expressions_not_allowed':
      return 'Este campo não admite operadores aritméticos.';
    case 'syntax_error':
    case 'not_finite':
      return 'Expressão numérica inválida.';
    default:
      return null;
  }
}
