// src/utils/releasePolicyRoutes.ts

/**
 * 11 Ferramentas Canónicas Homologadas / Prontas para o GitHub Pages
 */
export const READY_TOOL_IDS = new Set<string>([
  'ajuste_dose_eppo',
  'calc_area_parede_foliar',
  'verificador_ph',
  'calc_concentracao',
  'calc_dose',
  'mistura_compatibilidade',
  'pre_inspecao_dgav',
  'comparador_bicos',
  'calc_velocidade_real',
  'calc_volume_copa',
  'calc_aplicacao_manual'
]);

/**
 * 8 Ferramentas em Desenvolvimento / Avaliação bloqueadas no GitHub Pages e Produção
 */
export const BLOCKED_TOOL_IDS_IN_PAGES = new Set<string>([
  'calc_calibracao_pulverizador',
  'calc_debito_total',
  'calc_eppo',
  'calc_ird',
  'drone_buffer_zone',
  'smart_debito',
  'satelite_ndvi',
  'calc_volume_calda_trv'
]);

/**
 * Permite o módulo IRD em desenvolvimento (V-DEV) e avaliação RC/staging (V-RC), bloqueando V-PAGES e V-PROD
 */
export const isIrdEnabledForEnv = (env: string): boolean => env === 'development' || env === 'staging';

/**
 * Permite o submenu/aba Deriva no módulo Meteorologia em V-DEV, V-RC e V-PAGES
 */
export const isWeatherDriftTabEnabledForEnv = (env: string): boolean =>
  env === 'development' || env === 'staging' || env === 'pages';

/**
 * Mapeamento das rotas canónicas e ferramentas associadas
 */
export const CANONICAL_TOOL_ROUTES: Record<string, string> = {
  '/ferramentas/ajuste-dose-eppo': 'ajuste_dose_eppo',
  '/ferramentas/area-parede-foliar': 'calc_area_parede_foliar',
  '/ferramentas/verificador-ph': 'verificador_ph',
  '/ferramentas/mistura': 'mistura_compatibilidade',
  '/ferramentas/pre-inspecao': 'pre_inspecao_dgav',
  '/ferramentas/comparador-bicos': 'comparador_bicos',
  '/ferramentas/velocidade-real': 'calc_velocidade_real',
  '/ferramentas/volume-copa': 'calc_volume_copa',
  '/ferramentas/aplicacao-manual': 'calc_aplicacao_manual'
};

/**
 * Mapeamento de rotas de ferramentas em desenvolvimento/avaliação bloqueadas em Pages
 */
export const BLOCKED_PAGES_ROUTES: Record<string, string> = {
  '/ferramentas/calibracao-pulverizador': 'calc_calibracao_pulverizador',
  '/ferramentas/debito-total': 'calc_debito_total',
  '/ferramentas/eppo': 'calc_eppo',
  '/ferramentas/risco-deriva': 'calc_ird',
  '/ferramentas/drone-buffer-zone': 'drone_buffer_zone',
  '/ferramentas/smart-debito': 'smart_debito',
  '/ferramentas/satelite-ndvi': 'satelite_ndvi',
  '/ferramentas/volume-calda-trv': 'calc_volume_calda_trv'
};

/**
 * Mapeamento exato de Aliases para destinos canónicos
 */
export const ROUTE_ALIASES: Record<string, string> = {
  '/ferramentas/mistura-calda-concentracao': '/ferramentas?tool=calc_concentracao',
  '/tools/mistura-calda-concentracao': '/ferramentas?tool=calc_concentracao',
  '/ferramentas/concentracao-calda': '/ferramentas?tool=calc_concentracao',
  '/tools/calc_concentracao': '/ferramentas?tool=calc_concentracao',
  '/ferramentas/mistura-calda-dose': '/ferramentas?tool=calc_dose',
  '/tools/mistura-calda-dose': '/ferramentas?tool=calc_dose',
  '/ferramentas/dose': '/ferramentas?tool=calc_dose',
  '/tools/dose': '/ferramentas?tool=calc_dose',
  '/tools/calc_dose': '/ferramentas?tool=calc_dose',
  '/ferramentas/ordem-mistura': '/ferramentas/mistura',
  '/tools/ordem-mistura': '/ferramentas/mistura',
  '/ferramentas/consulta-ph': '/ferramentas/verificador-ph',
  '/tools/consulta-ph': '/ferramentas/verificador-ph',
  '/tools/calc_ph': '/ferramentas/verificador-ph',
  '/ferramentas/velocidade-trabalho': '/ferramentas/velocidade-real',
  '/tools/velocidade-trabalho': '/ferramentas/velocidade-real',
  '/tools/calc_velocidade_real': '/ferramentas/velocidade-real',
  '/tools/aplicacao-manual': '/ferramentas/aplicacao-manual',
  '/tools/calc_aplicacao_manual': '/ferramentas/aplicacao-manual',
  '/tools/ajuste-dose-eppo': '/ferramentas/ajuste-dose-eppo',
  '/tools/ajuste_dose_eppo': '/ferramentas/ajuste-dose-eppo',
  '/ferramentas/ajuste-dose': '/ferramentas/ajuste-dose-eppo',
  '/ferramentas/area-parede-foliar-lwa': '/ferramentas/area-parede-foliar',
  '/tools/area-parede-foliar-lwa': '/ferramentas/area-parede-foliar',
  '/tools/area-parede-foliar': '/ferramentas/area-parede-foliar',
  '/tools/calc_area_parede_foliar': '/ferramentas/area-parede-foliar',
  '/ferramentas/volume-copa-trv': '/ferramentas/volume-copa',
  '/tools/volume-copa-trv': '/ferramentas/volume-copa',
  '/tools/calc_volume_copa': '/ferramentas/volume-copa',
  '/ferramentas/tabelas-debito': '/ferramentas/comparador-bicos',
  '/tools/tabelas-debito': '/ferramentas/comparador-bicos',
  '/tools/comparador-bicos': '/ferramentas/comparador-bicos',
  '/tools/debito-trabalho-iso': '/ferramentas/comparador-bicos',
  '/tools/pre-inspecao': '/ferramentas/pre-inspecao',
  '/tools/calc_pre_inspecao': '/ferramentas/pre-inspecao',
  '/ferramentas/inspecao-detalhada': '/ferramentas/pre-inspecao',
  '/ferramentas/meteorologia': '/meteorologia'
};
