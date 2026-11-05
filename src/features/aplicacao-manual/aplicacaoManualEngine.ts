/**
 * DATERRA Smart - Motor Matemático Puro: Aplicação Manual
 * Regras Estritas: EPPO / DGAV, Precisão Interna e Formatação Inteligente
 */

import type { ManualCalculationState, ManualCalculationOutput, FormattedEquivalents } from './aplicacaoManualTypes';

export function formatSmartNumber(num: number, minDec = 0, maxDec = 2, locale = 'pt-PT'): string {
  if (num === undefined || num === null || isNaN(num) || !isFinite(num)) return '0';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec,
    useGrouping: false
  }).format(num);
}

export function formatEquivalents(resultSmall: number, isSolid: boolean, locale = 'pt-PT'): FormattedEquivalents {
  const isLargePrimary = resultSmall >= 1000;
  const rawSmall = resultSmall;
  const rawLarge = resultSmall / 1000;
  const smallUnit = isSolid ? 'g' : 'mL';
  const largeUnit = isSolid ? 'kg' : 'L';

  if (!isSolid) {
    const rawDl = resultSmall / 100; // 1 dL = 100 mL
    if (isLargePrimary) {
      const primaryValue = formatSmartNumber(rawLarge, 0, 3, locale);
      const secL = formatSmartNumber(rawSmall, 0, 2, locale);
      const secDl = formatSmartNumber(rawDl, 0, 2, locale);
      return {
        primaryValue,
        primaryUnit: largeUnit,
        secondaryText: `${secL} ${smallUnit} · ${secDl} dL`,
        rawSmall,
        smallUnit,
        rawLarge,
        largeUnit,
        isLargePrimary: true
      };
    } else {
      const primaryValue = formatSmartNumber(rawSmall, 0, 2, locale);
      const secL = formatSmartNumber(rawLarge, 0, 4, locale);
      const secDl = formatSmartNumber(rawDl, 0, 3, locale);
      return {
        primaryValue,
        primaryUnit: smallUnit,
        secondaryText: `${secL} ${largeUnit} · ${secDl} dL`,
        rawSmall,
        smallUnit,
        rawLarge,
        largeUnit,
        isLargePrimary: false
      };
    }
  } else {
    if (isLargePrimary) {
      const primaryValue = formatSmartNumber(rawLarge, 0, 3, locale);
      const secG = formatSmartNumber(rawSmall, 0, 2, locale);
      return {
        primaryValue,
        primaryUnit: largeUnit,
        secondaryText: `${secG} ${smallUnit}`,
        rawSmall,
        smallUnit,
        rawLarge,
        largeUnit,
        isLargePrimary: true
      };
    } else {
      const primaryValue = formatSmartNumber(rawSmall, 0, 2, locale);
      const secKg = formatSmartNumber(rawLarge, 0, 4, locale);
      return {
        primaryValue,
        primaryUnit: smallUnit,
        secondaryText: `${secKg} ${largeUnit}`,
        rawSmall,
        smallUnit,
        rawLarge,
        largeUnit,
        isLargePrimary: false
      };
    }
  }
}

export function calculateManualApplication(
  state: ManualCalculationState,
  locale = 'pt-PT'
): ManualCalculationOutput {
  const isSolid = state.productState === 'solido';
  const dummyEq: FormattedEquivalents = {
    primaryValue: '0',
    primaryUnit: isSolid ? 'g' : 'mL',
    secondaryText: '',
    rawSmall: 0,
    smallUnit: isSolid ? 'g' : 'mL',
    rawLarge: 0,
    largeUnit: isSolid ? 'kg' : 'L',
    isLargePrimary: false
  };

  const T = state.caldaPrepararL;
  if (!T || T <= 0 || isNaN(T) || !isFinite(T)) {
    return { isValid: false, error: 'Volume de calda a preparar inválido', quantidadePFSmall: 0, formattedQ: dummyEq, isSolid };
  }

  const rawVal = state.rotuloValue;
  const unit = state.rotuloUnit || '';
  if (!rawVal || rawVal <= 0 || isNaN(rawVal) || !isFinite(rawVal)) {
    return { isValid: false, error: 'Quantidade de produto do rótulo inválida', quantidadePFSmall: 0, formattedQ: dummyEq, isSolid };
  }

  // Normalização
  let normalizedD = rawVal;
  if (unit === 'L/ha' || unit === 'kg/ha' || unit === 'L/100 L' || unit === 'kg/100 L') {
    normalizedD = rawVal * 1000;
  }

  let A: number | undefined;
  let W: number | undefined;
  let V: number | undefined;
  let X: number | undefined;

  const needsEnsaio = state.mode === 'dose' || (state.mode === 'concentracao' && state.plantStage === 'adulta') || (state.mode === 'concentracao' && state.plantStage === 'jovem' && state.hasEnsaio);

  if (needsEnsaio) {
    if (state.areaMethod === 'area_conhecida') {
      A = state.areaConhecidaM2;
    } else if (state.areaMethod === 'faixa_medida') {
      const c = state.faixaComprimentoM;
      const l = state.faixaLarguraM;
      if (c && l && c > 0 && l > 0) A = c * l;
    }
    W = state.aguaGastaL;

    if (A && W && A > 0 && W > 0 && isFinite(A) && isFinite(W)) {
      V = (W * 10000) / A;
      X = (T * A) / W; // ou (T * 10000) / V
    } else if (state.mode === 'dose' || (state.mode === 'concentracao' && state.plantStage === 'adulta')) {
      return { isValid: false, error: 'Dados do ensaio de campo incompletos ou inválidos', quantidadePFSmall: 0, formattedQ: dummyEq, isSolid };
    }
  }

  let QSmall = 0;
  let doseEqTeorica: number | undefined;
  let fatorAjuste: number | undefined;

  if (state.mode === 'dose') {
    if (!V || V <= 0) {
      return { isValid: false, error: 'Volume aplicado não calculado', quantidadePFSmall: 0, formattedQ: dummyEq, isSolid };
    }
    QSmall = (T * normalizedD) / V;
  } else if (state.mode === 'concentracao') {
    if (state.plantStage === 'jovem') {
      QSmall = (T * normalizedD) / 100;
    } else {
      // Adulta
      let R = state.recVolumeLHa;
      if (state.hasRecVolume === false || R === undefined) {
        R = 1000; // Regra expressa: default 1000 L/ha quando Não ou Não sei
      } else if (R <= 0 || isNaN(R) || !isFinite(R)) {
        return { isValid: false, error: 'Volume de calda recomendado inválido', quantidadePFSmall: 0, formattedQ: dummyEq, isSolid };
      }
      if (!V || V <= 0) {
        return { isValid: false, error: 'Volume aplicado não calculado', quantidadePFSmall: 0, formattedQ: dummyEq, isSolid };
      }
      QSmall = (T * normalizedD * R) / (V * 100);
      doseEqTeorica = (normalizedD * R) / 100;
      fatorAjuste = R / V;
    }
  } else {
    return { isValid: false, error: 'Modo de cálculo não selecionado', quantidadePFSmall: 0, formattedQ: dummyEq, isSolid };
  }

  if (QSmall <= 0 || isNaN(QSmall) || !isFinite(QSmall)) {
    return { isValid: false, error: 'Resultado de produto calculado é nulo ou inválido', quantidadePFSmall: 0, formattedQ: dummyEq, isSolid };
  }

  const formattedQ = formatEquivalents(QSmall, isSolid, locale);

  return {
    isValid: true,
    quantidadePFSmall: QSmall,
    formattedQ,
    areaEnsaioM2: A,
    volumeAplicadoLHa: V,
    areaTratadaEstimadaM2: X,
    doseEquivalenteTeorica: doseEqTeorica,
    fatorAjusteRV: fatorAjuste,
    isSolid
  };
}
