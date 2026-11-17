import { IRD_SCORING_CONSTANTS } from './irdConfig.ts';
import type { IrdInput } from './irdTypes.ts';

export interface IrdTransparencyNotes {
  readonly saturationNotesPt: readonly string[];
  readonly infoOnlyNotesPt: readonly string[];
}

export function buildIrdTransparencyNotes(params: {
  readonly irdInput?: IrdInput;
  readonly hasCatalogNozzle?: boolean;
  readonly dv10UsedUm?: number | null;
  readonly hasCertifiedReduction?: boolean;
}): IrdTransparencyNotes {
  const saturationNotesPt: string[] = [];
  const infoOnlyNotesPt: string[] = [
    'Parcela/cultura e redução de deriva certificada são registadas apenas para rastreabilidade; não descontam pontuação nem autorizam tratamento.'
  ];
  const { irdInput, hasCatalogNozzle = false, dv10UsedUm = null, hasCertifiedReduction = false } = params;

  if (irdInput) {
    const { operation, nozzle } = irdInput;
    if (typeof operation.travelSpeedKmh === 'number' && operation.travelSpeedKmh <= IRD_SCORING_CONSTANTS.speedLowerLinearKmh) {
      saturationNotesPt.push(
        `Velocidade (${operation.travelSpeedKmh} km/h) <= 4 km/h está no patamar mínimo deste fator (reduzir mais não altera o índice).`
      );
    }
    const hRef = operation.applicationDomain === 'horizontal_boom'
      ? IRD_SCORING_CONSTANTS.referenceHeightBoomM
      : IRD_SCORING_CONSTANTS.referenceHeightOrchardM;
    if (typeof operation.boomOrReleaseHeightM === 'number' && operation.boomOrReleaseHeightM <= hRef) {
      saturationNotesPt.push(
        `Altura (${operation.boomOrReleaseHeightM} m) <= referência da família (${hRef} m): já está no mínimo operacional.`
      );
    }
    const hasManualP = typeof nozzle.measurementPressureBar === 'number' && nozzle.measurementPressureBar > 0;
    if (!hasCatalogNozzle && !hasManualP) {
      saturationNotesPt.push(
        'Sem bico selecionado nem pressão de referência na medição de gotas: variar apenas a pressão mantém o espectro base (78).'
      );
    }
    if (typeof dv10UsedUm === 'number' && (dv10UsedUm <= IRD_SCORING_CONSTANTS.dv10LowerRefUm || dv10UsedUm >= IRD_SCORING_CONSTANTS.dv10UpperRefUm)) {
      saturationNotesPt.push(
        `DV10 (${dv10UsedUm} µm) está no limite da escala utilizável (${IRD_SCORING_CONSTANTS.dv10LowerRefUm}–${IRD_SCORING_CONSTANTS.dv10UpperRefUm} µm); alterações extremas mantêm o mesmo patamar.`
      );
    }
    if (operation.applicationDomain !== 'horizontal_boom') {
      saturationNotesPt.push(
        'No modelo atual, copa/arbóreas e aplicação manual usam referência 1,0 m e apenas barra horizontal com Assistência de ar "Sim" aplica fator 0,85.'
      );
    }
  }

  if (hasCertifiedReduction) {
    infoOnlyNotesPt.unshift(
      'Redução de deriva certificada declarada: guardada no histórico como evidência documental, sem alterar o score.'
    );
  }

  return { saturationNotesPt, infoOnlyNotesPt };
}
