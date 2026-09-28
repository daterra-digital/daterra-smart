/**
 * DATERRA Smart - Catálogo Técnico Oficial de Bicos para Vinha e Arboricultura
 * Ficheiro: src/features/calibracao-pulverizador/data/nozzleCatalog.ts
 * 
 * Regra Obrigatória: Apenas dados técnicos oficiais existentes e verificados no projeto.
 * Não contém dados presumidos, interpolados ou inventados.
 */

import { NOZZLES_DATABASE } from '../../nozzle-comparison/nozzleComparison.data.ts';
import { MANUFACTURERS_DATABASE } from '../../nozzle-comparison/manufacturerData.ts';

export type NozzleType = 'hollow-cone' | 'full-cone' | 'flat-fan' | 'other';

export interface NozzleCatalogEntry {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  model: string;
  nozzleType: NozzleType;
  colorOrSize: string;
  pressureBar: number;             // Pressão de referência P1 (compatibilidade retroativa)
  referencePressureBar: number;    // P1 (ex: 3 bar ou 10 bar)
  nominalOutputLMin: number;       // D1 (débito nominal à pressão de referência P1)
  pressureMinBar?: number;         // Pressão mínima de trabalho recomendada
  pressureMaxBar?: number;         // Pressão máxima de trabalho recomendada
  sprayAngleDeg?: number | string; // Ângulo de pulverização em graus
  applicableUse: 'vineyard' | 'orchard' | 'general';
  sourceName: string;
  sourceUrl?: string;
  sourceVersion: string;
}

export interface ManufacturerItem {
  id: string;
  name: string;
  hasData: boolean;
  statusLabel: string;
  isTopSuggestion: boolean;
}

/**
 * Constrói a base de dados normalizada do catálogo de bicos a partir dos dados oficiais verificados.
 */
function buildNozzleCatalog(): NozzleCatalogEntry[] {
  const entries: NozzleCatalogEntry[] = [];

  for (const n of NOZZLES_DATABASE) {
    if (
      typeof n.referencePressureBar === 'number' &&
      n.referencePressureBar > 0 &&
      typeof n.nominalFlowLMin === 'number' &&
      n.nominalFlowLMin > 0
    ) {
      let type: NozzleType = 'other';
      if (
        n.nozzleType === 'Cone vazio' ||
        n.nozzleType === 'Cone vazio com indução de ar' ||
        n.nozzleType.toLowerCase().includes('cone vazio') ||
        n.nozzleType.toLowerCase().includes('cone oco') ||
        n.nozzleType.toLowerCase().includes('hollow cone')
      ) {
        type = 'hollow-cone';
      } else if (
        n.nozzleType === 'Cone cheio' ||
        n.nozzleType.toLowerCase().includes('cone cheio') ||
        n.nozzleType.toLowerCase().includes('full cone')
      ) {
        type = 'full-cone';
      } else if (
        n.nozzleType.toLowerCase().includes('fenda') ||
        n.nozzleType.toLowerCase().includes('leque') ||
        n.nozzleType.toLowerCase().includes('flat fan')
      ) {
        type = 'flat-fan';
      }

      let use: 'vineyard' | 'orchard' | 'general' = 'general';
      if (n.sprayFunction === 'Arboricultura/Viticultura') {
        use = 'vineyard';
      } else if (n.sprayFunction === 'Culturas especiais/Pomares') {
        use = 'orchard';
      }

      entries.push({
        id: n.id,
        manufacturerId: n.brand.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        manufacturerName: n.brand,
        model: n.model,
        nozzleType: type,
        colorOrSize: n.color || n.disc || n.swirlPlate || n.isoCode || n.modelNorm || 'Padrão',
        pressureBar: n.referencePressureBar,
        referencePressureBar: n.referencePressureBar,
        nominalOutputLMin: n.nominalFlowLMin,
        pressureMinBar: n.pressureMinBar,
        pressureMaxBar: n.pressureMaxBar,
        sprayAngleDeg: n.sprayAngleDeg,
        applicableUse: use,
        sourceName: n.sourceBody || 'Catálogo Oficial do Fabricante',
        sourceUrl: n.sourceLink,
        sourceVersion: '2026-09-02'
      });
    }
  }

  return entries;
}

export const NOZZLE_CATALOG_DATABASE: NozzleCatalogEntry[] = buildNozzleCatalog();

/**
 * Retorna a lista completa de fabricantes conhecidos no projeto ordenada alfabeticamente,
 * indicando se possuem dados técnicos no catálogo verificado ou se estão em preparação.
 */
export function getAvailableManufacturers(): ManufacturerItem[] {
  const brandsWithData = new Set(NOZZLE_CATALOG_DATABASE.map((e) => e.manufacturerName));
  const allKnownBrands = Object.keys(MANUFACTURERS_DATABASE);

  for (const b of brandsWithData) {
    if (!allKnownBrands.includes(b)) {
      allKnownBrands.push(b);
    }
  }

  const items = allKnownBrands.map((brand) => {
    const hasData = brandsWithData.has(brand);
    const isTop = brand === 'Albuz' || brand === 'ASJ' || brand === 'TeeJet';

    return {
      id: brand.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: brand,
      hasData,
      statusLabel: hasData ? 'Dados técnicos verificados' : 'Dados técnicos em preparação',
      isTopSuggestion: isTop
    };
  });

  return items.sort((a, b) => a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' }));
}

/**
 * Extrai todas as pressões únicas disponíveis no catálogo filtrado.
 */
export function getAvailablePressures(
  catalog: NozzleCatalogEntry[] = NOZZLE_CATALOG_DATABASE,
  selectedManufacturerNames: string[] = [],
  familyPreference: 'hollow-cone' | 'full-cone' | 'all' = 'hollow-cone'
): number[] {
  const filtered = catalog.filter((entry) => {
    if (selectedManufacturerNames.length > 0 && !selectedManufacturerNames.includes(entry.manufacturerName)) {
      return false;
    }
    if (familyPreference === 'hollow-cone' && entry.nozzleType !== 'hollow-cone') {
      return false;
    }
    if (familyPreference === 'full-cone' && entry.nozzleType !== 'full-cone') {
      return false;
    }
    return true;
  });

  const pressures = [...new Set(filtered.map((e) => e.referencePressureBar))];
  return pressures.sort((a, b) => a - b);
}
