// src/lib/equipment-math.ts
import {
  THREE_D_EQUIPMENT_TYPES,
  type EquipmentRecord,
  type EquipmentType
} from '../schemas/equipment.schema.ts';

export type VentilationAlertStatus = 'UNDER' | 'OPTIMAL' | 'OVER';

export interface ActiveCultureStatsForEquipment {
  cultureName?: string;
  trvM3ha?: number;
  lwaM2ha?: number;
  rowDistanceM?: number;
}

export const EQUIPMENT_TYPE_LABELS_PT: Readonly<Record<EquipmentType, string>> = {
  '2D_HORIZONTAL': 'Barra Horizontal 2D',
  '3D_AXIAL': 'Ventilador Axial 3D',
  '3D_TANGENTIAL': 'Ventilador Tangencial 3D',
  '3D_CROSSFLOW': 'Ventilador Fluxo Cruzado 3D',
  '3D_TUNNEL': 'Túnel 3D',
  '3D_PNEUMATIC': 'Pneumático 3D',
  '3D_CANNON': 'Canhão 3D',
  UAV_DRONE: 'Drone UAV',
  MANUAL_LANCE: 'Manual'
};

export function getEquipmentTypeLabelPt(type: EquipmentType): string {
  return EQUIPMENT_TYPE_LABELS_PT[type] ?? 'Equipamento';
}

const VENTILATION_ALERT_LABELS_PT: Readonly<Record<VentilationAlertStatus, string>> = {
  UNDER: 'Subventilação (< -20%)',
  OPTIMAL: 'Ventilação Ótima (±20%)',
  OVER: 'Sobreventilação (> +20%)'
};

/**
 * Calcula a largura efetiva da barra / faixa (m) a partir do número de bicos
 * e do espaçamento entre bicos (cm): L = (nozzleCount * nozzleSpacingCm) / 100.
 */
export function calculateEffectiveBoomWidthM(
  nozzleCount: number,
  nozzleSpacingCm: number
): number {
  if (!Number.isFinite(nozzleCount) || !Number.isFinite(nozzleSpacingCm)) {
    return 0;
  }
  if (nozzleCount <= 0 || nozzleSpacingCm <= 0) {
    return 0;
  }
  return Number(((nozzleCount * nozzleSpacingCm) / 100).toFixed(2));
}

/**
 * Calcula o caudal de ar ótimo (m³/h) em função do Volume da Copa (TRV, m³/ha)
 * e da velocidade de avanço (km/h), segundo a relação agronómica (exclusiva 3D):
 * Q_ar,otimo = 0.10 * TRV * speedKmh
 *
 * Devolve rigorosamente 0 quando trvM3ha <= 0, speedKmh <= 0 ou valores não finitos.
 */
export function calculateOptimalAirflow(trvM3ha: number, speedKmh: number): number {
  if (!Number.isFinite(trvM3ha) || !Number.isFinite(speedKmh)) {
    return 0;
  }
  if (trvM3ha <= 0 || speedKmh <= 0) {
    return 0;
  }
  const rawAirflow = 0.1 * trvM3ha * speedKmh;
  return Number(rawAirflow.toFixed(4));
}

/**
 * Avalia o estado de ventilação do equipamento face ao caudal de ar ótimo,
 * aplicando uma margem de tolerância estrita de ±20% ([0.80, 1.20] * optimalAirflow).
 *
 * Devolve 'OPTIMAL' quando optimalAirflow <= 0.
 */
export function getVentilationAlert(
  actualAirflow: number,
  optimalAirflow: number
): VentilationAlertStatus {
  if (!Number.isFinite(optimalAirflow) || optimalAirflow <= 0) {
    return 'OPTIMAL';
  }
  const safeActual = Number.isFinite(actualAirflow) && actualAirflow > 0 ? actualAirflow : 0;
  const lowerBound = optimalAirflow * 0.8;
  const upperBound = optimalAirflow * 1.2;

  if (safeActual < lowerBound - 1e-9) {
    return 'UNDER';
  }
  if (safeActual > upperBound + 1e-9) {
    return 'OVER';
  }
  return 'OPTIMAL';
}

/**
 * Verifica se todos os critérios obrigatórios da pré-inspeção ISO 16122 estão conformes.
 */
export function isIso16122Compliant(equipment: Pick<EquipmentRecord, 'iso16122Inspection'>): boolean {
  const { pressureGaugeOk, antiDripValveOk, nozzleWearWithin10Pct } = equipment.iso16122Inspection;
  return Boolean(pressureGaugeOk && antiDripValveOk && nozzleWearWithin10Pct);
}

/**
 * Formata a janela de contexto determinística `@equipamento` para enriquecimento de prompts IA.
 * Sistemas 2D e UAV nunca referenciam TRV/LWA; sistemas 3D cruzam Q_ar,otimo com o TRV ativo.
 */
export function buildEquipmentAiContextSummary(
  equipment: EquipmentRecord,
  activeCultureStats?: ActiveCultureStatsForEquipment
): string {
  const typeLabel = EQUIPMENT_TYPE_LABELS_PT[equipment.type] ?? equipment.type;
  const is3D = THREE_D_EQUIPMENT_TYPES.has(equipment.type);
  const isoCompliant = isIso16122Compliant(equipment);
  const inspectionDatePart = equipment.iso16122Inspection.lastInspectionDate
    ? ` (${equipment.iso16122Inspection.lastInspectionDate})`
    : '';
  const isoStatusText = isoCompliant
    ? `Conforme ISO 16122${inspectionDatePart}`
    : `Não conforme ISO 16122${inspectionDatePart}`;

  const segments: string[] = [
    `[@equipamento: "${equipment.name}"]`,
    `Tipologia: ${typeLabel} (${equipment.type})`,
    `Capacidade do Depósito: ${equipment.tankCapacityL} L`
  ];

  if (equipment.type === 'MANUAL_LANCE') {
    const lances = equipment.lanceCount ?? equipment.workingWidthM;
    const hose = equipment.hoseLengthM ? ` | Mangueira: ${equipment.hoseLengthM} m` : '';
    const reel = equipment.hasHoseReel !== undefined ? ` | Enrolador: ${equipment.hasHoseReel ? 'Sim' : 'Não'}` : '';
    segments.push(`Pistolas / Lanças: ${lances} un.${hose}${reel}`);
    segments.push(`Pressão Base: ${equipment.defaultPressureBar} bar | Ciclo IPP Portugal: 5 anos`);
  } else {
    segments.push(
      `Largura de Trabalho / Bicos: ${equipment.workingWidthM}`,
      `Espaçamento entre Bicos: ${equipment.nozzleSpacingCm} cm`,
      `Pressão Base: ${equipment.defaultPressureBar} bar`,
      `Velocidade Base: ${equipment.defaultSpeedKmh} km/h`
    );
  }

  if (equipment.type === '2D_HORIZONTAL') {
    const boomWidthM = calculateEffectiveBoomWidthM(
      equipment.workingWidthM,
      equipment.nozzleSpacingCm
    );
    segments.push(`Largura Efetiva da Barra: ${boomWidthM} m`);
    const hasAirSleeve =
      equipment.airAssisted ?? (equipment.defaultAirflowM3h !== undefined && equipment.defaultAirflowM3h > 0);
    if (hasAirSleeve) {
      const flowPart =
        equipment.defaultAirflowM3h !== undefined ? ` (${equipment.defaultAirflowM3h} m³/h)` : '';
      const anglePart = equipment.airCurtainAngle ? `, Cortina: ${equipment.airCurtainAngle}` : '';
      segments.push(`Regime 2D: Manga de Ar${flowPart}${anglePart}`);
    } else {
      segments.push('Regime 2D: Barra Hidráulica Convencional (sem manga de ar)');
    }
  } else if (is3D) {
    if (equipment.airAssisted === false) {
      segments.push(
        equipment.type === '3D_AXIAL'
          ? 'Barras Verticais sem Ventilação (Assistência de ar desativada)'
          : 'Ventilador 3D: Desligado'
      );
    } else {
      const actualAirflow = equipment.defaultAirflowM3h ?? 0;
      const trv = activeCultureStats?.trvM3ha ?? 0;
      const optimalAirflow = calculateOptimalAirflow(trv, equipment.defaultSpeedKmh);
      if (optimalAirflow > 0) {
        const alertState = getVentilationAlert(actualAirflow, optimalAirflow);
        segments.push(
          `Caudal de Ar: ${actualAirflow} m³/h vs. Ótimo: ${optimalAirflow} m³/h [${alertState} - ${VENTILATION_ALERT_LABELS_PT[alertState]}]`
        );
      } else {
        segments.push(`Caudal de Ar Atual: ${actualAirflow} m³/h`);
      }
    }
  } else if (equipment.type === 'UAV_DRONE') {
    const swathM = calculateEffectiveBoomWidthM(equipment.workingWidthM, equipment.nozzleSpacingCm);
    segments.push(`Faixa Efetiva UAV: ${swathM} m (Vento máx. legal <= 15 km/h)`);
  }

  segments.push(`Estado ISO 16122: ${isoStatusText}`);
  return segments.join(' | ');
}
