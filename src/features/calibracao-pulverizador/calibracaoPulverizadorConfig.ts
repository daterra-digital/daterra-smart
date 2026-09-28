/**
 * DATERRA Smart - Configuração Declarativa Oficial
 * Ferramenta: Calibração Pulverizador (calc_calibracao_pulverizador)
 * Fase A: Planeamento de volume de calda e produto por LWA/TRV — EPPO
 */

import type { CalculatorDefinition, ValidationResult } from '../calculators/core/types.ts';
import type { StructuredValue } from '../../types/calculator.ts';
import {
  calculateCalibracaoPulverizadorPure
} from './calibracaoPulverizadorEngine.ts';
import {
  validateCalibracaoPulverizador
} from './calibracaoPulverizadorValidation.ts';
import type {
  CalibracaoMetodo,
  CanopyDensityTierId,
  DoseType,
  LwaVThicknessId,
  LwaVStageId
} from './calibracaoPulverizadorTypes.ts';

export const calibracaoPulverizadorConfig: CalculatorDefinition = {
  id: 'calc_calibracao_pulverizador',
  version: '1.0.0',
  title: 'Calibração Pulverizador',
  subtitle: 'Planeamento de volume de calda e produto por LWA/TRV.',
  category: 'Calibração',
  badgeLabel: 'Planeamento EPPO',
  generalHelpFile: 'CalibracaoPulverizadorGuide.md',
  invalidResultNotice:
    'Resultado indisponível. Verifique as dimensões da vegetação e o preenchimento dos parâmetros.',

  defaultModeId: 'lwa',
  modes: [
    {
      id: 'lwa',
      label: 'LWA',
      icon: 'layers',
      description: 'Área de parede foliar em sebes contínuas ou vinha (m²/ha).',
      fieldIds: [
        'treatedHeightM',
        'rowSpacingM',
        'treatedSides',
        'adoptedSprayVolumeLHa',
        'finalTankVolumeL',
        'doseValue',
        'travelSpeedKmH',
        'workingWidthM',
        'activeNozzleCount'
      ],
      resultIds: [
        'primaryResult',
        'produtoPorDeposito',
        'doseEquivalenteHa',
        'taxaLwa',
        'lwaHa',
        'areaPorDeposito',
        'depositosPorHa',
        'volCaldaAdotado',
        'caudalTotalNecessario',
        'caudalMedioPorBico',
        'tempoTeoricoPorHa'
      ]
    },
    {
      id: 'trv',
      label: 'TRV',
      icon: 'trees',
      description: 'Volume tridimensional de copa em pomares e árvores (m³/ha).',
      fieldIds: [
        'treatedHeightM',
        'canopyWidthM',
        'rowSpacingM',
        'finalTankVolumeL',
        'doseValue',
        'travelSpeedKmH',
        'workingWidthM',
        'activeNozzleCount'
      ],
      resultIds: [
        'primaryResult',
        'produtoPorDeposito',
        'doseEquivalenteHa',
        'trvM3PerHa',
        'areaPorDeposito',
        'depositosPorHa',
        'caudalTotalNecessario',
        'caudalMedioPorBico',
        'tempoTeoricoPorHa'
      ]
    }
  ],

  fields: [
    // 1. Altura da vegetação / copa tratada (h)
    {
      id: 'treatedHeightM',
      canonicalKey: 'canopy_height',
      label: 'Altura da vegetação tratada',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 1.8,
      allowedUnits: ['m'],
      presets: [1.2, 1.5, 1.8, 2.2],
      getDynamicPresets: (values) => {
        const mode = values['mode'];
        if (mode === 'trv') {
          return [2.0, 2.5, 3.0, 3.5];
        }
        return [1.2, 1.5, 1.8, 2.2];
      },
      required: true,
      min: 0.4,
      max: 8.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Altura vertical efetiva da sebe ou copa foliar tratada (m).'
    },

    // 2. Largura média da copa tratada (w) - TRV exclusivo
    {
      id: 'canopyWidthM',
      canonicalKey: 'canopy_width',
      label: 'Largura média da copa tratada',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 1.5,
      allowedUnits: ['m'],
      presets: [1.0, 1.5, 2.0, 2.5],
      required: true,
      min: 0.3,
      max: 6.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Largura média transversal da copa tratada (m).'
    },

    // 3. Distância entrelinhas (r)
    {
      id: 'rowSpacingM',
      canonicalKey: 'row_spacing',
      label: 'Distância entrelinhas',
      dimension: 'length',
      defaultUnit: 'm',
      defaultValue: 2.5,
      allowedUnits: ['m'],
      presets: [1.8, 2.2, 2.5, 3.0],
      getDynamicPresets: (values) => {
        const mode = values['mode'];
        if (mode === 'trv') {
          return [3.0, 3.5, 4.0, 5.0];
        }
        return [1.8, 2.2, 2.5, 3.0];
      },
      required: true,
      min: 0.8,
      max: 12.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Distância entre o centro de duas linhas de plantação adjacentes (m).'
    },

    // 4. Faces tratadas (faces) - LWA exclusivo
    {
      id: 'treatedSides',
      canonicalKey: 'treated_sides',
      label: 'Faces tratadas',
      dimension: 'count',
      defaultUnit: 'faces',
      defaultValue: 2,
      allowedUnits: ['faces'],
      presets: [1, 2],
      required: true,
      min: 1,
      max: 2,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: false,
      maxDecimals: 0,
      integerOnly: true,
      allowNegative: false,
      allowExpressions: false,
      step: 1,
      description: 'Número de faces de pulverização aplicadas na sebe (1 ou 2 faces).'
    },

    // 5. Volume de calda adotado (L/ha) - LWA opcional / sob necessidade
    {
      id: 'adoptedSprayVolumeLHa',
      canonicalKey: 'adopted_spray_volume',
      label: 'Volume de calda adotado',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      allowedUnits: ['L/ha'],
      presets: [150, 200, 250, 300],
      required: false,
      min: 50,
      max: 3000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 1,
      allowNegative: false,
      allowExpressions: true,
      step: 25,
      description: 'Volume de calda operacional adotado pelo técnico para a parcela (L/ha).'
    },

    // 6. Volume final de calda a preparar (L)
    {
      id: 'finalTankVolumeL',
      canonicalKey: 'tank_volume',
      label: 'Volume final de calda a preparar',
      dimension: 'volume',
      defaultUnit: 'L',
      defaultValue: 400,
      allowedUnits: ['L'],
      presets: [200, 400, 600, 1000],
      required: false,
      min: 10,
      max: 10000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 1,
      allowNegative: false,
      allowExpressions: true,
      step: 50,
      description: 'Volume final de calda a preparar no depósito do pulverizador (L).'
    },

    // 7. Dose do produto fitofarmacêutico
    {
      id: 'doseValue',
      canonicalKey: 'dose',
      label: 'Dose do produto fitofarmacêutico',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      allowedUnits: [
        'L/ha',
        'mL/ha',
        'kg/ha',
        'g/ha',
        'mL/100 L',
        'L/100 L',
        'g/100 L',
        'kg/100 L',
        '%',
        'mL/hL',
        'L/hL',
        'g/hL',
        'kg/hL',
        'L/10 000 m² LWA',
        'mL/10 000 m² LWA',
        'kg/10 000 m² LWA',
        'g/10 000 m² LWA'
      ],
      presets: [1, 2, 5, 50, 100, 200],
      required: false,
      min: 0.001,
      max: 10000,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 3,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Dose ou concentração homologada indicada no rótulo oficial do produto.'
    },

    // 8. Velocidade de avanço (Fase B)
    {
      id: 'travelSpeedKmH',
      canonicalKey: 'travel_speed',
      label: 'Velocidade de avanço',
      dimension: 'speed',
      defaultUnit: 'km/h',
      allowedUnits: ['km/h'],
      presets: [4.0, 5.0, 6.0, 7.0, 8.0],
      required: false,
      min: 0.5,
      max: 30.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 1,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Velocidade de trabalho durante a aplicação (km/h).'
    },

    // 9. Largura de trabalho (Fase B)
    {
      id: 'workingWidthM',
      canonicalKey: 'working_width',
      label: 'Largura de trabalho',
      dimension: 'length',
      defaultUnit: 'm',
      allowedUnits: ['m'],
      presets: [2.0, 2.5, 3.0, 3.5],
      required: false,
      min: 0.5,
      max: 36.0,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: true,
      maxDecimals: 2,
      allowNegative: false,
      allowExpressions: true,
      step: 0.1,
      description: 'Normalmente corresponde à distância entre duas linhas tratadas numa passagem.'
    },

    // 10. Número de bicos ativos (Fase B)
    {
      id: 'activeNozzleCount',
      canonicalKey: 'nozzle_count',
      label: 'Número de bicos ativos',
      dimension: 'count',
      defaultUnit: 'bicos',
      allowedUnits: ['bicos'],
      presets: [4, 6, 8, 10, 12],
      required: false,
      min: 1,
      max: 120,
      minInclusive: true,
      maxInclusive: true,
      allowDecimal: false,
      maxDecimals: 0,
      allowNegative: false,
      allowExpressions: true,
      step: 1,
      description: 'Conte apenas os bicos que ficam abertos durante a aplicação.'
    },


  ],

  results: [
    // 1. Resultado Principal (Volume de Calda Recomendado)
    {
      id: 'primaryResult',
      canonicalKey: 'spray_volume',
      label: 'Volume de Calda Recomendado',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      isPrimary: true,
      formatDecimals: 1
    },

    // 2. Quantidade de Produto por Depósito
    {
      id: 'produtoPorDeposito',
      canonicalKey: 'product_commercial_quantity',
      label: 'Quantidade de Produto por Depósito',
      dimension: 'volume',
      defaultUnit: 'L',
      isPrimary: false,
      formatDecimals: 3,
      subUnit: 'mL'
    },

    // 3. Dose Equivalente por Hectare
    {
      id: 'doseEquivalenteHa',
      canonicalKey: 'dose',
      label: 'Dose Equivalente por Hectare',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      isPrimary: false,
      formatDecimals: 2,
      subUnit: 'mL/ha'
    },

    // 4. Taxa de Cobertura Hídrica Efetiva (LWA)
    {
      id: 'taxaLwa',
      canonicalKey: 'lwa_water_coverage_rate',
      label: 'Taxa de Cobertura Hídrica Efetiva',
      dimension: 'application_rate',
      defaultUnit: 'L / 10 000 m² LWA',
      isPrimary: false,
      formatDecimals: 1
    },

    // 5. Área de Parede Foliar (LWA)
    {
      id: 'lwaHa',
      canonicalKey: 'leaf_wall_area',
      label: 'Área de Parede Foliar Tratada',
      dimension: 'area',
      defaultUnit: 'm² LWA/ha',
      isPrimary: false,
      formatDecimals: 0
    },

    // 6. Volume de Copa Tratada (TRV)
    {
      id: 'trvM3PerHa',
      canonicalKey: 'tree_row_volume',
      label: 'Volume de Copa Tratada (TRV)',
      dimension: 'tree_row_volume',
      defaultUnit: 'm³ TRV/ha',
      isPrimary: false,
      formatDecimals: 1
    },

    // 7. Área Aproximada Tratada por Depósito
    {
      id: 'areaPorDeposito',
      canonicalKey: 'plot_area',
      label: 'Área Aproximada Tratada por Depósito',
      dimension: 'area',
      defaultUnit: 'ha',
      isPrimary: false,
      formatDecimals: 3
    },

    // 8. Depósitos Necessários por Hectare
    {
      id: 'depositosPorHa',
      canonicalKey: 'tank_count',
      label: 'Depósitos por Hectare',
      dimension: 'count',
      defaultUnit: 'depósitos/ha',
      isPrimary: false,
      formatDecimals: 2
    },

    // 9. Volume de Calda Adotado (LWA manual para culturas sem LWA-V)
    {
      id: 'volCaldaAdotado',
      canonicalKey: 'adopted_spray_volume',
      label: 'Volume de Calda Adotado',
      dimension: 'application_rate',
      defaultUnit: 'L/ha',
      isPrimary: false,
      formatDecimals: 1
    },

    // 10. Débito Total Requerido (Fase B)
    {
      id: 'caudalTotalNecessario',
      canonicalKey: 'target_total_flow_rate',
      label: 'Débito Total Requerido',
      dimension: 'flow_rate',
      defaultUnit: 'L/min',
      isPrimary: false,
      formatDecimals: 2
    },

    // 11. Débito Requerido por Bico (Fase B)
    {
      id: 'caudalMedioPorBico',
      canonicalKey: 'target_nozzle_flow_rate',
      label: 'Débito Requerido por Bico',
      dimension: 'flow_rate',
      defaultUnit: 'L/min',
      subUnit: 'por bico',
      isPrimary: false,
      formatDecimals: 2
    },

    // 12. Tempo Teórico por Hectare (Fase B)
    {
      id: 'tempoTeoricoPorHa',
      canonicalKey: 'work_time_per_ha',
      label: 'Tempo Teórico por Hectare',
      dimension: 'time',
      defaultUnit: 'min/ha',
      isPrimary: false,
      formatDecimals: 1
    },


  ],

  calculate: (inputs: Record<string, StructuredValue>): Record<string, StructuredValue> => {
    const rawMode = String(inputs['mode']?.rawValue || 'lwa');
    const method: CalibracaoMetodo = rawMode === 'trv' ? 'trv' : 'lwa';
    const useManualAdoptedVolumeInLwa =
      inputs['useManualAdoptedVolumeInLwa']?.rawValue === 'true' ||
      inputs['useManualAdoptedVolumeInLwa']?.rawValue === 1;

    // Resolver tipo de dose a partir da unidade
    const doseUnit = inputs['doseValue']?.unit || 'L/ha';
    let doseType: DoseType = 'dose_ha';
    if (doseUnit.includes('/100 L')) {
      doseType = 'dose_100l';
    } else if (doseUnit.includes('/hL') || doseUnit === '%') {
      doseType = 'concentration';
    } else if (doseUnit.includes('LWA')) {
      doseType = 'dose_lwa';
    }

    const pure = calculateCalibracaoPulverizadorPure({
      method,
      cultureId: inputs['cultureId'] ? String(inputs['cultureId'].rawValue) : undefined,
      conductionId: inputs['conductionId'] ? String(inputs['conductionId'].rawValue) : undefined,
      phenologyId: inputs['phenologyId'] ? String(inputs['phenologyId'].rawValue) : undefined,
      canopyDensity: inputs['canopyDensity']
        ? (String(inputs['canopyDensity'].rawValue) as CanopyDensityTierId)
        : undefined,
      canopyThickness: inputs['canopyThickness']
        ? (String(inputs['canopyThickness'].rawValue) as LwaVThicknessId)
        : undefined,
      phenologyStage: inputs['phenologyStage']
        ? (String(inputs['phenologyStage'].rawValue) as LwaVStageId)
        : undefined,
      useManualAdoptedVolumeInLwa,
      treatedHeightM: inputs['treatedHeightM']?.rawValue !== undefined ? Number(inputs['treatedHeightM'].rawValue) : undefined,
      rowSpacingM: inputs['rowSpacingM']?.rawValue !== undefined ? Number(inputs['rowSpacingM'].rawValue) : undefined,
      treatedSides: inputs['treatedSides']?.rawValue === 1 ? 1 : 2,
      canopyWidthM: inputs['canopyWidthM']?.rawValue !== undefined ? Number(inputs['canopyWidthM'].rawValue) : undefined,
      finalTankVolumeL: inputs['finalTankVolumeL']?.rawValue !== undefined && inputs['finalTankVolumeL']?.rawValue !== ''
        ? Number(inputs['finalTankVolumeL'].rawValue)
        : undefined,
      adoptedSprayVolumeLHa: inputs['adoptedSprayVolumeLHa']?.rawValue !== undefined && inputs['adoptedSprayVolumeLHa']?.rawValue !== ''
        ? Number(inputs['adoptedSprayVolumeLHa'].rawValue)
        : undefined,
      doseType,
      doseValue: inputs['doseValue']?.rawValue !== undefined && inputs['doseValue']?.rawValue !== ''
        ? Number(inputs['doseValue'].rawValue)
        : undefined,
      doseUnit,
      travelSpeedKmH: inputs['travelSpeedKmH']?.rawValue !== undefined && inputs['travelSpeedKmH']?.rawValue !== ''
        ? Number(inputs['travelSpeedKmH'].rawValue)
        : undefined,
      workingWidthM: inputs['workingWidthM']?.rawValue !== undefined && inputs['workingWidthM']?.rawValue !== ''
        ? Number(inputs['workingWidthM'].rawValue)
        : undefined,
      activeNozzleCount: inputs['activeNozzleCount']?.rawValue !== undefined && inputs['activeNozzleCount']?.rawValue !== ''
        ? Number(inputs['activeNozzleCount'].rawValue)
        : undefined,
      workingWidthSource: (inputs['workingWidthSource']?.rawValue as 'auto-row-spacing' | 'manual') || undefined
    });

    if (!pure.isValid) {
      return {};
    }

    const outputs: Record<string, StructuredValue> = {};

    // 1. Resultado Principal
    if (method === 'lwa') {
      if (pure.recommendedSprayVolumeLHa !== undefined) {
        outputs['primaryResult'] = {
          rawValue: pure.recommendedSprayVolumeLHa,
          unit: 'L/ha',
          subValue: pure.lwaM2PerHa,
          subUnit: 'm² LWA/ha',
          dimension: 'application_rate',
          canonicalKey: 'spray_volume',
          label: pure.isAdoptedSprayVolume
            ? 'Volume de Calda Adotado'
            : (pure.lwaModel === 'lwa-v-daterra-v1' || pure.lwaModel === 'lwa_v_daterra_v1' ? 'Volume de Calda Sugerido' : 'Volume de Calda Recomendado'),
          source: 'calculated_output',
          localId: 'primaryResult',
          calculatorId: 'calc_calibracao_pulverizador',
          calculatorVersion: '1.0.0'
        };
      } else {
        outputs['primaryResult'] = {
          rawValue: pure.lwaM2PerHa ?? 0,
          unit: 'm² LWA/ha',
          dimension: 'area',
          canonicalKey: 'leaf_wall_area',
          label: 'Área de Parede Foliar Tratada',
          source: 'calculated_output',
          localId: 'primaryResult',
          calculatorId: 'calc_calibracao_pulverizador',
          calculatorVersion: '1.0.0'
        };
      }
    } else {
      outputs['primaryResult'] = {
        rawValue: pure.recommendedSprayVolumeLHa ?? 0,
        unit: 'L/ha',
        subValue: pure.trvM3PerHa,
        subUnit: 'm³ TRV/ha',
        dimension: 'application_rate',
        canonicalKey: 'spray_volume',
        label: 'Volume de Calda Recomendado',
        source: 'calculated_output',
        localId: 'primaryResult',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.lwaM2PerHa !== undefined) {
      outputs['lwaHa'] = {
        rawValue: pure.lwaM2PerHa,
        unit: 'm² LWA/ha',
        dimension: 'area',
        canonicalKey: 'leaf_wall_area',
        label: 'Área de Parede Foliar Tratada',
        source: 'calculated_output',
        localId: 'lwaHa',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.kLwaLPer10000M2 !== undefined) {
      outputs['taxaLwa'] = {
        rawValue: pure.kLwaLPer10000M2,
        unit: 'L / 10 000 m² LWA',
        dimension: 'application_rate',
        canonicalKey: 'lwa_water_coverage_rate',
        label: 'Taxa de Cobertura Hídrica',
        source: 'calculated_output',
        localId: 'taxaLwa',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.recommendedSprayVolumeLHa !== undefined && !pure.isAdoptedSprayVolume) {
      outputs['volCaldaRecomendado'] = {
        rawValue: pure.recommendedSprayVolumeLHa,
        unit: 'L/ha',
        dimension: 'application_rate',
        canonicalKey: 'spray_volume',
        label: 'Volume de Calda Recomendado',
        source: 'calculated_output',
        localId: 'volCaldaRecomendado',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (method === 'lwa' && (pure.isAdoptedSprayVolume || (inputs['adoptedSprayVolumeLHa']?.rawValue !== undefined && inputs['adoptedSprayVolumeLHa']?.rawValue !== ''))) {
      outputs['volCaldaAdotado'] = {
        rawValue: pure.recommendedSprayVolumeLHa ?? Number(inputs['adoptedSprayVolumeLHa']?.rawValue),
        unit: 'L/ha',
        dimension: 'application_rate',
        canonicalKey: 'adopted_spray_volume',
        label: 'Volume de Calda Adotado',
        source: 'user_input',
        localId: 'volCaldaAdotado',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.trvM3PerHa !== undefined) {
      outputs['trvM3PerHa'] = {
        rawValue: pure.trvM3PerHa,
        unit: 'm³ TRV/ha',
        dimension: 'tree_row_volume',
        canonicalKey: 'tree_row_volume',
        label: 'Volume de Copa Tratada (TRV)',
        source: 'calculated_output',
        localId: 'trvM3PerHa',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.productPerTankValue !== undefined) {
      outputs['produtoPorDeposito'] = {
        rawValue: pure.productPerTankValue,
        unit: pure.productPerTankUnit || (pure.isSolid ? 'kg' : 'L'),
        subValue: pure.productPerTankSubValue,
        subUnit: pure.productPerTankSubUnit,
        dimension: pure.isSolid ? 'mass' : 'volume',
        canonicalKey: 'product_commercial_quantity',
        label: 'Quantidade de Produto por Depósito',
        source: 'calculated_output',
        localId: 'produtoPorDeposito',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.doseEquivalentPerHaValue !== undefined) {
      outputs['doseEquivalenteHa'] = {
        rawValue: pure.doseEquivalentPerHaValue,
        unit: pure.doseEquivalentPerHaUnit || (pure.isSolid ? 'kg/ha' : 'L/ha'),
        subValue: pure.doseEquivalentPerHaSubValue,
        subUnit: pure.doseEquivalentPerHaSubUnit,
        dimension: 'application_rate',
        canonicalKey: 'dose',
        label: 'Dose Equivalente por Hectare',
        source: 'calculated_output',
        localId: 'doseEquivalenteHa',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.areaPerTankHa !== undefined) {
      outputs['areaPorDeposito'] = {
        rawValue: pure.areaPerTankHa,
        unit: 'ha',
        dimension: 'area',
        canonicalKey: 'plot_area',
        label: 'Área Aproximada Tratada por Depósito',
        source: 'calculated_output',
        localId: 'areaPorDeposito',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.tanksPerHa !== undefined) {
      outputs['depositosPorHa'] = {
        rawValue: pure.tanksPerHa,
        unit: 'depósitos/ha',
        dimension: 'count',
        canonicalKey: 'tank_count',
        label: 'Depósitos por Hectare',
        source: 'calculated_output',
        localId: 'depositosPorHa',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    // Fase B — Ajuste Operacional
    if (pure.totalFlowRequiredLMin !== undefined) {
      outputs['caudalTotalNecessario'] = {
        rawValue: Math.round(pure.totalFlowRequiredLMin * 100) / 100,
        unit: 'L/min',
        dimension: 'flow_rate',
        canonicalKey: 'target_total_flow_rate',
        label: 'Débito Total Requerido',
        source: 'calculated_output',
        localId: 'caudalTotalNecessario',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.flowPerNozzleLMin !== undefined) {
      outputs['caudalMedioPorBico'] = {
        rawValue: Math.round(pure.flowPerNozzleLMin * 100) / 100,
        unit: 'L/min',
        subUnit: 'por bico',
        dimension: 'flow_rate',
        canonicalKey: 'target_nozzle_flow_rate',
        label: 'Débito Requerido por Bico',
        source: 'calculated_output',
        localId: 'caudalMedioPorBico',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    if (pure.theoreticalTimePerHaMinutes !== undefined) {
      outputs['tempoTeoricoPorHa'] = {
        rawValue: Math.round(pure.theoreticalTimePerHaMinutes * 10) / 10,
        unit: 'min/ha',
        dimension: 'time',
        canonicalKey: 'work_time_per_ha',
        label: 'Tempo Teórico por Hectare',
        source: 'calculated_output',
        localId: 'tempoTeoricoPorHa',
        calculatorId: 'calc_calibracao_pulverizador',
        calculatorVersion: '1.0.0'
      };
    }

    return outputs;
  },

  validate: (inputs: Record<string, StructuredValue>): ValidationResult => {
    const rawMode = String(inputs['mode']?.rawValue || 'lwa');
    const method: CalibracaoMetodo = rawMode === 'trv' ? 'trv' : 'lwa';
    const useManualAdoptedVolumeInLwa =
      inputs['useManualAdoptedVolumeInLwa']?.rawValue === 'true' ||
      inputs['useManualAdoptedVolumeInLwa']?.rawValue === 1;

    const doseUnit = inputs['doseValue']?.unit || 'L/ha';
    let doseType: DoseType = 'dose_ha';
    if (doseUnit.includes('/100 L')) {
      doseType = 'dose_100l';
    } else if (doseUnit.includes('/hL') || doseUnit === '%') {
      doseType = 'concentration';
    } else if (doseUnit.includes('LWA')) {
      doseType = 'dose_lwa';
    }

    const validation = validateCalibracaoPulverizador({
      method,
      cultureId: inputs['cultureId'] ? String(inputs['cultureId'].rawValue) : undefined,
      conductionId: inputs['conductionId'] ? String(inputs['conductionId'].rawValue) : undefined,
      phenologyId: inputs['phenologyId'] ? String(inputs['phenologyId'].rawValue) : undefined,
      canopyDensity: inputs['canopyDensity']
        ? (String(inputs['canopyDensity'].rawValue) as CanopyDensityTierId)
        : undefined,
      canopyThickness: inputs['canopyThickness']
        ? (String(inputs['canopyThickness'].rawValue) as LwaVThicknessId)
        : undefined,
      phenologyStage: inputs['phenologyStage']
        ? (String(inputs['phenologyStage'].rawValue) as LwaVStageId)
        : undefined,
      useManualAdoptedVolumeInLwa,
      treatedHeightM: inputs['treatedHeightM']?.rawValue !== undefined ? Number(inputs['treatedHeightM'].rawValue) : undefined,
      rowSpacingM: inputs['rowSpacingM']?.rawValue !== undefined ? Number(inputs['rowSpacingM'].rawValue) : undefined,
      treatedSides: inputs['treatedSides']?.rawValue === 1 ? 1 : 2,
      canopyWidthM: inputs['canopyWidthM']?.rawValue !== undefined ? Number(inputs['canopyWidthM'].rawValue) : undefined,
      finalTankVolumeL: inputs['finalTankVolumeL']?.rawValue !== undefined && inputs['finalTankVolumeL']?.rawValue !== ''
        ? Number(inputs['finalTankVolumeL'].rawValue)
        : undefined,
      adoptedSprayVolumeLHa: inputs['adoptedSprayVolumeLHa']?.rawValue !== undefined && inputs['adoptedSprayVolumeLHa']?.rawValue !== ''
        ? Number(inputs['adoptedSprayVolumeLHa'].rawValue)
        : undefined,
      doseType,
      doseValue: inputs['doseValue']?.rawValue !== undefined && inputs['doseValue']?.rawValue !== ''
        ? Number(inputs['doseValue'].rawValue)
        : undefined,
      doseUnit,
      travelSpeedKmH: inputs['travelSpeedKmH']?.rawValue !== undefined && inputs['travelSpeedKmH']?.rawValue !== ''
        ? Number(inputs['travelSpeedKmH'].rawValue)
        : undefined,
      workingWidthM: inputs['workingWidthM']?.rawValue !== undefined && inputs['workingWidthM']?.rawValue !== ''
        ? Number(inputs['workingWidthM'].rawValue)
        : undefined,
      activeNozzleCount: inputs['activeNozzleCount']?.rawValue !== undefined && inputs['activeNozzleCount']?.rawValue !== ''
        ? Number(inputs['activeNozzleCount'].rawValue)
        : undefined,
      workingWidthSource: (inputs['workingWidthSource']?.rawValue as 'auto-row-spacing' | 'manual') || undefined
    });

    return {
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings
    };
  }
};
