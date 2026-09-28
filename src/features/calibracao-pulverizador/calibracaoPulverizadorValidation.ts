import { selectEppoKRow, getInferredConductionForCulture } from './data/eppoKDecisionMatrix.ts';
import type {
  CalibracaoPulverizadorRawInputs
} from './calibracaoPulverizadorTypes.ts';

export interface ValidationOutput {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface AdoptedSprayVolumeVisibilityParams {
  method?: string;
  cultureId?: string;
  useManualAdoptedVolumeInLwa?: boolean;
  doseType?: string;
  doseUnit?: string;
}

export interface AdoptedSprayVolumeRequiredParams extends AdoptedSprayVolumeVisibilityParams {
  finalTankVolumeL?: number | string;
  doseValue?: number | string;
}

/**
 * Determina se o campo "Volume de calda adotado" deve ser visível na interface.
 * Regra:
 * - Em TRV: nunca é visível.
 * - Em LWA para Vinha (com modelo LWA-V DATERRA automático): nunca é visível.
 * - Em LWA para outras culturas: visível apenas quando o utilizador ativa a opção manual
 *   "Usar volume de calda adotado" E o tipo de dose for dose_ha ou dose_lwa.
 */
export function isAdoptedSprayVolumeVisible(params: AdoptedSprayVolumeVisibilityParams): boolean {
  if (params.method !== 'lwa') return false;

  const isVinha = !params.cultureId || params.cultureId === 'vinha';
  if (isVinha) {
    return false;
  }

  if (!params.useManualAdoptedVolumeInLwa) {
    return false;
  }

  let dt = params.doseType;
  if (!dt && params.doseUnit) {
    if (params.doseUnit.includes('/100 L')) dt = 'dose_100l';
    else if (params.doseUnit.includes('/hL') || params.doseUnit === '%') dt = 'concentration';
    else if (params.doseUnit.includes('LWA')) dt = 'dose_lwa';
    else dt = 'dose_ha';
  }

  if (!dt) dt = 'dose_ha';

  return dt === 'dose_ha' || dt === 'dose_lwa';
}

/**
 * Determina se o campo "Volume de calda adotado" é estritamente obrigatório para cálculo de produto por depósito.
 */
export function isAdoptedSprayVolumeRequired(params: AdoptedSprayVolumeRequiredParams): boolean {
  if (!isAdoptedSprayVolumeVisible(params)) return false;

  const hasTank = params.finalTankVolumeL !== undefined && params.finalTankVolumeL !== '';
  const hasDose = params.doseValue !== undefined && params.doseValue !== '';

  return hasTank && hasDose;
}

/**
 * Executa todas as validações de dados para a Calibração de Pulverizador.
 */
export function validateCalibracaoPulverizador(
  inputs: CalibracaoPulverizadorRawInputs
): ValidationOutput {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  const isLwa = inputs.method === 'lwa';
  const isVinha = !inputs.cultureId || inputs.cultureId === 'vinha';

  // -------------------------------------------------------------------------
  // 1. VALIDAÇÃO DE ALTURA (h)
  // -------------------------------------------------------------------------
  const hRaw = inputs.treatedHeightM;
  if (hRaw === undefined || hRaw === '' || hRaw === null) {
    errors['treatedHeightM'] = 'calibracaoPulverizador.errors.heightRequired';
  } else {
    const h = Number(hRaw);
    if (!Number.isFinite(h) || h <= 0) {
      errors['treatedHeightM'] = 'calibracaoPulverizador.errors.heightGreaterThanZero';
    } else if (h < 0.1) {
      warnings['treatedHeightM'] = 'calibracaoPulverizador.warnings.heightLow';
    } else if (h > 3.0) {
      warnings['treatedHeightM'] = 'calibracaoPulverizador.warnings.heightHigh';
    }
  }

  // -------------------------------------------------------------------------
  // 2. VALIDAÇÃO DE ENTRELINHA (r)
  // -------------------------------------------------------------------------
  const rRaw = inputs.rowSpacingM;
  if (rRaw === undefined || rRaw === '' || rRaw === null) {
    errors['rowSpacingM'] = 'calibracaoPulverizador.errors.rowSpacingRequired';
  } else {
    const r = Number(rRaw);
    if (!Number.isFinite(r) || r <= 0) {
      errors['rowSpacingM'] = 'calibracaoPulverizador.errors.rowSpacingGreaterThanZero';
    } else if (r < 1.0) {
      warnings['rowSpacingM'] = 'calibracaoPulverizador.warnings.rowSpacingNarrow';
    } else if (r > 4.0) {
      warnings['rowSpacingM'] = 'calibracaoPulverizador.warnings.rowSpacingWide';
    }
  }

  // -------------------------------------------------------------------------
  // 3. VALIDAÇÃO DE FACES TRATADAS (LWA)
  // -------------------------------------------------------------------------
  if (isLwa) {
    if (isVinha) {
      // Vinha LWA-V fixa faces tratadas = 2
      if (inputs.treatedSides !== undefined && inputs.treatedSides !== 2) {
        errors['treatedSides'] = 'calibracaoPulverizador.errors.lwaVTreatedSidesMustBe2';
      }
    } else {
      const faces = inputs.treatedSides ?? 2;
      if (faces !== 1 && faces !== 2) {
        errors['treatedSides'] = 'calibracaoPulverizador.errors.treatedSidesInvalid';
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. VALIDAÇÃO DE CONTEXTO AGRONÓMICO / MODELOS
  // -------------------------------------------------------------------------
  if (!isLwa) {
    const wRaw = inputs.canopyWidthM;
    if (wRaw === undefined || wRaw === '' || wRaw === null) {
      errors['canopyWidthM'] = 'calibracaoPulverizador.errors.widthRequired';
    } else {
      const w = Number(wRaw);
      const r = Number(rRaw);
      if (!Number.isFinite(w) || w <= 0) {
        errors['canopyWidthM'] = 'calibracaoPulverizador.errors.widthGreaterThanZero';
      } else if (w < 0.3) {
        errors['canopyWidthM'] = 'calibracaoPulverizador.errors.widthMin';
      } else if (w > 6.0) {
        errors['canopyWidthM'] = 'calibracaoPulverizador.errors.widthMax';
      } else if (w < 0.5) {
        warnings['canopyWidthM'] = 'calibracaoPulverizador.warnings.canopyWidthLow';
      } else if (w > 4.0) {
        warnings['canopyWidthM'] = 'calibracaoPulverizador.warnings.canopyWidthHigh';
      } else if (Number.isFinite(r) && w >= r * 0.8) {
        warnings['canopyWidthM'] = 'calibracaoPulverizador.warnings.widthRowSpacingOverlap';
      }
    }

    if (!inputs.cultureId) {
      errors['cultureId'] = 'calibracaoPulverizador.errors.cultureRequired';
    }
    if (!inputs.phenologyId) {
      errors['phenologyId'] = 'calibracaoPulverizador.errors.phenologyRequired';
    }
    if (!inputs.canopyDensity) {
      errors['canopyDensity'] = 'calibracaoPulverizador.errors.densityRequired';
    }

    const effectiveConductionId =
      inputs.conductionId || (inputs.cultureId ? getInferredConductionForCulture(inputs.cultureId)?.id : undefined);

    if (inputs.cultureId && inputs.phenologyId && inputs.canopyDensity) {
      const trvDensity: 'open' | 'moderate' | 'dense' =
        inputs.canopyDensity === 'aberta' || inputs.canopyDensity === 'open'
          ? 'open'
          : inputs.canopyDensity === 'densa' || inputs.canopyDensity === 'dense'
          ? 'dense'
          : 'moderate';

      const match = selectEppoKRow(
        inputs.cultureId,
        effectiveConductionId,
        inputs.phenologyId,
        trvDensity
      );
      if (!match) {
        errors['canopyDensity'] = 'calibracaoPulverizador.errors.noMatrixMatch';
      }
    }
  } else {
    // Percurso LWA
    if (isVinha) {
      // Validação de campos obrigatórios LWA-V
      if (!inputs.canopyThickness) {
        // Predefinição 'estreita', mas valida integridade
      }
      if (!inputs.canopyDensity) {
        // Predefinição 'moderada'
      }
      if (!inputs.phenologyStage) {
        // Predefinição 'int_5'
      }
      // Aviso para Estádio INT_1 (Repouso vegetativo)
      if (inputs.phenologyStage === 'int_1') {
        warnings['restingStage'] = 'calibracaoPulverizador.restingNoFoliageTarget';
      }
    } else {
      // Cultura sem LWA-V automático
      if (!inputs.useManualAdoptedVolumeInLwa) {
        warnings['lwaAutomaticVolumeUnavailable'] = 'calibracaoPulverizador.lwaAutomaticVolumeUnavailable';
      }
    }
  }

  // -------------------------------------------------------------------------
  // 5. VALIDAÇÃO DO VOLUME FINAL DO DEPÓSITO
  // -------------------------------------------------------------------------
  if (inputs.finalTankVolumeL !== undefined && inputs.finalTankVolumeL !== '') {
    const vTank = Number(inputs.finalTankVolumeL);
    if (!Number.isFinite(vTank) || vTank <= 0) {
      errors['finalTankVolumeL'] = 'calibracaoPulverizador.errors.tankVolumeGreaterThanZero';
    } else if (vTank < 10) {
      errors['finalTankVolumeL'] = 'calibracaoPulverizador.errors.tankVolumeMin';
    } else if (vTank > 10000) {
      errors['finalTankVolumeL'] = 'calibracaoPulverizador.errors.tankVolumeMax';
    } else if (vTank < 50) {
      warnings['finalTankVolumeL'] = 'calibracaoPulverizador.warnings.tankVolumeLow';
    } else if (vTank > 3000) {
      warnings['finalTankVolumeL'] = 'calibracaoPulverizador.warnings.tankVolumeHigh';
    }
  }

  // -------------------------------------------------------------------------
  // 6. VALIDAÇÃO DO VOLUME DE CALDA ADOTADO (LWA MANUAL)
  // -------------------------------------------------------------------------
  if (isLwa && !isVinha) {
    const isAdoptedRequired = isAdoptedSprayVolumeRequired({
      method: inputs.method,
      cultureId: inputs.cultureId,
      useManualAdoptedVolumeInLwa: inputs.useManualAdoptedVolumeInLwa,
      doseType: inputs.doseType,
      doseUnit: inputs.doseUnit,
      finalTankVolumeL: inputs.finalTankVolumeL,
      doseValue: inputs.doseValue
    });

    const qAdoptedRaw = inputs.adoptedSprayVolumeLHa;
    if (qAdoptedRaw === undefined || qAdoptedRaw === '' || qAdoptedRaw === null) {
      if (isAdoptedRequired) {
        errors['adoptedSprayVolumeLHa'] = 'calibracaoPulverizador.errors.adoptedVolumeRequired';
      }
    } else if (inputs.useManualAdoptedVolumeInLwa) {
      const qAdopted = Number(qAdoptedRaw);
      if (!Number.isFinite(qAdopted) || qAdopted <= 0) {
        errors['adoptedSprayVolumeLHa'] = 'calibracaoPulverizador.errors.adoptedVolumeGreaterThanZero';
      } else if (qAdopted < 15) {
        errors['adoptedSprayVolumeLHa'] = 'calibracaoPulverizador.errors.adoptedVolumeMin';
      } else if (qAdopted > 3000) {
        errors['adoptedSprayVolumeLHa'] = 'calibracaoPulverizador.errors.adoptedVolumeMax';
      }
    }
  }

  // -------------------------------------------------------------------------
  // 7. VALIDAÇÃO DA DOSE DO PRODUTO
  // -------------------------------------------------------------------------
  if (inputs.doseValue !== undefined && inputs.doseValue !== '') {
    const dose = Number(inputs.doseValue);
    if (!Number.isFinite(dose) || dose <= 0) {
      errors['doseValue'] = 'calibracaoPulverizador.errors.doseGreaterThanZero';
    } else {
      if (dose < 0.05) {
        warnings['doseValue'] = 'calibracaoPulverizador.warnings.doseLow';
      } else if (inputs.doseType === 'dose_100l' || inputs.doseType === 'concentration') {
        if (dose > 500) {
          warnings['doseValue'] = 'calibracaoPulverizador.warnings.doseHigh';
        }
      } else {
        if (dose > 10) {
          warnings['doseValue'] = 'calibracaoPulverizador.warnings.doseHigh';
        }
      }
    }
    if (!inputs.doseType) {
      errors['doseType'] = 'calibracaoPulverizador.errors.doseTypeRequired';
    }
    if (!inputs.doseUnit) {
      errors['doseUnit'] = 'calibracaoPulverizador.errors.doseUnitRequired';
    }
  }

  // -------------------------------------------------------------------------
  // 8. VALIDAÇÕES DA FASE B — AJUSTE OPERACIONAL
  // -------------------------------------------------------------------------
  // Velocidade de avanço (S)
  if (inputs.travelSpeedKmH !== undefined && inputs.travelSpeedKmH !== '' && inputs.travelSpeedKmH !== null) {
    const s = Number(inputs.travelSpeedKmH);
    if (!Number.isFinite(s) || s <= 0) {
      errors['travelSpeedKmH'] = 'calibracaoPulverizador.errors.speedGreaterThanZero';
    } else if (s < 2.0) {
      warnings['travelSpeedKmH'] = 'calibracaoPulverizador.warnings.speedLow';
    } else if (s > 10.0) {
      warnings['travelSpeedKmH'] = 'calibracaoPulverizador.warnings.speedHigh';
    }
  }

  // Largura de trabalho (W)
  if (inputs.workingWidthM !== undefined && inputs.workingWidthM !== '' && inputs.workingWidthM !== null) {
    const w = Number(inputs.workingWidthM);
    if (!Number.isFinite(w) || w <= 0) {
      errors['workingWidthM'] = 'calibracaoPulverizador.errors.workingWidthGreaterThanZero';
    } else {
      const r = Number(rRaw);
      if (Number.isFinite(r) && r > 0) {
        const diffRatio = Math.abs(w - r) / r;
        if (diffRatio > 0.20) {
          warnings['workingWidthM'] = 'calibracaoPulverizador.warnings.workingWidthDiffersRowSpacing';
        }
      }
    }
  }

  // Número de bicos ativos (N)
  if (inputs.activeNozzleCount !== undefined && inputs.activeNozzleCount !== '' && inputs.activeNozzleCount !== null) {
    const n = Number(inputs.activeNozzleCount);
    if (!Number.isFinite(n) || n <= 0) {
      errors['activeNozzleCount'] = 'calibracaoPulverizador.errors.activeNozzleCountGreaterThanZero';
    } else if (!Number.isInteger(n)) {
      errors['activeNozzleCount'] = 'calibracaoPulverizador.errors.activeNozzleCountInteger';
    } else if (n % 2 !== 0) {
      warnings['activeNozzleCount'] = 'calibracaoPulverizador.warnings.evenNozzlesRequired';
    } else if (n > 40) {
      warnings['activeNozzleCount'] = 'calibracaoPulverizador.warnings.activeNozzleCountHigh';
    }
  }


  // -------------------------------------------------------------------------
  // 10. AVISO GERAL AGRONÓMICO / JURÍDICO (apenas anexado se existirem avisos)
  // -------------------------------------------------------------------------
  if (Object.keys(warnings).length > 0) {
    warnings['general'] = 'calibracaoPulverizador.warnings.labelPrevalence';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}
