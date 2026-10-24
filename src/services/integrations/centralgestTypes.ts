/**
 * DATERRA Smart - CentralGest ERPCloud Integration Types
 * Contratos de dados da API REST do ERPCloud e DTOs de sincronização
 */

export interface CentralgestConfig {
  baseUrl: string;
  apiKey?: string;
  companyId?: string;
  isSimulationMode: boolean; // Flag de runtime desacoplada (Plug-and-Play)
  timeoutMs?: number;
}

export type ErpOperationType = 'fitossanitario' | 'adubacao' | 'poda' | 'rega' | 'colheita' | 'outro';

/**
 * DTO para registo de Operação Cultural / Caderno de Campo no CentralGest
 */
export interface ErpCulturalOperationDto {
  idempotencyKey: string;
  externalId: string;
  parcelCode: string;
  cropType: string;
  operationDate: string; // ISO 8601
  operationType: ErpOperationType;
  areaHa: number;
  productName?: string;
  activeSubstance?: string;
  doseRate?: number;
  doseUnit?: string;
  waterVolumeLHa?: number;
  totalProductQuantity?: number;
  operatorId?: string;
  machineryId?: string;
  notes?: string;
  status: 'pending' | 'posted';
}

/**
 * DTO para registo de Inspeção / Calibração de Pulverizador no CentralGest
 */
export interface ErpCalibrationDto {
  idempotencyKey: string;
  externalId: string;
  equipmentId: string;
  calibrationDate: string; // ISO 8601
  method: 'LWA' | 'TRV' | 'STANDARD';
  workingSpeedKmh: number;
  pressureBar?: number;
  nozzleType?: string;
  targetVolumeLHa: number;
  measuredOutputLMin?: number;
  deviationPercentage?: number;
  conformsDgav: boolean;
}

/**
 * Resposta tipificada da API REST do CentralGest
 */
export interface ErpSyncResponse<T = any> {
  success: boolean;
  statusCode: number;
  idempotencyKey: string;
  erpTransactionId?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    conflictDetails?: Record<string, any>;
  };
}

/**
 * Opções de substituição para o modo de simulação (útil para testes unitários)
 */
export interface ErpSimulationOverride {
  statusCode: number;
  errorMessage?: string;
  conflictDetails?: Record<string, any>;
  erpTransactionId?: string;
}
