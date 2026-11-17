import type { KeypadValidationRules } from '../../components/DaterraKeypad.tsx';
import type { WeatherKeypadField } from './IrdWeatherPanel.tsx';

export type CalibrationKeypadField =
  | 'workingPressureBar'
  | 'travelSpeedKmh'
  | 'boomOrReleaseHeightM'
  | 'distanceToSensitiveAreaM'
  | 'labelMinBufferM';

export type AnyIrdKeypadField =
  | CalibrationKeypadField
  | WeatherKeypadField
  | 'representativeDropletDiameterUm'
  | 'measuredDv10Um'
  | 'measuredDv50Um'
  | 'measuredDv90Um'
  | 'measurementPressureBar'
  | 'certifiedDriftReductionPct';

export const IRD_KEYPAD_META: Record<AnyIrdKeypadField, { label: string; unit: string; presets: number[]; rules: KeypadValidationRules }> = {
  workingPressureBar: { label: 'Pressão de trabalho', unit: 'bar', presets: [2, 3, 5, 10], rules: { required: true, min: 0.1, max: 50, allowDecimal: true, maxDecimals: 2 } },
  travelSpeedKmh: { label: 'Velocidade de avanço', unit: 'km/h', presets: [4, 6, 8, 10], rules: { required: true, min: 0.5, max: 40, allowDecimal: true, maxDecimals: 1 } },
  boomOrReleaseHeightM: { label: 'Altura de aplicação', unit: 'm', presets: [0.5, 0.7, 1.0, 1.5], rules: { required: true, min: 0.1, max: 15, allowDecimal: true, maxDecimals: 2 } },
  distanceToSensitiveAreaM: { label: 'Distância a zona sensível', unit: 'm', presets: [5, 10, 20, 50], rules: { required: true, min: 0, max: 10000, allowDecimal: true, maxDecimals: 1 } },
  labelMinBufferM: { label: 'Distância exigida no rótulo', unit: 'm', presets: [5, 10, 15, 20], rules: { required: true, min: 0, max: 10000, allowDecimal: true, maxDecimals: 1 } },
  windSpeedKmh: { label: 'Vento médio (anemómetro)', unit: 'km/h', presets: [3, 6, 10, 14], rules: { required: true, min: 0, max: 150, allowDecimal: true, maxDecimals: 1 } },
  windGustsKmh: { label: 'Rajada de vento', unit: 'km/h', presets: [5, 10, 15, 20], rules: { required: true, min: 0, max: 200, allowDecimal: true, maxDecimals: 1 } },
  temperatureC: { label: 'Temperatura do ar', unit: '°C', presets: [15, 20, 25, 30], rules: { required: true, min: -20, max: 55, allowDecimal: true, maxDecimals: 1, allowNegative: true } },
  relativeHumidityPct: { label: 'Humidade relativa', unit: '%', presets: [40, 55, 70, 85], rules: { required: true, min: 1, max: 100, allowDecimal: true, maxDecimals: 1 } },
  precipitationMm: { label: 'Precipitação', unit: 'mm', presets: [0, 0.2, 1], rules: { required: true, min: 0, max: 500, allowDecimal: true, maxDecimals: 1 } },
  representativeDropletDiameterUm: { label: 'Diâmetro representativo', unit: 'µm', presets: [200, 280, 350, 450], rules: { required: true, min: 15, max: 2500, allowDecimal: true, maxDecimals: 0 } },
  measuredDv10Um: { label: 'DV10 medido', unit: 'µm', presets: [90, 140, 180, 220], rules: { required: true, min: 15, max: 2500, allowDecimal: true, maxDecimals: 0 } },
  measuredDv50Um: { label: 'DV50 medido', unit: 'µm', presets: [220, 300, 380, 450], rules: { required: true, min: 15, max: 2500, allowDecimal: true, maxDecimals: 0 } },
  measuredDv90Um: { label: 'DV90 medido', unit: 'µm', presets: [400, 500, 620, 750], rules: { required: true, min: 15, max: 2500, allowDecimal: true, maxDecimals: 0 } },
  measurementPressureBar: { label: 'Pressão de ref. da medição', unit: 'bar', presets: [2, 3, 5, 10], rules: { required: true, min: 0.1, max: 50, allowDecimal: true, maxDecimals: 2 } },
  certifiedDriftReductionPct: { label: 'Redução de deriva certificada', unit: '%', presets: [50, 75, 90, 95], rules: { required: true, min: 0, max: 100, allowDecimal: true, maxDecimals: 1 } }
};
