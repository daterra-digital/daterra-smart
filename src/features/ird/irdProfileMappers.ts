import type {
  ProfileCalibration,
  ProfileEquipment,
  ProfileNozzle
} from '../../db/types.ts';
import type { Nozzle } from '../nozzle-comparison/nozzleComparison.types.ts';
import type { IrdApplicationDomain } from './irdTypes.ts';
import type { IrdTriStateStatus } from './irdOriginTypes.ts';

export interface MappedEquipmentContext {
  readonly applicationDomain: IrdApplicationDomain;
  readonly hasAirSleeve: boolean;
  readonly airAssistStatus: IrdTriStateStatus;
  readonly defaultSpeedKmh: number | null;
  readonly defaultHeightM: number | null;
  readonly isDroneOrNonBoomGap: boolean;
  readonly isAmbiguousDistribution: boolean;
  readonly distributionRawLabel: string;
  readonly notePt: string | null;
}

export interface NozzleMatchResult {
  readonly status: 'exact' | 'ambiguous' | 'none';
  readonly matchedNozzle: Nozzle | null;
  readonly candidates: readonly Nozzle[];
  readonly rawLabel: string;
}

export interface SafeCalibrationExtraction {
  readonly workingPressureBar: number | null;
  readonly workingSpeedKmh: number | null;
  readonly airflowM3h: number | null;
  readonly legacyDropletSizeUm: number | null;
  readonly legacyDropletNotePt: string | null;
}

const NOZZLE_V1_PREFIX = 'DATERRA_NOZZLE_PROFILE_V1:';

export function resolveNozzleRowId(row: ProfileNozzle): string {
  if (row.notes?.startsWith(NOZZLE_V1_PREFIX)) {
    try {
      const parsed = JSON.parse(row.notes.slice(NOZZLE_V1_PREFIX.length)) as { id?: string };
      if (parsed?.id) return parsed.id;
    } catch { /* fallback to numeric id */ }
  }
  return row.id !== undefined ? String(row.id) : '';
}

function norm(val: string | undefined | null): string {
  return (val || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function mapEquipmentProfileToIrd(eq: ProfileEquipment | null | undefined): MappedEquipmentContext | null {
  if (!eq) return null;
  const raw = (eq.distribution_type || '').trim();
  const dist = raw.toLowerCase();
  const nameLower = (eq.name || '').toLowerCase();

  const isDrone = dist.includes('drone') || dist.includes('uav') || dist.includes('vba') || dist.includes('aére') || nameLower.includes('drone');
  const isBoom = !isDrone && ((dist.includes('barra') && dist.includes('hor')) || dist === 'barras horizontais');
  const isAirblast = !isDrone && (dist.includes('ventilador') || dist.includes('atom') || dist.includes('turbo') || dist.includes('pomar') || dist.includes('arb'));
  const isManual = !isDrone && (dist.includes('lanç') || dist.includes('pistola') || dist.includes('manual') || dist.includes('cost'));
  const isAmbiguousType = !isDrone && !isBoom && !isAirblast && !isManual;

  const applicationDomain: IrdApplicationDomain = isAirblast
    ? 'orchard_airblast'
    : isManual
      ? 'manual_lance'
      : 'horizontal_boom';

  const airAssistStatus: IrdTriStateStatus = applicationDomain === 'horizontal_boom' && !isDrone && !isAmbiguousType
    ? (typeof eq.has_air_sleeve === 'boolean' ? (eq.has_air_sleeve ? 'yes' : 'no') : 'unknown')
    : applicationDomain === 'orchard_airblast'
      ? (eq.fan_type || eq.fan_transmission || typeof eq.has_air_deflector === 'boolean' ? 'yes' : 'unknown')
      : 'unknown';

  const hasAirSleeve = applicationDomain === 'horizontal_boom' && !isDrone && !isAmbiguousType && eq.has_air_sleeve === true;
  const defaultHeightM = applicationDomain === 'horizontal_boom' && !isDrone && !isAmbiguousType && typeof eq.boom_height_m === 'number' && eq.boom_height_m > 0
    ? eq.boom_height_m
    : null;
  const defaultSpeedKmh = typeof eq.last_working_speed_kmh === 'number' && eq.last_working_speed_kmh > 0
    ? eq.last_working_speed_kmh
    : null;

  let notePt: string | null = null;
  if (isDrone) {
    notePt = 'Perfil assinalado como aéreo/drone: perfis locais não incluem modelo operacional aéreo; selecione o domínio manual ou confirme parâmetros.';
  } else if (isAmbiguousType) {
    notePt = `Distribuição "${raw || 'não definida'}" não possui correspondência direta automática; selecione o modo manual para escolher a família adequada.`;
  } else if (applicationDomain !== 'horizontal_boom' && !eq.boom_height_m) {
    notePt = 'Perfis de copa/lança não armazenam altura de libertação nem aplicam redução de manga de ar de barras.';
  }

  return {
    applicationDomain,
    hasAirSleeve,
    airAssistStatus,
    defaultSpeedKmh,
    defaultHeightM,
    isDroneOrNonBoomGap: isDrone || isAmbiguousType || (applicationDomain !== 'horizontal_boom' && !defaultHeightM),
    isAmbiguousDistribution: isDrone || isAmbiguousType,
    distributionRawLabel: raw || eq.name,
    notePt
  };
}

export function matchNozzleProfileToCatalog(
  profileNozzle: ProfileNozzle | null | undefined,
  catalog: readonly Nozzle[]
): NozzleMatchResult {
  if (!profileNozzle) {
    return { status: 'none', matchedNozzle: null, candidates: [], rawLabel: '' };
  }
  if (profileNozzle.notes?.startsWith(NOZZLE_V1_PREFIX)) {
    try {
      const parsed = JSON.parse(profileNozzle.notes.slice(NOZZLE_V1_PREFIX.length)) as {
        name?: string;
        slots?: Array<{ isActive?: boolean; nozzleId?: string; brand?: string; model?: string }>;
      };
      const activeIds = Array.from(new Set((parsed.slots ?? []).filter((s) => s.isActive && s.nozzleId).map((s) => s.nozzleId as string)));
      if (activeIds.length === 1) {
        const hit = catalog.find((n) => n.id === activeIds[0]);
        if (hit) return { status: 'exact', matchedNozzle: hit, candidates: [hit], rawLabel: parsed.name || `${hit.brand} ${hit.model}` };
      }
      if (activeIds.length > 1) {
        const cands = activeIds.map((id) => catalog.find((n) => n.id === id)).filter((n): n is Nozzle => Boolean(n));
        if (cands.length > 0) return { status: 'ambiguous', matchedNozzle: null, candidates: cands, rawLabel: parsed.name || 'Perfil Misto' };
      }
    } catch { /* fallback para matching legado */ }
  }
  const rawLabel = `${profileNozzle.manufacturer} ${profileNozzle.model}`.trim();
  const targetBrand = norm(profileNozzle.manufacturer);
  const targetModel = norm(profileNozzle.model);
  if (!targetBrand || !targetModel) {
    return { status: 'none', matchedNozzle: null, candidates: [], rawLabel };
  }

  const brandMatches = catalog.filter((n) => norm(n.brand) === targetBrand);
  const candidates = brandMatches.filter((n) => {
    const m = norm(n.modelNorm || n.model);
    return m.includes(targetModel) || targetModel.includes(m);
  });

  if (candidates.length === 1) {
    return { status: 'exact', matchedNozzle: candidates[0], candidates, rawLabel };
  }
  if (candidates.length > 1) {
    return { status: 'ambiguous', matchedNozzle: null, candidates: candidates.slice(0, 50), rawLabel };
  }
  return { status: 'none', matchedNozzle: null, candidates: brandMatches.slice(0, 50), rawLabel };
}

export function extractCalibrationSafely(
  cal: ProfileCalibration | null | undefined
): SafeCalibrationExtraction | null {
  if (!cal) return null;
  const rawP = typeof cal.pressaoBar === 'number' && cal.pressaoBar > 0 ? cal.pressaoBar : cal.working_pressure_bar;
  const pressure = typeof rawP === 'number' && Number.isFinite(rawP) && rawP > 0 ? rawP : null;
  const rawS = typeof cal.velocidadeKmh === 'number' && cal.velocidadeKmh >= 0.5 ? cal.velocidadeKmh : cal.working_speed_kmh;
  const speed = typeof rawS === 'number' && Number.isFinite(rawS) && rawS >= 0.5 ? rawS : null;
  const rawAir = typeof cal.caudalArAplicadoM3H === 'number' && cal.caudalArAplicadoM3H >= 0 ? cal.caudalArAplicadoM3H : cal.air_volume_m3h;
  const airflowM3h = typeof rawAir === 'number' && Number.isFinite(rawAir) && rawAir >= 0 ? rawAir : null;
  const legacyDroplet = typeof cal.droplet_size_um === 'number' && Number.isFinite(cal.droplet_size_um) && cal.droplet_size_um > 0
    ? cal.droplet_size_um
    : null;

  return {
    workingPressureBar: pressure,
    workingSpeedKmh: speed,
    airflowM3h,
    legacyDropletSizeUm: legacyDroplet,
    legacyDropletNotePt: legacyDroplet !== null
      ? `Valor genérico registado (${legacyDroplet} µm): não é convertido em DV10, DV50 ou diâmetro representativo; introduza manualmente se tiver ensaio específico.`
      : null
  };
}
