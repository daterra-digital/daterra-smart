// src/db/types.ts
// Interfaces canónicas do modelo de dados local Dexie.js da DATERRA Smart

export interface CalculationHistoryItem {
  id?: number;
  date: string; // ISO String
  calculator_type: 'concentracao_jovem' | 'concentracao_adulta' | 'dose' | 'area_parede_foliar';
  inputs: Record<string, any>;
  result: {
    quantidade_pf: number;
    unit_pf: string;
    area_tratada_ha?: number;
    lwa_m2_ha?: number;
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

  // Telemetria Agronómica consolidada (EPPO PP 1/239) - Versão 9 (Pro Tier)
  last_lwa_m2_ha?: number;
  last_trv_m3_ha?: number;
  last_spray_volume_lha?: number;
  last_calculated_at?: string;
  last_calculator_id?: string;
  last_phenological_stage?: string;
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
  efficiency_correction_factor?: number;

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
  distribution_type?: string;
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

  // Telemetria e Eficácia da Máquina - Versão 9 (Pro Tier)
  machine_efficiency_pct?: number; // Percentagem de eficácia estimada (ex: 85%)
  last_working_speed_kmh?: number;
  last_total_flow_lmin?: number;
  last_calibrated_at?: string;
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

export interface MixHistoryRecord {
  id?: number;
  date: string;
  title?: string;
  selected_formulation_ids: string[];
  tank_capacity_l?: number;
  water_initial_l?: number;
  water_final_l?: number;
  notes?: string;
}

export interface EppoHistoryRecord {
  id?: number;
  date: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
}

export interface MutationOutboxRecord {
  id?: number;
  entityId: string;
  entityType: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  synced: 0 | 1;
  updatedAt: string;
  attempts: number;
  lastError?: string;
}
