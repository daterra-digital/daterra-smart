// src/features/settings/equipment/equipmentFormHelpers.ts
import type {
  EquipmentAccordionId,
  EquipmentEditorTarget,
  EquipmentKeypadField,
  EquipmentV12FormState
} from './equipmentFormState.ts';
import type { EquipmentType } from '../../../schemas/equipment.schema.ts';
import { getUavKeypadConfig, type UavKeypadField } from './equipmentUavHelpers.ts';

export const EQUIPMENT_TYPE_META: Readonly<
  Record<EquipmentType, { badge: '2D' | '3D' | 'UAV' | 'Manual'; label: string; shortLabel: string }>
> = {
  '2D_HORIZONTAL': { badge: '2D', label: 'Barra Horizontal 2D', shortLabel: 'Barra Horizontal' },
  '3D_AXIAL': { badge: '3D', label: 'Ventilador Axial 3D', shortLabel: 'Ventilador Axial' },
  '3D_TANGENTIAL': { badge: '3D', label: 'Ventilador Tangencial 3D', shortLabel: 'Tangencial 3D' },
  '3D_CROSSFLOW': { badge: '3D', label: 'Ventilador Fluxo Cruzado 3D', shortLabel: 'Fluxo Cruzado 3D' },
  '3D_TUNNEL': { badge: '3D', label: 'Túnel 3D', shortLabel: 'Túnel 3D' },
  '3D_PNEUMATIC': { badge: '3D', label: 'Pneumático 3D', shortLabel: 'Pneumático 3D' },
  '3D_CANNON': { badge: '3D', label: 'Canhão 3D', shortLabel: 'Canhão 3D' },
  UAV_DRONE: { badge: 'UAV', label: 'Drone UAV', shortLabel: 'Drone UAV' },
  MANUAL_LANCE: { badge: 'Manual', label: 'Manual', shortLabel: 'Manual' }
};

export interface EquipmentKeypadConfig {
  label: string;
  unit: string;
  initialValue: string;
  commonValues: number[];
  maxDecimals: number;
  allowDecimal: boolean;
}

export function getEquipmentKeypadConfig(
  field: EquipmentKeypadField,
  form: EquipmentV12FormState
): EquipmentKeypadConfig {
  if (field.startsWith('uav')) return getUavKeypadConfig(field as UavKeypadField, form);
  const map: Record<Exclude<EquipmentKeypadField, UavKeypadField>, EquipmentKeypadConfig> = {
    tankCapacityL: {
      label: 'Capacidade do Depósito',
      unit: 'L',
      initialValue: form.tankCapacityL,
      commonValues: [400, 600, 1000, 1500, 2000, 3000],
      maxDecimals: 0,
      allowDecimal: false
    },
    manufactureYear: {
      label: 'Ano de Construção',
      unit: 'Ano',
      initialValue: form.manufactureYear,
      commonValues: [2018, 2020, 2022, 2024, 2025, 2026],
      maxDecimals: 0,
      allowDecimal: false
    },
    workingWidthM: {
      label: 'Nº Bicos',
      unit: 'bicos',
      initialValue: form.workingWidthM,
      commonValues: [8, 10, 12, 14, 16, 20, 24],
      maxDecimals: 0,
      allowDecimal: false
    },
    nozzleSpacingCm: {
      label: 'Espaçamento entre Bicos',
      unit: 'cm',
      initialValue: form.nozzleSpacingCm,
      commonValues: [25, 35, 40, 50],
      maxDecimals: 1,
      allowDecimal: true
    },
    defaultPressureBar: {
      label: 'Pressão Habitual',
      unit: 'bar',
      initialValue: form.defaultPressureBar,
      commonValues: [2.5, 3.0, 5.0, 8.0, 10.0, 12.0],
      maxDecimals: 1,
      allowDecimal: true
    },
    defaultSpeedKmh: {
      label: 'Velocidade Habitual',
      unit: 'km/h',
      initialValue: form.defaultSpeedKmh,
      commonValues: [4.5, 5.5, 6.0, 6.5, 7.0, 8.0],
      maxDecimals: 1,
      allowDecimal: true
    },
    defaultAirflowM3h: {
      label: 'Caudal de ar do ventilador',
      unit: 'm³/h',
      initialValue: form.defaultAirflowM3h,
      commonValues: [1200, 1800, 2400, 15000, 25000, 35000],
      maxDecimals: 0,
      allowDecimal: false
    },
    lanceCount: {
      label: 'Nº de Pistolas / Lanças',
      unit: 'un.',
      initialValue: form.lanceCount,
      commonValues: [1, 2, 4],
      maxDecimals: 0,
      allowDecimal: false
    },
    hoseLengthM: {
      label: 'Comprimento da Mangueira',
      unit: 'm',
      initialValue: form.hoseLengthM,
      commonValues: [25, 50, 100, 150],
      maxDecimals: 1,
      allowDecimal: true
    },
    sectionsCount: {
      label: 'Nº de Secções',
      unit: '',
      initialValue: form.sectionsCount,
      commonValues: [2, 4, 5, 7, 9],
      maxDecimals: 0,
      allowDecimal: false
    },
    manometerDiameterMm: {
      label: 'Diâmetro do Manómetro',
      unit: 'mm',
      initialValue: form.manometerDiameterMm,
      commonValues: [63, 100],
      maxDecimals: 0,
      allowDecimal: false
    },
    manometerDivisionsBar: {
      label: 'Divisões da Escala',
      unit: 'bar',
      initialValue: form.manometerDivisionsBar,
      commonValues: [0.1, 0.2, 0.5, 1.0],
      maxDecimals: 2,
      allowDecimal: true
    },
    manometerMaxScaleBar: {
      label: 'Valor Máximo da Escala',
      unit: 'bar',
      initialValue: form.manometerMaxScaleBar,
      commonValues: [10, 16, 20, 25, 40],
      maxDecimals: 1,
      allowDecimal: true
    },
    manometerErrorClassPct: {
      label: 'Classe de Erro',
      unit: '%',
      initialValue: form.manometerErrorClassPct,
      commonValues: [1.0, 1.6, 2.5],
      maxDecimals: 2,
      allowDecimal: true
    },
    manometerMaxPressureBar: {
      label: 'Pressão Máxima',
      unit: 'bar',
      initialValue: form.manometerMaxPressureBar,
      commonValues: [10, 15, 20, 25],
      maxDecimals: 1,
      allowDecimal: true
    }
  };
  return map[field as Exclude<EquipmentKeypadField, UavKeypadField>];
}

export function resolveInitialOpenAccordions(target: EquipmentEditorTarget): Record<EquipmentAccordionId, boolean> {
  if (target === 'distribution') {
    return { ident: false, nozzles: false, distrib: true, bomba: false, comandos: false, manometro: false, inspecao: false };
  }
  if (target === 'inspection') {
    return { ident: false, nozzles: false, distrib: false, bomba: true, comandos: true, manometro: true, inspecao: true };
  }
  return { ident: true, nozzles: false, distrib: target === 'new', bomba: false, comandos: false, manometro: false, inspecao: false };
}

export function resolveEquipmentEditorMeta(target: EquipmentEditorTarget, name: string, editingId?: string) {
  const refName = name.trim() || 'Novo equipamento';
  if (!editingId || target === 'new') {
    return {
      title: 'Novo Equipamento',
      subtitle: 'Identificação, parâmetros operacionais e inspeção',
      submitLabel: 'Criar Equipamento'
    };
  }
  const sectionLabel =
    target === 'distribution'
      ? 'Distribuição e Aerodinâmica'
      : target === 'inspection'
        ? 'Características do Pulverizador'
        : 'Identificação da Máquina';
  return {
    title: `A editar: ${sectionLabel} · ${refName}`,
    subtitle: 'Altere os parâmetros e guarde para atualizar a ficha',
    submitLabel: 'Guardar Alterações'
  };
}
