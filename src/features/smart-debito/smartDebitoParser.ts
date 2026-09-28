/**
 * DATERRA Smart - Utilitário de Parsing para Ficheiros de Bancadas de Ensaio
 * Ficheiro: src/features/smart-debito/smartDebitoParser.ts
 *
 * Processa ficheiros .txt exportados por bancadas e equipamentos de ensaio.
 * Formato padrão: delimitado por ponto e vírgula (;), com vírgulas decimais (,).
 * Exemplo de dados:
 * N°;Débito(l/min);Pressão;Ref
 * 1;1,18;3,00;Bico 1
 * 2;1,21;3,00;Bico 2
 *
 * REGRAS ESTRITAS DE NOMENCLATURA:
 * - Termos estritamente protegidos e interditos.
 * - Na UI utiliza exclusivamente "débito".
 */

import type {
  EnsaioRawRecord,
  EnsaioParseResult,
  NozzleSlot,
  SlotKey
} from './types';

/**
 * Converte strings numéricas com vírgula ou ponto decimal para number float seguro.
 */
export function parseDecimalSafe(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.trim().replace(',', '.');
  const num = Number.parseFloat(cleaned);
  return Number.isNaN(num) ? null : num;
}

/**
 * Faz o parse do ficheiro de texto exportado pelo equipamento de ensaio.
 */
export function parseEnsaioFileContent(content: string): EnsaioParseResult {
  const lines = content.split(/\r?\n/);
  const records: EnsaioRawRecord[] = [];
  const warnings: string[] = [];

  let headerIndex = -1;
  let colIndexNozzle = 0;
  let colIndexFlow = 1;
  let colIndexPressure = 2;
  let colIndexRef = 3;

  // Analisa as primeiras 15 linhas para identificar o cabeçalho
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('#')) continue;

    const cols = rawLine.split(';').map((c) => c.trim().toLowerCase());
    // Procura pistas de colunas de débito ou número
    const hasFlowCol = cols.some(
      (c) =>
        c.includes('debito') ||
        c.includes('débito') ||
        c.includes('flow') ||
        c.includes('l/min') ||
        c.includes('output') ||
        c.includes('caudal') // parser flexível para ficheiros legados de hardware
    );
    const hasNozzleCol = cols.some(
      (c) =>
        c.includes('n°') ||
        c.includes('nº') ||
        c.includes('no') ||
        c.includes('bico') ||
        c.includes('boquilla') ||
        c.includes('pos')
    );

    if (hasFlowCol || hasNozzleCol) {
      headerIndex = i;

      cols.forEach((col, idx) => {
        if (
          col.includes('n°') ||
          col.includes('nº') ||
          col.includes('no') ||
          col.includes('bico') ||
          col.includes('boquilla') ||
          col.includes('pos')
        ) {
          colIndexNozzle = idx;
        } else if (
          col.includes('debito') ||
          col.includes('débito') ||
          col.includes('flow') ||
          col.includes('l/min') ||
          col.includes('output') ||
          col.includes('caudal')
        ) {
          colIndexFlow = idx;
        } else if (
          col.includes('presi') ||
          col.includes('press') ||
          col.includes('bar')
        ) {
          colIndexPressure = idx;
        } else if (col.includes('ref') || col.includes('nota') || col.includes('obs')) {
          colIndexRef = idx;
        }
      });
      break;
    }
  }

  const startLine = headerIndex >= 0 ? headerIndex + 1 : 0;
  let detectedPressure: number | null = null;
  let nonZeroPressureCount = 0;
  let totalPressureSum = 0;

  for (let i = startLine; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith('#')) continue;

    const cols = rawLine.split(';');
    if (cols.length < 2) continue;

    const nozzleNum = parseDecimalSafe(cols[colIndexNozzle]);
    const flowRate = parseDecimalSafe(cols[colIndexFlow]);
    const pressure = parseDecimalSafe(cols[colIndexPressure]);
    const ref = cols[colIndexRef]?.trim() || `Linha ${i + 1}`;

    if (flowRate !== null && !Number.isNaN(flowRate)) {
      records.push({
        lineIndex: i + 1, // 1-based no ficheiro físico
        nozzleNumber: nozzleNum ? Math.round(nozzleNum) : null,
        flowRate: Number(flowRate.toFixed(3)),
        pressure: pressure !== null && pressure > 0 ? Number(pressure.toFixed(2)) : null,
        reference: ref
      });

      if (pressure !== null && pressure > 0) {
        totalPressureSum += pressure;
        nonZeroPressureCount++;
      }
    }
  }

  if (records.length === 0) {
    return {
      success: false,
      records: [],
      totalLines: lines.length,
      detectedPressure: null,
      hasPressureColumn: false,
      warnings: ['Nenhuma linha de medição válida encontrada com o delimitador ";"'],
      error: 'Ficheiro sem registos numéricos válidos. Verifique se o separador é ";" e os valores contêm débito em l/min.'
    };
  }

  if (nonZeroPressureCount > 0) {
    detectedPressure = Number((totalPressureSum / nonZeroPressureCount).toFixed(2));
  } else {
    warnings.push(
      'Ficheiro não contém dados válidos de pressão. A Pressão de Ensaio (P2) deve ser inserida manualmente na interface.'
    );
  }

  return {
    success: true,
    records,
    totalLines: lines.length,
    detectedPressure,
    hasPressureColumn: nonZeroPressureCount > 0,
    warnings
  };
}

/**
 * Ordem de mapeamento dos bicos na máquina.
 */
export type SlotMappingOrder =
  | 'left_then_right'   // Lado Esquerdo (Níveis 1..N) seguido de Lado Direito (Níveis 1..N)
  | 'right_then_left'   // Lado Direito (Níveis 1..N) seguido de Lado Esquerdo (Níveis 1..N)
  | 'alternating_level'; // Nível 1 (Esq, Dir), Nível 2 (Esq, Dir), etc.

/**
 * Distribui sequencialmente os registos do equipamento de ensaio a partir da linha de offset
 * pelos slots ativos da grelha da máquina, saltando estritamente os bicos inativos.
 */
export function mapEnsaioRecordsToSlots(
  records: EnsaioRawRecord[],
  offset1Based: number,
  currentSlots: Record<string, NozzleSlot>,
  numLevels: number,
  order: SlotMappingOrder = 'left_then_right'
): {
  updatedSlots: Record<string, NozzleSlot>;
  mappedCount: number;
  skippedInactiveCount: number;
  remainingRecordsCount: number;
} {
  const updatedSlots: Record<string, NozzleSlot> = { ...currentSlots };

  // Gera a lista ordenada de chaves de slot segundo a ordem selecionada
  const orderedSlotKeys: SlotKey[] = [];

  if (order === 'left_then_right') {
    for (let level = 1; level <= numLevels; level++) {
      orderedSlotKeys.push(`${level}-left`);
    }
    for (let level = 1; level <= numLevels; level++) {
      orderedSlotKeys.push(`${level}-right`);
    }
  } else if (order === 'right_then_left') {
    for (let level = 1; level <= numLevels; level++) {
      orderedSlotKeys.push(`${level}-right`);
    }
    for (let level = 1; level <= numLevels; level++) {
      orderedSlotKeys.push(`${level}-left`);
    }
  } else {
    // Alternating
    for (let level = 1; level <= numLevels; level++) {
      orderedSlotKeys.push(`${level}-left`);
      orderedSlotKeys.push(`${level}-right`);
    }
  }

  // Identifica o índice de início no array de registos (1-based -> 0-based)
  const safeOffset = Math.max(1, offset1Based);
  const startIndex = safeOffset - 1;

  let recordCursor = startIndex;
  let mappedCount = 0;
  let skippedInactiveCount = 0;

  for (const slotKey of orderedSlotKeys) {
    const slot = updatedSlots[slotKey];
    if (!slot) continue;

    // Regra estrita: Ignora no mapeamento as células inativas (bicos fechados)
    if (!slot.isActive) {
      skippedInactiveCount++;
      continue;
    }

    if (recordCursor < records.length) {
      const record = records[recordCursor];
      updatedSlots[slotKey] = {
        ...slot,
        measuredFlowRate: record.flowRate
      };
      recordCursor++;
      mappedCount++;
    } else {
      // Sem mais registos no ficheiro
      break;
    }
  }

  const remainingRecordsCount = Math.max(0, records.length - recordCursor);

  return {
    updatedSlots,
    mappedCount,
    skippedInactiveCount,
    remainingRecordsCount
  };
}
