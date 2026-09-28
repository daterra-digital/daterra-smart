import test from 'node:test';
import assert from 'node:assert/strict';

import { interpolateDropletSpectrum } from '../src/features/nozzle-comparison/dropletSpectrumInterpolation.ts';

const mockAlbuzAtrLaranja = {
  id: 'albuz_atr_80_laranja',
  brand: 'Albuz',
  model: 'ATR',
  color: 'Laranja',
  d10_5bar_um: 39,
  d50_5bar_um: 96,
  d90_5bar_um: 240,
  d10_10bar_um: 31,
  d50_10bar_um: 84,
  d90_10bar_um: 213,
  d10_15bar_um: 27,
  d50_15bar_um: 79,
  d90_15bar_um: 205,
  dropletClass5bar: 'M',
  dropletClass10bar: 'F',
  dropletClass15bar: 'VF',
  pressureMinBar: 5,
  pressureMaxBar: 25
};

const mockTeeJetXR = {
  id: 'teejet_xr_110_verde',
  brand: 'TeeJet',
  model: 'XR',
  color: 'Verde',
  pressureMinBar: 1,
  pressureMaxBar: 4
};

test('Interpolação do Espectro de Gotas (Albuz ATR)', async (t) => {
  await t.test('1. Retorna valores catalogados exatos a 5, 10 e 15 bar', () => {
    const at5 = interpolateDropletSpectrum(mockAlbuzAtrLaranja, 5.0);
    assert.equal(at5.dv10, 39);
    assert.equal(at5.dv50, 96);
    assert.equal(at5.dv90, 240);
    assert.equal(at5.effectiveDropletClass, 'M');

    const at10 = interpolateDropletSpectrum(mockAlbuzAtrLaranja, 10.0);
    assert.equal(at10.dv10, 31);
    assert.equal(at10.dv50, 84);
    assert.equal(at10.dv90, 213);
    assert.equal(at10.effectiveDropletClass, 'F');

    const at15 = interpolateDropletSpectrum(mockAlbuzAtrLaranja, 15.0);
    assert.equal(at15.dv10, 27);
    assert.equal(at15.dv50, 79);
    assert.equal(at15.dv90, 205);
    assert.equal(at15.effectiveDropletClass, 'VF');
  });

  await t.test('2. Interpola continuamente a 7.6 bar (não congela nos valores de 10 bar)', () => {
    const at7_6 = interpolateDropletSpectrum(mockAlbuzAtrLaranja, 7.6);
    // Deve estar estritamente entre 5 bar e 10 bar
    assert.ok(at7_6.dv10 > 31 && at7_6.dv10 < 39, `dv10=${at7_6.dv10} deve estar entre 31 e 39`);
    assert.ok(at7_6.dv50 > 84 && at7_6.dv50 < 96, `dv50=${at7_6.dv50} deve estar entre 84 e 96`);
    assert.ok(at7_6.dv90 > 213 && at7_6.dv90 < 240, `dv90=${at7_6.dv90} deve estar entre 213 e 240`);
    assert.equal(at7_6.dv10, 35);
    assert.equal(at7_6.dv50, 90);
    assert.equal(at7_6.dv90, 226);
    assert.equal(at7_6.effectiveDropletClass, 'F');
  });

  await t.test('3. Atualiza valores acima de 15 bar (ex: 15.1 bar e 20 bar)', () => {
    const at15_1 = interpolateDropletSpectrum(mockAlbuzAtrLaranja, 15.1);
    assert.ok(at15_1.dv50 !== null);
    assert.equal(at15_1.effectiveDropletClass, 'VF');

    const at20 = interpolateDropletSpectrum(mockAlbuzAtrLaranja, 20.0);
    // A 20 bar as gotas são mais finas que a 15 bar
    assert.ok(at20.dv50 !== null && at20.dv50 < 79, `dv50 a 20 bar (${at20.dv50}) deve ser inferior a 79 µm`);
    assert.ok(at20.dv10 !== null && at20.dv10 < 27, `dv10 a 20 bar (${at20.dv10}) deve ser inferior a 27 µm`);
    assert.ok(at20.dv50 !== null && at20.dv50 >= 35, 'deve respeitar o piso físico');
  });

  await t.test('4. Bicos sem medições na fonte oficial retornam null sem erro', () => {
    const res = interpolateDropletSpectrum(mockTeeJetXR, 3.0);
    assert.equal(res.dv10, null);
    assert.equal(res.dv50, null);
    assert.equal(res.dv90, null);
  });
});
