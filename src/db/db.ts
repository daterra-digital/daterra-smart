import Dexie, { type Table } from 'dexie';

export interface CalculationHistoryItem {
  id?: number;
  date: string; // ISO String
  calculator_type: 'concentracao_jovem' | 'concentracao_adulta' | 'dose';
  inputs: Record<string, any>;
  result: {
    quantidade_pf: number;
    unit_pf: string;
    area_tratada_ha?: number;
  };
  notes?: string;
  profile_id?: number;
}

export interface ProfileCulture {
  id?: number;
  name: string;
  area_ha: number;
  crop_type: string;
  variety?: string;
  training_system?: string;
  spacing?: string;
  row_distance_m?: number;
  phenological_stage?: string;
  canopy_width_m?: number;
  canopy_height_m?: number;
  lai?: number;
  location?: string;
}

export interface ProfileEquipment {
  id?: number;
  name: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  construction_year?: string;
  tank_brand?: string;
  tank_capacity_l: number;
  clean_water_tank_l?: number;
  has_hand_washing_tank?: boolean;
  has_circuit_rinse?: boolean;
  has_product_incorporator?: boolean;
  selected_nozzles?: string[];

  // Bomba e Filtros
  pump_manufacturer?: string;
  pump_model?: string;
  pump_type?: string;
  has_filling_sieve?: boolean;
  has_suction_filter?: boolean;
  has_pressure_filter?: boolean;
  has_line_filters?: boolean;

  // Comandos e Regulação
  command_manufacturer?: string;
  command_model?: string;
  is_manual?: boolean;
  is_electric?: boolean;
  is_isobus?: boolean;
  is_automatic?: boolean;
  has_computer?: boolean;
  sections_count?: number;

  // Manómetro
  manometer_diameter_mm?: number;
  manometer_scale_divisions?: number;
  manometer_max_value?: number;
  manometer_error_class?: number;
  max_pressure_bar?: number;
  recommended_pressure_bar?: number;

  // Equipamento de Distribuição
  distribution_type?: string; // 'Barra horizontal' | 'Barra vertical' | 'Ventilador' | 'Pistola/Lança' | 'Pneumático' | 'Canhão' | 'Painéis'
  boom_width_m?: number;
  has_air_sleeve?: boolean;
  boom_height_m?: number;
  fan_transmission?: string;
  fan_diameter_mm?: number;
  fan_type?: string;
  has_air_deflector?: boolean;
  has_suction_air_deflector?: boolean;
  has_compression_air_deflector?: boolean;
  has_height_compression_air_deflector?: boolean;
  lances_count?: number;
  has_hose_reels?: boolean;
  hose_length_m?: number;
  pneumatic_nozzles_count?: number;
  nozzles_per_pneumatic_head?: number;
  cannon_nozzle_groups_count?: number;
  panels_count?: number;
  simultaneous_rows_count?: number;

  // Outros e Observações
  nozzle_location?: string;
  nozzle_type?: string;
  notes?: string;
  is_approved?: boolean;
  inspection_date?: string;
  calibration_date?: string;
}


export interface ProfileNozzle {
  id?: number;
  equipment_id?: number;
  equipment_name?: string;
  manufacturer: string;
  model: string;
  color: string;
  iso_classification: string;
  nozzle_type: string;
  spray_angle: string;
  working_pressure_bar: number;
  tabulated_flow_lmin?: number;
  nominal_flow_lmin: number;
}

export interface ProfileCalibration {
  id?: number;
  equipment_id?: number;
  equipment_name?: string;
  nozzle_id?: number;
  nozzle_name?: string;
  working_speed_kmh: number;
  working_pressure_bar: number;
  working_width_m: number;
  active_nozzles_count: number;
  droplet_size_um?: number;
  total_flow_lmin: number;
  calculated_spray_volume_lha: number;
  air_velocity_ms?: number;
  air_volume_m3h?: number;
}

export interface MicrolearningContent {
  id?: number;
  field_key: string;
  title: string;
  content: string;
  formula?: string;
  unit_explanation: string;
}

export interface InstalledToolItem {
  id?: number;
  tool_id: string;
  installed_at: string;
}

export class DaterraDatabase extends Dexie {
  calculation_history!: Table<CalculationHistoryItem>;
  profiles_cultures!: Table<ProfileCulture>;
  profiles_equipment!: Table<ProfileEquipment>;
  profiles_nozzles!: Table<ProfileNozzle>;
  profiles_calibrations!: Table<ProfileCalibration>;
  microlearning_content!: Table<MicrolearningContent>;
  installed_tools!: Table<InstalledToolItem>;

  constructor() {
    super('DaterraSmartDB');

    this.version(3).stores({
      calculation_history: '++id, date, calculator_type, profile_id',
      profiles_cultures: '++id, name, crop_type',
      profiles_equipment: '++id, name',
      profiles_nozzles: '++id, manufacturer, model, equipment_id',
      profiles_calibrations: '++id, equipment_id, nozzle_id',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id'
    });
  }
}

export const db = new DaterraDatabase();

export async function seedMicrolearningIfEmpty() {
  const existingCount = await db.microlearning_content.count();
  if (existingCount === 0) {
    await db.microlearning_content.bulkAdd([
      {
        field_key: 'calc_concentracao',
        title: 'Calculadora de Concentração da Calda',
        content: `[FAQ: Qual é a função desta calculadora?]
- Determina a quantidade exata de Produto Fitofarmacêutico (PF) a adicionar ao depósito para um determinado volume de calda a preparar.

[FAQ: O que é o modo Planta Jovem?]
- É indicado para fases iniciais da cultura com reduzida área foliar.
- A quantidade de produto no depósito é calculada diretamente a partir da concentração do rótulo e do volume do depósito.

[FAQ: O que é o modo Planta Adulta?]
- É indicado para pomares e vinhas em pleno desenvolvimento da copa vegetal.
- Ajusta a quantidade de produto no depósito considerando a relação entre o volume recomendado no rótulo e o volume real aplicado pelo pulverizador.`,
        formula: `Planta Jovem: Q_p = (C × C_d) / 100\nPlanta Adulta: Q_p = (C_d × C × V_r) / (V_a × 100)`,
        unit_explanation: `Q_p : Quantidade de Produto no Depósito (mL ou g)\nC_d : Volume a Preparar no Depósito (L)\nC : Concentração do Rótulo (mL/hL, g/hL ou %)\nV_r : Volume Recomendado (L/ha)\nV_a : Volume Aplicado (L/ha)`
      },
      {
        field_key: 'calc_dose',
        title: 'Calculadora de Dose por Hectare',
        content: `[FAQ: Qual é a função desta calculadora?]
- Converte a dose autorizada no rótulo (L/ha ou kg/ha) na quantidade exata de produto comercial a adicionar por depósito, com base no volume de calda calibrado no equipamento.

[FAQ: Como calcular a área coberta por cada tanque cheio?]
- Divida a capacidade do depósito pelo volume de calda real aplicado por hectare. Exemplo: 1.000 L / 200 L/ha = 5,0 hectares tratados por tanque.`,
        formula: `Q_p = (C_d × D × 1.000) / V_a\nÁrea (ha) = C_d / V_a`,
        unit_explanation: `Q_p : Quantidade de Produto no Depósito (mL ou g)\nC_d : Volume a Preparar (L)\nD : Dose Autorizada (L/ha ou kg/ha)\nV_a : Volume Aplicado (L/ha)`
      },
      {
        field_key: 'perfil_cultura',
        title: 'Perfil da Cultura & Geometria da Copa',
        content: `[FAQ: Qual a utilidade do registo de cultura?]
- O registo da cultura com variedade, estado fenológico e entrelinha permite calcular com precisão a dosagem de calda e ajustar o volume de copa (TRV).

[FAQ: O que é o Índice de Área Foliar (LAI)?]
- É a razão entre a área foliar total e a área de solo ocupada pela copa vegetal.`,
        formula: `TRV (m³/ha) = (10.000 × W × H) / W_w`,
        unit_explanation: `W_w : Entrelinha (m)\nW : Largura da Copa (m)\nH : Altura da Copa (m)`
      },
      {
        field_key: 'perfil_equipamento',
        title: 'Perfil do Equipamento de Pulverização',
        content: `[FAQ: Qual a importância de registar os dados do pulverizador?]
- Permite gerir as caraterísticas da bomba, filtros, comando e depósito para os ensaios de calibração segundo a norma ISO 16122.`,
        formula: `Débito da Bomba ≥ Débito Total Q_t + Agitação (≥5%)`,
        unit_explanation: `Capacidade : Litros (L)\nPressão : Bar (bar)`
      },
      {
        field_key: 'perfil_bicos',
        title: 'Perfil dos Bicos de Pulverização',
        content: `[FAQ: Como funciona a classificação ISO de bicos?]
- A cor do bico define o seu débito nominal a 3 bar de pressão segundo o código ISO 10625.

[FAQ: Qual a importância do tipo de bico?]
- Bicos de injeção de ar reduzem drasticamente a deriva em dias de vento.`,
        formula: `Q_bico (L/min) = (V_a × v × W_w) / (60.000 × N_bicos)`,
        unit_explanation: `Q_bico : Débito do Bico (L/min)\nÂngulo : Ângulo do Jato (60°, 80°, 110°)`
      },
      {
        field_key: 'perfil_calibracao',
        title: 'Perfil de Calibração & Ensaio em Branco',
        content: `[FAQ: O que é o ensaio de calibração?]
- É a medição em campo com água limpa para determinar a velocidade real, débito dos bicos e volume de calda aplicado por hectare.`,
        formula: `V_a (L/ha) = (600 × Q_t) / (v × W_w)`,
        unit_explanation: `v : Velocidade (km/h)\nQ_t : Débito Total (L/min)\nW_w : Largura de Trabalho (m)`
      }
    ]);
  }

  // Seed de ferramentas instaladas
  const installedCount = await db.installed_tools.count();
  if (installedCount === 0) {
    await db.installed_tools.bulkAdd([
      { tool_id: 'calc_concentracao', installed_at: new Date().toISOString() },
      { tool_id: 'calc_dose', installed_at: new Date().toISOString() }
    ]);
  }

  // Seed inicial de perfis
  const culturesCount = await db.profiles_cultures.count();
  if (culturesCount === 0) {
    await db.profiles_cultures.bulkAdd([
      { name: 'Vinha da Encosta', crop_type: 'Vinha', variety: 'Touriga Nacional', area_ha: 4.5, row_distance_m: 2.2, phenological_stage: 'Floração', location: 'Quinta do Vale' },
      { name: 'Pomar Gala', crop_type: 'Macieira', variety: 'Royal Gala', area_ha: 8.2, row_distance_m: 4.0, phenological_stage: 'Vingamento', location: 'Gouveia' }
    ]);
  }

  const equipCount = await db.profiles_equipment.count();
  if (equipCount === 0) {
    await db.profiles_equipment.bulkAdd([
      { name: 'Atomizador Tomix 1000L', manufacturer: 'Tomix', model: 'Tornado 1000', tank_capacity_l: 1000, clean_water_tank_l: 100, max_pressure_bar: 20, recommended_pressure_bar: 12, nozzle_type: 'Albuz ATR Amarelo' },
      { name: 'Pulverizador Barra Rocha 600L', manufacturer: 'Rocha', model: 'Hydra 600', tank_capacity_l: 600, clean_water_tank_l: 60, max_pressure_bar: 15, recommended_pressure_bar: 3, nozzle_type: 'Lechler IDK Azul' }
    ]);
  }

  const nozzleCount = await db.profiles_nozzles.count();
  if (nozzleCount === 0) {
    await db.profiles_nozzles.bulkAdd([
      { manufacturer: 'Albuz', model: 'ATR 80', color: 'Amarelo', iso_classification: 'ISO 10625', nozzle_type: 'Cone Oco', spray_angle: '80°', working_pressure_bar: 10, nominal_flow_lmin: 1.03 },
      { manufacturer: 'Lechler', model: 'IDK', color: 'Azul', iso_classification: 'ISO 10625', nozzle_type: 'Injeção de Ar', spray_angle: '110°', working_pressure_bar: 3, nominal_flow_lmin: 1.20 }
    ]);
  }

  const calibCount = await db.profiles_calibrations.count();
  if (calibCount === 0) {
    await db.profiles_calibrations.bulkAdd([
      { working_speed_kmh: 6.5, working_pressure_bar: 10, working_width_m: 2.2, active_nozzles_count: 12, total_flow_lmin: 12.36, calculated_spray_volume_lha: 518.88 },
      { working_speed_kmh: 5.0, working_pressure_bar: 3, working_width_m: 12.0, active_nozzles_count: 24, total_flow_lmin: 28.80, calculated_spray_volume_lha: 288.00 }
    ]);
  }
}

// Executar seed na inicialização
seedMicrolearningIfEmpty().catch(console.error);
