import type { LabMeasurementEvidence } from './nozzleComparison.types';

/**
 * Repositório Canónico de Medições e Ensaios Laboratoriais
 * Preparado para acolher ensaios de túnel de vento, difração laser (Malvern/Sympatec) e provetas padronizadas.
 */
export const LAB_MEASUREMENTS_DATABASE: LabMeasurementEvidence[] = [
  // Base estruturada aberta para expansão futura com ensaios acreditados (ex: IPB, ISA/ULisboa, UTAD, JKI, INRAE, Silsoe)
];

/**
 * Consulta a existência de medição laboratorial acreditada para uma dada variante e pressão.
 */
export function getLabMeasurementEvidence(
  nozzleId?: string,
  pressureBar?: number
): LabMeasurementEvidence | undefined {
  if (!nozzleId) return undefined;
  
  return LAB_MEASUREMENTS_DATABASE.find(
    item => item.fullReference.toLowerCase() === nozzleId.toLowerCase() &&
      (!pressureBar || Math.abs(item.testPressureBar - pressureBar) < 0.2)
  );
}

/**
 * Retorna uma representação amigável e fidedigna da evidência laboratorial.
 */
export function formatLabEvidenceSummary(evidence?: LabMeasurementEvidence): {
  statusText: string;
  entityName: string;
  hasEvidence: boolean;
  methodDescription: string;
} {
  if (!evidence || !evidence.publicationAuthorization) {
    return {
      statusText: 'Medição laboratorial: Não disponível',
      entityName: 'Não disponível',
      hasEvidence: false,
      methodDescription: 'Nenhum ensaio laboratorial independente catalogado para esta referência e patamar de pressão.'
    };
  }

  const entityDisplay = evidence.realEntityName && evidence.realEntityName.trim() !== ''
    ? evidence.realEntityName
    : 'Entidade: Não disponível';

  return {
    statusText: `Espectro de gotas obtido por medição laboratorial (${evidence.method})`,
    entityName: entityDisplay,
    hasEvidence: true,
    methodDescription: `Ensaio realizado em ${evidence.testDate} com ${evidence.testLiquid} a ${evidence.testPressureBar} bar. Método: ${evidence.method}.`
  };
}
