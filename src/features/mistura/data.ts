import type { FormulationItem, FormulationGroupInfo } from './types';

export const FORMULATION_GROUPS: FormulationGroupInfo[] = [
  {
    id: 'agua',
    label: 'Água - Bases e Condicionamento',
    shortLabel: 'Água & Condicionamento',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    iconName: 'Droplets',
    faqTopic: 'mistura-agua'
  },
  {
    id: 'solidos',
    label: 'Sólidos - Dissolução e Dispersão',
    shortLabel: 'Sólidos (WSB, WG, WP...)',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconName: 'Package',
    faqTopic: 'mistura-solidos'
  },
  {
    id: 'liquidos',
    label: 'Líquidos - Suspensão e Emulsão',
    shortLabel: 'Líquidos (SC, CS, EC...)',
    color: 'text-teal-800',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    iconName: 'FlaskConical',
    faqTopic: 'mistura-liquidos'
  },
  {
    id: 'solucoes',
    label: 'Soluções e Nutrição - Solubilização Final',
    shortLabel: 'Soluções & Nutrição (SL, AF...)',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconName: 'Sprout',
    faqTopic: 'mistura-liquidos'
  },
  {
    id: 'adjuvantes',
    label: 'Adjuvantes e Outros - Ajuste da Aplicação',
    shortLabel: 'Adjuvantes (MOL, AD, OLA...)',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    iconName: 'SlidersHorizontal',
    faqTopic: 'mistura-adjuvantes'
  }
];

export const FORMULATIONS_CATALOG: FormulationItem[] = [
  // 1 a 3: Água - Bases e Condicionamento
  {
    id: 'H2O',
    number: 1,
    group: 'Água - Bases e Condicionamento',
    groupId: 'agua',
    sigla: 'H2O',
    name: 'Água',
    shortDescription: 'Base da calda; iniciar agitação contínua.',
    information: 'Introduzir primeiro e usar apenas água limpa.',
    faqTopic: 'mistura-agua',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    isBaseWater: true
  },
  {
    id: 'PH',
    number: 2,
    group: 'Água - Bases e Condicionamento',
    groupId: 'agua',
    sigla: 'PH',
    name: 'Regulador de pH',
    shortDescription: 'Correção do pH da água.',
    information: 'Ajustar antes dos restantes produtos para reduzir risco de degradação.',
    faqTopic: 'mistura-ph',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    id: 'CD',
    number: 3,
    group: 'Água - Bases e Condicionamento',
    groupId: 'agua',
    sigla: 'CD',
    name: 'Corretor de dureza da água',
    shortDescription: 'Ajustar a dureza da água, se necessário.',
    information: 'Útil quando a água é dura ou interfere com a eficácia da calda.',
    faqTopic: 'mistura-dureza',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },

  // 4 a 9: Sólidos - Dissolução e Dispersão
  {
    id: 'WSB',
    number: 4,
    group: 'Sólidos - Dissolução e Dispersão',
    groupId: 'solidos',
    sigla: 'WSB',
    name: 'Embalagem hidrossolúvel',
    shortDescription: 'Embalagem que se dissolve na água.',
    information: 'Confirmar dissolução completa da embalagem antes de adicionar outros produtos.',
    faqTopic: 'mistura-solidos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'SG',
    number: 5,
    group: 'Sólidos - Dissolução e Dispersão',
    groupId: 'solidos',
    sigla: 'SG',
    name: 'Grânulos solúveis',
    shortDescription: 'Grânulos que se dissolvem na água.',
    information: 'Pode beneficiar de pré-mistura, conforme o rótulo.',
    faqTopic: 'mistura-solidos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'WG',
    number: 6,
    group: 'Sólidos - Dissolução e Dispersão',
    groupId: 'solidos',
    sigla: 'WG',
    name: 'Grânulos dispersíveis',
    shortDescription: 'Grânulos que se dispersam em água, não se dissolvem.',
    information: 'Fazer pré-mistura quando recomendado e evitar grumos.',
    faqTopic: 'mistura-solidos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'WP',
    number: 7,
    group: 'Sólidos - Dissolução e Dispersão',
    groupId: 'solidos',
    sigla: 'WP',
    name: 'Pó molhável',
    shortDescription: 'Pó que se dispersa em água, formando suspensão.',
    information: 'Introduzir lentamente para evitar empedramento e má dispersão.',
    faqTopic: 'mistura-solidos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'SP',
    number: 8,
    group: 'Sólidos - Dissolução e Dispersão',
    groupId: 'solidos',
    sigla: 'SP',
    name: 'Pó solúvel',
    shortDescription: 'Pó que se dissolve na água.',
    information: 'Confirmar total dissolução antes de avançar.',
    faqTopic: 'mistura-solidos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'TB',
    number: 9,
    group: 'Sólidos - Dissolução e Dispersão',
    groupId: 'solidos',
    sigla: 'TB',
    name: 'Tablete',
    shortDescription: 'Forma sólida que se dissolve em água.',
    information: 'Respeitar o tempo necessário para dissolução completa.',
    faqTopic: 'mistura-solidos',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },

  // 10 a 19: Líquidos - Suspensão e Emulsão
  {
    id: 'DC',
    number: 10,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'DC',
    name: 'Concentrado dispersível',
    shortDescription: 'Concentrado que se dispersa em água, formando suspensão.',
    information: 'Verificar a boa dispersão e compatibilidade com outras suspensões.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
  },
  {
    id: 'SC',
    number: 11,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'SC',
    name: 'Suspensão concentrada',
    shortDescription: 'Formulação líquida com partículas em suspensão.',
    information: 'Exige agitação contínua para evitar deposição no fundo do depósito.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
  },
  {
    id: 'CS',
    number: 12,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'CS',
    name: 'Suspensão de cápsulas',
    shortDescription: 'Microcápsulas dispersas em água.',
    information: 'Evitar interrupções prolongadas da agitação.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
  },
  {
    id: 'SE',
    number: 13,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'SE',
    name: 'Suspo-emulsão',
    shortDescription: 'Mistura de suspensão e emulsão.',
    information: 'Adicionar após suspensões simples e antes das emulsões clássicas.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
  },
  {
    id: 'OD',
    number: 14,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'OD',
    name: 'Suspensão concentrada oleosa',
    shortDescription: 'Suspensão de partículas em óleo, miscível em água.',
    information: 'Confirmar compatibilidade com adjuvantes e fertilizantes.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  },
  {
    id: 'EW',
    number: 15,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'EW',
    name: 'Emulsão de óleo em água',
    shortDescription: 'Gotículas de óleo dispersas em água.',
    information: 'Introduzir após suspensões já homogeneizadas.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  },
  {
    id: 'EO',
    number: 16,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'EO',
    name: 'Emulsão de água em óleo',
    shortDescription: 'Gotículas de água dispersas em óleo.',
    information: 'Formulação sensível; seguir rigorosamente o rótulo.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  },
  {
    id: 'EC',
    number: 17,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'EC',
    name: 'Concentrado para emulsão',
    shortDescription: 'Formulação líquida que forma emulsão estável em água.',
    information: 'Adicionar depois das suspensões e emulsões mais estáveis.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  },
  {
    id: 'ME',
    number: 18,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'ME',
    name: 'Microemulsão',
    shortDescription: 'Emulsão muito fina e estável.',
    information: 'Verificar estabilidade da mistura antes de adicionar adjuvantes finais.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  },
  {
    id: 'ES',
    number: 19,
    group: 'Líquidos - Suspensão e Emulsão',
    groupId: 'liquidos',
    sigla: 'ES',
    name: 'Emulsão solúvel',
    shortDescription: 'Líquido que se emulsiona quando diluído em água.',
    information: 'Verificar estabilidade da mistura antes de adicionar adjuvantes finais.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  },

  // 20 a 24: Soluções e Nutrição - Solubilização Final
  {
    id: 'SL',
    number: 20,
    group: 'Soluções e Nutrição - Solubilização Final',
    groupId: 'solucoes',
    sigla: 'SL',
    name: 'Líquido solúvel',
    shortDescription: 'Solução concentrada totalmente miscível em água.',
    information: 'Normalmente entra perto do final da mistura.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    id: 'AF',
    number: 21,
    group: 'Soluções e Nutrição - Solubilização Final',
    groupId: 'solucoes',
    sigla: 'AF',
    name: 'Adubo foliar líquido',
    shortDescription: 'Fertilizante líquido aplicado via foliar.',
    information: 'Confirmar compatibilidade físico-química com a calda.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    id: 'MN',
    number: 22,
    group: 'Soluções e Nutrição - Solubilização Final',
    groupId: 'solucoes',
    sigla: 'MN',
    name: 'Micronutriente líquido',
    shortDescription: 'Solução concentrada de micronutrientes.',
    information: 'Alguns sais podem alterar o pH ou provocar incompatibilidades.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    id: 'BIO',
    number: 23,
    group: 'Soluções e Nutrição - Solubilização Final',
    groupId: 'solucoes',
    sigla: 'BIO',
    name: 'Bioestimulante líquido compatível',
    shortDescription: 'Líquido para estimular crescimento ou resistência.',
    information: 'Utilizar apenas quando a mistura estiver tecnicamente validada.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    id: 'PB',
    number: 24,
    group: 'Soluções e Nutrição - Solubilização Final',
    groupId: 'solucoes',
    sigla: 'PB',
    name: 'Produto biológico compatível',
    shortDescription: 'Micro-organismos ou extratos biológicos líquidos.',
    information: 'Ter especial atenção à sensibilidade ao pH e a outras substâncias ativas.',
    faqTopic: 'mistura-liquidos',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },

  // 25 a 32: Adjuvantes e Outros - Ajuste da Aplicação
  {
    id: 'MOL',
    number: 25,
    group: 'Adjuvantes e Outros - Ajuste da Aplicação',
    groupId: 'adjuvantes',
    sigla: 'MOL',
    name: 'Molhante',
    shortDescription: 'Adjuvante que melhora a humectação da superfície.',
    information: 'A posição pode variar com o fabricante; confirmar sempre o rótulo.',
    faqTopic: 'mistura-adjuvantes',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  {
    id: 'ESP',
    number: 26,
    group: 'Adjuvantes e Outros - Ajuste da Aplicação',
    groupId: 'adjuvantes',
    sigla: 'ESP',
    name: 'Espalhante',
    shortDescription: 'Adjuvante que aumenta a dispersão da gota.',
    information: 'Usar no final para melhorar a cobertura da superfície tratada.',
    faqTopic: 'mistura-adjuvantes',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  {
    id: 'HUM',
    number: 27,
    group: 'Adjuvantes e Outros - Ajuste da Aplicação',
    groupId: 'adjuvantes',
    sigla: 'HUM',
    name: 'Humectante',
    shortDescription: 'Adjuvante que prolonga o tempo de permanência da gota.',
    information: 'Ajuda a prolongar o tempo de permanência da gota na folha.',
    faqTopic: 'mistura-adjuvantes',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  {
    id: 'ANT',
    number: 28,
    group: 'Adjuvantes e Outros - Ajuste da Aplicação',
    groupId: 'adjuvantes',
    sigla: 'ANT',
    name: 'Antiespumante',
    shortDescription: 'Redutor de espuma.',
    information: 'Utilizar apenas se houver formação excessiva de espuma.',
    faqTopic: 'mistura-adjuvantes',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  {
    id: 'PEN',
    number: 29,
    group: 'Adjuvantes e Outros - Ajuste da Aplicação',
    groupId: 'adjuvantes',
    sigla: 'PEN',
    name: 'Adjuvante de penetração',
    shortDescription: 'Ajuda na passagem da substância ativa pela cutícula.',
    information: 'Pode aumentar a absorção e também o risco de fitotoxicidade.',
    faqTopic: 'mistura-adjuvantes',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  {
    id: 'ADER',
    number: 30,
    group: 'Adjuvantes e Outros - Ajuste da Aplicação',
    groupId: 'adjuvantes',
    sigla: 'ADER',
    name: 'Aderente',
    shortDescription: 'Adjuvante que aumenta a aderência da calda.',
    information: 'Melhora a fixação da calda e a resistência à lavagem.',
    faqTopic: 'mistura-adjuvantes',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  {
    id: 'AD',
    number: 31,
    group: 'Adjuvantes e Outros - Ajuste da Aplicação',
    groupId: 'adjuvantes',
    sigla: 'AD',
    name: 'Líquido anti-deriva',
    shortDescription: 'Adjuvante que reduz a deriva de gotas.',
    information: 'Adicionar no fim; alguns polímeros podem perder o efeito com bombeamento intenso.',
    faqTopic: 'mistura-adjuvantes',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  {
    id: 'OLA',
    number: 32,
    group: 'Adjuvantes e Outros - Ajuste da Aplicação',
    groupId: 'adjuvantes',
    sigla: 'OLA',
    name: 'Óleo agrícola compatível',
    shortDescription: 'Óleo que melhora aderência e penetração.',
    information: 'Usar apenas quando expressamente recomendado e compatível com a mistura.',
    faqTopic: 'mistura-adjuvantes',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  }
];

export const FORMULATIONS_BY_ID = new Map<string, FormulationItem>(
  FORMULATIONS_CATALOG.map(item => [item.id, item])
);
