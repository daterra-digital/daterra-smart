import { rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { PreInspecaoPdfData } from './inspecaoPdfGenerator.ts';
import { isDroneEquipment, MANDATORY_DRONE_WARNING } from '../data/equipmentConfigs.ts';
import { sanitizeWinAnsi, drawBox, PDF_COLORS, PAGE_LAYOUT } from './inspecaoPdfHelpers.ts';

export { drawDocumentHeader } from './inspecaoPdfHeader.ts';

export function drawContinuationHeader(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  data: PreInspecaoPdfData,
  startY: number
): number {
  let y = startY;
  page.drawText('DATERRA SMART • PRÉ-INSPEÇÃO TÉCNICA', {
    x: PAGE_LAYOUT.margin,
    y,
    size: 8,
    font: fonts.bold,
    color: PDF_COLORS.lightGreen
  });
  const title = sanitizeWinAnsi(`${data.equipmentTitle} (Continuação da Checklist)`);
  page.drawText(title, { x: 230, y, size: 8, font: fonts.regular, color: PDF_COLORS.textMuted });
  y -= 8;
  page.drawLine({
    start: { x: PAGE_LAYOUT.margin, y },
    end: { x: PAGE_LAYOUT.margin + PAGE_LAYOUT.contentWidth, y },
    thickness: 0.8,
    color: PDF_COLORS.borderGray
  });
  return y - 14;
}

export function drawDroneWarning(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  equipmentId: string,
  startY: number
): number {
  if (!isDroneEquipment(equipmentId as any)) return startY;
  const boxH = 28;
  drawBox(page, PAGE_LAYOUT.margin, startY - boxH, PAGE_LAYOUT.contentWidth, boxH, PDF_COLORS.amberBg, PDF_COLORS.amberBorder);
  page.drawText('AVISO REGULAMENTAR OBRIGATÓRIO (DRONES / UAV):', {
    x: PAGE_LAYOUT.margin + 8,
    y: startY - 10,
    size: 7.2,
    font: fonts.bold,
    color: rgb(0.65, 0.42, 0.05)
  });
  page.drawText(sanitizeWinAnsi(MANDATORY_DRONE_WARNING), {
    x: PAGE_LAYOUT.margin + 8,
    y: startY - 20,
    size: 7.2,
    font: fonts.regular,
    color: PDF_COLORS.amberText
  });
  return startY - boxH - 10;
}

export function drawStatusCard(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  calcResult: any,
  startY: number
): number {
  const boxH = 50;
  drawBox(page, PAGE_LAYOUT.margin, startY - boxH, PAGE_LAYOUT.contentWidth, boxH, PDF_COLORS.darkGreen, PDF_COLORS.darkGreen);
  page.drawText('TAXA DE CONFORMIDADE GLOBAL', {
    x: PAGE_LAYOUT.margin + 12,
    y: startY - 14,
    size: 7.5,
    font: fonts.bold,
    color: PDF_COLORS.lightGreen
  });
  page.drawText(`${calcResult.conformityPct}%`, {
    x: PAGE_LAYOUT.margin + 12,
    y: startY - 40,
    size: 24,
    font: fonts.bold,
    color: rgb(1, 1, 1)
  });

  const statusLabel = sanitizeWinAnsi(calcResult.statusLabel.toUpperCase());
  const statusColor = calcResult.status === 'aprovado'
    ? PDF_COLORS.lightGreen
    : calcResult.status === 'reprovado'
    ? rgb(0.95, 0.35, 0.35)
    : rgb(0.96, 0.72, 0.24);
  page.drawText(statusLabel, { x: 135, y: startY - 23, size: 10, font: fonts.bold, color: statusColor });

  const statsText = sanitizeWinAnsi(
    `${calcResult.conformeCount} Conformes | ${calcResult.anomaliaCount} Anomalias / Falhas | ${calcResult.pendenteCount} Pendentes`
  );
  page.drawText(statsText, { x: 135, y: startY - 37, size: 8, font: fonts.regular, color: rgb(0.85, 0.9, 0.88) });
  return startY - boxH - 8;
}

export function drawDiagnosisBox(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  recommendation: string,
  startY: number
): number {
  const boxH = 28;
  drawBox(page, PAGE_LAYOUT.margin, startY - boxH, PAGE_LAYOUT.contentWidth, boxH, PDF_COLORS.bgLight, PDF_COLORS.borderGray);
  page.drawText('DIAGNÓSTICO TÉCNICO:', {
    x: PAGE_LAYOUT.margin + 8,
    y: startY - 10,
    size: 7.2,
    font: fonts.bold,
    color: PDF_COLORS.darkGreen
  });
  page.drawText(sanitizeWinAnsi(recommendation), {
    x: PAGE_LAYOUT.margin + 8,
    y: startY - 20,
    size: 7.8,
    font: fonts.regular,
    color: PDF_COLORS.textDark
  });
  return startY - boxH - 10;
}

export function drawSignatureBlock(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  startY: number
): number {
  const boxH = 36;
  drawBox(page, PAGE_LAYOUT.margin, startY - boxH, PAGE_LAYOUT.contentWidth, boxH, rgb(0.98, 0.99, 1), PDF_COLORS.borderGray);
  page.drawText('TERMO DE RESPONSABILIDADE TÉCNICA / AUDITORIA PRÉVIA IPP:', {
    x: PAGE_LAYOUT.margin + 8,
    y: startY - 11,
    size: 7,
    font: fonts.bold,
    color: PDF_COLORS.textDark
  });
  page.drawText('Declaro que os dados foram verificados no equipamento indicado. Assinatura do Responsável: _______________________________', {
    x: PAGE_LAYOUT.margin + 8,
    y: startY - 24,
    size: 6.8,
    font: fonts.regular,
    color: PDF_COLORS.textMuted
  });
  return startY - boxH - 6;
}

export function applyPageNumbers(pages: PDFPage[], fontRegular: PDFFont) {
  const total = pages.length;
  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const text = `Página ${i + 1} de ${total}`;
    page.drawText(text, {
      x: PAGE_LAYOUT.margin + PAGE_LAYOUT.contentWidth - 65,
      y: 18,
      size: 7.5,
      font: fontRegular,
      color: PDF_COLORS.textMuted
    });
  }
}
