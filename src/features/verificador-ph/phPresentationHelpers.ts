import type { ResistanceRisk } from './types';

export interface PhBlockTheme {
  container: string;
  label: string;
  value: string;
  badge: string;
  tagText: string;
}

export const getPhBlockTheme = (idealPh: string): PhBlockTheme => {
  const normalized = idealPh.toLowerCase();
  if (normalized.includes('ph 3') || normalized.includes('ph 3.5')) {
    return {
      container: 'bg-rose-50/90 border-rose-200 text-rose-950',
      label: 'text-rose-700',
      value: 'text-rose-950',
      badge: 'bg-rose-500/15 text-rose-900 border-rose-300',
      tagText: '🔴 Ultra-Ácido (pH 3 a 5)'
    };
  }
  if (normalized.includes('ph 4')) {
    return {
      container: 'bg-amber-50/90 border-amber-200 text-amber-950',
      label: 'text-amber-800',
      value: 'text-amber-950',
      badge: 'bg-amber-500/15 text-amber-900 border-amber-300',
      tagText: '🟡 Ácido Obrigatório (pH 4 a 6)'
    };
  }
  if (normalized.includes('ph 5 a ph 7') || normalized.includes('ph 5.5')) {
    return {
      container: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
      label: 'text-emerald-700',
      value: 'text-[#114037]',
      badge: 'bg-emerald-600/15 text-emerald-900 border-emerald-300',
      tagText: '🟢 Zona Ideal (pH 5 a 7)'
    };
  }
  return {
    container: 'bg-sky-50/90 border-sky-200 text-sky-950',
    label: 'text-sky-700',
    value: 'text-sky-950',
    badge: 'bg-sky-600/15 text-sky-900 border-sky-300',
    tagText: '🔵 Neutro a Alcalino (pH 6 a 8)'
  };
};

export interface RiskPresentation {
  icon: string;
  ruleHint: string;
  classes: string;
}

export const getRiskPresentation = (risk: ResistanceRisk): RiskPresentation => {
  switch (risk) {
    case 'Alto':
      return {
        icon: '🔴',
        ruleHint: 'Máx. 1–2 aplicações consecutivas',
        classes: 'bg-rose-50 text-rose-800 border-rose-200'
      };
    case 'Médio':
      return {
        icon: '🟡',
        ruleHint: 'Alternar grupos químicos',
        classes: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    case 'Baixo':
      return {
        icon: '🟢',
        ruleHint: 'Baixo risco / Multissítio',
        classes: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    default:
      return {
        icon: '⚪',
        ruleHint: 'Sem resistência aplicável',
        classes: 'bg-slate-100 text-slate-600 border-slate-200'
      };
  }
};
