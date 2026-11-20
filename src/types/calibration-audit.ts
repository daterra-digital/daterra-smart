// src/types/calibration-audit.ts
import { z } from 'zod';
import type { ProfileCropMoment, ProfileCropMomentSnapshot, ProfileCulture, ProfileEquipment, ProfileNozzle } from '../db/types.ts';
import type { EquipmentRecord } from '../schemas/equipment.schema.ts';
import type { NozzleProfile } from '../schemas/nozzle-profile.schema.ts';

export const PDF_AUDIT_REPORT_MODES = [
  'CALIBRATION_AGRONOMIC',
  'ISO_16122_INSPECTION'
] as const;

export const PdfAuditReportModeSchema = z.enum(PDF_AUDIT_REPORT_MODES);
export type PdfAuditReportMode = z.infer<typeof PdfAuditReportModeSchema>;

const DD_MM_YYYY_REGEX = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/i;

const nullableFiniteNonNeg = () => z.number().finite().min(0).nullable();
const nullableFinitePos = () => z.number().finite().positive().nullable();

/**
 * Pontos de controlo técnico para auditoria e futuro módulo de Centros de Inspeção DGAV (ISO 16122).
 */
export const Iso16122CheckpointDataSchema = z.object({
  numeroSerieChassi: z.string().trim().min(1).max(80).optional(),
  dataValidadeIpp: z
    .string()
    .regex(DD_MM_YYYY_REGEX, 'A data de validade IPP deve seguir o formato DD-MM-AAAA.')
    .optional(),
  desvioMaximoBicosPct: z.number().finite().min(0).max(100).nullable(),
  simetriaEsqDirPct: z.number().finite().min(0).max(100).nullable(),
  tempoCorteAntigotaS: z.number().finite().min(0).max(120).nullable().optional(),
  erroManometroPct: z.number().finite().min(0).max(100).nullable().optional()
});
export type Iso16122CheckpointData = z.infer<typeof Iso16122CheckpointDataSchema>;

/**
 * Registo canónico de calibração auditável com selo criptográfico SHA-256.
 */
export const CalibrationAuditRecordSchema = z.object({
  id: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  nomePerfil: z.string().trim().min(1).max(120),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
  nozzleProfileId: z.string().trim().min(1).nullable(),
  equipmentId: z.string().trim().min(1).nullable(),
  cultureParcelId: z.string().trim().min(1).nullable(),
  cultureMomentId: z.string().trim().min(1).nullable(),
  velocidadeKmh: z.number().finite().positive(),
  pressaoBar: z.number().finite().positive(),
  pressaoBaseBicoBar: nullableFinitePos().optional(),
  debitoTotalLMin: z.number().finite().positive(),
  numBicosAtivos: z.number().int().positive(),
  entrelinhaM: z.number().finite().positive(),
  volumeCalibradoLHa: z.number().finite().positive(),
  volumeRecomendadoEppoLHa: nullableFinitePos(),
  caudalArOtimoM3H: nullableFiniteNonNeg(),
  caudalArAplicadoM3H: nullableFiniteNonNeg(),
  relacaoEngrenagem: z.string().trim().max(80).optional(),
  rotacaoMotorRpm: nullableFinitePos().optional(),
  rotacaoTdfRpm: nullableFinitePos().optional(),
  iso16122: Iso16122CheckpointDataSchema,
  sha256Seal: z.string().regex(SHA256_HEX_REGEX, 'Selo SHA-256 inválido.').optional()
});
export type CalibrationAuditRecord = z.infer<typeof CalibrationAuditRecordSchema>;

/**
 * Fotografia meteorológica ativa; campos em falta permanecem rigorosamente null (nunca 0).
 */
export const WeatherAuditSnapshotSchema = z.object({
  ventoMs: nullableFiniteNonNeg(),
  rajadaMs: nullableFiniteNonNeg(),
  deltaT: z.number().finite().nullable(),
  vpd: nullableFiniteNonNeg(),
  precipitacaoMm: nullableFiniteNonNeg(),
  observadoEm: z.string().trim().min(1).nullable(),
  localidade: z.string().trim().min(1).nullable(),
  origemDados: z.enum(['LIVE', 'CACHE', 'MANUAL']).nullable()
});
export type WeatherAuditSnapshot = z.infer<typeof WeatherAuditSnapshotSchema>;

export const CultureContextRefSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  cropType: z.string().trim().min(1),
  entrelinhaM: nullableFinitePos(),
  trvM3Ha: nullableFinitePos(),
  lwaM2Ha: nullableFinitePos(),
  volumeRecomendadoEppoLHa: nullableFinitePos(),
  activeMomentId: z.string().trim().min(1).nullable(),
  record: z.custom<ProfileCulture>(),
  activeMoment: z.custom<ProfileCropMoment>().nullable(),
  momentSnapshot: z.custom<ProfileCropMomentSnapshot>().nullable()
});
export type CultureContextRef = z.infer<typeof CultureContextRefSchema>;

export const EquipmentContextRefSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  sourceStore: z.enum(['equipments_v12', 'profiles_equipment']),
  equipmentType: z.string().trim().min(1).nullable(),
  is3DOrAirAssisted: z.boolean(),
  isDroneUav: z.boolean(),
  caudalArAplicadoM3H: nullableFiniteNonNeg(),
  recordV12: z.custom<EquipmentRecord>().nullable(),
  legacyRecord: z.custom<ProfileEquipment>().nullable()
});
export type EquipmentContextRef = z.infer<typeof EquipmentContextRefSchema>;

export const NozzleContextRefSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  referencePressureBar: nullableFinitePos(),
  totalActiveFlowLMin: nullableFiniteNonNeg(),
  activeNozzleCount: z.number().int().positive().nullable(),
  profile: z.custom<NozzleProfile>().nullable(),
  legacyRecord: z.custom<ProfileNozzle>().nullable()
});
export type NozzleContextRef = z.infer<typeof NozzleContextRefSchema>;

/**
 * Contexto agronómico transversal unificado para Calibração, Relatório PDF, Chat IA e IRD.
 */
export const ActiveAgronomicContextSchema = z.object({
  userId: z.string().trim().min(1),
  resolvedAt: z.string().trim().min(1),
  culture: CultureContextRefSchema.nullable(),
  equipment: EquipmentContextRefSchema.nullable(),
  nozzleProfile: NozzleContextRefSchema.nullable(),
  calibration: CalibrationAuditRecordSchema.nullable(),
  weatherSnapshot: WeatherAuditSnapshotSchema.nullable()
});
export type ActiveAgronomicContext = z.infer<typeof ActiveAgronomicContextSchema>;
