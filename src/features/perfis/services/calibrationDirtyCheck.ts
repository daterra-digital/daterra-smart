// src/features/perfis/services/calibrationDirtyCheck.ts
import type { CalibrationAuditRecord } from '../../../types/calibration-audit.ts';

export interface CalibrationDirtyCheckState {
  cultureParcelId: string | null;
  equipmentId: string | null;
  nozzleProfileId: string | null;
  velocidadeKmh: number;
  pressaoBar: number | null;
  caudalArAplicadoM3H: number | null;
  relacaoEngrenagem: string;
  rotacaoMotorRpm: number | null;
  rotacaoTdfRpm: number | null;
  debitoTotalLMin: number | null;
  entrelinhaM: number | null;
}

function numChanged(a: number | null | undefined, b: number | null | undefined, eps = 0.005): boolean {
  const va = typeof a === 'number' && Number.isFinite(a) ? a : null;
  const vb = typeof b === 'number' && Number.isFinite(b) ? b : null;
  if (va === null || vb === null) return va !== vb;
  return Math.abs(va - vb) > eps;
}

/**
 * Deteta se os parâmetros operacionais ou perfis selecionados diferem da ficha de calibração carregada.
 */
export function hasCalibrationRecordChanged(
  loadedRecord: CalibrationAuditRecord | null,
  current: CalibrationDirtyCheckState
): boolean {
  if (!loadedRecord) return false;
  if ((loadedRecord.cultureParcelId ?? null) !== (current.cultureParcelId ?? null)) return true;
  if ((loadedRecord.equipmentId ?? null) !== (current.equipmentId ?? null)) return true;
  if ((loadedRecord.nozzleProfileId ?? null) !== (current.nozzleProfileId ?? null)) return true;
  if ((loadedRecord.relacaoEngrenagem ?? '').trim() !== current.relacaoEngrenagem.trim()) return true;
  if (numChanged(loadedRecord.velocidadeKmh, current.velocidadeKmh, 0.01)) return true;
  if (numChanged(loadedRecord.pressaoBar, current.pressaoBar, 0.01)) return true;
  if (numChanged(loadedRecord.caudalArAplicadoM3H, current.caudalArAplicadoM3H, 0.5)) return true;
  if (numChanged(loadedRecord.rotacaoMotorRpm, current.rotacaoMotorRpm, 0.5)) return true;
  if (numChanged(loadedRecord.rotacaoTdfRpm, current.rotacaoTdfRpm, 0.5)) return true;
  if (numChanged(loadedRecord.debitoTotalLMin, current.debitoTotalLMin, 0.01)) return true;
  if (numChanged(loadedRecord.entrelinhaM, current.entrelinhaM, 0.005)) return true;
  return false;
}

export function validateCalibrationReadyForSave(params: {
  validOwner: string;
  hasNozzle: boolean;
  debitoTotalLMin: number | null;
  numBicosAtivos: number | null;
  pressaoBar: number | null;
  entrelinhaM: number | null;
  isBalanceValid: boolean;
  volumeCalibradoLHa: number | null;
  errorMessagePt: string | null;
}): string | null {
  if (!params.validOwner) return 'Inicie sessão para gravar fichas de calibração.';
  if (!params.hasNozzle || !params.debitoTotalLMin || !params.numBicosAtivos || !params.pressaoBar) {
    return 'Selecione um Perfil Bico com bicos ativos e débito superior a 0 L/min.';
  }
  if (!params.entrelinhaM || !params.isBalanceValid || params.volumeCalibradoLHa === null) {
    return params.errorMessagePt || 'Indique uma parcela com entrelinha (m) e velocidade válidas.';
  }
  return null;
}
