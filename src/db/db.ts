// src/db/db.ts
import Dexie, { type Table } from 'dexie';
import type { CalculationHistoryRecord, CalibrationProfile } from '../types/calculator';
import type { ActiveSubstance } from '../features/verificador-ph/types.ts';
import { seedMicrolearningIfEmpty } from './seed.ts';
import type {
  CalculationHistoryItem,
  ProfileCulture,
  ProfileEquipment,
  ProfileNozzle,
  ProfileCalibration,
  MicrolearningContent,
  InstalledToolItem,
  MixHistoryRecord,
  EppoHistoryRecord,
  MutationOutboxRecord
} from './types.ts';

export * from './types.ts';

export class DaterraDatabase extends Dexie {
  calculation_history!: Table<CalculationHistoryItem>;
  profiles_cultures!: Table<ProfileCulture>;
  profiles_equipment!: Table<ProfileEquipment>;
  profiles_nozzles!: Table<ProfileNozzle>;
  profiles_calibrations!: Table<ProfileCalibration>;
  microlearning_content!: Table<MicrolearningContent>;
  installed_tools!: Table<InstalledToolItem>;

  // Motor Universal de Calculadoras
  calculation_history_v2!: Table<CalculationHistoryRecord>;
  calibration_profiles!: Table<CalibrationProfile>;

  // Histórico de Misturas
  mix_history!: Table<MixHistoryRecord>;

  // Substâncias Ativas (Verificador de pH)
  active_substances!: Table<ActiveSubstance, string>;

  // Histórico de Ajuste EPPO
  eppo_history!: Table<EppoHistoryRecord>;

  // Persistência First-Offline (Mutation Outbox)
  mutation_outbox!: Table<MutationOutboxRecord, number>;

  constructor() {
    super('DaterraSmartDB');

    // Versão 3 legada
    this.version(3).stores({
      calculation_history: '++id, date, calculator_type, profile_id',
      profiles_cultures: '++id, name, crop_type',
      profiles_equipment: '++id, name',
      profiles_nozzles: '++id, manufacturer, model, equipment_id',
      profiles_calibrations: '++id, equipment_id, nozzle_id',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id'
    });

    // Versão 4: Suporte a UUID v4 e calibrações
    this.version(4).stores({
      calculation_history: '++id, date, calculator_type, profile_id',
      profiles_cultures: '++id, name, crop_type',
      profiles_equipment: '++id, name',
      profiles_nozzles: '++id, manufacturer, model, equipment_id',
      profiles_calibrations: '++id, equipment_id, nozzle_id',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id',
      calculation_history_v2: '&id, userId, calculatorId, createdAt, syncStatus, isDeleted, [calculatorId+userId+isDeleted]',
      calibration_profiles: '&id, userId, equipmentProfileId, status, syncStatus, isDeleted'
    });

    // Versão 5: Adição de histórico de misturas
    this.version(5).stores({
      calculation_history: '++id, date, calculator_type, profile_id',
      profiles_cultures: '++id, name, crop_type',
      profiles_equipment: '++id, name',
      profiles_nozzles: '++id, manufacturer, model, equipment_id',
      profiles_calibrations: '++id, equipment_id, nozzle_id',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id',
      calculation_history_v2: '&id, userId, calculatorId, createdAt, syncStatus, isDeleted, [calculatorId+userId+isDeleted]',
      calibration_profiles: '&id, userId, equipmentProfileId, status, syncStatus, isDeleted',
      mix_history: '++id, date'
    });

    // Versão 6: Adição de substâncias ativas
    this.version(6).stores({
      calculation_history: '++id, date, calculator_type, profile_id',
      profiles_cultures: '++id, name, crop_type',
      profiles_equipment: '++id, name',
      profiles_nozzles: '++id, manufacturer, model, equipment_id',
      profiles_calibrations: '++id, equipment_id, nozzle_id',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id',
      calculation_history_v2: '&id, userId, calculatorId, createdAt, syncStatus, isDeleted, [calculatorId+userId+isDeleted]',
      calibration_profiles: '&id, userId, equipmentProfileId, status, syncStatus, isDeleted',
      mix_history: '++id, date',
      active_substances: 'id, name, moa, nameEn'
    });

    // Versão 7: Histórico EPPO
    this.version(7).stores({
      calculation_history: '++id, date, calculator_type, profile_id',
      profiles_cultures: '++id, name, crop_type',
      profiles_equipment: '++id, name',
      profiles_nozzles: '++id, manufacturer, model, equipment_id',
      profiles_calibrations: '++id, equipment_id, nozzle_id',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id',
      calculation_history_v2: '&id, userId, calculatorId, createdAt, syncStatus, isDeleted, [calculatorId+userId+isDeleted]',
      calibration_profiles: '&id, userId, equipmentProfileId, status, syncStatus, isDeleted',
      mix_history: '++id, date',
      active_substances: 'id, name, moa, nameEn',
      eppo_history: '++id, date'
    });

    // Versão 8: Padrão Mutation Outbox para persistência First-Offline e LWW
    this.version(8).stores({
      calculation_history: '++id, date, calculator_type, profile_id',
      profiles_cultures: '++id, name, crop_type',
      profiles_equipment: '++id, name',
      profiles_nozzles: '++id, manufacturer, model, equipment_id',
      profiles_calibrations: '++id, equipment_id, nozzle_id',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id',
      calculation_history_v2: '&id, userId, calculatorId, createdAt, syncStatus, isDeleted, [calculatorId+userId+isDeleted]',
      calibration_profiles: '&id, userId, equipmentProfileId, status, syncStatus, isDeleted',
      mix_history: '++id, date',
      active_substances: 'id, name, moa, nameEn',
      eppo_history: '++id, date',
      mutation_outbox: '++id, entityId, entityType, operation, synced, updatedAt, attempts'
    });

    // Versão 9: Telemetria Agronómica (LWA, TRV, Eficácia da Máquina) para Perfis Pro
    this.version(9).stores({
      calculation_history: '++id, date, calculator_type, profile_id',
      profiles_cultures: '++id, name, crop_type, last_lwa_m2_ha, last_trv_m3_ha',
      profiles_equipment: '++id, name, machine_efficiency_pct',
      profiles_nozzles: '++id, manufacturer, model, equipment_id',
      profiles_calibrations: '++id, equipment_id, nozzle_id',
      microlearning_content: '++id, &field_key',
      installed_tools: '++id, &tool_id',
      calculation_history_v2: '&id, userId, calculatorId, createdAt, syncStatus, isDeleted, [calculatorId+userId+isDeleted]',
      calibration_profiles: '&id, userId, equipmentProfileId, status, syncStatus, isDeleted',
      mix_history: '++id, date',
      active_substances: 'id, name, moa, nameEn',
      eppo_history: '++id, date',
      mutation_outbox: '++id, entityId, entityType, operation, synced, updatedAt, attempts'
    }).upgrade(async () => {
      console.log('[DaterraSmartDB] Migrado com sucesso para a Versão 9 (Telemetria Agronómica Pro ativa).');
    });
  }
}

export const db = new DaterraDatabase();

// Executar seed na inicialização
seedMicrolearningIfEmpty(db).catch(console.error);
