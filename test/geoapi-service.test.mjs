/**
 * DATERRA Smart - Testes de Integração e Resolução de Municípios e Freguesias (geoapi.pt)
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllMunicipalities,
  getAllFreguesias,
  findMunicipality,
  resolveGeoLocation
} from '../src/features/weather/services/geoApiService.ts';

describe('Serviço GEO API PT — Municípios e Freguesias de Portugal', () => {

  test('1. Lista completa contém exatamente os 308 municípios oficiais de Portugal', () => {
    const list = getAllMunicipalities();
    assert.equal(list.length, 308, 'Deve conter 308 municípios');
    // Verifica ordenação alfabética
    assert.equal(list[0].name, 'Abrantes');
  });

  test('2. Todos os municípios possuem coordenadas pré-calculadas e lista de freguesias', () => {
    const list = getAllMunicipalities();
    for (const m of list) {
      assert.ok(typeof m.latitude === 'number' && !isNaN(m.latitude), `Latitude inválida em ${m.name}`);
      assert.ok(typeof m.longitude === 'number' && !isNaN(m.longitude), `Longitude inválida em ${m.name}`);
      assert.ok(Array.isArray(m.freguesias), `Freguesias ausentes em ${m.name}`);
      assert.ok(m.freguesias.length > 0, `Nenhuma freguesia em ${m.name}`);
    }
  });

  test('3. Pesquisa e localização de concelho chave (Peso da Régua)', () => {
    const regua = findMunicipality('Peso da Régua');
    assert.ok(regua, 'Deve encontrar Peso da Régua');
    assert.equal(regua.name, 'Peso da Régua');
    assert.equal(regua.distrito, 'Vila Real');
    assert.ok(regua.freguesias.includes('Sedielos'));
    assert.ok(regua.freguesias.includes('Loureiro'));
  });

  test('4. Resolução de coordenadas de município funciona em 0ms (offline)', async () => {
    const loc = await resolveGeoLocation('Viseu');
    assert.equal(loc.name, 'Viseu');
    assert.ok(loc.latitude > 40 && loc.latitude < 41);
    assert.ok(loc.longitude > -8 && loc.longitude < -7);
    assert.ok(loc.region.includes('Viseu'));
  });

  test('5. Resolução de freguesia devolve coordenadas precisas', async () => {
    const loc = await resolveGeoLocation('Peso da Régua', 'Sedielos');
    assert.equal(loc.name, 'Sedielos');
    assert.ok(loc.region.includes('Peso da Régua'));
    assert.ok(typeof loc.latitude === 'number' && loc.latitude > 40);
    assert.ok(typeof loc.longitude === 'number' && loc.longitude < -7);
  });

  test('6. Índice global de freguesias contém mais de 3.000 freguesias associadas ao respetivo concelho', () => {
    const fregs = getAllFreguesias();
    assert.ok(fregs.length > 3000, `Esperado > 3000 freguesias, obtido ${fregs.length}`);
    const sample = fregs.find((f) => f.name === 'Benedita');
    assert.ok(sample, 'Deve encontrar a freguesia da Benedita');
    assert.equal(sample.municipio, 'Alcobaça');
    assert.equal(sample.distrito, 'Leiria');
  });

  test('7. Resolução direta da freguesia da Benedita (Alcobaça)', async () => {
    const loc = await resolveGeoLocation('Alcobaça', 'Benedita');
    assert.equal(loc.name, 'Benedita');
    assert.ok(loc.region.includes('Alcobaça'));
    assert.ok(typeof loc.latitude === 'number' && !isNaN(loc.latitude));
    assert.ok(typeof loc.longitude === 'number' && !isNaN(loc.longitude));
  });

});
