/**
 * DATERRA Smart - Conteúdo Pedagógico de Microlearning: Aplicação Manual
 * Fontes: Princípios DGAV/EPPO adaptados a pulverizadores manuais.
 * NOTA: Exemplos estritamente sintéticos para apoio aritmético; sujeito a revisão agronómica.
 */

export interface ManualGuideLesson {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string[];
  example?: {
    inputs: string;
    calculation: string;
    result: string;
  };
}

export const MANUAL_GUIDE_LESSONS: ManualGuideLesson[] = [
  {
    id: 'intro',
    title: '1. O que calcula esta ferramenta?',
    category: 'Fundamentos',
    summary: 'Apoio prático para pulverizadores manuais, de dorso ou carrinho.',
    content: [
      'Esta ferramenta calcula a quantidade exata de produto fitofarmacêutico necessária para preparar um determinado volume de calda (por exemplo, 10 L ou 16 L num pulverizador de dorso).',
      'Elimina erros comuns de sobredosagem ou subdosagem que ocorrem frequentemente quando se tenta adivinhar a quantidade por "tampas" ou diluições empíricas.',
      'Funciona 100% offline, respeitando o rótulo do produto e a medição do seu ritmo real de trabalho no terreno.'
    ]
  },
  {
    id: 'rotulo',
    title: '2. Ler Dose vs Concentração no rótulo',
    category: 'Rótulo',
    summary: 'Como distinguir a forma de recomendação oficial.',
    content: [
      '• Dose (por hectare): indicada em L/ha (líquidos) ou kg/ha (sólidos). Exige saber quanto gasta por hectare (ensaio de campo).',
      '• Concentração (por 100 litros): indicada em mL/100 L, g/100 L, ou por hectolitro (1 hL = 100 L).',
      'Importante: 100 L equivale a 1 hL. Se um rótulo indicar 50 mL/hL, significa exatamente 50 mL por cada 100 litros de calda.'
    ],
    example: {
      inputs: 'Rótulo: 150 mL/100 L | Calda a preparar: 15 L',
      calculation: 'Q = (15 L × 150 mL) / 100 = 22,5 mL',
      result: '22,5 mL de produto para o depósito.'
    }
  },
  {
    id: 'ensaio',
    title: '3. Como fazer o ensaio de campo (Área ou Faixa)',
    category: 'Calibração',
    summary: 'Medir o ritmo real de aplicação em poucos passos simples.',
    content: [
      'Coloque apenas água limpa no pulverizador.',
      'Opção A (Área Conhecida): trate uma área conhecida (ex: 50 m²) ao seu ritmo normal de marcha e bombagem.',
      'Opção B (Faixa Medida): meça uma faixa (ex: 20 m de comprimento por 1 m de largura tratada = 20 m²). Trate essa faixa.',
      'Meça com precisão a água gasta para cobrir essa área (W em Litros). O volume de calda por hectare é obtido por: V = (W × 10 000) / Área.'
    ],
    example: {
      inputs: 'Área = 50 m² | Água gasta = 1,5 L',
      calculation: 'V = (1,5 × 10 000) / 50 = 300 L/ha',
      result: 'Volume de aplicação real: 300 L/ha.'
    }
  },
  {
    id: 'adulta_1000',
    title: '4. Concentração em Planta Adulta e Regra dos 1000 L/ha',
    category: 'Agronomia',
    summary: 'Ajuste de concentração para árvores e sebes adultas.',
    content: [
      'Em culturas arbustivas ou arbóreas em estado adulto (maior massa foliar), a concentração recomendada no rótulo está historicamente associada a um volume de referência (normalmente 1000 L/ha).',
      'Se aplicar menos água (ex: 400 L/ha), a quantidade de produto por litro deve ser ajustada para não subdosar a sebe: Q = (T × C × R) / (V × 100).',
      'Por convenção prática estabelecida, quando o rótulo não especifica o volume de referência, utiliza-se a base de 1000 L/ha, mantendo a liberdade de a alterar.'
    ]
  },
  {
    id: 'unidades',
    title: '5. Equivalências práticas (mL, L, dL, g, kg)',
    category: 'Medições',
    summary: 'Medir pequenas quantidades no campo sem confusão.',
    content: [
      '1 Litro (L) = 10 decilitros (dL) = 1000 mililitros (mL).',
      '1 decilitro (dL) = 100 mL.',
      '1 quilograma (kg) = 1000 gramas (g).',
      'Para produtos líquidos, meça sempre com uma proveta graduada ou seringa dosadora limpa e exclusiva para fitofarmacêuticos. Nunca use utensílios domésticos ou alimentares.'
    ]
  }
];
