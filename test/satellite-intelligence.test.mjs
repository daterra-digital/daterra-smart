import test, { describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateNdviModulation,
  getCopernicusMetadata,
  getNdviHistorySeries
} from '../src/features/satellite-intelligence/services/copernicusService.ts';
import {
  exportParcelToKml,
  exportPrescriptionGeoJson
} from '../src/features/satellite-intelligence/services/gisParcelService.ts';

describe('Inteligência de Satélite & NDVI (Copernicus / Sentinel-2 / LWA) Test Suite', () => {
  test('1. Modulação de volume de calda por NDVI para vigor ótimo (~0.74)', () => {
    const res = calculateNdviModulation(0.74, 350);
    // factor = 0.42 + 0.74 * 0.70 = 0.938
    // 350 * 0.938 = 328 L/ha aprox
    assert.ok(res.modulatedVolumeLha < 350);
    assert.strictEqual(res.canopyStatus, 'VIGOROSO');
    assert.strictEqual(res.canopyStatusLabel, 'Vigor Normal • Vegetação Sadia');
    assert.ok(res.volumeDiffLha < 0);
    assert.ok(res.savingsPct < 0);
  });

  test('2. Modulação para biomassa com stress vegetativo (NDVI < 0.40)', () => {
    const res = calculateNdviModulation(0.30, 350);
    assert.strictEqual(res.canopyStatus, 'STRESS');
    assert.strictEqual(res.canopyStatusLabel, 'Stress Vegetativo / Pouca Biomassa');
    // Deve ter poupança substancial de calda para evitar escorrimento em solo nu
    assert.ok(res.modulatedVolumeLha < 250);
    assert.ok(res.savingsPct < -30);
  });

  test('3. Modulação para copa muito densa (NDVI >= 0.75)', () => {
    const res = calculateNdviModulation(0.85, 300);
    assert.strictEqual(res.canopyStatus, 'MUITO_VIGOROSO');
    assert.strictEqual(res.canopyStatusLabel, 'Vigor Muito Elevado • Copa Densa');
    assert.ok(res.modulatedVolumeLha > 300);
  });

  test('4. Metadados Copernicus Sentinel-2 seguem as especificações da ESA', () => {
    const meta = getCopernicusMetadata(39.545, -8.605, 0.74);
    assert.strictEqual(meta.resolutionM, 10);
    assert.strictEqual(meta.instrument, 'MSI (MultiSpectral Instrument)');
    assert.ok(meta.platform.startsWith('Sentinel-2'));
    assert.strictEqual(meta.collection, 'SENTINEL-2_MSI_L2A');
  });

  test('5. Série temporal de 6 meses é gerada corretamente', () => {
    const series = getNdviHistorySeries(0.74);
    assert.strictEqual(series.length, 6);
    assert.strictEqual(series[0].date, 'Abr');
    assert.strictEqual(series[5].date, 'Set');
    series.forEach((p) => {
      assert.ok(p.ndvi >= 0.20 && p.ndvi <= 1.0);
    });
  });

  test('6. Exportação KML gera XML válido compatível com Google Earth', () => {
    const parcel = {
      id: 'p1',
      name: 'Vinha Teste',
      areaHa: 4.0,
      cropType: 'Vinha',
      coordinates: [[39.5, -8.6], [39.51, -8.6], [39.51, -8.59], [39.5, -8.59]],
      center: [39.505, -8.595],
      ndvi: 0.72,
      lastPassDate: '2026-09-28',
      cloudCoveragePct: 0.0,
      baseVolumeLha: 350
    };
    const kml = exportParcelToKml(parcel);
    assert.ok(kml.includes('<?xml version="1.0"'));
    assert.ok(kml.includes('<Polygon>'));
    assert.ok(kml.includes('Vinha Teste'));
    assert.ok(kml.includes('-8.6,39.5,0'));
  });

  test('7. Exportação de Prescrição GeoJSON contém atributos agronómicos', () => {
    const parcel = {
      id: 'p1',
      name: 'Vinha Teste',
      areaHa: 4.0,
      cropType: 'Vinha',
      coordinates: [[39.5, -8.6], [39.51, -8.6], [39.51, -8.59], [39.5, -8.59]],
      center: [39.505, -8.595],
      ndvi: 0.72,
      lastPassDate: '2026-09-28',
      cloudCoveragePct: 0.0,
      baseVolumeLha: 350
    };
    const geojsonStr = exportPrescriptionGeoJson(parcel, 280);
    const parsed = JSON.parse(geojsonStr);
    assert.strictEqual(parsed.type, 'FeatureCollection');
    assert.strictEqual(parsed.features[0].properties.target_spray_volume_l_ha, 280);
    assert.strictEqual(parsed.features[0].properties.parcel_name, 'Vinha Teste');
  });

  test('8. Algoritmo geodésico calcula área em hectares para coordenadas GPS reais', async () => {
    const { calculateGeoPolygonAreaHa } = await import('../src/features/satellite-intelligence/services/polygonMath.ts');
    // Coordenadas de um talhão retangular de ~3.8 ha em Santarém
    const coords = [
      [39.545, -8.605],
      [39.546, -8.601],
      [39.542, -8.600],
      [39.541, -8.604]
    ];
    const area = calculateGeoPolygonAreaHa(coords);
    assert.ok(area > 1.0 && area < 20.0);
  });

  test('9. Polígono com menos de 3 pontos retorna área 0.0 ha e centróide calcula corretamente', async () => {
    const { calculateGeoPolygonAreaHa, calculateCoordsCenter } = await import('../src/features/satellite-intelligence/services/polygonMath.ts');
    assert.strictEqual(calculateGeoPolygonAreaHa([[39.5, -8.6], [39.6, -8.6]]), 0);
    const center = calculateCoordsCenter([[39.5, -8.6], [39.7, -8.4]]);
    assert.strictEqual(center[0], 39.6);
    assert.strictEqual(center[1], -8.5);
  });
});
