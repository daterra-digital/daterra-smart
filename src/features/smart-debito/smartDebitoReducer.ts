/**
 * DATERRA Smart - Gestão de Estado Normalizado para Smart Débito
 * Ficheiro: src/features/smart-debito/smartDebitoReducer.ts
 *
 * Utiliza useReducer com dicionário normalizado slots["${level}-${side}"]
 * para garantir máxima performance sem re-renders desnecessários.
 *
 * REGRAS ESTRITAS: Termos interditos estritamente excluídos. UI sem menção a "caudal".
 */

import type {
  SmartDebitoState,
  SmartDebitoAction,
  NozzleSlot,
  SlotKey,
  NozzleSide,
  SectorConfig
} from './types';
import { convertLMinToRaw } from './types';
import { DEFAULT_NOZZLE_PRESET } from './nozzlePresets';
import { mapEnsaioRecordsToSlots } from './smartDebitoParser';
import {
  DEFAULT_CO_BRANDING,
  getStoredCoBrandingConfig,
  saveStoredCoBrandingConfig
} from './coBrandingStorage';

export { DEFAULT_CO_BRANDING };

/**
 * Cria setores predefinidos para a barra (1 a 10 setores).
 * O utilizador apenas define o Lado do Setor 1 ('left' ou 'right');
 * todos os restantes setores adaptam-se sequencialmente.
 */
export function createDefaultSectors(
  numSectors: number,
  startSide: 'left' | 'right' = 'left'
): SectorConfig[] {
  const count = Math.max(1, Math.min(10, Math.round(numSectors)));
  const sectors: SectorConfig[] = [];

  if (count === 1) {
    return [{ id: 1, side: 'center', numNozzles: 24, startLineTxt: 1 }];
  }

  for (let i = 1; i <= count; i++) {
    const idx = i - 1;
    let side: 'left' | 'right' | 'center' = 'left';

    if (count % 2 === 1 && idx === Math.floor(count / 2)) {
      side = 'center';
    } else {
      const isFirstHalf = idx < Math.floor(count / 2);
      if (startSide === 'left') {
        side = isFirstHalf ? 'left' : 'right';
      } else {
        side = isFirstHalf ? 'right' : 'left';
      }
    }

    let numNozzles = Math.max(1, Math.round(24 / count));
    if (count === 3) {
      numNozzles = i === 2 ? 4 : 10;
    }

    sectors.push({
      id: i,
      side,
      numNozzles,
      startLineTxt: i === 1 ? 1 : null
    });
  }

  return sectors;
}

/**
 * Cria o conjunto inicial normalizado de slots para N níveis.
 */
export function createSlotsForLevels(
  numLevels: number,
  existingSlots: Record<string, NozzleSlot> = {},
  defaultTemplate = DEFAULT_NOZZLE_PRESET
): Record<string, NozzleSlot> {
  const newSlots: Record<string, NozzleSlot> = {};
  const sides: NozzleSide[] = ['left', 'right'];

  for (let level = 1; level <= numLevels; level++) {
    for (const side of sides) {
      const id: SlotKey = `${level}-${side}`;
      if (existingSlots[id]) {
        newSlots[id] = { ...existingSlots[id], level, side };
      } else {
        newSlots[id] = {
          id,
          level,
          side,
          isActive: true,
          brand: defaultTemplate.brand,
          model: defaultTemplate.model,
          color: defaultTemplate.color,
          referencePressureBar: defaultTemplate.referencePressureBar,
          nominalFlowLMin: defaultTemplate.nominalFlowLMin,
          measuredFlowRate: null,
          measurementUnit: 'L/min',
          rawMeasuredValue: null
        };
      }
    }
  }

  return newSlots;
}

/**
 * Cria o estado inicial do Smart Débito.
 */
export function createInitialSmartDebitoState(
  initialLevels = 7
): SmartDebitoState {
  const today = new Date().toISOString().split('T')[0];
  const initialSectors = createDefaultSectors(3, 'left');
  const totalNozzles = initialSectors.reduce((sum, s) => sum + s.numNozzles, 0);
  const actualLevels = Math.max(initialLevels, Math.ceil(totalNozzles / 2));

  return {
    numLevels: actualLevels,
    standard: 'ISO_16122_2', // Padrão Culturas Baixas / Barras Horizontais
    testPressureBar: 10.0,   // Pressão de Ensaio inicial recomendada (10.0 bar para ATR 80)
    slots: createSlotsForLevels(actualLevels),
    numSectors: 3,
    startSide: 'left',
    sectors: initialSectors,
    fileOffset: 1,
    importedFileName: null,
    lastImportedCount: null,
    operatorName: 'Técnico Especialista DATERRA',
    machineModel: 'Atomizador Turbina 2000L',
    machineRegistration: 'AB-88-CD',
    inspectionDate: today,
    notes: 'Ensaio oficial de conformidade periódica segundo a norma ISO 16122.',
    globalMeasurementUnit: 'L/min',
    coBranding: getStoredCoBrandingConfig(),
    isPremiumUser: true,
    availableCredits: 5
  };
}

/**
 * Reducer atómico para o Smart Débito.
 */
export function smartDebitoReducer(
  state: SmartDebitoState,
  action: SmartDebitoAction
): SmartDebitoState {
  switch (action.type) {
    case 'SET_NUM_LEVELS': {
      const targetLevels = Math.max(1, Math.min(30, Math.round(action.payload)));
      if (targetLevels === state.numLevels) return state;

      const updatedSlots = createSlotsForLevels(targetLevels, state.slots);
      return {
        ...state,
        numLevels: targetLevels,
        slots: updatedSlots
      };
    }

    case 'SET_STANDARD': {
      const newStandard = action.payload;
      if (newStandard === state.standard) return state;

      if (newStandard === 'ISO_16122_3') {
        // No modo ISO 16122-3 (Culturas 3D), o número predefinido de níveis é 6 (12 bicos totais: 6 Esq + 6 Dir)
        const defaultLevels = 6;
        const updatedSlots = createSlotsForLevels(defaultLevels, state.slots);
        return {
          ...state,
          standard: newStandard,
          numLevels: defaultLevels,
          slots: updatedSlots
        };
      }

      if (newStandard === 'ISO_16122_2') {
        // No modo ISO 16122-2 (Culturas Baixas), adapta os níveis ao somatório de bicos dos setores
        const totalNozzles = (state.sectors || []).reduce((sum, s) => sum + s.numNozzles, 0) || 24;
        const targetLevels = Math.max(1, Math.min(30, Math.ceil(totalNozzles / 2)));
        const updatedSlots = createSlotsForLevels(targetLevels, state.slots);
        return {
          ...state,
          standard: newStandard,
          numLevels: targetLevels,
          slots: updatedSlots
        };
      }

      return {
        ...state,
        standard: newStandard
      };
    }

    case 'SET_TEST_PRESSURE': {
      const pressure = action.payload;
      return {
        ...state,
        testPressureBar: pressure !== null && !Number.isNaN(pressure) && pressure > 0 ? Number(pressure.toFixed(2)) : null
      };
    }

    case 'UPDATE_SLOT': {
      const { id, updates } = action.payload;
      const current = state.slots[id];
      if (!current) return state;

      return {
        ...state,
        slots: {
          ...state.slots,
          [id]: {
            ...current,
            ...updates
          }
        }
      };
    }

    case 'TOGGLE_SLOT_ACTIVE': {
      const { id } = action.payload;
      const current = state.slots[id];
      if (!current) return state;

      return {
        ...state,
        slots: {
          ...state.slots,
          [id]: {
            ...current,
            isActive: !current.isActive
          }
        }
      };
    }

    case 'APPLY_NOZZLE_TO_ALL': {
      const nozzle = action.payload;
      const updatedSlots: Record<string, NozzleSlot> = {};

      for (const key in state.slots) {
        const slot = state.slots[key];
        updatedSlots[key] = {
          ...slot,
          brand: nozzle.brand,
          model: nozzle.model,
          color: nozzle.color,
          referencePressureBar: nozzle.referencePressureBar,
          nominalFlowLMin: nozzle.nominalFlowLMin,
          swirlPlate: nozzle.swirlPlate,
          disc: nozzle.disc,
          isIsoNozzle: nozzle.isIsoNozzle,
          isoCode: nozzle.isoCode
        };
      }

      return {
        ...state,
        slots: updatedSlots
      };
    }

    case 'APPLY_NOZZLE_TO_SIDE': {
      const { side, nozzle } = action.payload;
      const updatedSlots: Record<string, NozzleSlot> = {};

      for (const key in state.slots) {
        const slot = state.slots[key];
        if (slot.side === side) {
          updatedSlots[key] = {
            ...slot,
            brand: nozzle.brand,
            model: nozzle.model,
            color: nozzle.color,
            referencePressureBar: nozzle.referencePressureBar,
            nominalFlowLMin: nozzle.nominalFlowLMin,
            swirlPlate: nozzle.swirlPlate,
            disc: nozzle.disc,
            isIsoNozzle: nozzle.isIsoNozzle,
            isoCode: nozzle.isoCode
          };
        } else {
          updatedSlots[key] = slot;
        }
      }

      return {
        ...state,
        slots: updatedSlots
      };
    }

    case 'COPY_PREVIOUS_NOZZLE': {
      const { targetId } = action.payload;
      const targetSlot = state.slots[targetId];
      if (!targetSlot || targetSlot.level <= 1) return state;

      const sourceId: SlotKey = `${targetSlot.level - 1}-${targetSlot.side}`;
      const sourceSlot = state.slots[sourceId];
      if (!sourceSlot) return state;

      return {
        ...state,
        slots: {
          ...state.slots,
          [targetId]: {
            ...targetSlot,
            brand: sourceSlot.brand,
            model: sourceSlot.model,
            color: sourceSlot.color,
            referencePressureBar: sourceSlot.referencePressureBar,
            nominalFlowLMin: sourceSlot.nominalFlowLMin,
            swirlPlate: sourceSlot.swirlPlate,
            disc: sourceSlot.disc,
            isIsoNozzle: sourceSlot.isIsoNozzle,
            isoCode: sourceSlot.isoCode
          }
        }
      };
    }

    case 'SET_FILE_OFFSET': {
      const offset = Math.max(1, Math.round(action.payload));
      return {
        ...state,
        fileOffset: offset
      };
    }

    case 'APPLY_ENSAIO_DATA': {
      const { records, offset, fileName, detectedPressure } = action.payload;
      const { updatedSlots, mappedCount } = mapEnsaioRecordsToSlots(
        records,
        offset,
        state.slots,
        state.numLevels,
        'left_then_right'
      );

      const nextPressure =
        state.testPressureBar !== null
          ? state.testPressureBar
          : detectedPressure !== null && detectedPressure !== undefined
          ? detectedPressure
          : null;

      return {
        ...state,
        slots: updatedSlots,
        fileOffset: offset,
        importedFileName: fileName || state.importedFileName,
        lastImportedCount: mappedCount,
        testPressureBar: nextPressure
      };
    }

    case 'SET_MEASURED_FLOW': {
      const { id, flowRate } = action.payload;
      const current = state.slots[id];
      if (!current) return state;

      return {
        ...state,
        slots: {
          ...state.slots,
          [id]: {
            ...current,
            measuredFlowRate: flowRate
          }
        }
      };
    }

    case 'SET_GLOBAL_MEASUREMENT_UNIT':
    case 'APPLY_UNIT_TO_ALL': {
      const newUnit = action.payload;
      const updatedSlots: Record<string, NozzleSlot> = {};
      for (const key in state.slots) {
        const slot = state.slots[key];
        const newRaw =
          slot.measuredFlowRate !== null && slot.measuredFlowRate !== undefined
            ? convertLMinToRaw(slot.measuredFlowRate, newUnit)
            : null;
        updatedSlots[key] = {
          ...slot,
          measurementUnit: newUnit,
          rawMeasuredValue: newRaw
        };
      }
      return {
        ...state,
        globalMeasurementUnit: newUnit,
        slots: updatedSlots
      };
    }

    case 'UPDATE_SLOT_UNIT': {
      const { id, unit } = action.payload;
      const current = state.slots[id];
      if (!current) return state;

      const newRaw =
        current.measuredFlowRate !== null && current.measuredFlowRate !== undefined
          ? convertLMinToRaw(current.measuredFlowRate, unit)
          : null;

      return {
        ...state,
        slots: {
          ...state.slots,
          [id]: {
            ...current,
            measurementUnit: unit,
            rawMeasuredValue: newRaw
          }
        }
      };
    }

    case 'CLEAR_MEASUREMENTS': {
      const updatedSlots: Record<string, NozzleSlot> = {};
      for (const key in state.slots) {
        updatedSlots[key] = {
          ...state.slots[key],
          measuredFlowRate: null,
          rawMeasuredValue: null
        };
      }
      return {
        ...state,
        slots: updatedSlots,
        lastImportedCount: null
      };
    }

    case 'SET_NUM_SECTORS': {
      const count = Math.max(1, Math.min(10, Math.round(action.payload)));
      const newSectors = createDefaultSectors(count, state.startSide);
      const totalNozzles = newSectors.reduce((sum, s) => sum + s.numNozzles, 0);
      const targetLevels = Math.max(1, Math.min(30, Math.ceil(totalNozzles / 2)));
      const updatedSlots = createSlotsForLevels(targetLevels, state.slots);
      return {
        ...state,
        numSectors: count,
        sectors: newSectors,
        numLevels: targetLevels,
        slots: updatedSlots
      };
    }

    case 'SET_START_SIDE': {
      const startSide = action.payload;
      const count = state.sectors.length;
      const updatedSectors = state.sectors.map((s, idx) => {
        let side: 'left' | 'right' | 'center' = 'left';
        if (count % 2 === 1 && idx === Math.floor(count / 2)) {
          side = 'center';
        } else {
          const isFirstHalf = idx < Math.floor(count / 2);
          if (startSide === 'left') {
            side = isFirstHalf ? 'left' : 'right';
          } else {
            side = isFirstHalf ? 'right' : 'left';
          }
        }
        return { ...s, side };
      });

      return {
        ...state,
        startSide,
        sectors: updatedSectors
      };
    }

    case 'UPDATE_SECTOR': {
      const { id, updates } = action.payload;
      const updatedSectors = state.sectors.map((s) => (s.id === id ? { ...s, ...updates } : s));
      const totalNozzles = updatedSectors.reduce((sum, s) => sum + s.numNozzles, 0);
      const targetLevels = Math.max(1, Math.min(30, Math.ceil(totalNozzles / 2)));
      const updatedSlots = createSlotsForLevels(targetLevels, state.slots);
      return {
        ...state,
        sectors: updatedSectors,
        numLevels: targetLevels,
        slots: updatedSlots
      };
    }

    case 'SET_MACHINE_INFO': {
      return {
        ...state,
        ...action.payload
      };
    }

    case 'UPDATE_CO_BRANDING': {
      const updated = {
        ...state.coBranding,
        ...action.payload
      };
      saveStoredCoBrandingConfig(updated);
      return {
        ...state,
        coBranding: updated
      };
    }

    case 'SET_CREDITS': {
      const credits = Math.max(0, action.payload);
      return {
        ...state,
        availableCredits: credits,
        isPremiumUser: credits > 0
      };
    }

    case 'DEDUCT_CREDIT': {
      const newCredits = Math.max(0, state.availableCredits - 1);
      return {
        ...state,
        availableCredits: newCredits,
        isPremiumUser: newCredits > 0
      };
    }

    case 'RESET_STATE': {
      return createInitialSmartDebitoState(state.numLevels);
    }

    default:
      return state;
  }
}
