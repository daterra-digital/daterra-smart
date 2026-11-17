// src/features/perfis/services/explorationFormHelpers.ts
import type { ProfileCalibration, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../../../db/types.ts';
import { stripUndefinedFields } from './profileOwnership.ts';
import {
  INITIAL_CALIBRATION_FORM,
  INITIAL_CULTURE_FORM,
  INITIAL_EQUIPMENT_FORM,
  INITIAL_NOZZLE_FORM,
  optText,
  parsePositiveFloat,
  readNum,
  type CalibrationFormState,
  type CultureFormState,
  type EquipmentFormState,
  type NozzleFormState,
  type ValidationResult
} from './explorationFormTypes.ts';

export {
  INITIAL_CALIBRATION_FORM,
  INITIAL_CULTURE_FORM,
  INITIAL_EQUIPMENT_FORM,
  INITIAL_NOZZLE_FORM,
  parsePositiveFloat,
  type CalibrationFormState,
  type CultureFormState,
  type EquipmentFormState,
  type NozzleFormState,
  type ValidationResult
};

export function validateOptionalSprayAngle(raw: string): { value?: string; error?: string } {
  const t = raw.trim();
  if (!t) return {};
  const cleaned = t.endsWith('°') ? t.slice(0, -1).trim() : t;
  const val = parsePositiveFloat(cleaned);
  if (val === null || val < 15 || val > 170) {
    return { error: 'Ângulo do jato inválido (ex.: 80° ou 110°, entre 15° e 170°).' };
  }
  return { value: `${String(val).replace('.', ',')}°` };
}

export function computeSprayVolumeLha(speedRaw: string, widthRaw: string, flowRaw: string): number | null {
  const v = parsePositiveFloat(speedRaw);
  const w = parsePositiveFloat(widthRaw);
  const q = parsePositiveFloat(flowRaw);
  if (v === null || w === null || q === null) return null;
  return Number(((600 * q) / (v * w)).toFixed(2));
}

export function buildCulturePayload(f: CultureFormState): ValidationResult<Omit<ProfileCulture, 'id' | 'userId'>> {
  const errors: Record<string, string> = {};
  const cropType = optText(f.cropType);
  if (!cropType) errors.cropType = 'Selecione a cultura.';
  const name = optText(f.name);
  if (!name) errors.name = 'Indique o nome da parcela.';
  const area = readNum(f.area, 'area', 'Área (ha)', false, false, errors);
  const rowDistance = readNum(f.rowDistance, 'rowDistance', 'Distância entrelinha (m)', false, false, errors);
  const canopyWidth = readNum(f.canopyWidth, 'canopyWidth', 'Largura da copa (m)', false, false, errors);
  const canopyHeight = readNum(f.canopyHeight, 'canopyHeight', 'Altura da copa (m)', false, false, errors);
  const lai = readNum(f.lai, 'lai', 'LAI', false, false, errors);

  if (Object.keys(errors).length > 0 || !cropType || !name) return { errors };
  return {
    errors,
    data: stripUndefinedFields({
      name, crop_type: cropType, area_ha: area, variety: optText(f.variety),
      training_system: optText(f.trainingSystem), spacing: optText(f.spacing),
      row_distance_m: rowDistance, phenological_stage: optText(f.phenologicalStage),
      canopy_width_m: canopyWidth, canopy_height_m: canopyHeight, lai
    })
  };
}

export function buildEquipmentPayload(f: EquipmentFormState): ValidationResult<Omit<ProfileEquipment, 'id' | 'userId'>> {
  const errors: Record<string, string> = {};
  const name = optText(f.name);
  if (!name) errors.name = 'Indique o nome de referência do equipamento.';
  const tankCap = readNum(f.tankCapacity, 'tankCapacity', 'Capacidade do depósito (L)', true, false, errors);
  const resolveModel = (sel: string, custom: string) => (sel === 'outro' ? optText(custom) : optText(sel));
  const sections = readNum(f.sectionsCount, 'sectionsCount', 'Nº de secções', false, true, errors);
  const manoDia = readNum(f.manometerDiameter, 'manometerDiameter', 'Diâmetro do manómetro', false, false, errors);
  const manoDiv = readNum(f.manometerDivisions, 'manometerDivisions', 'Divisões da escala', false, false, errors);
  const manoMax = readNum(f.manometerMaxValue, 'manometerMaxValue', 'Valor máximo da escala', false, false, errors);
  const manoErr = readNum(f.manometerErrorClass, 'manometerErrorClass', 'Classe de erro', false, false, errors);
  const maxPress = readNum(f.maxPressure, 'maxPressure', 'Pressão máxima', false, false, errors);

  const dist = optText(f.distributionType);
  const distFields: Partial<ProfileEquipment> = {};
  if (dist === 'Barra horizontal') {
    distFields.boom_width_m = readNum(f.boomWidth, 'boomWidth', 'Largura da barra (m)', false, false, errors);
    distFields.boom_height_m = readNum(f.boomHeight, 'boomHeight', 'Altura da barra (m)', false, false, errors);
    distFields.has_air_sleeve = f.hasAirSleeve;
  } else if (dist === 'Barra vertical') {
    distFields.boom_height_m = readNum(f.boomHeight, 'boomHeight', 'Altura da barra (m)', false, false, errors);
  } else if (dist === 'Ventilador') {
    distFields.fan_transmission = optText(f.fanTransmission);
    distFields.fan_diameter_mm = readNum(f.fanDiameter, 'fanDiameter', 'Diâmetro do ventilador (mm)', false, false, errors);
    distFields.fan_type = optText(f.fanType);
    distFields.has_suction_air_deflector = f.hasSuctionAirDeflector;
    distFields.has_compression_air_deflector = f.hasCompressionAirDeflector;
    distFields.has_height_compression_air_deflector = f.hasHeightCompressionAirDeflector;
  } else if (dist === 'Pistola/Lança') {
    distFields.lances_count = readNum(f.lancesCount, 'lancesCount', 'Nº de pistolas/lanças', false, true, errors);
    distFields.hose_length_m = readNum(f.hoseLength, 'hoseLength', 'Comprimento da mangueira (m)', false, false, errors);
    distFields.has_hose_reels = f.hasHoseReels;
  } else if (dist === 'Pneumático') {
    distFields.pneumatic_nozzles_count = readNum(f.pneumaticNozzlesCount, 'pneumaticNozzlesCount', 'Nº de bocais pneumáticos', false, true, errors);
    distFields.nozzles_per_pneumatic_head = readNum(f.nozzlesPerPneumaticHead, 'nozzlesPerPneumaticHead', 'Bicos por bocal', false, true, errors);
  } else if (dist === 'Canhão') {
    distFields.cannon_nozzle_groups_count = readNum(f.cannonNozzleGroupsCount, 'cannonNozzleGroupsCount', 'Agrupamentos de bicos', false, true, errors);
  } else if (dist === 'Painéis') {
    distFields.panels_count = readNum(f.panelsCount, 'panelsCount', 'Nº de painéis', false, true, errors);
    distFields.simultaneous_rows_count = readNum(f.simultaneousRowsCount, 'simultaneousRowsCount', 'Linhas simultâneas', false, true, errors);
  }

  if (Object.keys(errors).length > 0 || !name || tankCap === undefined) return { errors };
  return {
    errors,
    data: stripUndefinedFields({
      name, tank_capacity_l: tankCap, manufacturer: optText(f.manufacturer),
      model: resolveModel(f.modelSelect, f.modelCustom), serial_number: optText(f.serialNumber),
      construction_year: optText(f.constructionYear), has_hand_washing_tank: f.hasHandWashingTank,
      has_circuit_rinse: f.hasCircuitRinse, has_product_incorporator: f.hasProductIncorporator,
      selected_nozzles: f.selectedNozzles.length > 0 ? f.selectedNozzles : undefined,
      pump_manufacturer: optText(f.pumpManufacturer), pump_model: resolveModel(f.pumpModelSelect, f.pumpModelCustom),
      pump_type: optText(f.pumpType), has_filling_sieve: f.hasFillingSieve, has_suction_filter: f.hasSuctionFilter,
      has_pressure_filter: f.hasPressureFilter, has_line_filters: f.hasLineFilters,
      command_manufacturer: optText(f.commandManufacturer), command_model: resolveModel(f.commandModelSelect, f.commandModelCustom),
      is_manual: f.isManual, is_electric: f.isElectric, is_isobus: f.isIsobus, is_automatic: f.isAutomatic,
      has_computer: f.hasComputer, sections_count: sections, manometer_diameter_mm: manoDia,
      manometer_scale_divisions: manoDiv, manometer_max_value: manoMax, manometer_error_class: manoErr,
      max_pressure_bar: maxPress, distribution_type: dist, ...distFields,
      notes: optText(f.notes), inspection_date: optText(f.inspectionDate), calibration_date: optText(f.calibrationDate)
    })
  };
}

export function buildNozzlePayload(f: NozzleFormState, selectedEq?: ProfileEquipment): ValidationResult<Omit<ProfileNozzle, 'id' | 'userId'>> {
  const errors: Record<string, string> = {};
  const manufacturer = optText(f.manufacturer);
  if (!manufacturer) errors.manufacturer = 'Selecione o fabricante do bico.';
  const model = optText(f.model);
  if (!model) errors.model = 'Selecione o modelo do bico.';
  const color = optText(f.color);
  if (!color) errors.color = 'Selecione a cor do bico.';
  const nozzleType = optText(f.nozzleType);
  if (!nozzleType) errors.nozzleType = 'Selecione o tipo de bico.';
  const pressure = readNum(f.workingPressureBar, 'workingPressureBar', 'Pressão de trabalho (bar)', true, false, errors);
  const nominalFlow = readNum(f.nominalFlowLmin, 'nominalFlowLmin', 'Débito nominal (L/min)', true, false, errors);

  const angleApplicable = nozzleType !== 'Defletor';
  const angleRes = angleApplicable ? validateOptionalSprayAngle(f.sprayAngle) : {};
  if (angleRes.error) errors.sprayAngle = angleRes.error;

  if (Object.keys(errors).length > 0 || !manufacturer || !model || !color || !nozzleType || pressure === undefined || nominalFlow === undefined) {
    return { errors };
  }
  return {
    errors,
    data: stripUndefinedFields({
      equipment_id: selectedEq?.id, equipment_name: selectedEq?.name,
      manufacturer, model, color, iso_classification: optText(f.isoClassification),
      nozzle_type: nozzleType, spray_angle: angleRes.value,
      working_pressure_bar: pressure, nominal_flow_lmin: nominalFlow
    })
  };
}

export function buildCalibrationPayload(
  f: CalibrationFormState, selectedEq?: ProfileEquipment, selectedNz?: ProfileNozzle
): ValidationResult<Omit<ProfileCalibration, 'id' | 'userId'>> {
  const errors: Record<string, string> = {};
  const speed = readNum(f.workingSpeedKmh, 'workingSpeedKmh', 'Velocidade (km/h)', true, false, errors);
  const pressure = readNum(f.workingPressureBar, 'workingPressureBar', 'Pressão (bar)', true, false, errors);
  const width = readNum(f.workingWidthM, 'workingWidthM', 'Largura de trabalho (m)', true, false, errors);
  const totalFlow = readNum(f.totalFlowLmin, 'totalFlowLmin', 'Débito total (L/min)', true, false, errors);
  const activeNozzles = readNum(f.activeNozzlesCount, 'activeNozzlesCount', 'Nº de bicos ativos', false, true, errors);
  const droplet = readNum(f.dropletSizeUm, 'dropletSizeUm', 'Tamanho da gota (µm)', false, false, errors);
  const airVel = readNum(f.airVelocityMs, 'airVelocityMs', 'Velocidade do ar (m/s)', false, false, errors);
  const airVol = readNum(f.airVolumeM3h, 'airVolumeM3h', 'Volume de ar (m³/h)', false, false, errors);

  const volume = speed && width && totalFlow ? Number(((600 * totalFlow) / (speed * width)).toFixed(2)) : undefined;
  if (Object.keys(errors).length > 0 || speed === undefined || pressure === undefined || width === undefined || totalFlow === undefined || volume === undefined) {
    return { errors };
  }
  return {
    errors,
    data: stripUndefinedFields({
      equipment_id: selectedEq?.id, equipment_name: selectedEq?.name,
      nozzle_id: selectedNz?.id, nozzle_name: selectedNz ? `${selectedNz.manufacturer} ${selectedNz.model}` : undefined,
      working_speed_kmh: speed, working_pressure_bar: pressure, working_width_m: width,
      active_nozzles_count: activeNozzles, droplet_size_um: droplet,
      total_flow_lmin: totalFlow, calculated_spray_volume_lha: volume,
      air_velocity_ms: airVel, air_volume_m3h: airVol
    })
  };
}
