/**
 * DATERRA Smart - Motor Universal de Calculadoras
 * Catálogo Oficial de Variáveis Canónicas Partilhadas
 * Fase 1 - Fundação
 */

import type { PhysicalDimension } from '../../../types/calculator.ts';

export interface CanonicalVariableDefinition {
  canonicalKey: string;
  labelPt: string;
  dimension: PhysicalDimension;
  canonicalUnit: string;
  allowedUnits: string[];
  description: string;
}

export const CANONICAL_VARIABLES: Record<string, CanonicalVariableDefinition> = {
  tank_volume: {
    canonicalKey: 'tank_volume',
    labelPt: 'Volume a Preparar / Capacidade do Depósito',
    dimension: 'volume',
    canonicalUnit: 'L',
    allowedUnits: ['L', 'm³', 'hL', 'gal'],
    description: 'Volume total de calda a preparar no depósito do pulverizador'
  },
  product_dose_rate: {
    canonicalKey: 'product_dose_rate',
    labelPt: 'Dose Recomendada por Hectare',
    dimension: 'application_rate',
    canonicalUnit: 'L/ha',
    allowedUnits: ['L/ha', 'kg/ha', 'g/ha', 'mL/ha'],
    description: 'Dose do produto fitofarmacêutico homologada no rótulo oficial por hectare'
  },
  spray_volume_rate: {
    canonicalKey: 'spray_volume_rate',
    labelPt: 'Volume de Calda Aplicado por Hectare',
    dimension: 'application_rate',
    canonicalUnit: 'L/ha',
    allowedUnits: ['L/ha', 'hL/ha', 'gal/acre'],
    description: 'Volume de calda distribuído pelo pulverizador por unidade de área de solo'
  },
  concentration: {
    canonicalKey: 'concentration',
    labelPt: 'Concentração do Produto na Calda',
    dimension: 'concentration',
    canonicalUnit: '%',
    allowedUnits: ['%', 'mL/hL', 'g/hL', 'L/hL', 'kg/hL'],
    description: 'Concentração do produto comercial expressa por 100 litros (hL) ou percentagem'
  },
  route_distance: {
    canonicalKey: 'route_distance',
    labelPt: 'Distância do Percurso',
    dimension: 'length',
    canonicalUnit: 'm',
    allowedUnits: ['m'],
    description: 'Comprimento do troço de ensaio medido no terreno'
  },
  route_time: {
    canonicalKey: 'route_time',
    labelPt: 'Tempo do Percurso',
    dimension: 'time',
    canonicalUnit: 's',
    allowedUnits: ['s'],
    description: 'Duração cronometrada para percorrer o troço de ensaio'
  },
  work_speed: {
    canonicalKey: 'work_speed',
    labelPt: 'Velocidade de Trabalho',
    dimension: 'speed',
    canonicalUnit: 'km/h',
    allowedUnits: ['km/h', 'm/s', 'mph'],
    description: 'Velocidade real de avanço do trator no terreno'
  },
  working_width: {
    canonicalKey: 'working_width',
    labelPt: 'Largura Útil de Trabalho',
    dimension: 'length',
    canonicalUnit: 'm',
    allowedUnits: ['m', 'cm'],
    description: 'Largura da barra de pulverização ou faixa tratada'
  },
  row_spacing: {
    canonicalKey: 'row_spacing',
    labelPt: 'Distância Entrelinha',
    dimension: 'length',
    canonicalUnit: 'm',
    allowedUnits: ['m', 'cm'],
    description: 'Distância transversal entre fiadas consecutivas de plantação (r)'
  },
  canopy_height: {
    canonicalKey: 'canopy_height',
    labelPt: 'Altura da Vegetação Tratada',
    dimension: 'length',
    canonicalUnit: 'm',
    allowedUnits: ['m', 'cm'],
    description: 'Altura vertical da zona foliar ativa da cultura (h)'
  },
  canopy_width: {
    canonicalKey: 'canopy_width',
    labelPt: 'Espessura / Largura da Copa',
    dimension: 'length',
    canonicalUnit: 'm',
    allowedUnits: ['m', 'cm'],
    description: 'Largura média transversal da vegetação tratada'
  },
  leaf_wall_area: {
    canonicalKey: 'leaf_wall_area',
    labelPt: 'Área de Parede Foliar (LWA)',
    dimension: 'foliar_wall_area',
    canonicalUnit: 'm² LWA/ha',
    allowedUnits: ['m² LWA/ha', 'km² LWA/ha'],
    description: 'Área total de superfície foliar vertical exposta por hectare de terreno'
  },
  tree_row_volume: {
    canonicalKey: 'tree_row_volume',
    labelPt: 'Volume de Copa por Hectare (TRV)',
    dimension: 'tree_row_volume',
    canonicalUnit: 'm³ TRV/ha',
    allowedUnits: ['m³ TRV/ha', 'm³/ha'],
    description: 'Volume tridimensional aparente ocupado pela vegetação por hectare'
  },
  spray_volume_coefficient: {
    canonicalKey: 'spray_volume_coefficient',
    labelPt: 'Coeficiente de Volume de Calda (k)',
    dimension: 'volume_per_volume',
    canonicalUnit: 'L/m³',
    allowedUnits: ['L/m³'],
    description: 'Relação volumétrica entre a copa da cultura e o volume de calda a aplicar'
  },
  total_flow_rate: {
    canonicalKey: 'total_flow_rate',
    labelPt: 'Débito Total do Pulverizador',
    dimension: 'flow_rate',
    canonicalUnit: 'L/min',
    allowedUnits: ['L/min', 'L/h'],
    description: 'Caudal global debitado pelo conjunto de todos os bicos ativos'
  },
  nozzle_flow_rate: {
    canonicalKey: 'nozzle_flow_rate',
    labelPt: 'Débito Individual por Bico',
    dimension: 'flow_rate',
    canonicalUnit: 'L/min',
    allowedUnits: ['L/min', 'mL/min'],
    description: 'Caudal nominal debitado por cada bico na barra à pressão de serviço'
  },
  working_pressure: {
    canonicalKey: 'working_pressure',
    labelPt: 'Pressão de Trabalho',
    dimension: 'pressure',
    canonicalUnit: 'bar',
    allowedUnits: ['bar', 'kPa', 'psi'],
    description: 'Pressão hidráulica medida no manómetro do circuito de pulverização'
  },
  active_nozzles: {
    canonicalKey: 'active_nozzles',
    labelPt: 'Número de Bicos em Funcionamento',
    dimension: 'count',
    canonicalUnit: 'unidades',
    allowedUnits: ['unidades'],
    description: 'Contagem total de pontas pulverizadoras abertas no tratamento'
  },
  product_commercial_quantity: {
    canonicalKey: 'product_commercial_quantity',
    labelPt: 'Quantidade Necessária de Produto Comercial',
    dimension: 'volume',
    canonicalUnit: 'L',
    allowedUnits: ['L', 'mL', 'kg', 'g'],
    description: 'Massa ou volume de produto comercial a adicionar ao tanque'
  },
  treated_area: {
    canonicalKey: 'treated_area',
    labelPt: 'Área Tratada por Depósito',
    dimension: 'area',
    canonicalUnit: 'ha',
    allowedUnits: ['ha', 'm²'],
    description: 'Área de terreno que um depósito de calda permite pulverizar'
  }
};

/**
 * Consulta segura do catálogo canónico.
 * Retorna undefined se a chave não existir.
 */
export function getCanonicalVariable(key: string): CanonicalVariableDefinition | undefined {
  return CANONICAL_VARIABLES[key];
}
