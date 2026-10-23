import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { CoBrandingConfig } from '../smart-debito/types';
import { getStoredCoBrandingConfig } from '../smart-debito/coBrandingStorage';
import type { EppoDoseInputs, EppoDoseResults, LabelDoseType } from './types';
import { formatEppoNum } from './calculations';
import {
  hexToPdfRgb,
  loadLogoPngBytes,
  drawSectionBox,
  sanitizeWinAnsi
} from './eppoPdfHelpers';

export interface EppoCalculationData {
  inputs: EppoDoseInputs;
  results: EppoDoseResults;
  dateIso?: string;
}

function getDoseExpressionLabel(type: LabelDoseType, isLiquid: boolean): string {
  switch (type) {
    case 'D_GA':
      return `${isLiquid ? 'L/ha' : 'kg/ha'} de Área de Superfície (D_GA)`;
    case 'D_LWA':
      return `${isLiquid ? 'L' : 'kg'} / 10.000 m² de Parede Foliar (D_LWA)`;
    case 'D_TRV':
      return `${isLiquid ? 'L' : 'kg'} / 10.000 m³ de Volume de Copa (D_TRV)`;
    case 'D_hl':
      return `${isLiquid ? 'mL/hL' : 'g/hL'} de Concentração na Calda (D_hL)`;
    case 'D_pct':
      return `% de Concentração na Calda`;
    default:
      return type;
  }
}

export async function generateEppoPdfReport(
  data: EppoCalculationData,
  coBranding: CoBrandingConfig = getStoredCoBrandingConfig()
): Promise<void> {
  const { inputs, results } = data;
  const reportDate = data.dateIso ? new Date(data.dateIso) : new Date();
  const isWallCrop = inputs.cropReference === 'vinha';
  const isLiquid = inputs.unitMode === 'liquid';
  const unitLarge = isLiquid ? 'L' : 'kg';
  const unitSmall = isLiquid ? 'mL' : 'g';

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Relatorio_Oficial_Ajuste_Dose_EPPO');
  pdfDoc.setAuthor(coBranding.isEnabled ? coBranding.companyName : 'DATERRA Smart');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const primaryRgb = coBranding.isEnabled
    ? hexToPdfRgb(coBranding.primaryColor)
    : rgb(0.067, 0.251, 0.216);
  const secondaryRgb = coBranding.isEnabled
    ? hexToPdfRgb(coBranding.secondaryColor)
    : rgb(0.235, 0.651, 0.298);
  const bannerTextRgb = coBranding.isEnabled
    ? hexToPdfRgb(coBranding.textColor)
    : rgb(1, 1, 1);

  // 1. CABEÇALHO (BANNER DE CO-BRANDING OU PADRÃO DATERRA)
  const bannerTop = pageHeight - 32;
  const bannerHeight = 76;
  const bannerBottom = bannerTop - bannerHeight;

  page.drawRectangle({
    x: 36,
    y: bannerBottom,
    width: pageWidth - 72,
    height: bannerHeight,
    color: primaryRgb,
    borderColor: secondaryRgb,
    borderWidth: 1.5
  });

  const logoBoxX = 48;
  const logoBoxY = bannerBottom + 11;
  const logoBoxW = 104;
  const logoBoxH = 54;

  page.drawRectangle({
    x: logoBoxX,
    y: logoBoxY,
    width: logoBoxW,
    height: logoBoxH,
    color: rgb(1, 1, 1),
    borderColor: secondaryRgb,
    borderWidth: 1
  });

  const logoBytes = coBranding.isEnabled ? await loadLogoPngBytes(coBranding.logoUrl) : null;
  if (logoBytes) {
    try {
      const pngImg = await pdfDoc.embedPng(logoBytes);
      const maxW = logoBoxW - 10;
      const maxH = logoBoxH - 10;
      const aspect = pngImg.width / pngImg.height;
      let drawW = maxW;
      let drawH = drawW / aspect;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * aspect;
      }
      page.drawImage(pngImg, {
        x: logoBoxX + (logoBoxW - drawW) / 2,
        y: logoBoxY + (logoBoxH - drawH) / 2,
        width: drawW,
        height: drawH
      });
    } catch {
      // Fallback caso a imagem falhe
    }
  } else {
    page.drawText('DATERRA SMART', {
      x: logoBoxX + 14,
      y: logoBoxY + 23,
      size: 9,
      font: fontBold,
      color: primaryRgb
    });
  }

  const infoX = logoBoxX + logoBoxW + 16;
  const companyTitle =
    coBranding.isEnabled && coBranding.companyName
      ? coBranding.companyName
      : 'DATERRA Smart - Agricultura de Precisao';

  page.drawText(sanitizeWinAnsi(companyTitle), {
    x: infoX,
    y: bannerBottom + 48,
    size: 13,
    font: fontBold,
    color: bannerTextRgb
  });

  if (coBranding.isEnabled) {
    const addrLine = [coBranding.address, coBranding.postalCode].filter(Boolean).join(' - ');
    const contactLine = [
      coBranding.phone ? `Tel: ${coBranding.phone}` : '',
      coBranding.email ? `E-mail: ${coBranding.email}` : ''
    ]
      .filter(Boolean)
      .join('  |  ');

    page.drawText(sanitizeWinAnsi(addrLine), {
      x: infoX,
      y: bannerBottom + 31,
      size: 8.5,
      font: fontRegular,
      color: bannerTextRgb
    });
    page.drawText(sanitizeWinAnsi(contactLine), {
      x: infoX,
      y: bannerBottom + 16,
      size: 8,
      font: fontRegular,
      color: bannerTextRgb
    });
  }

  // 2. TÍTULO DO RELATÓRIO E DATA/HORA
  let cursorY = bannerBottom - 26;
  page.drawText(
    sanitizeWinAnsi('Relatorio Oficial de Ajuste de Dose - Metodo EPPO PP 1/239 (3)'),
    {
      x: 36,
      y: cursorY,
      size: 13.5,
      font: fontBold,
      color: primaryRgb
    }
  );
  page.drawText(
    sanitizeWinAnsi(`Emitido em: ${reportDate.toLocaleString('pt-PT')}`),
    {
      x: 36,
      y: cursorY - 15,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.5)
    }
  );

  cursorY -= 32;

  // SECÇÃO 1: GEOMETRIA DA PARCELA
  const shapeName =
    inputs.shapeFactor === 0.75
      ? 'Conica (SF 0.75)'
      : inputs.shapeFactor === 0.85
        ? 'Globular (SF 0.85)'
        : 'Retangular (SF 1.00)';

  const geomRows: [string, string][] = isWallCrop
    ? [
        ['Cultura e Metodo:', 'Vinha | Sebe (Metodo LWA)'],
        ['Altura Tratada (h):', `${formatEppoNum(inputs.canopyHeightM, 2)} m`],
        ['Entrelinha (r):', `${formatEppoNum(inputs.rowSpacingM, 2)} m`],
        [
          'Indice Biometrico Real (Parede Foliar LWA):',
          `${formatEppoNum(results.lwaM2Ha, 0)} m2/ha (Ref. EPPO: 10.000 m2/ha)`
        ]
      ]
    : [
        ['Cultura e Metodo:', 'Pomar | Fruteiras (Metodo TRV)'],
        ['Altura Tratada (h):', `${formatEppoNum(inputs.canopyHeightM, 2)} m`],
        ['Largura da Copa (w):', `${formatEppoNum(inputs.canopyWidthM, 2)} m`],
        ['Entrelinha (r) e Fator de Forma (SF):', `${formatEppoNum(inputs.rowSpacingM, 2)} m  |  ${shapeName}`],
        [
          'Indice Biometrico Real (Volume de Copa TRV):',
          `${formatEppoNum(results.trvM3Ha, 0)} m3/ha (Ref. EPPO: 10.000 m3/ha)`
        ]
      ];

  cursorY = drawSectionBox(
    page,
    cursorY,
    isWallCrop ? 112 : 130,
    '1. GEOMETRIA DA PARCELA E ARQUITETURA DA COPA',
    geomRows,
    fontRegular,
    fontBold,
    primaryRgb
  );

  // SECÇÃO 2: ESPECIFICAÇÃO HOMOLOGADA (RÓTULO)
  cursorY = drawSectionBox(
    page,
    cursorY,
    78,
    '2. ESPECIFICACAO HOMOLOGADA (ROTULO)',
    [
      ['Estado do Produto:', isLiquid ? 'Produto Liquido (L / mL)' : 'Produto Solido (kg / g)'],
      [
        'Dose Original do Rotulo:',
        `${formatEppoNum(inputs.labelDoseValue, 2)} ${getDoseExpressionLabel(inputs.labelDoseType, isLiquid)}`
      ]
    ],
    fontRegular,
    fontBold,
    primaryRgb
  );

  // SECÇÃO 3: CALIBRAÇÃO DE CAMPO
  cursorY = drawSectionBox(
    page,
    cursorY,
    94,
    '3. CALIBRACAO DE CAMPO (MAQUINA & DEPOSITO)',
    [
      ['Capacidade do Deposito:', `${formatEppoNum(inputs.tankCapacityL, 0)} L`],
      ['Volume de Calda a Aplicar:', `${formatEppoNum(inputs.sprayVolumeLHa, 0)} L/ha`],
      ['Area Tratada por Deposito:', `${formatEppoNum(results.treatedAreaPerTankHa, 2)} ha`]
    ],
    fontRegular,
    fontBold,
    primaryRgb
  );

  // SECÇÃO 4: RESULTADOS DA CONVERSÃO (DESTAQUE VISUAL)
  const resHeight = 115;
  const resBottom = cursorY - resHeight;
  page.drawRectangle({
    x: 36,
    y: resBottom,
    width: pageWidth - 72,
    height: resHeight,
    color: primaryRgb,
    borderColor: secondaryRgb,
    borderWidth: 1.5
  });

  page.drawText('4. RESULTADOS DA CONVERSAO E DOSE NO DEPOSITO', {
    x: 50,
    y: cursorY - 22,
    size: 10.5,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  page.drawText(
    sanitizeWinAnsi(
      `Dose Ajustada de Solo (D_GA): ${formatEppoNum(results.adjustedDoseHa, 2)} ${unitLarge}/ha   |   Concentracao na Calda: ${formatEppoNum(results.equivalentConcentrationHl, 0)} ${unitSmall}/hL`
    ),
    {
      x: 50,
      y: cursorY - 46,
      size: 10,
      font: fontBold,
      color: rgb(0.9, 0.96, 0.93)
    }
  );

  page.drawText(
    sanitizeWinAnsi(
      `PRODUTO NO DEPOSITO (${inputs.tankCapacityL} L):  ${formatEppoNum(results.productInTankMethod1Large, 2)} ${unitLarge}  (${formatEppoNum(results.productInTankMethod1Small, 0)} ${unitSmall})`
    ),
    {
      x: 50,
      y: cursorY - 82,
      size: 15,
      font: fontBold,
      color: rgb(1, 1, 1)
    }
  );

  // RODAPÉ INSTITUCIONAL
  const footerCompany =
    coBranding.isEnabled && coBranding.companyName
      ? coBranding.companyName
      : 'DATERRA Smart';
  page.drawLine({
    start: { x: 36, y: 46 },
    end: { x: pageWidth - 36, y: 46 },
    color: rgb(0.82, 0.85, 0.88),
    thickness: 0.8
  });
  page.drawText(
    sanitizeWinAnsi(`Gerado por DATERRA Smart App - ${footerCompany}`),
    {
      x: 36,
      y: 30,
      size: 8.5,
      font: fontBold,
      color: primaryRgb
    }
  );

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Relatorio_Ajuste_Dose_EPPO_${reportDate.toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
