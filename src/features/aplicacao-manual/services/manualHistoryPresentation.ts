/**
 * DATERRA Smart - Mapeador de Apresentação Humana do Histórico
 * Traduz valores, chaves e unidades sem termos técnicos (< 200 LOC)
 */

import type { StructuredValue } from '../../../types/calculator';

export interface HumanizedInputItem {
  id: string;
  label: string;
  displayValue: string;
}

export function humanizeManualInputs(
  inputs: Record<string, StructuredValue | undefined>,
  locale: string = 'pt-PT'
): HumanizedInputItem[] {
  const items: HumanizedInputItem[] = [];
  const numFmt = new Intl.NumberFormat(locale === 'en-GB' ? 'en-GB' : 'pt-PT');

  const formatNum = (v: any, maxDec = 2): string => {
    const n = Number(v);
    return isNaN(n) ? String(v) : numFmt.format(Number(n.toFixed(maxDec)));
  };

  // 1. Modo de cálculo
  const rawMode = inputs['mode']?.rawValue;
  if (rawMode) {
    items.push({
      id: 'mode',
      label: 'Tipo de aplicação',
      displayValue: rawMode === 'concentracao' ? 'Concentração' : 'Dose'
    });
  }

  // 2. Estado do produto
  const rawProd = inputs['productState']?.rawValue;
  if (rawProd) {
    items.push({
      id: 'productState',
      label: 'Tipo de produto',
      displayValue: rawProd === 'solido' ? 'Sólido' : 'Líquido'
    });
  }

  // 3. Quantidade indicada no rótulo
  const rotulo = inputs['rotuloValue'];
  if (rotulo && rotulo.rawValue !== undefined && rotulo.rawValue !== '') {
    const isDose = rawMode === 'dose';
    items.push({
      id: 'rotuloValue',
      label: isDose ? 'Dose indicada no rótulo' : 'Concentração indicada no rótulo',
      displayValue: `${formatNum(rotulo.rawValue)} ${rotulo.unit || ''}`.trim()
    });
  }

  // 4. Volume de calda a preparar
  const calda = inputs['caldaPrepararL'];
  if (calda && calda.rawValue !== undefined && calda.rawValue !== '') {
    items.push({
      id: 'caldaPrepararL',
      label: 'Volume de calda a preparar',
      displayValue: `${formatNum(calda.rawValue)} L`
    });
  }

  // 5. Estado vegetativo
  const stage = inputs['plantStage']?.rawValue;
  if (stage) {
    items.push({
      id: 'plantStage',
      label: 'Estado vegetativo',
      displayValue: stage === 'jovem' ? 'Planta jovem' : 'Planta adulta'
    });
  }

  // 6. Ensaio de medição de água
  const hasEnsaio = inputs['hasEnsaio']?.rawValue;
  if (hasEnsaio !== undefined) {
    const isRealizado = String(hasEnsaio) === 'true' || hasEnsaio === 1;
    items.push({
      id: 'hasEnsaio',
      label: 'Medição do ensaio',
      displayValue: isRealizado ? 'Ensaio realizado' : 'Sem ensaio'
    });
  }

  // 7. Método de ensaio de área
  const areaMethod = inputs['areaMethod']?.rawValue;
  if (areaMethod) {
    items.push({
      id: 'areaMethod',
      label: 'Método de área do ensaio',
      displayValue: areaMethod === 'faixa_medida' ? 'Faixa medida' : 'Área conhecida'
    });
  }

  // 8. Área conhecida
  const areaM2 = inputs['areaConhecidaM2'];
  if (areaM2 && areaM2.rawValue !== undefined && areaM2.rawValue !== '') {
    items.push({
      id: 'areaConhecidaM2',
      label: 'Área do ensaio',
      displayValue: `${formatNum(areaM2.rawValue)} m²`
    });
  }

  // 9. Faixa de ensaio
  const len = inputs['faixaComprimentoM'];
  if (len && len.rawValue !== undefined && len.rawValue !== '') {
    items.push({
      id: 'faixaComprimentoM',
      label: 'Comprimento da faixa',
      displayValue: `${formatNum(len.rawValue)} m`
    });
  }
  const wid = inputs['faixaLarguraM'];
  if (wid && wid.rawValue !== undefined && wid.rawValue !== '') {
    items.push({
      id: 'faixaLarguraM',
      label: 'Largura da faixa',
      displayValue: `${formatNum(wid.rawValue)} m`
    });
  }

  // 10. Água gasta
  const water = inputs['aguaGastaL'];
  if (water && water.rawValue !== undefined && water.rawValue !== '') {
    items.push({
      id: 'aguaGastaL',
      label: 'Água gasta no ensaio',
      displayValue: `${formatNum(water.rawValue)} L`
    });
  }

  // 11. Volume de referência
  const recVol = inputs['recVolumeLHa'];
  if (recVol && recVol.rawValue !== undefined && recVol.rawValue !== '') {
    const origin = inputs['recOrigin']?.rawValue;
    const originText = origin === 'predefinido' ? ' (Predefinido habitual)' : ' (Indicado no rótulo / editado)';
    items.push({
      id: 'recVolumeLHa',
      label: 'Volume de referência',
      displayValue: `${formatNum(recVol.rawValue)} L/ha${originText}`
    });
  }

  return items;
}
