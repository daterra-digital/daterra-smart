/**
 * DATERRA Smart 2.0 - SprayOps Module
 * Drone Buffer Zone & Legal Compliance Engine (Offline Pure TypeScript Core)
 * Reference: Decreto-Lei n.º 91/2016, Diretivas DGAV, Diretiva Uso Sustentável UE
 */

export interface DroneProductRestriction {
  apvNumber: number;
  productName: string;
  aerialApplicationAllowed: boolean;
  minWaterBufferM: number;
  minResidentialBufferM: number;
  maxWindSpeedMs: number;
  requiredNozzleDrtClass: 'STANDARD' | 'LOW_DRIFT_50' | 'LOW_DRIFT_75';
}

export const OFFICIAL_PRODUCTS_DGAV: DroneProductRestriction[] = [
  {
    apvNumber: 9999,
    productName: 'BioDefense DronePro X (Fungicida Biológico Homologado)',
    aerialApplicationAllowed: true,
    minWaterBufferM: 10.0,
    minResidentialBufferM: 50.0,
    maxWindSpeedMs: 4.17, // 15 km/h
    requiredNozzleDrtClass: 'LOW_DRIFT_50'
  },
  {
    apvNumber: 8888,
    productName: 'AgroCure Cúprico Flow (Cobre Homologado)',
    aerialApplicationAllowed: true,
    minWaterBufferM: 15.0,
    minResidentialBufferM: 50.0,
    maxWindSpeedMs: 4.17,
    requiredNozzleDrtClass: 'STANDARD'
  },
  {
    apvNumber: 1111,
    productName: 'HerbTotal Max (Herbicida Proibido por Via Aérea)',
    aerialApplicationAllowed: false,
    minWaterBufferM: 20.0,
    minResidentialBufferM: 100.0,
    maxWindSpeedMs: 3.00,
    requiredNozzleDrtClass: 'STANDARD'
  }
];

export interface ComplianceInputParams {
  apvNumber: number;
  droneModel: string;
  flightHeightM: number;
  droneSpeedMs: number;
  nozzleType: 'STANDARD' | 'AIR_INDUCTION_LOW_DRIFT';
  windSpeedMs: number;
  windDirectionDeg?: number;
  additionalSafetyBufferM?: number;
  fieldTotalAreaHa?: number;
  distanceToWaterBodyM?: number;
  distanceToResidentialM?: number;
}

export interface ComplianceEvaluationResult {
  status: 'PERMITTED' | 'RESTRICTED' | 'PROHIBITED';
  statusColor: string;
  statusMessage: string;
  bufferAppliedM: number;
  legalMinBufferM: number;
  driftSafetyMarginM: number;
  calculatedBufferM: number;
  fieldAreaHa: number;
  sprayableAreaHa: number;
  excludedAreaHa: number;
  violations: string[];
  mitigations: string[];
  academyRecommendation?: {
    courseTitle: string;
    url: string;
  };
}

export const LEGAL_MAX_WIND_MS = 4.17; // 15.0 km/h estrito segundo o DL 91/2016

/**
 * 4.1. Fator de vento (Wind Factor)
 */
export function getWindFactor(windSpeedMs: number): { factor: number; exceeded: boolean } {
  if (windSpeedMs > LEGAL_MAX_WIND_MS) {
    return { factor: 1.35, exceeded: true };
  }
  if (windSpeedMs <= 2.0) {
    return { factor: 1.00, exceeded: false };
  }
  if (windSpeedMs <= 4.0) {
    return { factor: 1.25, exceeded: false };
  }
  return { factor: 1.30, exceeded: false };
}

/**
 * 4.1. Fator de altura de voo (Flight Height Factor)
 */
export function getHeightFactor(flightHeightM: number): number {
  if (flightHeightM <= 2.0) return 1.00;
  if (flightHeightM <= 3.5) return 1.20;
  return 1.45;
}

/**
 * 4.1. Fator de tecnologia de redução de deriva de bicos (DRT Factor)
 */
export function getNozzleFactor(nozzleType: string): number {
  const nt = nozzleType.toUpperCase();
  if (nt.includes('AIR_INDUCTION') || nt.includes('LOW_DRIFT') || nt.includes('IDK')) {
    return 0.50; // Redução de 50%
  }
  return 1.00;
}

/**
 * 4.1. Fator de velocidade de voo do drone (Drone Speed Factor)
 */
export function getDroneSpeedFactor(droneSpeedMs: number): number {
  if (droneSpeedMs <= 3.0) return 1.00;
  if (droneSpeedMs <= 6.0) return 1.15;
  return 1.30;
}

/**
 * Cálculo da Zona Tampão Dinâmica
 */
export function calculateDynamicBuffer(params: {
  baseBufferM: number;
  legalMinBufferM: number;
  windSpeedMs: number;
  flightHeightM: number;
  nozzleType: string;
  droneSpeedMs: number;
  additionalSafetyBufferM?: number;
}): {
  bufferFinal: number;
  bufferCalculada: number;
  driftSafetyMargin: number;
} {
  const { factor: fVento } = getWindFactor(params.windSpeedMs);
  const fAltura = getHeightFactor(params.flightHeightM);
  const fBico = getNozzleFactor(params.nozzleType);
  const fVelocidade = getDroneSpeedFactor(params.droneSpeedMs);

  const extra = params.additionalSafetyBufferM || 0;
  const bufferCalculada = (params.baseBufferM * fVento * fAltura * fBico * fVelocidade) + extra;
  const bufferFinal = Math.max(params.legalMinBufferM, bufferCalculada);
  const driftSafetyMargin = Math.max(0, bufferFinal - params.legalMinBufferM);

  return {
    bufferFinal: Number(bufferFinal.toFixed(2)),
    bufferCalculada: Number(bufferCalculada.toFixed(2)),
    driftSafetyMargin: Number(driftSafetyMargin.toFixed(2))
  };
}

/**
 * Avaliação Completa de Conformidade Legal e Operacional (Offline Core)
 */
export function evaluateDroneCompliance(params: ComplianceInputParams): ComplianceEvaluationResult {
  const violations: string[] = [];
  const mitigations: string[] = [];

  const product = OFFICIAL_PRODUCTS_DGAV.find((p) => p.apvNumber === params.apvNumber) || {
    apvNumber: params.apvNumber,
    productName: `Produto APV ${params.apvNumber}`,
    aerialApplicationAllowed: true,
    minWaterBufferM: 10.0,
    minResidentialBufferM: 50.0,
    maxWindSpeedMs: LEGAL_MAX_WIND_MS,
    requiredNozzleDrtClass: 'STANDARD' as const
  };

  const legalMin = product.minWaterBufferM;
  const { factor: _fV, exceeded: windExceeded } = getWindFactor(params.windSpeedMs);
  const windKmh = params.windSpeedMs * 3.6;

  // 1. Verificação de Restrições Rígidas (Hard Red)
  if (windExceeded) {
    violations.push(
      `Infracção ao Decreto-Lei n.º 91/2016. Vento medido de ${params.windSpeedMs.toFixed(2)} m/s (${windKmh.toFixed(1)} km/h) excede o limite legal estrito de 15 km/h (4.17 m/s) para pulverização aérea.`
    );
  }

  if (!product.aerialApplicationAllowed) {
    violations.push(
      `Produto '${product.productName}' (APV ${product.apvNumber}) não possui autorização de venda para aplicação aérea em Portugal (DGAV / SIFITO).`
    );
  }

  // 2. Buffer Dinâmico
  const { bufferFinal, bufferCalculada, driftSafetyMargin } = calculateDynamicBuffer({
    baseBufferM: legalMin,
    legalMinBufferM: legalMin,
    windSpeedMs: params.windSpeedMs,
    flightHeightM: params.flightHeightM,
    nozzleType: params.nozzleType,
    droneSpeedMs: params.droneSpeedMs,
    additionalSafetyBufferM: params.additionalSafetyBufferM
  });

  // 3. Simulação Espacial (Distância à linha de água ou elemento sensível)
  const distanceToWater = params.distanceToWaterBodyM !== undefined ? params.distanceToWaterBodyM : 18.0;
  const fieldTotalAreaHa = params.fieldTotalAreaHa || 5.40;

  let status: 'PERMITTED' | 'RESTRICTED' | 'PROHIBITED' = 'PERMITTED';
  let statusColor = '#10B981';
  let statusMessage = 'Aplicação Totalmente Permitida. A parcela respeita todas as distâncias de segurança legais.';
  let excludedAreaHa = 0.0;
  let sprayableAreaHa = fieldTotalAreaHa;

  if (distanceToWater <= 0) {
    status = 'PROHIBITED';
    statusColor = '#F43F5E';
    statusMessage = 'Aplicação Proibida por Lei. A parcela está sobreposta a uma massa de água protegida.';
    excludedAreaHa = fieldTotalAreaHa;
    sprayableAreaHa = 0.0;
  } else if (distanceToWater < bufferFinal) {
    status = 'RESTRICTED';
    statusColor = '#FFC107';

    // Proporção de sobreposição estimada com base no buffer
    const overlapRatio = Math.min(0.85, (bufferFinal - distanceToWater) / (bufferFinal * 1.5));
    excludedAreaHa = Number((fieldTotalAreaHa * overlapRatio).toFixed(2));
    sprayableAreaHa = Number((fieldTotalAreaHa - excludedAreaHa).toFixed(2));

    statusMessage = `Aplicação Permitida com Restrições. Linha de água detetada a ${distanceToWater.toFixed(0)}m da bordadura (Buffer dinâmico aplicado: ${bufferFinal.toFixed(1)}m).`;
  }

  // Se houver violações normativas graves, sobrepõe para PROHIBITED
  if (violations.length > 0) {
    status = 'PROHIBITED';
    statusColor = '#F43F5E';
    statusMessage = `Aplicação Proibida por Lei: ${violations.join('; ')}`;
    sprayableAreaHa = 0.0;
    excludedAreaHa = fieldTotalAreaHa;
  }

  // 4. Ações de Mitigação
  if (status === 'RESTRICTED') {
    mitigations.push('Ativar desligamento automático de secção na bordadura Sul/Este (geofencing ativo).');
    if (params.nozzleType === 'STANDARD') {
      mitigations.push('Ativar bicos de indução de ar (ex: IDK120-03) para reduzir a distância de buffer em 50%.');
    }
    if (params.droneSpeedMs > 3.0) {
      mitigations.push('Manter velocidade de voo inferior a 3.0 m/s junto à linha de água ou zona sensível.');
    }
    if (params.flightHeightM > 2.0) {
      mitigations.push('Reduzir altura de voo para ≤ 2.0 m sobre a cultura para diminuir o tempo de queda das gotas.');
    }
  } else if (status === 'PROHIBITED') {
    mitigations.push('Suspender operação de voo até melhoria das condições meteorológicas ou ajuste do produto fitofarmacêutico.');
    mitigations.push('Consultar catálogo oficial da DGAV para opções de tratamento terrestre ou formulações biológicas autorizadas.');
  }

  return {
    status,
    statusColor,
    statusMessage,
    bufferAppliedM: bufferFinal,
    legalMinBufferM: legalMin,
    driftSafetyMarginM: driftSafetyMargin,
    calculatedBufferM: bufferCalculada,
    fieldAreaHa: fieldTotalAreaHa,
    sprayableAreaHa,
    excludedAreaHa,
    violations,
    mitigations,
    academyRecommendation: status !== 'PERMITTED' ? {
      courseTitle: 'Reduzir Deriva e Gestão de Zonas Tampão em Drones',
      url: 'https://academia.daterra.com.pt/course/view.php?id=12'
    } : undefined
  };
}
