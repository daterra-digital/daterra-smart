/**
 * DATERRA Smart - Predefinições Rápidas de Bicos para Smart Débito
 * Ficheiro: src/features/smart-debito/nozzlePresets.ts
 */

import type { NozzleCatalogRef } from './types';
import { NOZZLE_CATALOG_DATABASE } from '../calibracao-pulverizador/data/nozzleCatalog';

export const COMMON_NOZZLE_PRESETS: NozzleCatalogRef[] = [
  // Linha Albuz ATR 80 (Referência clássica arboricultura / viticultura a 10 bar)
  {
    brand: 'Albuz',
    model: 'ATR 80',
    color: 'Branco',
    referencePressureBar: 10,
    nominalFlowLMin: 0.38,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },
  {
    brand: 'Albuz',
    model: 'ATR 80',
    color: 'Lilás',
    referencePressureBar: 10,
    nominalFlowLMin: 0.50,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },
  {
    brand: 'Albuz',
    model: 'ATR 80',
    color: 'Castanho',
    referencePressureBar: 10,
    nominalFlowLMin: 0.60,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },
  {
    brand: 'Albuz',
    model: 'ATR 80',
    color: 'Amarelo',
    referencePressureBar: 10,
    nominalFlowLMin: 0.73,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },
  {
    brand: 'Albuz',
    model: 'ATR 80',
    color: 'Laranja',
    referencePressureBar: 10,
    nominalFlowLMin: 0.99,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },
  {
    brand: 'Albuz',
    model: 'ATR 80',
    color: 'Vermelho',
    referencePressureBar: 10,
    nominalFlowLMin: 1.38,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },
  {
    brand: 'Albuz',
    model: 'ATR 80',
    color: 'Verde',
    referencePressureBar: 10,
    nominalFlowLMin: 1.65,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },
  {
    brand: 'Albuz',
    model: 'ATR 80',
    color: 'Azul',
    referencePressureBar: 10,
    nominalFlowLMin: 1.94,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },

  // Linha Padrão ISO (Referência a 3.0 bar para barras e leques standard)
  {
    brand: 'ISO Standard',
    model: '01',
    color: 'Laranja',
    referencePressureBar: 3.0,
    nominalFlowLMin: 0.40,
    sprayAngleDeg: 110,
    nozzleType: 'Leque standard'
  },
  {
    brand: 'ISO Standard',
    model: '015',
    color: 'Verde',
    referencePressureBar: 3.0,
    nominalFlowLMin: 0.60,
    sprayAngleDeg: 110,
    nozzleType: 'Leque standard'
  },
  {
    brand: 'ISO Standard',
    model: '02',
    color: 'Amarelo',
    referencePressureBar: 3.0,
    nominalFlowLMin: 0.80,
    sprayAngleDeg: 110,
    nozzleType: 'Leque standard'
  },
  {
    brand: 'ISO Standard',
    model: '025',
    color: 'Lilás',
    referencePressureBar: 3.0,
    nominalFlowLMin: 1.00,
    sprayAngleDeg: 110,
    nozzleType: 'Leque standard'
  },
  {
    brand: 'ISO Standard',
    model: '03',
    color: 'Azul',
    referencePressureBar: 3.0,
    nominalFlowLMin: 1.20,
    sprayAngleDeg: 110,
    nozzleType: 'Leque standard'
  },
  {
    brand: 'ISO Standard',
    model: '04',
    color: 'Vermelho',
    referencePressureBar: 3.0,
    nominalFlowLMin: 1.60,
    sprayAngleDeg: 110,
    nozzleType: 'Leque standard'
  },
  {
    brand: 'ISO Standard',
    model: '05',
    color: 'Castanho',
    referencePressureBar: 3.0,
    nominalFlowLMin: 2.00,
    sprayAngleDeg: 110,
    nozzleType: 'Leque standard'
  },

  // TeeJet TXR ConeJet
  {
    brand: 'TeeJet',
    model: 'TXR ConeJet',
    color: 'Amarelo (TXR8002VK)',
    referencePressureBar: 3.0,
    nominalFlowLMin: 0.79,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  },
  {
    brand: 'TeeJet',
    model: 'TXR ConeJet',
    color: 'Azul (TXR8003VK)',
    referencePressureBar: 3.0,
    nominalFlowLMin: 1.18,
    sprayAngleDeg: 80,
    nozzleType: 'Cone vazio'
  }
];

export const DEFAULT_NOZZLE_PRESET: NozzleCatalogRef = COMMON_NOZZLE_PRESETS[4]; // Albuz ATR 80 Laranja (0.99 l/min @ 10 bar)

/**
 * Procura rápida de bicos no catálogo oficial verificado DATERRA.
 */
export function searchOfficialNozzles(query: string): NozzleCatalogRef[] {
  if (!query || query.trim().length < 2) {
    return COMMON_NOZZLE_PRESETS;
  }
  const q = query.toLowerCase().trim();
  const filtered = NOZZLE_CATALOG_DATABASE.filter(
    (n) =>
      n.manufacturerName.toLowerCase().includes(q) ||
      n.model.toLowerCase().includes(q) ||
      n.colorOrSize.toLowerCase().includes(q)
  );

  return filtered.slice(0, 30).map((n) => ({
    id: n.id,
    brand: n.manufacturerName,
    model: n.model,
    color: n.colorOrSize,
    referencePressureBar: n.referencePressureBar,
    nominalFlowLMin: n.nominalOutputLMin,
    sprayAngleDeg: n.sprayAngleDeg,
    nozzleType: n.nozzleType
  }));
}
