// src/features/settings/equipment/equipmentAiContextService.ts
import { db, type DaterraDatabase, type ProfileCulture } from '../../../db/db.ts';
import { isOwnedByUser, isValidOwnerId } from '../../perfis/services/profileOwnership.ts';
import { parseMomentSnapshot } from '../../perfis/services/cultureEngineCompatibility.ts';
import { THREE_D_EQUIPMENT_TYPES, type EquipmentRecord, type EquipmentType } from '../../../schemas/equipment.schema.ts';
import {
  buildEquipmentAiContextSummary,
  calculateEffectiveBoomWidthM,
  calculateOptimalAirflow,
  getVentilationAlert,
  type ActiveCultureStatsForEquipment,
  type VentilationAlertStatus
} from '../../../lib/equipment-math.ts';
import { evaluateEquipmentIppStatus, type IppEvaluationResult } from '../../../lib/equipment-ipp-rules.ts';

export type EquipmentTypologyBadge = '2D' | '3D' | 'UAV' | 'Manual';

export interface ResolvedCultureStatsForEquipment extends ActiveCultureStatsForEquipment {
  countryCode: string;
}

export interface EquipmentAiContextItem {
  id: string;
  name: string;
  type: EquipmentType;
  typologyBadge: EquipmentTypologyBadge;
  tankCapacityL: number;
  operationalSummary: string;
  airSummary: string;
  ippStatus: IppEvaluationResult;
  promptSummary: string;
  record: EquipmentRecord;
}

const VENTILATION_SHORT_PT: Readonly<Record<VentilationAlertStatus, string>> = {
  UNDER: 'Subventilação',
  OPTIMAL: 'Ventilação ótima',
  OVER: 'Sobreventilação'
};

export function getEquipmentTypologyBadge(type: EquipmentType): EquipmentTypologyBadge {
  if (type === '2D_HORIZONTAL') return '2D';
  if (THREE_D_EQUIPMENT_TYPES.has(type)) return '3D';
  return type === 'UAV_DRONE' ? 'UAV' : 'Manual';
}

/**
 * Lista equipamentos v12 estritamente do utilizador autenticado (offline-first).
 * A tabela `equipments` não indexa `userId`; filtra-se diretamente sobre o registo.
 */
export async function listScopedEquipmentsV12(
  userId?: string | null,
  targetDb: DaterraDatabase = db
): Promise<EquipmentRecord[]> {
  if (!isValidOwnerId(userId)) return [];
  const ownerId = userId.trim();
  const owned = await targetDb.equipments.filter((row) => isOwnedByUser(row, ownerId)).toArray();
  return owned.sort((a, b) => (b.lastUpdatedAt || '').localeCompare(a.lastUpdatedAt || ''));
}

/**
 * Resolve TRV, LWA, entrelinha e jurisdição da cultura ativa em modo offline.
 */
export async function resolveActiveCultureStats(
  culture?: ProfileCulture | null,
  targetDb: DaterraDatabase = db
): Promise<ResolvedCultureStatsForEquipment> {
  if (!culture) return { countryCode: 'PT' };

  const countryCode = culture.country_code?.trim().toUpperCase() || 'PT';
  let trvM3ha: number | undefined;

  if (culture.last_trv_m3_ha !== undefined && culture.last_trv_m3_ha > 0) {
    trvM3ha = culture.last_trv_m3_ha;
  } else if (culture.active_moment_id) {
    const moment = await targetDb.profile_crop_moments.get(culture.active_moment_id);
    const snap = moment?.snapshotJson ? parseMomentSnapshot(moment.snapshotJson) : null;
    if (snap?.trvPure && snap.trvPure > 0) trvM3ha = snap.trvPure;
  } else if (culture.row_distance_m && culture.canopy_height_m && culture.canopy_width_m) {
    trvM3ha = Number(
      ((10000 * culture.canopy_height_m * culture.canopy_width_m) / culture.row_distance_m).toFixed(1)
    );
  }

  return {
    cultureName: culture.name,
    trvM3ha,
    lwaM2ha: culture.last_lwa_m2_ha,
    rowDistanceM: culture.row_distance_m,
    countryCode
  };
}

function formatOperationalAndAir(
  equipment: EquipmentRecord,
  cultureStats?: Partial<ResolvedCultureStatsForEquipment>
): { operationalSummary: string; airSummary: string } {
  if (equipment.type === '2D_HORIZONTAL') {
    const boomM = calculateEffectiveBoomWidthM(equipment.workingWidthM, equipment.nozzleSpacingCm);
    const hasAirSleeve =
      equipment.airAssisted ?? (equipment.defaultAirflowM3h !== undefined && equipment.defaultAirflowM3h > 0);
    const flowPart = equipment.defaultAirflowM3h !== undefined ? ` ${equipment.defaultAirflowM3h} m³/h` : '';
    const anglePart = equipment.airCurtainAngle ? ` · ${equipment.airCurtainAngle}` : '';
    return {
      operationalSummary: `${equipment.tankCapacityL} L · Barra ${boomM} m · ${equipment.defaultPressureBar} bar · ${equipment.defaultSpeedKmh} km/h`,
      airSummary: hasAirSleeve ? `Manga de ar${flowPart}${anglePart}` : 'Barra hidráulica (sem manga de ar)'
    };
  }

  if (THREE_D_EQUIPMENT_TYPES.has(equipment.type)) {
    const operationalSummary = `${equipment.tankCapacityL} L · ${equipment.workingWidthM} bicos · ${equipment.defaultPressureBar} bar · ${equipment.defaultSpeedKmh} km/h`;
    if (equipment.airAssisted === false) return { operationalSummary, airSummary: 'Ventilador desligado' };
    const actual = equipment.defaultAirflowM3h ?? 0;
    const optimal = calculateOptimalAirflow(cultureStats?.trvM3ha ?? 0, equipment.defaultSpeedKmh);
    if (optimal > 0) {
      const alert = getVentilationAlert(actual, optimal);
      return { operationalSummary, airSummary: `${VENTILATION_SHORT_PT[alert]} (${actual} vs. ${optimal} m³/h)` };
    }
    return { operationalSummary, airSummary: `Ventilador: ${actual} m³/h` };
  }

  if (equipment.type === 'UAV_DRONE') {
    const swathM = calculateEffectiveBoomWidthM(equipment.workingWidthM, equipment.nozzleSpacingCm);
    return {
      operationalSummary: `${equipment.tankCapacityL} L · Faixa ${swathM} m · ${equipment.defaultSpeedKmh} km/h`,
      airSummary: 'Drone UAV · Vento máx. ≤ 15 km/h'
    };
  }

  const lances = equipment.lanceCount ?? equipment.workingWidthM;
  const hosePart = equipment.hoseLengthM ? ` · ${equipment.hoseLengthM} m` : '';
  return {
    operationalSummary: `${equipment.tankCapacityL} L · ${lances} un.${hosePart} · ${equipment.defaultPressureBar} bar`,
    airSummary: equipment.hasHoseReel ? 'Pulverização manual c/ enrolador' : 'Pulverização manual (pistolas/lanças)'
  };
}

/**
 * Constrói o payload determinístico `@equipamento` cruzado com a cultura ativa e estado legal IPP.
 */
export function buildEquipmentAiContextItem(
  equipment: EquipmentRecord,
  cultureStats?: Partial<ResolvedCultureStatsForEquipment>,
  referenceDateIso?: string
): EquipmentAiContextItem {
  const typologyBadge = getEquipmentTypologyBadge(equipment.type);
  const ippStatus = evaluateEquipmentIppStatus(equipment, {
    countryCode: cultureStats?.countryCode || 'PT',
    referenceDateIso
  });
  const { operationalSummary, airSummary } = formatOperationalAndAir(equipment, cultureStats);
  const baseSummary = buildEquipmentAiContextSummary(equipment, cultureStats);
  const promptSummary = `${baseSummary} | Estado IPP Legal: ${ippStatus.badgeText} — ${ippStatus.summaryMessage}`;

  return {
    id: equipment.id,
    name: equipment.name,
    type: equipment.type,
    typologyBadge,
    tankCapacityL: equipment.tankCapacityL,
    operationalSummary,
    airSummary,
    ippStatus,
    promptSummary,
    record: equipment
  };
}

/**
 * Carrega e formata a frota v12 do utilizador para as Janelas de Contexto IA (`@equipamento`).
 */
export async function loadActiveEquipmentAiContexts(
  userId?: string | null,
  activeCulture?: ProfileCulture | null,
  options?: { targetDb?: DaterraDatabase; referenceDateIso?: string }
): Promise<EquipmentAiContextItem[]> {
  const targetDb = options?.targetDb ?? db;
  const [equipments, cultureStats] = await Promise.all([
    listScopedEquipmentsV12(userId, targetDb),
    resolveActiveCultureStats(activeCulture, targetDb)
  ]);
  return equipments.map((eq) => buildEquipmentAiContextItem(eq, cultureStats, options?.referenceDateIso));
}
