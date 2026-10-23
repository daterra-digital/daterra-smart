export type SatelliteMapLayer = 'ndvi' | 'rgb' | 'zones';

export interface SatelliteParcel {
  id: string;
  name: string;
  areaHa: number;
  cropType: string;
  coordinates: [number, number][]; // [lat, lon]
  center: [number, number];
  ndvi: number;
  lastPassDate: string;
  cloudCoveragePct: number;
  baseVolumeLha: number;
}

export interface NdviModulationResult {
  ndvi: number;
  baseVolumeLha: number;
  modulatedVolumeLha: number;
  volumeDiffLha: number;
  savingsPct: number;
  canopyStatus: 'MUITO_VIGOROSO' | 'VIGOROSO' | 'MEDIO' | 'STRESS';
  canopyStatusLabel: string;
}

export interface CopernicusProductMeta {
  platform: 'Sentinel-2A' | 'Sentinel-2B';
  instrument: 'MSI (MultiSpectral Instrument)';
  resolutionM: number;
  sensingTime: string;
  cloudCoveragePct: number;
  ndviMean: number;
  collection: string;
}

export interface NdviTimeSeriesPoint {
  date: string;
  ndvi: number;
}
