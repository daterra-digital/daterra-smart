import type { PDFPage, PDFFont } from 'pdf-lib';
import type { PreInspecaoPdfData } from './inspecaoPdfGenerator.ts';
import { sanitizeWinAnsi, drawBox, PDF_COLORS, PAGE_LAYOUT } from './inspecaoPdfHelpers.ts';

export function drawDocumentHeader(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  data: PreInspecaoPdfData,
  startY: number
): number {
  const y = startY;
  const leftX = PAGE_LAYOUT.margin;
  const colWidth = 295;
  const rightX = PAGE_LAYOUT.margin + colWidth + 15;
  const slotWidth = PAGE_LAYOUT.contentWidth - colWidth - 15;
  const slotH = 54;

  // Coluna Esquerda: Marca DATERRA Smart e Título do Documento Técnico
  page.drawText('DATERRA SMART - SUITE AGRÍCOLA', {
    x: leftX,
    y: y - 2,
    size: 8,
    font: fonts.bold,
    color: PDF_COLORS.lightGreen
  });

  const titleText = sanitizeWinAnsi(`Boletim de Pré-Inspeção: ${data.equipmentTitle}`);
  page.drawText(titleText, {
    x: leftX,
    y: y - 18,
    size: 13,
    font: fonts.bold,
    color: PDF_COLORS.darkGreen
  });

  const styleText = sanitizeWinAnsi(
    data.evaluationStyle === 'dgav_oficial'
      ? 'Enquadramento: Inspeção Oficial Portugal (DGAV) • DL 26/2017'
      : 'Enquadramento: Norma Europeia ISO 16122 (Partes 1 a 4)'
  );
  page.drawText(styleText, {
    x: leftX,
    y: y - 31,
    size: 7.8,
    font: fonts.regular,
    color: PDF_COLORS.textMuted
  });

  const dateStr = new Date(data.dateIso || Date.now()).toLocaleDateString('pt-PT');
  page.drawText(`Data de Emissão: ${dateStr}`, {
    x: leftX,
    y: y - 43,
    size: 7.5,
    font: fonts.regular,
    color: PDF_COLORS.textMuted
  });

  // Coluna Direita: Slot Oficial de Co-Branding (Altura Fixa: 54 pt)
  drawBox(page, rightX, y - slotH, slotWidth, slotH, PDF_COLORS.bgLight, PDF_COLORS.borderGray);

  const coBranding = data.coBranding;
  if (coBranding && coBranding.isEnabled && coBranding.companyName) {
    page.drawText('ENTIDADE AUDITORA / CENTRO IPP', {
      x: rightX + 8,
      y: y - 12,
      size: 6.8,
      font: fonts.bold,
      color: PDF_COLORS.darkGreen
    });
    const entityName = sanitizeWinAnsi(coBranding.companyName);
    page.drawText(entityName, {
      x: rightX + 8,
      y: y - 24,
      size: 8,
      font: fonts.bold,
      color: PDF_COLORS.textDark
    });
    const subInfo = sanitizeWinAnsi(coBranding.address || coBranding.website || 'Centro Reconhecido DGAV');
    page.drawText(subInfo, {
      x: rightX + 8,
      y: y - 35,
      size: 6.8,
      font: fonts.regular,
      color: PDF_COLORS.textMuted
    });
    const contact = sanitizeWinAnsi(coBranding.phone || coBranding.email || 'Licença Oficial IPP');
    page.drawText(contact, {
      x: rightX + 8,
      y: y - 46,
      size: 6.8,
      font: fonts.regular,
      color: PDF_COLORS.textMuted
    });
  } else {
    // Fallback limpo com altura técnica estritamente fixa
    page.drawText('ENTIDADE EMISSORA / AUDITOR', {
      x: rightX + 8,
      y: y - 12,
      size: 6.8,
      font: fonts.bold,
      color: PDF_COLORS.textMuted
    });
    page.drawText('Centro de Inspeção IPP / Técnico', {
      x: rightX + 8,
      y: y - 24,
      size: 8,
      font: fonts.bold,
      color: PDF_COLORS.textDark
    });
    page.drawText('Registo / Acreditação Oficial de Campo', {
      x: rightX + 8,
      y: y - 35,
      size: 6.8,
      font: fonts.regular,
      color: PDF_COLORS.textMuted
    });
    page.drawText('Auditoria Técnica e Calibração Agronómica', {
      x: rightX + 8,
      y: y - 46,
      size: 6.8,
      font: fonts.regular,
      color: PDF_COLORS.textMuted
    });
  }

  return y - slotH - 10;
}
