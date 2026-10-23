import type { SatelliteParcel } from '../types';

export const INITIAL_PARCELS: SatelliteParcel[] = [
  {
    id: 'vinha-1',
    name: 'Vinha Touriga Nacional',
    areaHa: 3.8,
    cropType: 'Vinha',
    coordinates: [[39.545, -8.605], [39.546, -8.601], [39.542, -8.600], [39.541, -8.604]],
    center: [39.5451, -8.6052],
    ndvi: 0.74,
    lastPassDate: '2026-09-28',
    cloudCoveragePct: 0.0,
    baseVolumeLha: 350
  },
  {
    id: 'olival-1',
    name: 'Olival Arbequina Intensivo',
    areaHa: 8.2,
    cropType: 'Olival',
    coordinates: [[39.540, -8.610], [39.542, -8.606], [39.538, -8.605], [39.537, -8.609]],
    center: [39.5402, -8.6095],
    ndvi: 0.52,
    lastPassDate: '2026-09-28',
    cloudCoveragePct: 0.0,
    baseVolumeLha: 300
  },
  {
    id: 'pomar-1',
    name: 'Pomar Maçã Bravo',
    areaHa: 4.5,
    cropType: 'Pomar',
    coordinates: [[39.550, -8.600], [39.552, -8.596], [39.548, -8.595], [39.547, -8.599]],
    center: [39.5501, -8.5982],
    ndvi: 0.82,
    lastPassDate: '2026-09-28',
    cloudCoveragePct: 0.0,
    baseVolumeLha: 400
  }
];
