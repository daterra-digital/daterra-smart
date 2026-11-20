// src/schemas/equipmentUav.schema.ts
import { z } from 'zod/mini';

export const UavWeightClassSchema = z.enum(['LIGHT_LT_15L', 'HEAVY_GTE_20L']);
export type UavWeightClass = z.infer<typeof UavWeightClassSchema>;

export const UavAtomizationSystemSchema = z.enum(['CENTRIFUGAL_CDA', 'HYDRAULIC']);
export type UavAtomizationSystem = z.infer<typeof UavAtomizationSystemSchema>;

export const UavNozzlePlacementSchema = z.enum(['UNDER_ROTOR', 'WINGTIP']);
export type UavNozzlePlacement = z.infer<typeof UavNozzlePlacementSchema>;

export const UavEquipmentDetailsSchema = z.object({
  flightHeightM: z.optional(z.number().check(z.gt(0))),
  swathWidthM: z.optional(z.number().check(z.gt(0))),
  weightClass: z.optional(UavWeightClassSchema),
  rotorCount: z.optional(z.number().check(z.int(), z.gte(4), z.lte(8))),
  terrainFollowingRadar: z.optional(z.boolean()),
  atomizationSystem: z.optional(UavAtomizationSystemSchema),
  cdaDiscRpm: z.optional(z.number().check(z.gt(0))),
  dropletDv50Um: z.optional(z.number().check(z.gt(0))),
  dropletDv10Um: z.optional(z.number().check(z.gt(0))),
  nozzlePlacement: z.optional(UavNozzlePlacementSchema)
});

export type UavEquipmentDetails = z.infer<typeof UavEquipmentDetailsSchema>;
