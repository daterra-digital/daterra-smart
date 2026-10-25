import type { Nozzle } from '../../../nozzle-comparison/nozzleComparison.types.ts';
import { NOZZLES_DATABASE } from '../../../nozzle-comparison/nozzleComparison.data.ts';
import { interpolateDropletSpectrum } from '../../../nozzle-comparison/dropletSpectrumInterpolation.ts';

const DROPLET_MAP: Record<string, { code: string; labelPt: string; badgeBg: string; badgeText: string; badgeBorder: string; driftSensitivity: string }> = {
  VF: { code: 'VF', labelPt: 'Muito Fina (VF)', badgeBg: 'bg-red-100', badgeText: 'text-red-800', badgeBorder: 'border-red-300', driftSensitivity: 'Muito Alta' },
  F: { code: 'F', labelPt: 'Fina (F)', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', badgeBorder: 'border-amber-300', driftSensitivity: 'Alta' },
  M: { code: 'M', labelPt: 'Média (M)', badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-800', badgeBorder: 'border-yellow-300', driftSensitivity: 'Média' },
  C: { code: 'C', labelPt: 'Grossa (C)', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', badgeBorder: 'border-blue-300', driftSensitivity: 'Baixa' },
  VC: { code: 'VC', labelPt: 'Muito Grossa (VC)', badgeBg: 'bg-green-100', badgeText: 'text-green-800', badgeBorder: 'border-green-300', driftSensitivity: 'Muito Baixa' },
  XC: { code: 'XC', labelPt: 'Extremamente Grossa (XC)', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', badgeBorder: 'border-emerald-300', driftSensitivity: 'Muito Baixa' },
  UC: { code: 'UC', labelPt: 'Ultra Grossa (UC)', badgeBg: 'bg-teal-100', badgeText: 'text-teal-800', badgeBorder: 'border-teal-300', driftSensitivity: 'Muito Baixa' }
};

export interface AlternativeNozzleMatch {
  nozzle: Nozzle;
  requiredPressureBar: number;
  calculatedFlowLMin: number;
  diffPercent: number;
  minP: number;
  maxP: number;
  dropletCode?: string;
  dropletLabelPt?: string;
  dropletBadgeBg?: string;
  dropletBadgeText?: string;
  dropletBadgeBorder?: string;
  driftNote: string;
  isAirInduction: boolean;
}

/**
 * Motor de Equivalência por Bico de Referência (Substituição Direta à Mesma Pressão):
 * 1. Calcula o débito de trabalho real do Bico de Referência à pressão habitual:
 *    q_ref = q_nom * sqrt(P_hab / P_nom)
 * 2. Avalia cada modelo da base multimarca que suporte a mesma pressão P_hab:
 *    q_cand = q_nom_cand * sqrt(P_hab / P_nom_cand)
 * 3. Valida se a diferença percentual se situa dentro da tolerância estrita de +-10%:
 *    |Delta%| = |(q_cand - q_ref) / q_ref * 100| <= 10.0%
 */
export function findEquivalenceAlternatives(
  refNozzle?: Nozzle,
  habitualPressureBar = 8.0,
  brandFilter = 'Todos'
): { targetFlowLMin: number; matches: AlternativeNozzleMatch[] } {
  if (!refNozzle) {
    return { targetFlowLMin: 0, matches: [] };
  }

  const pRefNom = refNozzle.referencePressureBar || 3.0;
  const qRefNom = refNozzle.nominalFlowLMin || 0.8;
  const targetFlow = qRefNom * Math.sqrt(Math.max(0.1, habitualPressureBar) / pRefNom);

  const results: AlternativeNozzleMatch[] = [];

  for (const candidate of NOZZLES_DATABASE) {
    if (candidate.id === refNozzle.id) continue;
    const isAll = brandFilter === 'Todos' || brandFilter === 'TODAS';
    if (!isAll && candidate.brand?.toLowerCase() !== brandFilter.toLowerCase()) continue;

    const minP = candidate.pressureMinBar ?? 1.5;
    const maxP = candidate.pressureMaxBar ?? 20.0;

    // O modelo alternativo tem de estar homologado para a pressão habitual selecionada
    if (habitualPressureBar < minP || habitualPressureBar > maxP) continue;

    const pNom = candidate.referencePressureBar || 3.0;
    const qNom = candidate.nominalFlowLMin || 0.8;
    if (qNom <= 0) continue;

    // Débito produzido pelo bico alternativo à mesma pressão de trabalho
    const candidateFlow = qNom * Math.sqrt(Math.max(0.1, habitualPressureBar) / pNom);
    const diffPercent = ((candidateFlow - targetFlow) / targetFlow) * 100;

    // Critério: mesmo débito com tolerância de +-10% (norma ISO 16122 / substituição direta)
    if (Math.abs(diffPercent) > 10.0) continue;

    const roundedP = Number(habitualPressureBar.toFixed(1));
    const dv = interpolateDropletSpectrum(candidate, roundedP);
    const effClass = dv.effectiveDropletClass;
    const info = effClass && effClass in DROPLET_MAP
      ? DROPLET_MAP[effClass]
      : undefined;

    const isAirInduction = Boolean(
      candidate.nozzleType?.toLowerCase().includes('ar') ||
      candidate.model?.toLowerCase().includes('aixr') ||
      candidate.model?.toLowerCase().includes('idk') ||
      candidate.model?.toLowerCase().includes('cvi') ||
      effClass === 'XC' ||
      effClass === 'UC'
    );

    const driftNote = isAirInduction
      ? 'Muito baixa sensibilidade à deriva (Anti-deriva)'
      : (info?.driftSensitivity ? `Deriva ${info.driftSensitivity}` : 'Deriva normal');

    results.push({
      nozzle: candidate,
      requiredPressureBar: roundedP,
      calculatedFlowLMin: Number(candidateFlow.toFixed(2)),
      diffPercent: Number(diffPercent.toFixed(1)),
      minP,
      maxP,
      dropletCode: info?.code,
      dropletLabelPt: info?.labelPt,
      dropletBadgeBg: info?.badgeBg || 'bg-slate-100',
      dropletBadgeText: info?.badgeText || 'text-slate-800',
      dropletBadgeBorder: info?.badgeBorder || 'border-slate-300',
      driftNote,
      isAirInduction
    });
  }

  // Ordenar priorizando o menor desvio percentual (|diffPercent| asc) e tecnologia anti-deriva
  results.sort((a, b) => {
    const diffComp = Math.abs(a.diffPercent) - Math.abs(b.diffPercent);
    if (Math.abs(diffComp) > 0.05) return diffComp;
    if (a.isAirInduction !== b.isAirInduction) return a.isAirInduction ? -1 : 1;
    return 0;
  });

  return {
    targetFlowLMin: Number(targetFlow.toFixed(2)),
    matches: results
  };
}
