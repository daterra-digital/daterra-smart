// src/features/perfis/data/cultureCatalogData.ts
// Catálogo canónico de Cultura, conduções e estádios fenológicos (sem variedades inventadas).

export interface CatalogSelectOption {
  id: string;
  label: string;
  code?: string;
  isPendingLocal?: boolean;
  localRecordId?: number;
}

export const CULTURE_CATALOG_OPTIONS: CatalogSelectOption[] = [
  { id: 'vinha', label: 'Vinha' },
  { id: 'pereira', label: 'Pereira' },
  { id: 'macieira', label: 'Macieira' },
  { id: 'pessegueiro', label: 'Pessegueiro' },
  { id: 'cerejeira', label: 'Cerejeira' },
  { id: 'amendoeira', label: 'Amendoeira' },
  { id: 'citrinos', label: 'Citrinos' },
  { id: 'oliveira', label: 'Oliveira' }
];

// Mantido vazio até validação técnica explícita de castas/cultivares; utilizador adiciona via opção local.
export const VARIETY_CATALOG_BY_CULTURE: Record<string, CatalogSelectOption[]> = {};

export const INSTALLATION_CATALOG_OPTIONS: CatalogSelectOption[] = [
  { id: 'sebe_linear', label: 'Plantação em linha / sebe' },
  { id: 'compasso_regular', label: 'Pomar em compasso regular' },
  { id: 'copa_tradicional', label: 'Copa isolada / tradicional' }
];

export const CONDUCTION_CATALOG_BY_CULTURE: Record<string, CatalogSelectOption[]> = {
  vinha: [{ id: 'espaldeira', label: 'Espaldeira' }],
  pereira: [{ id: 'sebe_parede', label: 'Sebe / parede' }],
  macieira: [{ id: 'sebe_parede', label: 'Sebe / parede' }],
  pessegueiro: [{ id: 'vaso_taca', label: 'Vaso / taça' }],
  cerejeira: [{ id: 'vaso_taca', label: 'Vaso / taça' }],
  amendoeira: [{ id: 'sebe_parede', label: 'Sebe / parede' }],
  citrinos: [{ id: 'vaso_arredondado', label: 'Vaso / arredondado' }],
  oliveira: [
    { id: 'sebe_continua', label: 'Sebe contínua (superintensivo)' },
    { id: 'vaso_globo', label: 'Vaso / globo (intensivo)' }
  ]
};

export const PHENOLOGY_CATALOG_BY_CULTURE: Record<string, CatalogSelectOption[]> = {
  vinha: [
    { id: 'vinha_repouso_algodao', label: 'Repouso a olho de algodão', code: 'BBCH 00–05' },
    { id: 'vinha_folhas_jovens', label: 'Folhas jovens a folhas livres', code: 'BBCH 09–15' },
    { id: 'vinha_cachos_floracao', label: 'Cachos visíveis a floração', code: 'BBCH 53–69' },
    { id: 'vinha_bago_ervilha', label: 'Bago de chumbo a ervilha', code: 'BBCH 71–75' },
    { id: 'vinha_pintor_maturacao', label: 'Pintor à maturação', code: 'BBCH 77–89' }
  ],
  pereira: [
    { id: 'pereira_abrolhamento_botoes', label: 'Abrolhamento e botões florais', code: 'BBCH 51–59' },
    { id: 'pereira_inicio_pos_floracao', label: 'Desenvolvimento inicial / pós-floração', code: 'BBCH 69–72' },
    { id: 'pereira_crescimento_fruto', label: 'Crescimento dos frutos', code: 'BBCH 74–78' },
    { id: 'pereira_pleno_maturacao', label: 'Pleno crescimento / maturação', code: 'BBCH 81–89' }
  ],
  macieira: [
    { id: 'macieira_abrolhamento_botoes', label: 'Abrolhamento e botões florais', code: 'BBCH 51–59' },
    { id: 'macieira_inicio_pos_floracao', label: 'Desenvolvimento inicial / pós-floração', code: 'BBCH 69–72' },
    { id: 'macieira_crescimento_fruto', label: 'Crescimento do fruto', code: 'BBCH 74–78' },
    { id: 'macieira_pleno_maturacao', label: 'Pleno vigor / maturação', code: 'BBCH 71–89' }
  ],
  pessegueiro: [
    { id: 'pessegueiro_botoes_floracao', label: 'Botão rosa à floração', code: 'BBCH 57–65' },
    { id: 'pessegueiro_inicio_pos_floracao', label: 'Desenvolvimento inicial / pós-floração', code: 'BBCH 69–72' },
    { id: 'pessegueiro_endurecimento_caroco', label: 'Endurecimento do caroço', code: 'BBCH 75–77' },
    { id: 'pessegueiro_pleno_maturacao', label: 'Pleno vigor / maturação', code: 'BBCH 71–89' }
  ],
  cerejeira: [
    { id: 'cerejeira_botoes_floracao', label: 'Botão branco à floração', code: 'BBCH 55–65' },
    { id: 'cerejeira_inicio_pos_floracao', label: 'Desenvolvimento inicial / pós-floração', code: 'BBCH 69–72' },
    { id: 'cerejeira_crescimento_fruto', label: 'Crescimento do fruto', code: 'BBCH 73–77' },
    { id: 'cerejeira_pleno_maturacao', label: 'Pleno vigor / maturação', code: 'BBCH 81–89' }
  ],
  amendoeira: [
    { id: 'amendoeira_floracao', label: 'Floração e vingamento', code: 'BBCH 61–69' },
    { id: 'amendoeira_inicio_pos_floracao', label: 'Desenvolvimento inicial / pós-floração', code: 'BBCH 71–73' },
    { id: 'amendoeira_crescimento_fruto', label: 'Crescimento do fruto', code: 'BBCH 74–77' },
    { id: 'amendoeira_pleno_maturacao', label: 'Pleno vigor / maturação', code: 'BBCH 81–89' }
  ],
  citrinos: [
    { id: 'citrinos_pos_poda_inicio', label: 'Pós-poda / início vegetativo', code: 'Pós-poda' },
    { id: 'citrinos_floracao_vingamento', label: 'Floração e vingamento', code: 'BBCH 60–71' },
    { id: 'citrinos_crescimento_fruto', label: 'Crescimento do fruto', code: 'BBCH 72–79' },
    { id: 'citrinos_pleno_vigor', label: 'Pleno vigor', code: 'Pleno vigor' }
  ],
  oliveira: [
    { id: 'olival_botoes_floracao', label: 'Botões florais à floração', code: 'BBCH 51–69' },
    { id: 'olival_desenvolvimento_fruto', label: 'Desenvolvimento e endurecimento', code: 'BBCH 71–75' },
    { id: 'olival_pleno_vigor', label: 'Pleno vigor', code: 'BBCH 71–89' }
  ]
};
