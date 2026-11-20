// src/features/weather/utils/irdUavFactorHelpers.ts
import type { UavEquipmentDetails } from '../../../schemas/equipmentUav.schema.ts';
import { formatDecimalPt } from './windDirection.ts';

export interface UavIrdInput {
  flightHeightM: number;
  flightSpeedKmh: number;
  cdaDiscRpm: number | null;
  pressureBar: number;
  adjuvantAntiEvap: boolean;
  windSpeedKmh: number;
  slopePct: number | null;
  uavDetails?: UavEquipmentDetails;
}

export interface UavIrdResult {
  uavOpRiskScore: number;
  speedMs: number;
  isLegalWindBlock: boolean;
  alertsPt: string[];
}

export function computeUavIrdFactor(input: UavIrdInput): UavIrdResult {
  const details = input.uavDetails;
  const speedMs = Math.round((input.flightSpeedKmh / 3.6) * 100) / 100;
  const alertsPt: string[] = [];
  let factor = 1.0;

  // 1. Bloqueio legal de vento UAV (> 15,0 km/h = 4,17 m/s, DL 91/2016)
  const isLegalWindBlock = input.windSpeedKmh > 15.0;
  if (isLegalWindBlock) {
    alertsPt.push(`Bloqueio legal UAV (DL 91/2016): vento ${formatDecimalPt(input.windSpeedKmh)} km/h > 15,0 km/h (4,17 m/s).`);
  }

  // 2. Altura de voo acima da copa (ideal 1,5-2,5 m; penalização exponencial > 3,0 m)
  if (input.flightHeightM > 3.0) {
    const expPenalty = Math.min(2.2, 1 + 0.35 * Math.pow(input.flightHeightM - 3.0, 1.5));
    factor *= expPenalty;
    alertsPt.push(`Altura de voo ${formatDecimalPt(input.flightHeightM)} m > 3,0 m: perda de downwash e deriva exponencial.`);
  } else if (input.flightHeightM < 1.5) {
    factor *= 1.05;
  }

  // 3. Velocidade de voo (distorção de esteira > 6,0-6,5 m/s)
  if (speedMs > 6.5) {
    factor *= 1.45;
    alertsPt.push(`Velocidade ${formatDecimalPt(speedMs)} m/s (> 6,5 m/s): forte distorção da esteira de rotores.`);
  } else if (speedMs > 6.0) {
    factor *= 1.25;
    alertsPt.push(`Velocidade ${formatDecimalPt(speedMs)} m/s (> 6,0 m/s): atenção à distorção de esteira.`);
  }

  // 4. Sistema de atomização (Centrífugo CDA vs Hidráulico)
  const isCda = (details?.atomizationSystem ?? 'CENTRIFUGAL_CDA') === 'CENTRIFUGAL_CDA';
  if (isCda) {
    const rpm = input.cdaDiscRpm ?? details?.cdaDiscRpm ?? 10000;
    if (rpm > 12000) {
      factor *= 1.30;
      alertsPt.push(`Discos CDA a ${rpm.toLocaleString('pt-PT')} RPM (> 12.000 RPM): gotas < 100 µm.`);
    } else if (rpm <= 9000) {
      factor *= 0.95;
    }
  } else {
    if (input.pressureBar > 4.0) {
      factor *= 1.25;
      alertsPt.push(`Pressão hidráulica UAV ${formatDecimalPt(input.pressureBar)} bar elevada: atomização fina.`);
    } else if (input.pressureBar < 1.5) {
      factor *= 1.10;
    }
  }

  // 5. Radar de seguimento de terreno OFF em declive > 5%
  const slope = input.slopePct ?? 0;
  if (details?.terrainFollowingRadar === false && slope > 5) {
    factor *= 1.30;
    alertsPt.push(`Radar altimétrico OFF em declive ${formatDecimalPt(slope)}% (> 5%): risco de altura irregular (× 1,30).`);
  }

  // 6. Classe de capacidade / peso e posicionamento dos bicos
  if (details?.weightClass === 'LIGHT_LT_15L') {
    factor *= 1.15;
    alertsPt.push('Classe ligeira (< 15 L): downwash reduzido (× 1,15) e maior variação por esvaziamento.');
  } else {
    factor *= 0.90;
  }

  if (details?.nozzlePlacement === 'WINGTIP') {
    factor *= 1.35;
    alertsPt.push('Bicos Wingtip (extremidades): vórtices de ponta de hélice (× 1,35).');
  }

  // 7. Adjuvante antievaporante
  if (input.adjuvantAntiEvap) factor *= 0.80;

  const baseScore = isLegalWindBlock ? 85 : 32;
  const uavOpRiskScore = Math.round(Math.min(100, Math.max(8, baseScore * factor)));
  return { uavOpRiskScore, speedMs, isLegalWindBlock, alertsPt };
}
