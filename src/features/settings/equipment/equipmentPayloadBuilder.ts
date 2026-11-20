// src/features/settings/equipment/equipmentPayloadBuilder.ts
import { EquipmentSchema, type EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import type { ProfileEquipment } from '../../../db/types.ts';
import { stripUndefinedFields } from '../../perfis/services/profileOwnership.ts';
import type { EquipmentV12FormState } from './equipmentFormState.ts';
import { buildUavDetailsFromForm } from './equipmentUavHelpers.ts';

function parsePosNum(raw: string): number | undefined {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseNonNegNum(raw: string): number | undefined {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

const optStr = (raw: string): string | undefined => (raw.trim().length > 0 ? raw.trim() : undefined);

function makeUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function buildEquipmentRecordFromForm(
  form: EquipmentV12FormState,
  userId: string
): { record?: EquipmentRecord; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const name = optStr(form.name);
  if (!name) errors.name = 'Indique o nome ou referência da máquina.';

  const tankCapacityL = parsePosNum(form.tankCapacityL);
  if (tankCapacityL === undefined) errors.tankCapacityL = 'Indique a capacidade do depósito (> 0 L).';

  const isManual = form.type === 'MANUAL_LANCE';
  const lanceCountNum = isManual ? parsePosNum(form.lanceCount) ?? parsePosNum(form.workingWidthM) : undefined;
  if (isManual && lanceCountNum === undefined) {
    errors.lanceCount = 'Indique o número de pistolas / lanças (> 0).';
  }
  const hoseLengthNum = isManual ? parsePosNum(form.hoseLengthM) : undefined;

  const workingWidthM = isManual ? (lanceCountNum ? Math.round(lanceCountNum) : undefined) : parsePosNum(form.workingWidthM);
  if (!isManual && workingWidthM === undefined) errors.workingWidthM = 'Indique o número de bicos (> 0).';

  const nozzleSpacingCm = isManual ? parsePosNum(form.nozzleSpacingCm) ?? 50 : parsePosNum(form.nozzleSpacingCm);
  if (!isManual && nozzleSpacingCm === undefined) errors.nozzleSpacingCm = 'Indique o espaçamento entre bicos (> 0 cm).';

  const isUavCda = form.type === 'UAV_DRONE' && form.uavAtomizationSystem === 'CENTRIFUGAL_CDA';
  const defaultPressureBar = parsePosNum(form.defaultPressureBar) ?? (isUavCda ? 2 : undefined);
  if (!isUavCda && defaultPressureBar === undefined) errors.defaultPressureBar = 'Indique a pressão habitual (> 0 bar).';

  const defaultSpeedKmh = isManual ? parsePosNum(form.defaultSpeedKmh) ?? 3 : parsePosNum(form.defaultSpeedKmh);
  if (!isManual && defaultSpeedKmh === undefined) errors.defaultSpeedKmh = 'Indique a velocidade habitual (> 0 km/h).';

  const isAirAssisted = form.type === 'UAV_DRONE' || isManual ? false : Boolean(form.airAssisted);
  const rawAirflow = isAirAssisted ? parseNonNegNum(form.defaultAirflowM3h) : undefined;
  if (isAirAssisted && form.defaultAirflowM3h.trim() && rawAirflow === undefined) {
    errors.defaultAirflowM3h = 'Indique um caudal de ar válido (>= 0 m³/h).';
  }
  const defaultAirflowM3h = isAirAssisted ? rawAirflow : undefined;

  let manufactureYear: number | undefined;
  if (form.manufactureYear.trim()) {
    const yr = Number(form.manufactureYear.trim());
    if (!Number.isInteger(yr) || yr < 1950 || yr > 2100) {
      errors.manufactureYear = 'Indique um ano de construção válido (1950 a 2100).';
    } else {
      manufactureYear = yr;
    }
  }

  const sectionsCount = parsePosNum(form.sectionsCount);
  if (Object.keys(errors).length > 0 || !name || !tankCapacityL || !workingWidthM || !nozzleSpacingCm || !defaultPressureBar || !defaultSpeedKmh) {
    return { errors };
  }

  const candidate: EquipmentRecord = stripUndefinedFields({
    id: form.editingId || makeUuidV4(),
    userId: userId.trim(),
    legacyProfileId: form.legacyProfileId,
    name,
    type: form.type,
    manufacturer: optStr(form.manufacturer),
    model: optStr(form.model),
    serialNumber: optStr(form.serialNumber),
    manufactureYear,
    tankCapacityL,
    handWashTank: form.handWashTank,
    circuitFlushTank: form.circuitFlushTank,
    chemicalInductor: form.chemicalInductor,
    associatedNozzleIds: form.associatedNozzleIds.length > 0 ? form.associatedNozzleIds : undefined,
    workingWidthM,
    nozzleSpacingCm,
    defaultPressureBar,
    defaultSpeedKmh,
    defaultAirflowM3h,
    airAssisted: form.type === 'UAV_DRONE' || isManual ? undefined : isAirAssisted,
    airCurtainAngle: form.type === '2D_HORIZONTAL' && isAirAssisted ? optStr(form.airCurtainAngle) : undefined,
    uavDetails: buildUavDetailsFromForm(form, parsePosNum),
    lanceCount: isManual && lanceCountNum ? Math.round(lanceCountNum) : undefined,
    hoseLengthM: isManual ? hoseLengthNum : undefined,
    hasHoseReel: isManual ? form.hasHoseReel : undefined,
    pumpAndFilters: stripUndefinedFields({
      pumpManufacturer: optStr(form.pumpManufacturer),
      pumpModel: optStr(form.pumpModel),
      pumpType: optStr(form.pumpType),
      hasFillingSieve: form.hasFillingSieve,
      hasSuctionFilter: form.hasSuctionFilter,
      hasPressureFilter: form.hasPressureFilter,
      hasLineFilters: form.hasLineFilters,
      notes: optStr(form.pumpNotes)
    }),
    controlsAndRegulation: stripUndefinedFields({
      commandManufacturer: optStr(form.commandManufacturer),
      commandModel: optStr(form.commandModel),
      sectionsCount: sectionsCount !== undefined ? Math.round(sectionsCount) : undefined,
      isManual: form.isManual,
      isElectric: form.isElectric,
      isIsobus: form.isIsobus,
      isAutomatic: form.isAutomatic,
      hasComputer: form.hasComputer,
      notes: optStr(form.controlsNotes)
    }),
    manometer: stripUndefinedFields({
      manometerType: form.manometerType || 'ANALOG',
      diameterMm: form.manometerType === 'DIGITAL' ? undefined : parsePosNum(form.manometerDiameterMm),
      scaleDivisionsBar: parsePosNum(form.manometerDivisionsBar),
      maxScaleValueBar: parsePosNum(form.manometerMaxScaleBar),
      errorClassPct: parsePosNum(form.manometerErrorClassPct),
      maxPressureBar: parsePosNum(form.manometerMaxPressureBar),
      notes: optStr(form.manometerNotes)
    }),
    iso16122Inspection: stripUndefinedFields({
      lastInspectionDate: form.lastInspectionDate || undefined,
      pressureGaugeOk: form.pressureGaugeOk,
      antiDripValveOk: form.antiDripValveOk,
      nozzleWearWithin10Pct: form.nozzleWearWithin10Pct,
      hoseAndTriggerOk: isManual ? form.hoseAndTriggerOk : undefined,
      pumpAndFiltersOk: form.pumpAndFiltersOk,
      controlsAndRegulationOk: form.controlsAndRegulationOk,
      notes: optStr(form.notes)
    }),
    notes: optStr(form.notes),
    lastUpdatedAt: new Date().toISOString()
  });

  const parsed = EquipmentSchema.safeParse(candidate);
  if (!parsed.success) {
    errors.general = parsed.error.issues[0]?.message || 'Dados inválidos segundo o contrato ISO 16122.';
    return { errors };
  }
  return { record: parsed.data, errors: {} };
}

export function mapEquipmentRecordToLegacyProfile(eq: EquipmentRecord): Omit<ProfileEquipment, 'id' | 'userId'> {
  const distMap: Record<EquipmentRecord['type'], string> = {
    '2D_HORIZONTAL': 'Barra horizontal', '3D_AXIAL': 'Ventilador', '3D_TANGENTIAL': 'Ventilador',
    '3D_CROSSFLOW': 'Ventilador', '3D_TUNNEL': 'Painéis', '3D_PNEUMATIC': 'Pneumático',
    '3D_CANNON': 'Canhão', UAV_DRONE: 'Drone UAV', MANUAL_LANCE: 'Pistola/Lança'
  };
  return stripUndefinedFields({
    name: eq.name, manufacturer: eq.manufacturer, model: eq.model, serial_number: eq.serialNumber,
    construction_year: eq.manufactureYear !== undefined ? String(eq.manufactureYear) : undefined,
    tank_capacity_l: eq.tankCapacityL, has_hand_washing_tank: eq.handWashTank,
    has_circuit_rinse: eq.circuitFlushTank, has_product_incorporator: eq.chemicalInductor,
    selected_nozzles: eq.associatedNozzleIds, pump_manufacturer: eq.pumpAndFilters?.pumpManufacturer,
    pump_model: eq.pumpAndFilters?.pumpModel, pump_type: eq.pumpAndFilters?.pumpType,
    has_filling_sieve: eq.pumpAndFilters?.hasFillingSieve, has_suction_filter: eq.pumpAndFilters?.hasSuctionFilter,
    has_pressure_filter: eq.pumpAndFilters?.hasPressureFilter, has_line_filters: eq.pumpAndFilters?.hasLineFilters,
    command_manufacturer: eq.controlsAndRegulation?.commandManufacturer, command_model: eq.controlsAndRegulation?.commandModel,
    sections_count: eq.controlsAndRegulation?.sectionsCount, is_manual: eq.controlsAndRegulation?.isManual,
    is_electric: eq.controlsAndRegulation?.isElectric, is_isobus: eq.controlsAndRegulation?.isIsobus,
    is_automatic: eq.controlsAndRegulation?.isAutomatic, has_computer: eq.controlsAndRegulation?.hasComputer,
    manometer_diameter_mm: eq.manometer?.diameterMm, manometer_scale_divisions: eq.manometer?.scaleDivisionsBar,
    manometer_max_value: eq.manometer?.maxScaleValueBar, manometer_error_class: eq.manometer?.errorClassPct,
    max_pressure_bar: eq.manometer?.maxPressureBar, recommended_pressure_bar: eq.defaultPressureBar,
    last_working_speed_kmh: eq.defaultSpeedKmh, boom_width_m: eq.workingWidthM,
    has_air_sleeve: eq.type === '2D_HORIZONTAL' ? eq.airAssisted : undefined,
    uav_details: eq.uavDetails,
    lances_count: eq.lanceCount, hose_length_m: eq.hoseLengthM, has_hose_reels: eq.hasHoseReel,
    distribution_type: distMap[eq.type], inspection_date: eq.iso16122Inspection.lastInspectionDate,
    is_approved: Boolean(eq.iso16122Inspection.pressureGaugeOk && eq.iso16122Inspection.antiDripValveOk && eq.iso16122Inspection.nozzleWearWithin10Pct),
    notes: eq.notes
  });
}
