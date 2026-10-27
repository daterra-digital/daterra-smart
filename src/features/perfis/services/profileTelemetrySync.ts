// src/features/perfis/services/profileTelemetrySync.ts
// Serviço First-Offline de sincronização de telemetria agronómica para Perfis (Plano PRO)

import { db } from '../../../db/db.ts';

export interface CultureTelemetryUpdate {
  lwa_m2_ha?: number;
  trv_m3_ha?: number;
  spray_volume_lha?: number;
  phenological_stage?: string;
  calculator_id: string;
}

export interface EquipmentEfficiencyUpdate {
  efficiency_pct: number;
  speed_kmh?: number;
  flow_lmin?: number;
}

/**
 * Atualiza os indicadores agronómicos (LWA, TRV, volume de calda) na cultura selecionada
 * e regista a mutação na Outbox para sincronização First-Offline.
 */
export async function syncCultureTelemetry(
  cultureId: number,
  telemetry: CultureTelemetryUpdate
): Promise<boolean> {
  try {
    const existing = await db.profiles_cultures.get(cultureId);
    if (!existing) return false;

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      last_calculated_at: now,
      last_calculator_id: telemetry.calculator_id
    };

    if (telemetry.lwa_m2_ha !== undefined) updateData.last_lwa_m2_ha = telemetry.lwa_m2_ha;
    if (telemetry.trv_m3_ha !== undefined) updateData.last_trv_m3_ha = telemetry.trv_m3_ha;
    if (telemetry.spray_volume_lha !== undefined) updateData.last_spray_volume_lha = telemetry.spray_volume_lha;
    if (telemetry.phenological_stage) updateData.last_phenological_stage = telemetry.phenological_stage;

    await db.profiles_cultures.update(cultureId, updateData);

    // Registo de mutação offline (LWW)
    await db.mutation_outbox.add({
      entityId: String(cultureId),
      entityType: 'profile_culture',
      operation: 'UPDATE',
      payload: updateData,
      synced: 0,
      updatedAt: now,
      attempts: 0
    });

    return true;
  } catch (err) {
    console.error('[profileTelemetrySync] Erro ao sincronizar telemetria da cultura:', err);
    return false;
  }
}

/**
 * Atualiza os indicadores de eficiência da máquina (Eficácia %, Velocidade, Débito)
 * no equipamento de pulverização selecionado.
 */
export async function syncEquipmentEfficiency(
  equipmentId: number,
  efficiency: EquipmentEfficiencyUpdate
): Promise<boolean> {
  try {
    const existing = await db.profiles_equipment.get(equipmentId);
    if (!existing) return false;

    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      machine_efficiency_pct: efficiency.efficiency_pct,
      last_calibrated_at: now
    };

    if (efficiency.speed_kmh !== undefined) updateData.last_working_speed_kmh = efficiency.speed_kmh;
    if (efficiency.flow_lmin !== undefined) updateData.last_total_flow_lmin = efficiency.flow_lmin;

    await db.profiles_equipment.update(equipmentId, updateData);

    // Registo de mutação offline (LWW)
    await db.mutation_outbox.add({
      entityId: String(equipmentId),
      entityType: 'profile_equipment',
      operation: 'UPDATE',
      payload: updateData,
      synced: 0,
      updatedAt: now,
      attempts: 0
    });

    return true;
  } catch (err) {
    console.error('[profileTelemetrySync] Erro ao sincronizar eficiência do equipamento:', err);
    return false;
  }
}
