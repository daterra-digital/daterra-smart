export interface PhMicrolearningTopic {
  id: string;
  number: number;
  columnCode: string;
  icon: string;
  category: string;
  title: string;
  keyConcept: string;
  whatIsIt: string;
  whyItMatters: string[];
  practicalRules: { label: string; detail: string; badgeColor?: string }[];
  actionNow: string;
  referenceStandard: string;
}

export interface PhMicrolearningQuiz {
  id: string;
  substance: string;
  category: string;
  specs: string;
  question: string;
  answer: string;
}

export const PH_MICROLEARNING_TOPICS: PhMicrolearningTopic[] = [
  {
    id: 'pka-equilibrio',
    number: 1,
    columnCode: 'Coluna C',
    icon: '⚗️',
    category: 'Química da Calda',
    title: 'Constante de Dissociação (pKa a 25 °C)',
    keyConcept: 'A "chave de ignição" química da molécula na água.',
    whatIsIt:
      'É o valor de pH no qual exatamente 50% da molécula está ionizada (com carga elétrica) e 50% está na sua forma neutra (sem carga).',
    whyItMatters: [
      'As plantas e as cutículas dos insetos e fungos são cerosas e lipofílicas: as moléculas sem carga elétrica atravessam a cutícula muito mais depressa.',
      'Quando o pH da calda se desvia drasticamente do pKa, a molécula transforma-se numa forma iónica polar (repelida pela cera da folha) ou precipita no fundo do depósito.'
    ],
    practicalRules: [
      {
        label: 'Valor Numérico Baixo (2.0 a 5.7)',
        detail: 'Ácido fraco (ex.: Glifosato com pKa ≈ 5.73). Beneficia de águas ácidas para maximizar a penetração cuticular.',
        badgeColor: 'bg-amber-50 text-amber-900 border-amber-200'
      },
      {
        label: 'Valor Numérico Elevado (> 8.0)',
        detail: 'Base fraca. Mantém estabilidade em caldas neutras a ligeiramente alcalinas.',
        badgeColor: 'bg-sky-50 text-sky-900 border-sky-200'
      },
      {
        label: 'Não ionizável',
        detail: 'Moléculas neutras cuja carga não varia com o pH normal da água (ex.: Piretroides, Estrobilurinas). O foco é prevenir a hidrólise.',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
      },
      {
        label: 'Não aplicável',
        detail: 'Microrganismos vivos (bactérias, fungos antagónicos) ou extratos botânicos.',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200'
      }
    ],
    actionNow:
      'O pKa indica como a água da exploração afeta a absorção da molécula. Se a calda estiver no pH errado, a planta absorve menos substância ativa e desperdiça-se produto sem eficácia.',
    referenceStandard: 'Físico-Química IUPAC / FAO'
  },
  {
    id: 'ph-ideal',
    number: 2,
    columnCode: 'Coluna D',
    icon: '🧪',
    category: 'Química da Calda',
    title: 'pH Ideal da Calda',
    keyConcept: 'A zona de segurança e longevidade da mistura no depósito.',
    whatIsIt:
      'O intervalo ótimo de acidez ou alcalinidade da água no qual o produto fitofarmacêutico não sofre hidrólise (degradação química acelerada) nem perde estabilidade biológica.',
    whyItMatters: [
      'Hidrólise Alcalina: Em águas alcalinas (pH > 7.5–8.0), substâncias sensíveis (como captana, cimoxanil ou azadiractina) podem degradar 50% da substância ativa em apenas 15 a 30 minutos dentro do depósito.',
      'Fitotoxicidade Ácida: Descer o pH abaixo de 5.0 com produtos cúpricos (Calda Bordalesa, Oxicloreto de Cobre) liberta iões de cobre solúvel em excesso, provocando queimaduras severas em folhas e frutos.'
    ],
    practicalRules: [
      {
        label: '🔴 pH 3 a 5 • Ultra-ácido',
        detail: 'Reguladores específicos e ácidos orgânicos (ex.: Etefão, Ácido Acético).',
        badgeColor: 'bg-rose-50 text-rose-900 border-rose-200'
      },
      {
        label: '🟡 pH 4 a 6 • Ácido obrigatório',
        detail: 'Exige acidificação prévia da água (ex.: Glifosato, Captana, Cimoxanil).',
        badgeColor: 'bg-amber-50 text-amber-900 border-amber-200'
      },
      {
        label: '🟢 pH 5 a 7 • Neutro a ligeiramente ácido',
        detail: 'Zona de ouro para mais de 70% dos produtos fitofarmacêuticos e agentes biológicos.',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200'
      },
      {
        label: '🔵 pH 6 a 8 / 7 a 8.5 • Neutro a alcalino',
        detail: 'Ideal para Sulfonilureias, Enxofre, Cobre e Bicarbonato de Potássio.',
        badgeColor: 'bg-sky-50 text-sky-900 border-sky-200'
      }
    ],
    actionNow:
      'Meça e corrija sempre o pH da água limpa no depósito antes de introduzir os produtos fitofarmacêuticos para impedir a decomposição durante a pulverização.',
    referenceStandard: 'Boas Práticas DGAV / EPPO'
  },
  {
    id: 'instrucao-pratica',
    number: 3,
    columnCode: 'Coluna E',
    icon: '🚜',
    category: 'Operação no Campo',
    title: 'Instrução Prática para o Agricultor',
    keyConcept: 'A regra de ouro no terreno (Call to Action imediato).',
    whatIsIt:
      'A síntese agronómica operacional concebida para apoiar o operador no momento exato em que prepara o depósito do pulverizador.',
    whyItMatters: [
      'Transforma parâmetros analíticos de laboratório numa decisão direta sobre se deve acidificar a água, misturar de imediato ou evitar guardar sobras de calda.'
    ],
    practicalRules: [
      {
        label: 'Requer águas ácidas; aplicar logo após preparação',
        detail: 'Uso obrigatório de regulador/acidificante de pH no depósito. Nunca deixar a calda preparada de um dia para o outro.',
        badgeColor: 'bg-amber-50 text-amber-900 border-amber-200'
      },
      {
        label: 'Estável em caldas ligeiramente ácidas; aplicar no próprio dia',
        detail: 'Compatível com águas normais (pH 6.0 a 6.8). Evitar misturar com produtos alcalinos sem tamponamento.',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200'
      },
      {
        label: 'Muito estável na maioria das caldas',
        detail: 'Grande amplitude operacional; excelente parceiro de mistura sem exigência crítica de correção de pH.',
        badgeColor: 'bg-sky-50 text-sky-900 border-sky-200'
      }
    ],
    actionNow:
      'Respeite a ordem de enchimento no depósito: primeiro 50% de água limpa, depois o corretor de pH e só de seguida os produtos fitofarmacêuticos.',
    referenceStandard: 'Protocolo W.A.L.E.S. / DGAV'
  },
  {
    id: 'risco-resistencia',
    number: 4,
    columnCode: 'Coluna F',
    icon: '🛡️',
    category: 'Gestão de Resistências',
    title: 'Risco de Resistência Fitossanitária',
    keyConcept: 'A preservação da eficácia das moléculas para as próximas campanhas.',
    whatIsIt:
      'A probabilidade genética de a praga, fungo ou infestante selecionar mutações que anulam a eficácia da substância ativa devido ao uso repetido.',
    whyItMatters: [
      'Repetir o mesmo mecanismo bioquímico seleciona populações resistentes no pomar ou vinha, obrigando a doses mais altas ou perda total de controlo.'
    ],
    practicalRules: [
      {
        label: '🔴 Alto (Sítio Único)',
        detail: 'Ex.: Diamidas (IRAC 28), Estrobilurinas (FRAC 11), Sulfonilureias (HRAC 2). Limite rígido de 1 a 2 aplicações consecutivas e rotação estrita.',
        badgeColor: 'bg-rose-50 text-rose-900 border-rose-200'
      },
      {
        label: '🟡 Médio (Sítio Específico)',
        detail: 'Ex.: Triazóis (FRAC 3), Tricetonas (HRAC 27). Alternar grupos químicos ou associar produtos multissítio na mesma campanha.',
        badgeColor: 'bg-amber-50 text-amber-900 border-amber-200'
      },
      {
        label: '🟢 Baixo / Não aplicável (Multissítio / Biológicos)',
        detail: 'Ex.: Enxofre (M02), Cobre (M01), Bacillus e Trichoderma. São a âncora da proteção integrada sem resistência conhecida.',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200'
      }
    ],
    actionNow:
      'Nunca alterne apenas pelo nome comercial: verifique sempre o Código MoA para garantir uma verdadeira rotação de modos de ação.',
    referenceStandard: 'Diretrizes IRAC / FRAC / HRAC'
  },
  {
    id: 'codigo-moa',
    number: 5,
    columnCode: 'Coluna G',
    icon: '🧩',
    category: 'Gestão de Resistências',
    title: 'Código MoA (IRAC / FRAC / HRAC)',
    keyConcept: 'O "Bilhete de Identidade" bioquímico de como a molécula atua.',
    whatIsIt:
      'A classificação internacional unificada dos comités IRAC (Inseticidas/Acaricidas), FRAC (Fungicidas) e HRAC (Herbicidas), no formato [Comité] [Grupo] ([Família]).',
    whyItMatters: [
      'Dois produtos comerciais de fabricantes diferentes podem conter substâncias com exatamente o mesmo código MoA.',
      'Mudar de marca comercial mantendo o mesmo código MoA não é rotação: é repetir o mesmo ataque bioquímico.'
    ],
    practicalRules: [
      {
        label: 'IRAC • Inseticidas e Acaricidas',
        detail: 'Ex.: IRAC 28 (Diamidas), IRAC 3A (Piretroides), IRAC UNE (Óleos minerais/botânicos).',
        badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200'
      },
      {
        label: 'FRAC • Fungicidas',
        detail: 'Ex.: FRAC 3 (Triazóis), FRAC 11 (Estrobilurinas), FRAC M01/M02 (Multissítio inorgânicos).',
        badgeColor: 'bg-purple-50 text-purple-900 border-purple-200'
      },
      {
        label: 'HRAC • Herbicidas',
        detail: 'Ex.: HRAC 9 (Glicinas), HRAC 12 (Nicotinanilidas), HRAC 2 (Inibidores ALS).',
        badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200'
      }
    ],
    actionNow:
      'Toque no badge MoA de qualquer cartão na pesquisa para filtrar rapidamente outras substâncias e planear a sua rotação.',
    referenceStandard: 'Classificação Global MoA'
  },
  {
    id: 'sa-ingles-iso',
    number: 6,
    columnCode: 'Coluna H',
    icon: '🌍',
    category: 'Normas & Exportação',
    title: 'Substância Ativa em Inglês (Padrão ISO)',
    keyConcept: 'A linguagem universal da química agrícola.',
    whatIsIt:
      'A denominação comum internacional oficial da substância ativa estabelecida pela ISO (International Organization for Standardization).',
    whyItMatters: [
      'Indispensável para consultar limites máximos de resíduos (LMR) para exportação, literatura científica internacional e bases europeias oficiais.'
    ],
    practicalRules: [
      {
        label: 'EU Pesticides Database & EFSA',
        detail: 'Consulte estatutos de aprovação europeia e LMR atualizados utilizando o nome ISO em inglês.',
        badgeColor: 'bg-sky-50 text-sky-900 border-sky-200'
      },
      {
        label: 'PPDB (Pesticide Properties DataBase)',
        detail: 'Permite cruzar parâmetros ecotoxicológicos, tempo de meia-vida e solubilidade em plataformas globais.',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
      }
    ],
    actionNow:
      'Pode pesquisar no Verificador de pH tanto pelo nome português como pela denominação oficial em inglês (ex.: Sulfur, Diflufenican, Glyphosate).',
    referenceStandard: 'ISO 1750 / EU Pesticides DB'
  }
];

export const PH_MICROLEARNING_QUIZZES: PhMicrolearningQuiz[] = [
  {
    id: 'quiz-glifosato',
    substance: 'Exemplo 1 (Herbicidas): Glifosato',
    category: 'Correção de pH e Absorção',
    specs: 'pKa = 5.73 | pH Ideal 4 a 6 | HRAC 9 (Glicinas) | Risco Médio',
    question: 'A água do seu furo tem pH 8.0. O que deve fazer antes de aplicar glifosato?',
    answer:
      'Adicionar um regulador acidificante no depósito para baixar o pH para 4.5–5.5 antes de juntar o herbicida. Em pH alcalino (8.0), a molécula ioniza-se e perde absorção cuticular e eficácia.'
  },
  {
    id: 'quiz-azoxistrobina',
    substance: 'Exemplo 2 (Fungicidas): Azoxistrobina',
    category: 'Gestão Anti-Resistência (MoA)',
    specs: 'Não ionizável | pH Ideal 5 a 7 | FRAC 11 (Metoxiacrilatos) | Risco Alto',
    question: 'Pode aplicar azoxistrobina três vezes seguidas na vinha?',
    answer:
      'Não! Pertence ao grupo FRAC 11 com Risco Alto de resistência (sítio único). Deve alternar no tratamento seguinte com uma substância de outro código MoA (ex.: FRAC 3 ou multissítio FRAC M01/M02).'
  }
];
