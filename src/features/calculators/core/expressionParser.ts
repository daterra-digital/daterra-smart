/**
 * DATERRA Smart - Parser Aritmético Determinístico e Seguro
 * Algoritmo puramente funcional (Recursive Descent Parser)
 * Zero eval(), zero Function(), com limites estritos de segurança e tipagem completa.
 */

export type ParseErrorCode =
  | 'emptyExpression'
  | 'divisionByZero'
  | 'invalidSyntax'
  | 'expressionTooLong'
  | 'excessiveNesting'
  | 'outOfRange';

export interface ParseResult {
  /** Valor numérico exato avaliado (sem arredondamento prematuro) */
  value: number | null;
  /** Expressão original fornecida pelo utilizador */
  rawExpression: string;
  /** Expressão normalizada interna (vírgulas convertidas para pontos, operadores tipográficos padronizados) */
  normalized: string;
  /** Se a expressão está gramaticalmente completa para cálculo final */
  isComplete: boolean;
  /** Código de erro tipado se a expressão for inválida */
  error?: ParseErrorCode;
  /** Mensagem técnica descritiva em inglês para depuração */
  debugMessage?: string;
}

const MAX_EXPRESSION_LENGTH = 50;
const MAX_NESTING_DEPTH = 5;

type TokenType = 'NUMBER' | 'PLUS' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
  numValue?: number;
}

/**
 * Converte a string de entrada numa sequência de tokens seguros.
 */
function tokenize(input: string): { tokens: Token[]; hasTrailingOperator: boolean; error?: ParseErrorCode } {
  const tokens: Token[] = [];
  let i = 0;
  const len = input.length;

  while (i < len) {
    const char = input[i];

    if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
      i++;
      continue;
    }

    if (char === '+') {
      tokens.push({ type: 'PLUS', value: '+' });
      i++;
    } else if (char === '-' || char === '−') {
      tokens.push({ type: 'MINUS', value: '-' });
      i++;
    } else if (char === '*' || char === '×') {
      tokens.push({ type: 'MULTIPLY', value: '*' });
      i++;
    } else if (char === '/' || char === '÷') {
      tokens.push({ type: 'DIVIDE', value: '/' });
      i++;
    } else if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
    } else if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
    } else if (char >= '0' && char <= '9') {
      let numStr = '';
      let hasDot = false;

      while (i < len) {
        const c = input[i];
        if (c >= '0' && c <= '9') {
          numStr += c;
          i++;
        } else if ((c === '.' || c === ',') && !hasDot) {
          hasDot = true;
          numStr += '.';
          i++;
        } else {
          break;
        }
      }

      // Caso termine em ponto/vírgula pendente (ex: "12.")
      if (numStr.endsWith('.')) {
        tokens.push({ type: 'NUMBER', value: numStr, numValue: parseFloat(numStr.slice(0, -1)) || 0 });
      } else {
        const parsed = parseFloat(numStr);
        tokens.push({ type: 'NUMBER', value: numStr, numValue: parsed });
      }
    } else if (char === '.' || char === ',') {
      // Começou com vírgula/ponto solto (ex: ",5")
      let numStr = '0.';
      i++;
      while (i < len && input[i] >= '0' && input[i] <= '9') {
        numStr += input[i];
        i++;
      }
      const parsed = parseFloat(numStr);
      tokens.push({ type: 'NUMBER', value: numStr, numValue: parsed });
    } else {
      // Carater proibido (qualquer coisa que não dígitos ou operadores matemáticos)
      return { tokens: [], hasTrailingOperator: false, error: 'invalidSyntax' };
    }
  }

  // Verificar se termina em operador transitório aberto (ex: "200 +", "(", "12 *")
  const lastToken = tokens[tokens.length - 1];
  const hasTrailingOperator =
    lastToken !== undefined &&
    (lastToken.type === 'PLUS' ||
      lastToken.type === 'MINUS' ||
      lastToken.type === 'MULTIPLY' ||
      lastToken.type === 'DIVIDE' ||
      lastToken.type === 'LPAREN');

  return { tokens, hasTrailingOperator };
}

class ParserContext {
  private tokens: Token[];
  private pos = 0;
  private nestingDepth = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  consume(): Token {
    return this.tokens[this.pos++];
  }

  isAtEnd(): boolean {
    return this.pos >= this.tokens.length;
  }

  parse(): number {
    if (this.tokens.length === 0) {
      throw new Error('emptyExpression');
    }
    const result = this.parseExpression();
    if (!this.isAtEnd()) {
      throw new Error('invalidSyntax');
    }
    if (!Number.isFinite(result) || Number.isNaN(result)) {
      throw new Error('invalidSyntax');
    }
    return result;
  }

  private parseExpression(): number {
    let left = this.parseTerm();

    while (!this.isAtEnd()) {
      const token = this.peek();
      if (!token) break;

      if (token.type === 'PLUS') {
        this.consume();
        const right = this.parseTerm();
        left = left + right;
      } else if (token.type === 'MINUS') {
        this.consume();
        const right = this.parseTerm();
        left = left - right;
      } else {
        break;
      }
    }

    return left;
  }

  private parseTerm(): number {
    let left = this.parseFactor();

    while (!this.isAtEnd()) {
      const token = this.peek();
      if (!token) break;

      if (token.type === 'MULTIPLY') {
        this.consume();
        const right = this.parseFactor();
        left = left * right;
      } else if (token.type === 'DIVIDE') {
        this.consume();
        const right = this.parseFactor();
        if (right === 0) {
          throw new Error('divisionByZero');
        }
        left = left / right;
      } else {
        break;
      }
    }

    return left;
  }

  private parseFactor(): number {
    const token = this.peek();
    if (!token) {
      throw new Error('invalidSyntax');
    }

    // Sinal unário positivo ou negativo (+x ou -x)
    if (token.type === 'PLUS') {
      this.consume();
      return this.parseFactor();
    }
    if (token.type === 'MINUS') {
      this.consume();
      return -this.parseFactor();
    }

    if (token.type === 'NUMBER') {
      this.consume();
      return token.numValue ?? 0;
    }

    if (token.type === 'LPAREN') {
      this.consume();
      this.nestingDepth++;
      if (this.nestingDepth > MAX_NESTING_DEPTH) {
        throw new Error('excessiveNesting');
      }

      const val = this.parseExpression();

      const closeToken = this.peek();
      if (!closeToken || closeToken.type !== 'RPAREN') {
        throw new Error('invalidSyntax');
      }
      this.consume();
      this.nestingDepth--;

      return val;
    }

    throw new Error('invalidSyntax');
  }
}

/**
 * Função pura principal que avalia uma expressão aritmética.
 * Suporta estados transitórios (edição em curso) sem corromper a entrada.
 */
export function parseExpression(rawInput: string): ParseResult {
  const trimmed = rawInput.trim();

  if (trimmed === '' || trimmed === '0') {
    return {
      value: trimmed === '0' ? 0 : null,
      rawExpression: rawInput,
      normalized: trimmed === '0' ? '0' : '',
      isComplete: trimmed === '0',
      error: trimmed === '' ? 'emptyExpression' : undefined
    };
  }

  if (trimmed.length > MAX_EXPRESSION_LENGTH) {
    return {
      value: null,
      rawExpression: rawInput,
      normalized: trimmed,
      isComplete: false,
      error: 'expressionTooLong',
      debugMessage: `Comprimento ${trimmed.length} excede o limite de ${MAX_EXPRESSION_LENGTH}`
    };
  }

  const { tokens, hasTrailingOperator, error: tokenError } = tokenize(trimmed);

  if (tokenError) {
    return {
      value: null,
      rawExpression: rawInput,
      normalized: trimmed,
      isComplete: false,
      error: tokenError
    };
  }

  // Normalização visual para armazenamento limpo
  const normalized = tokens.map((t) => t.value).join('');

  // Se terminar em operador transitório ou parêntese aberto, está incompleto mas não é erro fatal
  if (hasTrailingOperator) {
    return {
      value: null,
      rawExpression: rawInput,
      normalized,
      isComplete: false
    };
  }

  try {
    const parser = new ParserContext(tokens);
    const value = parser.parse();

    return {
      value,
      rawExpression: rawInput,
      normalized,
      isComplete: true
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'invalidSyntax';
    const isKnownError =
      message === 'divisionByZero' ||
      message === 'expressionTooLong' ||
      message === 'excessiveNesting' ||
      message === 'emptyExpression' ||
      message === 'invalidSyntax' ||
      message === 'outOfRange';

    return {
      value: null,
      rawExpression: rawInput,
      normalized,
      isComplete: false,
      error: isKnownError ? (message as ParseErrorCode) : 'invalidSyntax',
      debugMessage: message
    };
  }
}

/**
 * Formata um número bruto para exibição amigável em pt-PT (vírgula decimal sem agrupador de milhares para edição).
 */
export function formatNumberForDisplay(
  num: number | null | undefined,
  maxFractionDigits: number = 3
): string {
  if (num === null || num === undefined || Number.isNaN(num) || !Number.isFinite(num)) {
    return '0';
  }
  return new Intl.NumberFormat('pt-PT', {
    maximumFractionDigits: maxFractionDigits,
    useGrouping: false
  }).format(num);
}
