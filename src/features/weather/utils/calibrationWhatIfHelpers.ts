// src/features/weather/utils/calibrationWhatIfHelpers.ts
import type { ProfileCropMoment, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../../../db/types.ts';
import { computeCalibrationEppoBalance, type CalibrationEppoBalanceResult } from '../../../lib/agri-math/calibration-eppo-bridge.ts';
import { calculateDriftRiskIndex } from '../../ird/irdEngine.ts';
import { THREE_D_EQUIPMENT_TYPES, type EquipmentRecord } from '../../../schemas/equipment.schema.ts';
import type { UavEquipmentDetails } from '../../../schemas/equipmentUav.schema.ts';
import type { NozzleProfile } from '../../../schemas/nozzle-profile.schema.ts';
import type { CalibrationAuditRecord } from '../../../types/calibration-audit.ts';
import { resolveCultureGeometryAndEppo, resolveNozzlePressureBounds } from '../../perfis/services/calibrationFormatters.ts';
import { NOZZLES_BY_ID } from '../../nozzle-comparison/nozzleComparison.data.ts';
import type { CurrentWeather } from '../types.ts';
import { computeParcelFactorBundle } from './irdParcelFactorHelpers.ts';
import { computeUavIrdFactor } from './irdUavFactorHelpers.ts';
import { getIrdOperationalBand, resolveAcceptableIrdLimit } from './irdOperationalThresholds.ts';
import { formatDecimalPt } from './windDirection.ts';

export type WhatIfEquipKind = '3D' | '2D' | 'UAV';

export interface ResolvedCalibrationChain {
  calibration: CalibrationAuditRecord; culture: ProfileCulture | null; cultureLabel: string; cultureMetaLabel: string;
  geometryMode?: '2D' | '3D'; fParcela?: number; parcelAlertsPt?: string[]; sensitiveZoneLimitPct?: number | null;
  slopePct?: number | null; refBoomHeightCm?: number | null; equipmentName: string; equipKind: WhatIfEquipKind;
  hasAirSleeve: boolean; equipmentMetaLabel: string; uavDetails?: UavEquipmentDetails; nozzleSpacingCm?: number | null;
  nozzleName: string; nozzleType: string | null; nozzleMetaLabel: string; nozzleCatalogId: string | null;
  nozzleBrand: string | null; nozzleModel: string | null; driftHazardLevel: string | null; dv50Um: number | null;
  baseSpeedKmh: number; basePressureBar: number; baseFlowLMin: number; baseAirflowM3h: number | null;
  baseHeightVal: number; baseCdaDiscRpm?: number | null; entrelinhaM: number; numBicosAtivos: number;
  trvM3Ha: number | null; lwaM2Ha: number | null; volumeEppoLHa: number | null; minPressureBar: number | null;
  maxPressureBar: number | null; hasAntiDrift: boolean | null;
}

export interface WhatIfValues {
  speedKmh: number; pressureBar: number; airflowM3h: number | null; heightVal: number;
  cdaDiscRpm?: number | null; unilateralBorder3d?: boolean; adjuvantAntiDrift?: boolean;
}

export interface WhatIfSimulationResult {
  scaledFlowLMin: number; appliedVolumeLHa: number; eppoBalance: CalibrationEppoBalanceResult; optimalAirflowM3h: number | null;
  fNozzleFactor: number; isPressureOutOfBounds: boolean; pressureAlertPt: string | null; eppoAlignmentLabel: string;
  belowMechanicalFloor: boolean; mechanicalFloorLHa: number; baseMeteoScore: number; combinedIrdPct: number;
  irdRiskLabel: string; apparentWindKmh: number; boomSpacingRatio: number | null; uavSpeedMs: number | null;
  isUavLegalWindBlock: boolean; isUavOutOfTargetBand: boolean; isSensitiveZoneAlert: boolean; simAlertsPt: string[];
}

const isPos = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const round2 = (v: number) => Math.round(v * 100) / 100;

export function resolveCalibrationChain(
  cal: CalibrationAuditRecord, cultures: ProfileCulture[], moments: ProfileCropMoment[],
  equipV12: EquipmentRecord[], equipLeg: ProfileEquipment[], nozzlesV12: NozzleProfile[], nozzlesLeg: ProfileNozzle[], weather?: CurrentWeather
): ResolvedCalibrationChain {
  const cult = cal.cultureParcelId ? cultures.find((c) => String(c.id) === String(cal.cultureParcelId)) ?? null : null;
  const mom = cult && (cal.cultureMomentId || cult.active_moment_id)
    ? moments.find((m) => String(m.id) === String(cal.cultureMomentId ?? cult.active_moment_id)) ?? null : null;
  const geom = cult ? resolveCultureGeometryAndEppo(cult, mom) : null;
  const parcel = computeParcelFactorBundle(cult, mom, weather?.telemetryQuality?.rawWindDirectionDeg ?? weather?.windDirectionDeg);
  const eqV12 = cal.equipmentId ? equipV12.find((e) => e.id === cal.equipmentId) ?? null : null;
  const eqLeg = !eqV12 && cal.equipmentId ? equipLeg.find((e) => String(e.id) === String(cal.equipmentId)) ?? null : null;
  const nzV12 = cal.nozzleProfileId ? nozzlesV12.find((n) => n.id === cal.nozzleProfileId) ?? null : null;
  const nzLeg = !nzV12 && cal.nozzleProfileId ? nozzlesLeg.find((n) => String(n.id) === String(cal.nozzleProfileId)) ?? null : null;

  const isUav = eqV12 ? eqV12.type === 'UAV_DRONE' : (eqLeg?.distribution_type || eqLeg?.name || '').toLowerCase().includes('drone');
  const is3d = !isUav && (eqV12 ? (THREE_D_EQUIPMENT_TYPES.has(eqV12.type) || Boolean(eqV12.airAssisted)) : Boolean(eqLeg?.has_air_sleeve || eqLeg?.fan_type));
  const equipKind: WhatIfEquipKind = isUav ? 'UAV' : is3d ? '3D' : '2D';
  const hasAirSleeve = Boolean(eqLeg?.has_air_sleeve || (eqV12?.type === '2D_HORIZONTAL' && eqV12.airAssisted));
  const uavDetails = eqV12?.uavDetails ?? eqLeg?.uav_details;

  const firstCat = nzV12?.slots.find((s) => s.isActive && s.nozzleId)?.nozzleId ? NOZZLES_BY_ID.get(nzV12.slots.find((s) => s.isActive && s.nozzleId)!.nozzleId) ?? null : null;
  const bounds = resolveNozzlePressureBounds(nzV12);
  const volumeEppoLHa = isPos(cal.volumeRecomendadoEppoLHa) ? cal.volumeRecomendadoEppoLHa : (parcel.targetVolumeLHa ?? geom?.volumeEppoLHa ?? null);
  const idxText = parcel.geometryMode === '2D'
    ? (parcel.refBoomHeightCm ? `2D · Barra ref. ${parcel.refBoomHeightCm} cm` : 'Modo 2D (Arvense/Hortícola)')
    : (geom?.lwaM2Ha ? `LWA ${Math.round(geom.lwaM2Ha).toLocaleString('pt-PT')} m²/ha` : geom?.trvM3Ha ? `TRV ${Math.round(geom.trvM3Ha).toLocaleString('pt-PT')} m³/ha` : 'Cultura 3D');
  const eppoText = volumeEppoLHa ? `Alvo ${formatDecimalPt(volumeEppoLHa)} L/ha` : 'Sem alvo vol.';
  const sensDist = cult?.sensitive_zone_distance_m;

  return {
    calibration: cal, culture: cult, cultureLabel: cult ? `${cult.name}${mom?.stageLabel ? ` · ${mom.stageLabel}` : ''}` : 'Cultura não associada',
    cultureMetaLabel: `${idxText} · ${eppoText}`, geometryMode: parcel.geometryMode, fParcela: parcel.fParcela, parcelAlertsPt: parcel.alertsPt,
    sensitiveZoneLimitPct: resolveAcceptableIrdLimit(sensDist), slopePct: cult?.parcel_slope_pct ?? null, refBoomHeightCm: parcel.refBoomHeightCm,
    equipmentName: eqV12?.name ?? eqLeg?.name ?? 'Equipamento não associado', equipKind, hasAirSleeve,
    equipmentMetaLabel: `${equipKind === 'UAV' ? 'Drone UAV' : equipKind === '3D' ? 'Copa 3D' : 'Barra 2D'}${hasAirSleeve ? ' · c/ Manga' : ''}`,
    uavDetails, nozzleSpacingCm: eqV12?.nozzleSpacingCm ?? null,
    nozzleName: nzV12?.name ?? (nzLeg ? `${nzLeg.manufacturer} ${nzLeg.model}` : 'Bico não associado'),
    nozzleType: firstCat?.nozzleType ?? nzLeg?.nozzle_type ?? null, nozzleMetaLabel: `${cal.numBicosAtivos} bicos · ${formatDecimalPt(cal.pressaoBar)} bar`,
    nozzleCatalogId: firstCat?.id ?? null, nozzleBrand: firstCat?.brand ?? nzLeg?.manufacturer ?? null, nozzleModel: firstCat?.model ?? nzLeg?.model ?? null,
    driftHazardLevel: firstCat?.driftHazardLevel ?? null, dv50Um: uavDetails?.dropletDv50Um ?? firstCat?.d50_5bar_um ?? firstCat?.d50_10bar_um ?? null,
    baseSpeedKmh: cal.velocidadeKmh, basePressureBar: cal.pressaoBar, baseFlowLMin: cal.debitoTotalLMin,
    baseAirflowM3h: cal.caudalArAplicadoM3H ?? eqV12?.defaultAirflowM3h ?? (equipKind === '3D' ? (cal.caudalArOtimoM3H ?? 12000) : null),
    baseHeightVal: equipKind === 'UAV' ? (uavDetails?.flightHeightM ?? 2.0) : equipKind === '2D' ? (parcel.refBoomHeightCm ?? Math.round((eqLeg?.boom_height_m ?? 0.5) * 100)) : 1.2,
    baseCdaDiscRpm: uavDetails?.cdaDiscRpm ?? null,
    entrelinhaM: equipKind === 'UAV' && isPos(uavDetails?.swathWidthM) ? uavDetails!.swathWidthM! : cal.entrelinhaM,
    numBicosAtivos: cal.numBicosAtivos, trvM3Ha: geom?.trvM3Ha ?? null, lwaM2Ha: geom?.lwaM2Ha ?? null, volumeEppoLHa,
    minPressureBar: bounds.minBar, maxPressureBar: bounds.maxBar, hasAntiDrift: bounds.hasAntiDrift ?? (nzLeg?.nozzle_type || '').toLowerCase().includes('ind')
  };
}

export function computeWhatIfSimulation(chain: ResolvedCalibrationChain, vals: WhatIfValues, weather?: CurrentWeather): WhatIfSimulationResult {
  const speed = Math.max(0.5, vals.speedKmh);
  const press = Math.max(0.5, vals.pressureBar);
  const scaledFlowLMin = round2(chain.baseFlowLMin * Math.sqrt(press / Math.max(0.1, chain.basePressureBar)));
  const appliedVolumeLHa = round2((scaledFlowLMin * 600) / (speed * Math.max(0.1, chain.entrelinhaM)));

  const eppoBalance = computeCalibrationEppoBalance({
    debitoTotalLMin: scaledFlowLMin, velocidadeKmh: speed, entrelinhaM: chain.entrelinhaM, pressaoBar: press,
    numBicosAtivos: chain.numBicosAtivos, culturaTipologia: chain.equipKind === '2D' ? '2D' : '3D_COPA',
    volumeRecomendadoEppoLHa: chain.volumeEppoLHa, trvM3Ha: chain.trvM3Ha, lwaM2Ha: chain.lwaM2Ha,
    caudalArAplicadoM3H: chain.equipKind === '3D' ? vals.airflowM3h : null, isDroneUav: chain.equipKind === 'UAV'
  });

  const windKmh = weather?.telemetryQuality?.rawWindSpeedKmh ?? weather?.windSpeedKmh ?? 6;
  const apparentWindKmh = round2(windKmh + 0.35 * speed);
  const optimalAirflowM3h = chain.trvM3Ha ? Math.round(0.1 * chain.trvM3Ha * speed) : null;
  const isUnder = chain.minPressureBar !== null && press < chain.minPressureBar;
  const isOver = chain.maxPressureBar !== null && press > chain.maxPressureBar;
  const fNozzleFactor = round2(Math.max(0.5, (chain.hasAntiDrift ? 0.85 : 1.15) * Math.pow(press / Math.max(0.5, chain.basePressureBar), 0.35) * (isOver ? 1.25 : 1)));
  const pressureAlertPt = isOver ? `Pressão > máx. homologado (${formatDecimalPt(chain.maxPressureBar)} bar): atomização fina eleva f_bico.`
    : isUnder ? `Pressão < mín. homologado (${formatDecimalPt(chain.minPressureBar)} bar): SDRT comprometida.` : null;

  const boomM = chain.equipKind === '2D' ? Math.max(0.2, vals.heightVal / 100) : chain.equipKind === 'UAV' ? Math.max(0.5, vals.heightVal) : 1.2;
  const irdRes = calculateDriftRiskIndex({
    weather: { windSpeedKmh: windKmh, windGustsKmh: weather?.telemetryQuality?.rawWindGustsKmh ?? weather?.windGustsKmh ?? 8, temperatureC: weather?.telemetryQuality?.rawTemperatureC ?? weather?.temperatureC ?? 18, relativeHumidityPct: weather?.telemetryQuality?.rawHumidityPercent ?? weather?.humidityPercent ?? 65, precipitationMm: 0, weatherSource: weather?.isCached ? 'open_meteo_cache' : 'open_meteo_live' },
    nozzle: { nozzleId: chain.nozzleCatalogId, brand: chain.nozzleBrand, model: chain.nozzleModel, nozzleType: chain.nozzleType, driftHazardLevel: chain.driftHazardLevel, referencePressureBar: chain.basePressureBar, pressureMinBar: chain.minPressureBar, pressureMaxBar: chain.maxPressureBar, dv50Um: chain.dv50Um, isAirInductionDeclared: chain.hasAntiDrift ?? undefined, workingPressureBar: press, hasAirSleeve: chain.hasAirSleeve },
    operation: { applicationDomain: chain.equipKind === '2D' ? 'horizontal_boom' : 'orchard_airblast', travelSpeedKmh: speed, boomOrReleaseHeightM: boomM },
    exposure: { hasDownwindSensitiveTarget: false }
  });

  const baseMeteoScore = irdRes.status === 'CALCULATED' ? Math.round(irdRes.subIndices.meteo) : 25;
  const simAlertsPt = [...(chain.parcelAlertsPt ?? [])];
  let opComponent = 30;
  let uavSpeedMs: number | null = null;
  let isUavLegalWindBlock = false;

  if (chain.equipKind === 'UAV') {
    const uavRes = computeUavIrdFactor({ flightHeightM: vals.heightVal, flightSpeedKmh: speed, cdaDiscRpm: vals.cdaDiscRpm ?? chain.baseCdaDiscRpm ?? null, pressureBar: press, adjuvantAntiEvap: Boolean(vals.adjuvantAntiDrift), windSpeedKmh: windKmh, slopePct: chain.slopePct ?? null, uavDetails: chain.uavDetails });
    opComponent = uavRes.uavOpRiskScore;
    uavSpeedMs = uavRes.speedMs;
    isUavLegalWindBlock = uavRes.isLegalWindBlock;
    simAlertsPt.push(...uavRes.alertsPt);
  } else {
    const rawOp = irdRes.status === 'CALCULATED' ? (0.55 * irdRes.subIndices.espectro + 0.45 * irdRes.subIndices.operacao) : 30;
    const overVent = optimalAirflowM3h && vals.airflowM3h && vals.airflowM3h > optimalAirflowM3h * 1.2 ? Math.min(28, ((vals.airflowM3h - optimalAirflowM3h * 1.2) / optimalAirflowM3h) * 35) : 0;
    const borderFactor = chain.equipKind === '3D' && vals.unilateralBorder3d ? 0.50 : 1.0;
    const adjFactor = vals.adjuvantAntiDrift ? 0.80 : 1.0;
    opComponent = (rawOp + overVent + Math.max(0, (fNozzleFactor - 1) * 18)) * borderFactor * adjFactor;
  }

  const combinedIrdPct = Math.round(Math.min(200, Math.max(10, (baseMeteoScore * (chain.fParcela ?? 1)) + opComponent)));
  const irdRiskLabel = getIrdOperationalBand(combinedIrdPct).shortLabel;
  const sensLimit = chain.sensitiveZoneLimitPct ?? 75;
  const isSensitiveZoneAlert = sensLimit === 30 ? combinedIrdPct > 50 : combinedIrdPct > sensLimit;
  if (isSensitiveZoneAlert) simAlertsPt.push(`IRD (${combinedIrdPct}%) acima do limiar máximo aceitável (${sensLimit === 30 ? '≤ 50% c/ SDRT' : `${sensLimit}%`}).`);
  else if (sensLimit === 30 && combinedIrdPct > 30) simAlertsPt.push(`IRD (${combinedIrdPct}% em zona ≤ 15 m): exige bicos SDRT 75–90%.`);
  else if (combinedIrdPct >= 60 && combinedIrdPct <= 75) simAlertsPt.push(`IRD ${combinedIrdPct}% (60–75%): aplique medidas corretivas imediatas.`);
  const boomSpacingRatio = chain.equipKind === '2D' && chain.nozzleSpacingCm ? round2(vals.heightVal / chain.nozzleSpacingCm) : null;
  const isUavOutOfTargetBand = chain.equipKind === 'UAV' && (appliedVolumeLHa < 10 || appliedVolumeLHa > 30);
  const eppoAlignmentLabel = eppoBalance.estadoConformidade === 'ALINHADO_REF_EPPO' ? 'Alinhado EPPO' : eppoBalance.estadoConformidade === 'ABAIXO_REF_EPPO' ? `Abaixo EPPO (${formatDecimalPt(eppoBalance.desvioPercentual)}%)` : eppoBalance.estadoConformidade === 'ACIMA_REF_EPPO' ? `Acima EPPO (+${formatDecimalPt(eppoBalance.desvioPercentual)}%)` : 'Sem alvo EPPO';

  return {
    scaledFlowLMin, appliedVolumeLHa, eppoBalance, optimalAirflowM3h, fNozzleFactor, isPressureOutOfBounds: isUnder || isOver, pressureAlertPt,
    eppoAlignmentLabel, belowMechanicalFloor: eppoBalance.abaixoPisoMecanico, mechanicalFloorLHa: eppoBalance.pisoMecanicoMinLHa,
    baseMeteoScore, combinedIrdPct, irdRiskLabel, apparentWindKmh, boomSpacingRatio, uavSpeedMs, isUavLegalWindBlock,
    isUavOutOfTargetBand, isSensitiveZoneAlert, simAlertsPt
  };
}
