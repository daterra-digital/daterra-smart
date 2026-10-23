// src/features/agri-chat/data/skillsCatalog.ts
import type { Skill, SkillId } from '../types';

export const SKILLS_CATALOG: Skill[] = [
  {
    id: 'geral',
    name: 'Geral',
    version: '1.0',
    slug: 'geral',
    shortDescription: 'Apoio agronómico transversal, calibração base e boas práticas.',
    fullDescription: 'Consultoria geral para o dia-a-dia da exploração agrícola. Explica princípios agronómicos de base, fórmulas gerais e sustentabilidade, integrando dados das parcelas.',
    iconName: 'Sprout',
    badgeLabel: 'INCLUÍDO',
    isPremium: false,
    monthlyPriceEur: 0.00,
    systemPromptDomain: 'agronomy_general'
  },
  {
    id: 'fitofarmacos',
    name: 'Fitofármacos',
    version: 'v1.0',
    slug: 'fitofarmacos',
    shortDescription: 'Substâncias ativas, APVs, intervalos de segurança e ZNT.',
    fullDescription: 'Proteção fitossanitária com base na regulamentação oficial. Matérias ativas autorizadas, doses por hl/ha, limites máximos de resíduos e gestão de resistências.',
    iconName: 'ShieldAlert',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 9.90,
    systemPromptDomain: 'plant_protection_dgav'
  },
  {
    id: 'rega',
    name: 'Rega',
    version: 'v1.0 - Modelo FAO 56',
    slug: 'rega',
    shortDescription: 'Balanço hídrico, evapotranspiração, coeficientes Kc e tempos de rega.',
    fullDescription: 'Engenharia e gestão da água de rega. Inclui dados de solo para suportar cálculos de ETc, tempos de rega por sector, dotações hídricas e sondas de humidade.',
    iconName: 'Droplets',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 9.90,
    systemPromptDomain: 'irrigation_water_balance'
  },
  {
    id: 'fertilizacao',
    name: 'Fertilização',
    version: 'v1.0 - Balanço N-P-K',
    slug: 'fertilizacao',
    shortDescription: 'Planos de adubação, extração de nutrientes NPK e fertirrigação.',
    fullDescription: 'Cálculo de equilíbrios de nutrientes N-P-K-Mg-Ca, curvas de absorção cultural e planos de fertirrigação adaptados à fase fenológica da cultura.',
    iconName: 'Layers',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 9.90,
    systemPromptDomain: 'plant_nutrition_fertilization'
  },
  {
    id: 'solos',
    name: 'Solos',
    version: '1.0 - Textura & Fertilidade',
    slug: 'solos',
    shortDescription: 'Física e química do solo, pH, matéria orgânica e condutividade.',
    fullDescription: 'Interpretação detalhada de análises laboratoriais de solos, textura, retenção de água, calcário ativo, salinidade e regeneração da microbiota do solo.',
    iconName: 'Mountain',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 9.90,
    systemPromptDomain: 'soil_science_fertility'
  },
  {
    id: 'legislacao',
    name: 'Legislação',
    version: '2026.2 - Regulamentos UE/PT',
    slug: 'legislacao',
    shortDescription: 'Diretiva Uso Sustentável, condicionalidade PEPAC e DL 91/2016.',
    fullDescription: 'Conformidade legal agrícola. Zonas vulneráveis a nitratos, distâncias de segurança a linhas de água, obrigações de cadernos de campo e inspeção de pulverizadores.',
    iconName: 'Scale',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 12.90,
    systemPromptDomain: 'agricultural_legal_compliance'
  },
  {
    id: 'globalgap',
    name: 'GlobalGAP',
    version: 'IFA v6',
    slug: 'globalgap',
    shortDescription: 'Auditoria e conformidade segundo o referencial GlobalGAP IFA v6.',
    fullDescription: 'Pontos de Controlo e Critérios de Conformidade (PCCC) para Frutas e Legumes. Verificação de registos de armazém, rastreabilidade, higiene e auditorias.',
    iconName: 'FileCheck2',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 14.90,
    systemPromptDomain: 'globalgap_compliance_ifa_v6'
  },
  {
    id: 'haccp',
    name: 'HACCP',
    version: 'Codex Alimentarius 2023',
    slug: 'haccp',
    shortDescription: 'Segurança alimentar na produção primária, PCCs e higienização.',
    fullDescription: 'Princípios de Análise de Perigos e Controlo de Pontos Críticos na pós-colheita, transporte e conservação de produtos hortofrutícolas.',
    iconName: 'CheckSquare',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 14.90,
    systemPromptDomain: 'haccp_food_safety'
  },
  {
    id: 'fisiologia',
    name: 'Fisiologia',
    version: '1.0 - BBCH & Morfologia',
    slug: 'fisiologia',
    shortDescription: 'Escalas fenológicas BBCH, fotossíntese, gomo floral e maturação.',
    fullDescription: 'Fisiologia vegetal aplicada ao campo. Respostas a stresse térmico/hídrico, desenvolvimento radicular, vingamento e índices de maturação.',
    iconName: 'Activity',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 9.90,
    systemPromptDomain: 'plant_physiology_phenology'
  },
  {
    id: 'calibracao-equipamentos',
    name: 'Calibração de Equipamentos',
    version: 'v1.0 - Calibração',
    slug: 'calibracao-equipamentos',
    shortDescription: 'Metodologias LWA/TRV, regulação de débito e calibração de bicos.',
    fullDescription: 'Especialista em regulação de máquinas. Cruza a cultura, bicos, velocidade e manómetro da exploração para validar se a calibração assegura cobertura foliar sem perdas nem deriva.',
    iconName: 'Gauge',
    badgeLabel: 'PRO',
    isPremium: true,
    monthlyPriceEur: 9.90,
    systemPromptDomain: 'equipment_calibration_eppo'
  }
];

export const QUICK_PROMPTS: Record<SkillId, string[]> = {
  geral: [
    'Como calcular a área de parede foliar (LWA)?',
    'Qual o método dos 50 metros para calibrar o pulverizador?',
    'Resumo das boas práticas para evitar a deriva'
  ],
  fitofarmacos: [
    'Matérias ativas para pedrado na macieira com IS curto',
    'Quais as regras de ZNT para produtos tóxicos para abelhas?',
    'Como alternar fungicidas para evitar resistências?'
  ],
  rega: [
    'Como calcular a dotação de rega com base na ET0?',
    'Quais os coeficientes Kc para olival em sebe?',
    'Tempo de rega com base no solo da minha parcela'
  ],
  fertilizacao: [
    'Qual o equilíbrio N-P-K recomendado para a fase de vingamento?',
    'Sintomas visuais de deficiência de magnésio na vinha',
    'Como calcular as unidades fertilizantes de azoto nítrico'
  ],
  solos: [
    'Como avaliar a textura do solo com base na capacidade de campo?',
    'Qual o impacto do pH 7.8 na disponibilidade de microelementos?',
    'Recomendações para aumentar a matéria orgânica'
  ],
  legislacao: [
    'Quais as regras de conservação do caderno de campo?',
    'Limites legais de vento para aplicação de fitofarmacêuticos',
    'Periodicidade obrigatória da inspeção do pulverizador (DL 91/2016)'
  ],
  globalgap: [
    'Quais os registos obrigatórios no armazém de produtos fitofarmacêuticos?',
    'Critérios de calibração de pulverizadores segundo IFA v6',
    'Regras para conservação de registos de colheita'
  ],
  haccp: [
    'Quais os Pontos Críticos de Controlo (PCC) na apanha e lavagem?',
    'Regras de higiene e água potável na produção primária',
    'Procedimentos em caso de contaminação física do lote'
  ],
  fisiologia: [
    'Identificação do estádio BBCH 65 em pomóideas',
    'Impacto de temperaturas acima de 35°C no vingamento floral',
    'Mecanismos de dormência e quebra com horas de frio'
  ],
  'calibracao-equipamentos': [
    'A calibração do meu perfil está adequada para tratar esta cultura?',
    'Os bicos selecionados cumprem as normas EPPO de cobertura?',
    'Qual a pressão ideal para evitar deriva com a minha velocidade?'
  ]
};
