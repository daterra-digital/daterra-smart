// src/lib/equipment-ipp-rules.ts
import type { EquipmentRecord, EquipmentType } from '../schemas/equipment.schema.ts';
import { isIso16122Compliant } from './equipment-math.ts';

export type IppStatusState =
  | 'VALID'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'YEAR_ALERT'
  | 'MISSING_DATE'
  | 'NON_PT_EXEMPT';

export interface IppEvaluationResult {
  status: IppStatusState;
  cycleYears: 3 | 5;
  dueDateIso: string | null;
  dueMonthYear: string | null;
  daysRemaining: number | null;
  estimatedDueYear: number | null;
  badgeText: string;
  badgeTone: 'emerald' | 'amber' | 'rose' | 'slate';
  summaryMessage: string;
}

const MS_PER_DAY = 86_400_000;

/**
 * Em Portugal (DL 86/2010 alterado pelo DL 78/2020):
 * - Equipamentos exclusivamente de aplicação manual (pistolas/lanças): ciclo de 5 anos.
 * - Restantes pulverizadores em uso: ciclo de 3 anos.
 */
export function getLegalIppCycleYears(type: EquipmentType): 3 | 5 {
  return type === 'MANUAL_LANCE' ? 5 : 3;
}

function parseIsoDayUtc(iso: string): Date | null {
  const clean = iso.trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo || dt.getUTCDate() !== d) {
    return null;
  }
  return dt;
}

function addYearsUtc(date: Date, years: number): Date {
  const y = date.getUTCFullYear() + years;
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const candidate = new Date(Date.UTC(y, m, d));
  if (candidate.getUTCMonth() !== m) {
    return new Date(Date.UTC(y, m + 1, 0));
  }
  return candidate;
}

function formatUtcToIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatUtcToMonthYear(date: Date): string {
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${m}/${y}`;
}

/**
 * Calcula de forma 100% determinística o estado legal da Inspeção Periódica de Pulverizadores (IPP).
 */
export function evaluateEquipmentIppStatus(
  equipment: Pick<EquipmentRecord, 'type' | 'manufactureYear' | 'iso16122Inspection'>,
  options?: { countryCode?: string; referenceDateIso?: string }
): IppEvaluationResult {
  const country = (options?.countryCode || 'PT').trim().toUpperCase();
  const cycleYears = getLegalIppCycleYears(equipment.type);
  const techOk = isIso16122Compliant(equipment);

  if (country !== 'PT') {
    return {
      status: 'NON_PT_EXEMPT',
      cycleYears,
      dueDateIso: null,
      dueMonthYear: null,
      daysRemaining: null,
      estimatedDueYear: null,
      badgeText: techOk ? 'Inspeção OK' : 'Inspeção pendente',
      badgeTone: techOk ? 'emerald' : 'amber',
      summaryMessage: techOk
        ? 'Pulverizador conforme com os critérios técnicos de verificação.'
        : 'Verifique os pontos técnicos da checklist do pulverizador.'
    };
  }

  const refDate =
    (options?.referenceDateIso ? parseIsoDayUtc(options.referenceDateIso) : null) ??
    parseIsoDayUtc(new Date().toISOString().slice(0, 10))!;
  const rawLastDate = equipment.iso16122Inspection.lastInspectionDate?.trim() || '';
  const lastDate = rawLastDate ? parseIsoDayUtc(rawLastDate) : null;

  if (lastDate) {
    const dueUtc = addYearsUtc(lastDate, cycleYears);
    const dueDateIso = formatUtcToIso(dueUtc);
    const dueMonthYear = formatUtcToMonthYear(dueUtc);
    const daysRemaining = Math.floor((dueUtc.getTime() - refDate.getTime()) / MS_PER_DAY);

    if (daysRemaining < 0) {
      const overdue = Math.abs(daysRemaining);
      return {
        status: 'EXPIRED',
        cycleYears,
        dueDateIso,
        dueMonthYear,
        daysRemaining,
        estimatedDueYear: dueUtc.getUTCFullYear(),
        badgeText: 'IPP Caducada',
        badgeTone: 'rose',
        summaryMessage: `Inspeção IPP caducada há ${overdue} ${overdue === 1 ? 'dia' : 'dias'} (limite: ${dueMonthYear}, ciclo ${cycleYears} anos).`
      };
    }

    if (daysRemaining <= 90) {
      return {
        status: 'EXPIRING_SOON',
        cycleYears,
        dueDateIso,
        dueMonthYear,
        daysRemaining,
        estimatedDueYear: dueUtc.getUTCFullYear(),
        badgeText: `IPP expira em ${daysRemaining}d`,
        badgeTone: 'amber',
        summaryMessage: `Inspeção IPP expira em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} (${dueMonthYear}, ciclo ${cycleYears} anos).`
      };
    }

    return {
      status: 'VALID',
      cycleYears,
      dueDateIso,
      dueMonthYear,
      daysRemaining,
      estimatedDueYear: dueUtc.getUTCFullYear(),
      badgeText: `IPP Válida · até ${dueMonthYear}`,
      badgeTone: 'emerald',
      summaryMessage: `Inspeção IPP válida até ${dueMonthYear} (ciclo legal de ${cycleYears} anos em Portugal).`
    };
  }

  if (equipment.manufactureYear !== undefined && Number.isFinite(equipment.manufactureYear)) {
    const estimatedDueYear = equipment.manufactureYear + cycleYears;
    const currentYear = refDate.getUTCFullYear();
    if (currentYear >= estimatedDueYear) {
      return {
        status: 'YEAR_ALERT',
        cycleYears,
        dueDateIso: null,
        dueMonthYear: null,
        daysRemaining: null,
        estimatedDueYear,
        badgeText: `Verificar IPP (Ano ${equipment.manufactureYear})`,
        badgeTone: 'amber',
        summaryMessage: `Verificar IPP · Ano ${equipment.manufactureYear} (ciclo ${cycleYears} anos). Registe a data oficial da última inspeção ou aquisição.`
      };
    }
  }

  return {
    status: 'MISSING_DATE',
    cycleYears,
    dueDateIso: null,
    dueMonthYear: null,
    daysRemaining: null,
    estimatedDueYear:
      equipment.manufactureYear !== undefined ? equipment.manufactureYear + cycleYears : null,
    badgeText: 'Data IPP pendente',
    badgeTone: 'slate',
    summaryMessage: `Indique a data da última inspeção IPP ou aquisição para calcular a validade (ciclo de ${cycleYears} anos em Portugal).`
  };
}
