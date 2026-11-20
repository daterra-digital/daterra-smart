// src/schemas/nozzle-profile.schema.ts
import { z } from 'zod/mini';
import { EQUIPMENT_TYPES, EquipmentTypeSchema, type EquipmentType } from './equipment.schema.ts';

export const NOZZLE_BOOM_DIRECTIONS = ['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT'] as const;
export const NozzleBoomDirectionSchema = z.enum(NOZZLE_BOOM_DIRECTIONS);
export type NozzleBoomDirection = z.infer<typeof NozzleBoomDirectionSchema>;

export const UAV_NOZZLE_MODES = ['HYDRAULIC', 'ROTARY_CDA'] as const;
export const UavNozzleModeSchema = z.enum(UAV_NOZZLE_MODES);
export type UavNozzleMode = z.infer<typeof UavNozzleModeSchema>;

export const TUNNEL_ORIENTATIONS = ['OUTER', 'INNER', 'BOTH'] as const;
export const TunnelOrientationSchema = z.enum(TUNNEL_ORIENTATIONS);
export type TunnelOrientation = z.infer<typeof TunnelOrientationSchema>;
export type CrossflowOrientation = TunnelOrientation;

export const SLOT_SECTION_SIDES = [
  'LEFT',
  'RIGHT',
  'LEFT_OUTER',
  'LEFT_INNER',
  'RIGHT_INNER',
  'RIGHT_OUTER',
  'BOOM',
  'LANCE',
  'ROTOR',
  'LOWER_LEFT',
  'LOWER_RIGHT',
  'UPPER_LEFT',
  'UPPER_RIGHT',
  'CANNON_MAIN',
  'CANNON_DEFLECTOR'
] as const;
export const SlotSectionSideSchema = z.enum(SLOT_SECTION_SIDES);
export type SlotSectionSide = z.infer<typeof SlotSectionSideSchema>;

export const NozzleSlotConfigSchema = z.object({
  slotIndex: z.number().check(z.int(), z.gte(0)),
  slotLabel: z.string().check(z.minLength(1)),
  sectionSide: z.optional(SlotSectionSideSchema),
  levelIndex: z.optional(z.number().check(z.int(), z.gte(0))),
  sectorIndex: z.optional(z.number().check(z.int(), z.gte(1))),
  armIndex: z.optional(z.number().check(z.int(), z.gte(1))),
  orientation: z.optional(TunnelOrientationSchema),
  isActive: z.boolean(),
  nozzleId: z.string(),
  brand: z.string(),
  model: z.string(),
  color: z.string(),
  isoCode: z.optional(z.string()),
  sprayAngleDeg: z.optional(z.number()),
  referencePressureBar: z.optional(z.number().check(z.gt(0))),
  nominalFlowLMin: z.number().check(z.gte(0)),
  swirlPlate: z.optional(z.string()),
  disc: z.optional(z.string()),
  flowAtPressureLMin: z.number().check(z.gte(0)),
  measuredFlowLMin: z.optional(z.number().check(z.gte(0)))
});
export type NozzleSlotConfig = z.infer<typeof NozzleSlotConfigSchema>;

export const NozzleProfileSchema = z.object({
  id: z.uuid({ message: 'Identificador deve ser UUID v4.' }),
  userId: z.optional(z.string().check(z.minLength(1))),
  name: z.string().check(z.minLength(1), z.maxLength(120)),
  equipmentType: EquipmentTypeSchema,
  equipmentId: z.optional(z.string()),
  equipmentName: z.optional(z.string()),
  referencePressureBar: z.number().check(z.gt(0)),
  airAssisted: z.optional(z.boolean()),
  boomDirection: z.optional(NozzleBoomDirectionSchema),
  boomSectors: z.optional(z.number().check(z.int(), z.gte(1), z.lte(12))),
  boomNozzlesPerSector: z.optional(z.number().check(z.int(), z.gte(1), z.lte(12))),
  threeDSectors: z.optional(z.number().check(z.int(), z.gte(2), z.lte(6))),
  tunnelOrientation: z.optional(TunnelOrientationSchema),
  pneumaticArms: z.optional(z.number().check(z.int(), z.gte(2), z.lte(8))),
  pneumaticNozzlesPerArm: z.optional(z.number().check(z.int(), z.gte(1), z.lte(6))),
  cannonDeflectorCount: z.optional(z.number().check(z.int(), z.gte(0), z.lte(6))),
  uavMode: z.optional(UavNozzleModeSchema),
  uavRotaryRpm: z.optional(z.number().check(z.gte(0))),
  uavTargetDv50Um: z.optional(z.number().check(z.gte(0))),
  slots: z.array(NozzleSlotConfigSchema).check(z.minLength(1)),
  totalActiveFlowLMin: z.number().check(z.gte(0)),
  activeSlotsCount: z.number().check(z.int(), z.gte(0)),
  totalSlotsCount: z.number().check(z.int(), z.gte(1)),
  updatedAt: z.string()
});
export type NozzleProfile = z.infer<typeof NozzleProfileSchema>;
export { EQUIPMENT_TYPES, type EquipmentType };
