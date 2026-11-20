// src/schemas/equipment.schema.ts
import { z } from 'zod/mini';
import { UavEquipmentDetailsSchema } from './equipmentUav.schema.ts';

/**
 * Tipologias fechadas de equipamentos de pulverização DATERRA Smart.
 */
export const EQUIPMENT_TYPES = [
  '2D_HORIZONTAL',
  '3D_AXIAL',
  '3D_TANGENTIAL',
  '3D_CROSSFLOW',
  '3D_TUNNEL',
  '3D_PNEUMATIC',
  '3D_CANNON',
  'UAV_DRONE',
  'MANUAL_LANCE'
] as const;

export const EquipmentTypeSchema = z.enum(EQUIPMENT_TYPES);
export type EquipmentType = z.infer<typeof EquipmentTypeSchema>;

export const THREE_D_EQUIPMENT_TYPES: ReadonlySet<EquipmentType> = new Set([
  '3D_AXIAL',
  '3D_TANGENTIAL',
  '3D_CROSSFLOW',
  '3D_TUNNEL',
  '3D_PNEUMATIC',
  '3D_CANNON'
]);

const optTrimmedStr = () => z.optional(z.string());
const optPosNum = () => z.optional(z.number().check(z.gt(0)));

/**
 * Sub-objetos opcionais da ficha legada ISO 16122 (Bomba/Filtros, Comandos/Regulação e Manómetro).
 */
export const PumpAndFiltersDetailsSchema = z.object({
  pumpManufacturer: optTrimmedStr(),
  pumpModel: optTrimmedStr(),
  pumpType: optTrimmedStr(),
  hasFillingSieve: z.optional(z.boolean()),
  hasSuctionFilter: z.optional(z.boolean()),
  hasPressureFilter: z.optional(z.boolean()),
  hasLineFilters: z.optional(z.boolean()),
  notes: optTrimmedStr()
});
export type PumpAndFiltersDetails = z.infer<typeof PumpAndFiltersDetailsSchema>;

export const ControlsAndRegulationDetailsSchema = z.object({
  commandManufacturer: optTrimmedStr(),
  commandModel: optTrimmedStr(),
  sectionsCount: z.optional(z.number().check(z.int(), z.gt(0))),
  isManual: z.optional(z.boolean()),
  isElectric: z.optional(z.boolean()),
  isIsobus: z.optional(z.boolean()),
  isAutomatic: z.optional(z.boolean()),
  hasComputer: z.optional(z.boolean()),
  notes: optTrimmedStr()
});
export type ControlsAndRegulationDetails = z.infer<typeof ControlsAndRegulationDetailsSchema>;

export const ManometerTypeSchema = z.enum(['ANALOG', 'DIGITAL']);
export type ManometerType = z.infer<typeof ManometerTypeSchema>;

export const ManometerDetailsSchema = z.object({
  manometerType: z.optional(ManometerTypeSchema),
  diameterMm: optPosNum(),
  scaleDivisionsBar: optPosNum(),
  maxScaleValueBar: optPosNum(),
  errorClassPct: optPosNum(),
  maxPressureBar: optPosNum(),
  notes: optTrimmedStr()
});
export type ManometerDetails = z.infer<typeof ManometerDetailsSchema>;

const isoDateCheck = z.refine<string>(
  (val) => val.trim().length === 0 || !Number.isNaN(Date.parse(val)),
  { message: 'A data deve estar em formato ISO válido.' }
);

/**
 * Sub-objeto de pré-inspeção segundo a norma ISO 16122.
 * Verifica manómetro validado, válvula antigota (<= 5s) e desgaste de bicos (<= 10%).
 */
export const Iso16122InspectionSchema = z.object({
  lastInspectionDate: z.optional(z.string().check(isoDateCheck)),
  pressureGaugeOk: z.boolean(),
  antiDripValveOk: z.boolean(),
  nozzleWearWithin10Pct: z.boolean(),
  hoseAndTriggerOk: z.optional(z.boolean()),
  pumpAndFiltersOk: z.optional(z.boolean()),
  controlsAndRegulationOk: z.optional(z.boolean()),
  notes: optTrimmedStr()
});

export type Iso16122Inspection = z.infer<typeof Iso16122InspectionSchema>;

/**
 * Schema principal da tabela `equipments` (Dexie v12).
 * Bloqueia valores fisicamente impossíveis (<= 0 nos parâmetros estruturais e operacionais).
 */
export const EquipmentSchema = z.object({
  id: z.uuid({ message: 'O identificador do equipamento deve ser um UUID v4 válido.' }),
  userId: z.optional(z.string().check(z.minLength(1))),
  legacyProfileId: z.optional(z.number().check(z.int(), z.gt(0))),
  name: z
    .string()
    .check(
      z.minLength(1, { message: 'O nome do equipamento é obrigatório.' }),
      z.maxLength(120, { message: 'O nome do equipamento não pode exceder 120 caracteres.' })
    ),
  type: EquipmentTypeSchema,
  manufacturer: optTrimmedStr(),
  model: optTrimmedStr(),
  serialNumber: optTrimmedStr(),
  manufactureYear: z.optional(z.number().check(z.int(), z.gte(1950), z.lte(2100))),
  tankCapacityL: z
    .number()
    .check(z.gt(0, { message: 'A capacidade do depósito (L) deve ser superior a zero.' })),
  handWashTank: z.optional(z.boolean()),
  circuitFlushTank: z.optional(z.boolean()),
  chemicalInductor: z.optional(z.boolean()),
  associatedNozzleIds: z.optional(z.array(z.string().check(z.minLength(1)))),
  workingWidthM: z
    .number()
    .check(z.gt(0, { message: 'A largura de trabalho ou número de bicos deve ser superior a zero.' })),
  nozzleSpacingCm: z
    .number()
    .check(z.gt(0, { message: 'O espaçamento entre bicos (cm) deve ser superior a zero.' })),
  defaultPressureBar: z
    .number()
    .check(z.gt(0, { message: 'A pressão operacional (bar) deve ser superior a zero.' })),
  defaultSpeedKmh: z
    .number()
    .check(z.gt(0, { message: 'A velocidade de avanço (km/h) deve ser superior a zero.' })),
  defaultAirflowM3h: z.optional(
    z.number().check(z.gte(0, { message: 'O caudal de ar (m³/h) não pode ser negativo.' }))
  ),
  airAssisted: z.optional(z.boolean()),
  airCurtainAngle: optTrimmedStr(),
  uavDetails: z.optional(UavEquipmentDetailsSchema),
  lanceCount: z.optional(z.number().check(z.int(), z.gt(0))),
  hoseLengthM: optPosNum(),
  hasHoseReel: z.optional(z.boolean()),
  pumpAndFilters: z.optional(PumpAndFiltersDetailsSchema),
  controlsAndRegulation: z.optional(ControlsAndRegulationDetailsSchema),
  manometer: z.optional(ManometerDetailsSchema),
  iso16122Inspection: Iso16122InspectionSchema,
  notes: optTrimmedStr(),
  lastUpdatedAt: z.optional(z.string().check(isoDateCheck))
});

export type EquipmentRecord = z.infer<typeof EquipmentSchema>;

export function parseEquipmentRecord(input: unknown): EquipmentRecord {
  return EquipmentSchema.parse(input);
}

export function safeParseEquipmentRecord(input: unknown) {
  return EquipmentSchema.safeParse(input);
}
