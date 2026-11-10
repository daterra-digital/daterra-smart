/**
 * DATERRA Smart - Adaptador de Bicos do Motor IRD (Fase 1)
 * Hierarquia: Medição utilizador -> Catálogo dv10/dv50/dv90 -> Classe -> driftHazardLevel -> Fallback.
 */

import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import { interpolateDropletSpectrum } from '../nozzle-comparison/dropletSpectrumInterpolation.ts';
import { DROPLET_CLASSES_MAP, mapToDriftSensitivity } from '../nozzle-comparison/nozzleComparison.calculations.ts';
import type {
  IrdDataConfidence, IrdDropletClassCode, IrdDropletSource,
  IrdFallbackFlagCode, IrdNotice, IrdNozzleInput, IrdNozzleResolutionTier
} from './irdTypes.ts';
import {
  IRD_ANTI_ZERO_RISK, IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES,
  IRD_DROPLET_CLASS_SCORES, IRD_SCORING_CONSTANTS
} from './irdConfig.ts';

export interface ResolvedNozzleDriftProfile {
  readonly baseScore: number;
  readonly resolutionTier: IrdNozzleResolutionTier;
  readonly confidence: IrdDataConfidence;
  readonly dropletConfidence: IrdDataConfidence;
  readonly dropletSource: IrdDropletSource;
  readonly dropletClass?: IrdDropletClassCode;
  readonly dv10Um: number | null;
  readonly dv50Um: number | null;
  readonly dv10UsedUm: number | null;
  readonly dv50UsedUm: number | null;
  readonly dv90UsedUm: number | null;
  readonly isAirInduction: boolean;
  readonly pressureMinBar?: number;
  readonly pressureMaxBar?: number;
  readonly referencePressureBar?: number;
  readonly fallbackFlags: readonly IrdFallbackFlagCode[];
  readonly warnings: readonly IrdNotice[];
}

const clamp = (val: number, min: number, max: number): number => Math.min(max, Math.max(min, val));
const isValidUm = (val: unknown): val is number => typeof val === 'number' && Number.isFinite(val) && val >= 15 && val <= 2500;
const hasValue = (val: unknown): boolean => val !== undefined && val !== null;

function isDropletClassCode(val: unknown): val is IrdDropletClassCode {
  return typeof val === 'string' && Object.prototype.hasOwnProperty.call(DROPLET_CLASSES_MAP, val) && Object.prototype.hasOwnProperty.call(IRD_DROPLET_CLASS_SCORES, val);
}

function detectAirInduction(nozzleType?: string | null, declared?: boolean): boolean {
  return Boolean(declared || (nozzleType && /induç|induc|anti.?deriva|deriva reduzida|low.?drift|air.?ind/i.test(nozzleType)));
}

function pickCatalogDropletClass(catalogNozzle: Nozzle | undefined, pressureBar: number): string | undefined {
  if (!catalogNozzle) return undefined;
  const candidate = pressureBar >= 12.5 ? catalogNozzle.dropletClass15bar : pressureBar >= 7.5 ? catalogNozzle.dropletClass10bar : catalogNozzle.dropletClass5bar;
  return candidate && candidate !== 'null' ? candidate : undefined;
}

export function buildNozzleInputFromCatalog(nozzle: Nozzle, workingPressureBar: number | null, hasAirSleeve = false): IrdNozzleInput {
  return {
    nozzleId: nozzle.id, brand: nozzle.brand, model: nozzle.model, nozzleType: nozzle.nozzleType,
    driftHazardLevel: nozzle.driftHazardLevel, referencePressureBar: nozzle.referencePressureBar,
    pressureMinBar: nozzle.pressureMinBar, pressureMaxBar: nozzle.pressureMaxBar,
    isAirInductionDeclared: detectAirInduction(nozzle.nozzleType, false), workingPressureBar, hasAirSleeve
  };
}

function scoreDv10(dv10: number): number {
  const span = IRD_SCORING_CONSTANTS.dv10UpperRefUm - IRD_SCORING_CONSTANTS.dv10LowerRefUm;
  return clamp(((IRD_SCORING_CONSTANTS.dv10UpperRefUm - dv10) / span) * 100, IRD_ANTI_ZERO_RISK.minSubIndexScore, 100);
}

function scoreRepresentativeOrVmd(diameterUm: number): number {
  return clamp(10 + ((650 - clamp(diameterUm, 120, 650)) / 530) * 90, IRD_ANTI_ZERO_RISK.minSubIndexScore, 100);
}

function mapHazardBaseScore(rawHazard: string): number {
  const mapped = /\bhigh\b/i.test(rawHazard) ? 'Maior sensibilidade potencial à deriva' : mapToDriftSensitivity(rawHazard);
  if (mapped === 'Menor sensibilidade potencial à deriva') return IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES.LOWER;
  if (mapped === 'Sensibilidade potencial à deriva intermédia') return IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES.INTERMEDIATE;
  if (mapped === 'Maior sensibilidade potencial à deriva') return IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES.HIGHER;
  return IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES.UNAVAILABLE;
}

function tryResolveUserDroplet(
  input: IrdNozzleInput,
  nozzleType?: string | null
): { resolved?: { baseScore: number; resolutionTier: IrdNozzleResolutionTier; confidence: IrdDataConfidence; dv10UsedUm: number | null; dv50UsedUm: number | null; dv90UsedUm: number | null; dropletSource: IrdDropletSource }; invalidReason?: string } {
  const { measuredDv10Um: u10, measuredDv50Um: u50, measuredDv90Um: u90, representativeDropletDiameterUm: rep, measurementSource: src, measurementPressureBar: pRef, measurementConfidence: conf } = input;
  const hasAnyUserField = hasValue(u10) || hasValue(u50) || hasValue(u90) || hasValue(rep);
  if (!hasAnyUserField) return {};

  if (hasValue(pRef) && (typeof pRef !== 'number' || !Number.isFinite(pRef) || pRef <= 0 || pRef > 50)) {
    return { invalidReason: 'Pressão de referência da medição inválida (> 0 a 50 bar).' };
  }
  if ((hasValue(u10) && !isValidUm(u10)) || (hasValue(u50) && !isValidUm(u50)) || (hasValue(u90) && !isValidUm(u90)) || (hasValue(rep) && !isValidUm(rep))) {
    return { invalidReason: 'Diâmetro de gota introduzido fora da faixa válida (15–2500 µm).' };
  }
  if ((isValidUm(u10) && isValidUm(u50) && u10 >= u50) || (isValidUm(u50) && isValidUm(u90) && u50 >= u90) || (isValidUm(u10) && isValidUm(u90) && u10 >= u90)) {
    return { invalidReason: 'Ordem física inválida no espectro informado (exige Dv10 < Dv50 < Dv90).' };
  }

  const dropletSource = (typeof src === 'string' && src.trim() ? src.trim() : 'user_declared') as IrdDropletSource;
  if (isValidUm(u10) || isValidUm(u50) || isValidUm(u90)) {
    return {
      resolved: {
        baseScore: isValidUm(u10) ? scoreDv10(u10) : scoreRepresentativeOrVmd(isValidUm(u50) ? u50 : (u90 as number)),
        resolutionTier: 'user_measured_spectrum',
        confidence: conf ?? (isValidUm(u10) ? 'ALTA' : 'MEDIA'),
        dv10UsedUm: isValidUm(u10) ? u10 : null,
        dv50UsedUm: isValidUm(u50) ? u50 : null,
        dv90UsedUm: isValidUm(u90) ? u90 : null,
        dropletSource
      }
    };
  }

  const isRotaryOrCda = Boolean(nozzleType && /rotativ|cda|centrífug|centrifug|drone/i.test(nozzleType));
  if (typeof src !== 'string' || !src.trim()) {
    return { invalidReason: 'Diâmetro representativo exige indicação da fonte da medição.' };
  }
  if (!isRotaryOrCda && !hasValue(pRef)) {
    return { invalidReason: 'Diâmetro representativo em bico hidráulico exige pressão de referência.' };
  }

  return {
    resolved: {
      baseScore: scoreRepresentativeOrVmd(rep as number),
      resolutionTier: 'user_representative_diameter',
      confidence: conf ?? 'MEDIA',
      dv10UsedUm: null,
      dv50UsedUm: null,
      dv90UsedUm: null,
      dropletSource
    }
  };
}

export function resolveNozzleDriftProfile(inputNozzle: IrdNozzleInput, workingPressureBar: number, catalogNozzle?: Nozzle): ResolvedNozzleDriftProfile {
  const fallbackFlags: IrdFallbackFlagCode[] = [];
  const warnings: IrdNotice[] = [];
  const nozzleType = catalogNozzle?.nozzleType ?? inputNozzle.nozzleType;
  const isAirInduction = detectAirInduction(nozzleType, inputNozzle.isAirInductionDeclared);
  const pressureMinBar = catalogNozzle?.pressureMinBar ?? inputNozzle.pressureMinBar ?? undefined;
  const pressureMaxBar = catalogNozzle?.pressureMaxBar ?? inputNozzle.pressureMaxBar ?? undefined;
  const referencePressureBar = catalogNozzle?.referencePressureBar ?? inputNozzle.referencePressureBar ?? undefined;
  const interpolated = catalogNozzle ? interpolateDropletSpectrum(catalogNozzle, workingPressureBar) : undefined;
  const validClass = [interpolated?.effectiveDropletClass, pickCatalogDropletClass(catalogNozzle, workingPressureBar), inputNozzle.dropletClass].find(isDropletClassCode);
  const sharedMeta = { isAirInduction, pressureMinBar, pressureMaxBar, referencePressureBar, dropletClass: validClass };

  // Nível 1: Valores opcionais introduzidos pelo utilizador (se inválidos, ignora com aviso e segue hierarquia)
  const userTry = tryResolveUserDroplet(inputNozzle, nozzleType);
  if (userTry.resolved) {
    const u = userTry.resolved;
    return { ...sharedMeta, ...u, dropletConfidence: u.confidence, dv10Um: u.dv10UsedUm, dv50Um: u.dv50UsedUm, fallbackFlags, warnings };
  }
  if (userTry.invalidReason) {
    fallbackFlags.push('USER_DROPLET_MEASUREMENT_INVALID_IGNORED');
    warnings.push({ code: 'USER_DROPLET_MEASUREMENT_IGNORED', severity: 'warning', messagePt: `Medição de gota ignorada (${userTry.invalidReason}); aplicada hierarquia padrão do catálogo.` });
  }

  // Nível 2: dv10/dv50/dv90 do catálogo (ou dv10Um legado direto)
  const catDv10 = typeof inputNozzle.dv10Um === 'number' && Number.isFinite(inputNozzle.dv10Um) && inputNozzle.dv10Um > 0 ? inputNozzle.dv10Um : interpolated?.dv10 ?? null;
  const catDv50 = typeof inputNozzle.dv50Um === 'number' && Number.isFinite(inputNozzle.dv50Um) && inputNozzle.dv50Um > 0 ? inputNozzle.dv50Um : interpolated?.dv50 ?? null;
  const catDv90 = interpolated?.dv90 ?? null;
  if (catDv10 !== null && catDv10 > 0) {
    return { ...sharedMeta, baseScore: scoreDv10(catDv10), resolutionTier: 'lab_dv10', confidence: 'ALTA', dropletConfidence: 'ALTA', dropletSource: catalogNozzle ? 'catalog_interpolated' : 'user_declared', dv10Um: catDv10, dv50Um: catDv50, dv10UsedUm: catDv10, dv50UsedUm: catDv50, dv90UsedUm: catDv90, fallbackFlags, warnings };
  }

  // Nível 3: Classe de gotas BCPC / ISO 25358
  if (validClass) {
    fallbackFlags.push('NOZZLE_DV10_UNAVAILABLE_USED_CLASS');
    return { ...sharedMeta, baseScore: IRD_DROPLET_CLASS_SCORES[validClass], resolutionTier: 'catalog_droplet_class', confidence: 'MEDIA', dropletConfidence: 'MEDIA', dropletSource: 'catalog_class', dv10Um: null, dv50Um: catDv50, dv10UsedUm: null, dv50UsedUm: null, dv90UsedUm: null, fallbackFlags, warnings };
  }

  // Nível 4: driftHazardLevel normalizado
  const rawHazard = catalogNozzle?.driftHazardLevel ?? inputNozzle.driftHazardLevel;
  if (rawHazard && rawHazard !== 'null' && rawHazard !== 'N/D') {
    fallbackFlags.push('NOZZLE_CLASS_UNAVAILABLE_USED_HAZARD');
    if (/inexistente|zero|none/i.test(rawHazard)) fallbackFlags.push('NOZZLE_ZERO_HAZARD_NORMALIZED_NON_ZERO');
    return { ...sharedMeta, dropletClass: undefined, baseScore: mapHazardBaseScore(rawHazard), resolutionTier: 'catalog_drift_hazard', confidence: 'REDUZIDA', dropletConfidence: 'REDUZIDA', dropletSource: 'catalog_drift_hazard', dv10Um: null, dv50Um: null, dv10UsedUm: null, dv50UsedUm: null, dv90UsedUm: null, fallbackFlags, warnings };
  }

  // Nível 5: Fallback conservador (nunca risco zero)
  fallbackFlags.push('NOZZLE_CATALOG_DATA_MISSING_USED_CONSERVATIVE_F');
  const baseScore = isAirInduction ? IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES.CONSERVATIVE_DECLARED_AIR_INDUCTION : IRD_DRIFT_SENSITIVITY_FALLBACK_SCORES.CONSERVATIVE_NO_NOZZLE_STANDARD;
  return { ...sharedMeta, dropletClass: undefined, baseScore, resolutionTier: 'conservative_fallback', confidence: 'REDUZIDA', dropletConfidence: 'REDUZIDA', dropletSource: 'conservative_fallback', dv10Um: null, dv50Um: null, dv10UsedUm: null, dv50UsedUm: null, dv90UsedUm: null, fallbackFlags, warnings };
}
