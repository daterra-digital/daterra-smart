// src/features/settings/equipment/equipmentCatalogData.ts
import type { CatalogSelectOption } from '../../perfis/data/cultureCatalogData.ts';
import type { EquipmentType } from '../../../schemas/equipment.schema.ts';
import { EQUIPMENT_TYPE_LABELS_PT } from '../../../lib/equipment-math.ts';

export const EQUIPMENT_TYPE_OPTIONS: CatalogSelectOption[] = [
  { id: '2D_HORIZONTAL', label: EQUIPMENT_TYPE_LABELS_PT['2D_HORIZONTAL'], code: '2D' },
  { id: '3D_AXIAL', label: EQUIPMENT_TYPE_LABELS_PT['3D_AXIAL'], code: '3D Axial' },
  { id: '3D_TANGENTIAL', label: EQUIPMENT_TYPE_LABELS_PT['3D_TANGENTIAL'], code: '3D Tangencial' },
  { id: '3D_CROSSFLOW', label: EQUIPMENT_TYPE_LABELS_PT['3D_CROSSFLOW'], code: '3D Fluxo Cruzado' },
  { id: '3D_TUNNEL', label: EQUIPMENT_TYPE_LABELS_PT['3D_TUNNEL'], code: '3D Túnel' },
  { id: '3D_PNEUMATIC', label: EQUIPMENT_TYPE_LABELS_PT['3D_PNEUMATIC'], code: '3D Pneumático' },
  { id: '3D_CANNON', label: EQUIPMENT_TYPE_LABELS_PT['3D_CANNON'], code: '3D Canhão' },
  { id: 'UAV_DRONE', label: EQUIPMENT_TYPE_LABELS_PT.UAV_DRONE, code: 'UAV' },
  { id: 'MANUAL_LANCE', label: EQUIPMENT_TYPE_LABELS_PT.MANUAL_LANCE, code: 'Manual' }
];

export const PUMP_TYPE_OPTIONS: CatalogSelectOption[] = [
  { id: 'Membrana', label: 'Membrana' },
  { id: 'Pistão', label: 'Pistão' },
  { id: 'Centrífuga', label: 'Centrífuga' },
  { id: 'Rolos', label: 'Rolos' }
];

export const AIR_CURTAIN_ANGLE_OPTIONS: CatalogSelectOption[] = [
  { id: '0° (Vertical)', label: '0° (Vertical)' },
  { id: '+15° (Frente — penetração)', label: '+15° (Frente — penetração)' },
  { id: '+30° (Frente — copa densa)', label: '+30° (Frente — copa densa)' },
  { id: '-15° (Trás — controlo deriva)', label: '-15° (Trás — controlo deriva)' },
  { id: '-30° (Trás — alta velocidade)', label: '-30° (Trás — alta velocidade)' }
];

export const SPRAYER_BRANDS: CatalogSelectOption[] = [
  'Tomix', 'Teyme', 'Hardi', 'Berthoud', 'Kuhn', 'Amazone', 'Caffini',
  'Fede', 'Ilemo', 'Nobili', 'Lochmann', 'Rocha', 'Herpa', 'Jacto',
  'John Deere', 'DJI Agras', 'XAG'
].map((b) => ({ id: b, label: b }));

export const SPRAYER_MODELS_BY_BRAND: Readonly<Record<string, string[]>> = {
  Tomix: ['Tornado 600', 'Tornado 1000', 'Tornado 1500', 'Tornado 2000', 'Hydra 600', 'Hydra 1000', 'Vega 1000'],
  Teyme: ['Eolo 1000', 'Eolo 1500', 'Eolo 2000', 'Eolo Twister', ' Unicell'],
  Hardi: ['Zaturn', 'Mercury', 'Arrow', 'Commander 3300', 'Master Plus', 'Navigator'],
  Berthoud: ['Winair', 'Fructair', 'Raptor', 'Tracker', 'Elyte'],
  Kuhn: ['Antis', 'Tornado', 'Metris', 'Lexis', 'Deltis'],
  Amazone: ['UF 1201', 'UF 1602', 'UX 3201', 'UX 4201'],
  Caffini: ['Synthesis', 'Rafal', 'Booster', 'Profarmer', 'Reverse'],
  Fede: ['Futur Qi', 'H3O', 'Inverter Qi', 'Smartomizer'],
  Ilemo: ['Arrow', 'Zaturn', 'Mercury'],
  Nobili: ['Geo 75', 'Geo 90', 'Antis', 'Vento', 'PDF'],
  Lochmann: ['RP 80', 'RP 90', 'RPS 10', 'RPT'],
  Rocha: ['Turbo 600', 'Turbo 1000', 'Turbo 1500', 'Turbo 2000', 'Vinha 800'],
  Herpa: ['Atomizador 600', 'Atomizador 1000', 'Atomizador 1500', 'Barra 600'],
  Jacto: ['Arbus 400', 'Arbus 1000', 'Arbus 2000', 'Condor 600', 'Condor 800'],
  'John Deere': ['M724', 'M732', 'R952i', 'M944'],
  'DJI Agras': ['Agras T10', 'Agras T20P', 'Agras T30', 'Agras T40', 'Agras T50'],
  XAG: ['P40', 'P100', 'P100 Pro', 'V40']
};

export const PUMP_BRANDS: CatalogSelectOption[] = [
  'Comet', 'Annovi Reverberi', 'Bertolini', 'Udor', 'Imovilli Pompe', 'Hypro', 'Hardi'
].map((b) => ({ id: b, label: b }));

export const PUMP_MODELS_BY_BRAND: Readonly<Record<string, string[]>> = {
  Comet: ['APS 71', 'APS 96', 'APS 121', 'APS 145', 'IDS 1201', 'IDS 1401'],
  'Annovi Reverberi': ['AR 115 bp', 'AR 135 bp', 'AR 160 bp', 'BHA 130', 'BHA 150'],
  Bertolini: ['PA 908', 'PA 1108', 'POLY 2150'],
  Udor: ['Zeta 85', 'Zeta 120', 'Zeta 140', 'Kappa 75', 'Kappa 120'],
  'Imovilli Pompe': ['M93', 'M123', 'M135', 'D133', 'P98'],
  Hypro: ['9303C', '9306C', 'D115', 'D135'],
  Hardi: ['1303', '364', '464']
};

export const COMMAND_BRANDS: CatalogSelectOption[] = [
  'Arag', 'TeeJet', 'Hardi', 'Müller-Elektronik', 'Trimble', 'Raven', 'Braglia', 'Geoline'
].map((b) => ({ id: b, label: b }));

export const COMMAND_MODELS_BY_BRAND: Readonly<Record<string, string[]>> = {
  Arag: ['Bravo 180', 'Bravo 180S', 'Bravo 300S', 'Bravo 400S', 'Delta 80', 'Orion'],
  TeeJet: ['Radion 8140', 'Matrix 430', 'Aeros 9040'],
  Hardi: ['HC 5500', 'HC 6500', 'HC 8600', 'HC 9600'],
  'Müller-Elektronik': ['Spraydos', 'BASIC-Terminal', 'TRACK-Leader', 'TOUCH 800'],
  Trimble: ['GFX-350', 'GFX-750', 'Field-IQ'],
  Raven: ['SCS 450', 'CR7', 'Viper 4+'],
  Braglia: ['M170', 'M200', 'Elettrico 2V'],
  Geoline: ['EVC 2', 'EVC 4', 'flowcontrol']
};

export type EquipmentCustomCatalogScope =
  | 'sprayer_brand'
  | 'sprayer_model'
  | 'pump_brand'
  | 'pump_model'
  | 'pump_type'
  | 'command_brand'
  | 'command_model';

const STORAGE_PREFIX = 'daterra_eq_catalog_v1_';

export function loadEquipmentCustomOptions(
  userId: string,
  scope: EquipmentCustomCatalogScope,
  parentBrand?: string
): CatalogSelectOption[] {
  if (typeof window === 'undefined' || !window.localStorage || !userId.trim()) return [];
  const key = `${STORAGE_PREFIX}${userId.trim()}_${scope}_${(parentBrand || '').trim().toLowerCase()}`;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addEquipmentCustomOption(
  userId: string,
  scope: EquipmentCustomCatalogScope,
  label: string,
  parentBrand?: string
): CatalogSelectOption {
  const cleaned = label.replace(/\s+/g, ' ').trim();
  const opt: CatalogSelectOption = { id: cleaned, label: cleaned, isPendingLocal: true };
  if (typeof window === 'undefined' || !window.localStorage || !userId.trim()) return opt;
  const key = `${STORAGE_PREFIX}${userId.trim()}_${scope}_${(parentBrand || '').trim().toLowerCase()}`;
  const existing = loadEquipmentCustomOptions(userId, scope, parentBrand);
  if (!existing.some((x) => x.label.toLowerCase() === cleaned.toLowerCase())) {
    try {
      window.localStorage.setItem(key, JSON.stringify([...existing, opt]));
    } catch {
      // Ignorar quota
    }
  }
  return opt;
}

export function getEquipmentTypeLabel(type: EquipmentType): string {
  return EQUIPMENT_TYPE_LABELS_PT[type] ?? EQUIPMENT_TYPE_OPTIONS[0].label;
}
