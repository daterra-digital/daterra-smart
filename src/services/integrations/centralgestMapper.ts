/**
 * DATERRA Smart - Mappers de Entidades para API do CentralGest ERPCloud
 * Converte puramente registos da Mutation Outbox nos DTOs da API REST
 */

import type { MutationOutboxRecord } from '../../db/db.ts';
import type {
  ErpCulturalOperationDto,
  ErpCalibrationDto,
  ErpOperationType
} from './centralgestTypes.ts';

/**
 * Gera uma chave de idempotência no formato UUIDv4 compatível com browser e Node.js
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Mapeia mutação de Caderno de Campo / Tratamento Fitossanitário para DTO do ERP
 */
export function mapToErpCulturalOperation(
  mutation: MutationOutboxRecord,
  idempotencyKey: string
): ErpCulturalOperationDto {
  const p = mutation.payload || {};

  return {
    idempotencyKey,
    externalId: mutation.entityId,
    parcelCode: p.parcelCode || p.parcelId || 'PARCEL-UNASSIGNED',
    cropType: p.cropType || p.cultureName || 'Geral',
    operationDate: p.date || mutation.updatedAt,
    operationType: (p.operationType as ErpOperationType) || 'fitossanitario',
    areaHa: Number(p.areaHa || p.treatedAreaHa || 1.0),
    productName: p.productName || p.product || undefined,
    activeSubstance: p.activeSubstance || undefined,
    doseRate: p.doseRate !== undefined ? Number(p.doseRate) : undefined,
    doseUnit: p.doseUnit || 'L/ha',
    waterVolumeLHa: p.waterVolumeLHa !== undefined ? Number(p.waterVolumeLHa) : undefined,
    totalProductQuantity: p.totalProductQuantity !== undefined ? Number(p.totalProductQuantity) : undefined,
    operatorId: p.operatorId || undefined,
    machineryId: p.machineryId || p.equipmentId || undefined,
    notes: p.notes || p.extraNotes || undefined,
    status: mutation.operation === 'DELETE' ? 'posted' : 'pending'
  };
}

/**
 * Mapeia mutação de Calibração de Pulverizador para DTO do ERP
 */
export function mapToErpCalibration(
  mutation: MutationOutboxRecord,
  idempotencyKey: string
): ErpCalibrationDto {
  const p = mutation.payload || {};
  const rawMethod = (p.method || p.calculatorId || 'STANDARD').toUpperCase();
  const method = rawMethod.includes('LWA') ? 'LWA' : rawMethod.includes('TRV') ? 'TRV' : 'STANDARD';

  return {
    idempotencyKey,
    externalId: mutation.entityId,
    equipmentId: p.equipmentId || p.machineryId || 'PULV-DEFAULT',
    calibrationDate: p.date || mutation.updatedAt,
    method,
    workingSpeedKmh: Number(p.workingSpeedKmh || p.speed || 6.0),
    pressureBar: p.pressureBar !== undefined ? Number(p.pressureBar) : undefined,
    nozzleType: p.nozzleType || p.nozzleModel || undefined,
    targetVolumeLHa: Number(p.targetVolumeLHa || p.sprayVolumeLHa || p.volume || 200),
    measuredOutputLMin: p.measuredOutputLMin !== undefined ? Number(p.measuredOutputLMin) : undefined,
    deviationPercentage: p.deviationPercentage !== undefined ? Number(p.deviationPercentage) : 0,
    conformsDgav: p.conformsDgav !== undefined ? Boolean(p.conformsDgav) : true
  };
}

/**
 * Resolve o endpoint, método HTTP e payload correspondente à mutação
 */
export function mapOutboxMutationToErpPayload(
  mutation: MutationOutboxRecord,
  forcedIdempotencyKey?: string
): { endpoint: string; method: string; payload: any; idempotencyKey: string } {
  const idempotencyKey = forcedIdempotencyKey || generateIdempotencyKey();
  const httpMethod = mutation.operation === 'DELETE' ? 'DELETE' : mutation.operation === 'UPDATE' ? 'PUT' : 'POST';

  switch (mutation.entityType) {
    case 'caderno_campo':
    case 'calculation':
    case 'mixture':
      return {
        endpoint: '/api/v1/agriculture/cultural-operations',
        method: httpMethod,
        payload: mapToErpCulturalOperation(mutation, idempotencyKey),
        idempotencyKey
      };

    case 'calibration':
    case 'equipment':
      return {
        endpoint: '/api/v1/agriculture/calibrations',
        method: httpMethod,
        payload: mapToErpCalibration(mutation, idempotencyKey),
        idempotencyKey
      };

    default:
      return {
        endpoint: `/api/v1/agriculture/generic/${mutation.entityType}`,
        method: httpMethod,
        payload: {
          idempotencyKey,
          externalId: mutation.entityId,
          entityType: mutation.entityType,
          operation: mutation.operation,
          data: mutation.payload,
          updatedAt: mutation.updatedAt
        },
        idempotencyKey
      };
  }
}
