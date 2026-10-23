import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const CANDIDATE_CSVS = [
  path.join(ROOT_DIR, 'Cópia_de_PreInspecaoFINAL.csv'),
  path.join(ROOT_DIR, 'PreInspecaoFINAL.csv')
];
const OUTPUT_TS_PATH = path.join(
  ROOT_DIR,
  'src',
  'features',
  'pre-inspecao',
  'preInspectionData.ts'
);

const EQUIPMENT_NAME_TO_ID = {
  'Barras Horizontais': 'barras_horizontais',
  'Culturas Arbustivas': 'culturas_arbustivas',
  'Pistolas de Pulverização': 'pistolas_pulverizacao',
  'Pulverizador Fixo (Estufas)': 'pulverizador_fixo',
  Polvilhador: 'polvilhador',
  'Drones/UAV': 'drones_uas',
  'Drones / UAS': 'drones_uas'
};

/**
 * Parser CSV RFC 4180 para lidar com campos entre aspas, vírgulas internas e aspas escapadas ("").
 */
function parseCsvRecords(csvContent) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const ch = csvContent[i];
    const nextCh = csvContent[i + 1];

    if (inQuotes) {
      if (ch === '"' && nextCh === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (ch === '\r' && nextCh === '\n') {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += ch;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function generatePreInspectionData() {
  const csvPath = CANDIDATE_CSVS.find((candidate) => fs.existsSync(candidate));
  if (!csvPath) {
    throw new Error(
      'Ficheiro CSV não encontrado na raiz (esperado Cópia_de_PreInspecaoFINAL.csv ou PreInspecaoFINAL.csv).'
    );
  }

  const rawCsv = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsvRecords(rawCsv);
  const dataRows = rows.slice(1); // Ignora linha de cabeçalho

  const categoryMap = new Map();
  const categories = [];

  for (const cols of dataRows) {
    const [
      rawEquip = '',
      rawCategoria = '',
      rawPerguntaGlobal = '',
      rawInformacao = '',
      rawDica = '',
      rawSubpergunta = '',
      rawInformacaoSub = '',
      rawDicaSub = '',
      rawFalhas = ''
    ] = cols;

    const equipmentId = EQUIPMENT_NAME_TO_ID[rawEquip];
    if (!equipmentId || !rawCategoria || !rawSubpergunta) {
      continue;
    }

    const catKey = `${equipmentId}::${rawCategoria}`;
    let categoryEntry = categoryMap.get(catKey);

    if (!categoryEntry) {
      const catSlug = slugify(rawCategoria);
      categoryEntry = {
        id: `cat_${equipmentId}_${catSlug}`,
        tipoEquipamento: equipmentId,
        categoria: rawCategoria,
        perguntaGlobal: rawPerguntaGlobal,
        informacao: rawInformacao,
        dica: rawDica,
        subperguntas: []
      };
      categoryMap.set(catKey, categoryEntry);
      categories.push(categoryEntry);
    } else {
      if (!categoryEntry.perguntaGlobal && rawPerguntaGlobal) {
        categoryEntry.perguntaGlobal = rawPerguntaGlobal;
      }
      if (!categoryEntry.informacao && rawInformacao) {
        categoryEntry.informacao = rawInformacao;
      }
      if (!categoryEntry.dica && rawDica) {
        categoryEntry.dica = rawDica;
      }
    }

    const subIndex = categoryEntry.subperguntas.length + 1;
    categoryEntry.subperguntas.push({
      id: `${categoryEntry.id}_sub_${subIndex}`,
      subpergunta: rawSubpergunta,
      informacaoSub: rawInformacaoSub,
      dicaSub: rawDicaSub,
      falhas: rawFalhas
    });
  }

  const tsFileContent = `// FICHEIRO GERADO AUTOMATICAMENTE POR scripts/generatePreInspectionData.js
// Fonte: ${path.basename(csvPath)}

export type EquipmentTypeId =
  | 'barras_horizontais'
  | 'culturas_arbustivas'
  | 'pistolas_pulverizacao'
  | 'pulverizador_fixo'
  | 'polvilhador'
  | 'drones_uas';

export type EvaluationMode = 'expresso' | 'detalhado';

export type SubQuestionAnswer = 'conforme' | 'anomalia' | null;

export type EquipmentIconName = 'Tractor' | 'Fan' | 'SprayCan' | 'Factory' | 'Wind' | 'Plane';

export interface PreInspectionCsvRow {
  tipoEquipamento: string;
  categoria: string;
  perguntaGlobal: string;
  informacao: string;
  dica: string;
  subpergunta: string;
  informacaoSub: string;
  dicaSub: string;
  falhas: string;
}

export interface PreInspectionSubQuestion {
  id: string;
  subpergunta: string;
  informacaoSub: string;
  dicaSub: string;
  falhas: string;
}

export interface PreInspectionCategory {
  id: string;
  tipoEquipamento: EquipmentTypeId;
  categoria: string;
  perguntaGlobal: string;
  informacao: string;
  dica: string;
  subperguntas: PreInspectionSubQuestion[];
}

export interface EquipmentOption {
  id: EquipmentTypeId;
  title: string;
  subtitle: string;
  normativeRef?: string;
  iconName: EquipmentIconName;
  disabled?: boolean;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  {
    id: 'barras_horizontais',
    title: 'Barras Horizontais',
    subtitle: 'Culturas baixas e herbáceas',
    normativeRef: 'ISO 16122-2',
    iconName: 'Tractor',
    disabled: false
  },
  {
    id: 'culturas_arbustivas',
    title: 'Culturas Arbustivas / Arbóreas',
    subtitle: 'Atomizadores e turbopulverizadores',
    normativeRef: 'ISO 16122-3',
    iconName: 'Fan',
    disabled: false
  },
  {
    id: 'pistolas_pulverizacao',
    title: 'Pistolas de Pulverização',
    subtitle: 'Lanças manuais e semimóveis',
    normativeRef: 'ISO 16122-4',
    iconName: 'SprayCan',
    disabled: false
  },
  {
    id: 'pulverizador_fixo',
    title: 'Pulverizador Fixo (Estufas)',
    subtitle: 'Instalações fixas e semimóveis',
    normativeRef: 'ISO 16122-4',
    iconName: 'Factory',
    disabled: false
  },
  {
    id: 'polvilhador',
    title: 'Polvilhador',
    subtitle: 'Aplicação de pós secos',
    iconName: 'Wind',
    disabled: true
  },
  {
    id: 'drones_uas',
    title: 'Drones / UAS',
    subtitle: 'Pulverização aérea não tripulada',
    iconName: 'Plane',
    disabled: true
  }
];

export const PRE_INSPECTION_CATEGORIES: PreInspectionCategory[] = ${JSON.stringify(categories, null, 2)};

export const PRE_INSPECTION_MOCK_CATEGORIES = PRE_INSPECTION_CATEGORIES;

export function getCategoriesByEquipment(equipmentId: EquipmentTypeId): PreInspectionCategory[] {
  return PRE_INSPECTION_CATEGORIES.filter((cat) => cat.tipoEquipamento === equipmentId);
}
`;

  fs.writeFileSync(OUTPUT_TS_PATH, tsFileContent, 'utf8');
  console.log(
    `[generatePreInspectionData] Gerado com sucesso: ${categories.length} categorias a partir de ${path.basename(csvPath)}.`
  );
}

generatePreInspectionData();
