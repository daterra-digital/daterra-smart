import { rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { PreInspecaoPdfData } from './inspecaoPdfGenerator.ts';
import { sanitizeWinAnsi, drawBox, PDF_COLORS, PAGE_LAYOUT } from './inspecaoPdfHelpers.ts';

const COLS = {
  colNum: 25,
  colDesc: 270,
  colStatus: 100,
  colNotes: 120
};

export function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const words = sanitizeWinAnsi(text).split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

function drawTableHeader(page: PDFPage, fonts: { bold: PDFFont }, y: number): number {
  const x = PAGE_LAYOUT.margin;
  drawBox(page, x, y - 18, PAGE_LAYOUT.contentWidth, 18, PDF_COLORS.bgLight, PDF_COLORS.borderGray);
  page.drawText('#', { x: x + 6, y: y - 12, size: 7.5, font: fonts.bold, color: PDF_COLORS.textDark });
  page.drawText('REQUISITO TÉCNICO INSPECIONADO', { x: x + COLS.colNum + 6, y: y - 12, size: 7.5, font: fonts.bold, color: PDF_COLORS.textDark });
  page.drawText('ESTADO', { x: x + COLS.colNum + COLS.colDesc + 6, y: y - 12, size: 7.5, font: fonts.bold, color: PDF_COLORS.textDark });
  page.drawText('OBSERVAÇÕES / MEDIÇÃO', { x: x + COLS.colNum + COLS.colDesc + COLS.colStatus + 6, y: y - 12, size: 7.5, font: fonts.bold, color: PDF_COLORS.textDark });
  return y - 20;
}

export function renderExhaustiveChecklist(
  fonts: { regular: PDFFont; bold: PDFFont },
  data: PreInspecaoPdfData,
  initialPage: PDFPage,
  initialY: number,
  onNewPage: () => { page: PDFPage; startY: number }
): { currentPage: PDFPage; currentY: number } {
  let page = initialPage;
  let y = initialY;
  const x = PAGE_LAYOUT.margin;
  const isDGAV = data.evaluationStyle === 'dgav_oficial';

  y = drawTableHeader(page, fonts, y);

  let globalItemIndex = 1;
  for (const cat of data.categories) {
    if (y - 22 < 65) {
      const next = onNewPage();
      page = next.page;
      y = drawTableHeader(page, fonts, next.startY);
    }

    drawBox(page, x, y - 17, PAGE_LAYOUT.contentWidth, 17, rgb(0.92, 0.95, 0.93), PDF_COLORS.borderGray);
    page.drawText(sanitizeWinAnsi(cat.categoria.toUpperCase()), {
      x: x + 6,
      y: y - 12,
      size: 7.5,
      font: fonts.bold,
      color: PDF_COLORS.darkGreen
    });
    y -= 19;

    for (const sub of cat.subperguntas) {
      const status = data.answers[sub.id] || 'pendente';
      const lines = wrapText(sub.subpergunta, COLS.colDesc - 12, fonts.regular, 7.5);
      const rowH = Math.max(20, lines.length * 10 + 8);

      if (y - rowH < 65) {
        const next = onNewPage();
        page = next.page;
        y = drawTableHeader(page, fonts, next.startY);
      }

      drawBox(page, x, y - rowH, PAGE_LAYOUT.contentWidth, rowH, rgb(1, 1, 1), PDF_COLORS.borderGray);

      page.drawText(String(globalItemIndex), {
        x: x + 6,
        y: y - 13,
        size: 7.5,
        font: fonts.bold,
        color: PDF_COLORS.textMuted
      });

      let textY = y - 12;
      for (const line of lines) {
        page.drawText(line, { x: x + COLS.colNum + 6, y: textY, size: 7.5, font: fonts.regular, color: PDF_COLORS.textDark });
        textY -= 10;
      }

      let statusLabel = 'Pendente [-]';
      let statusColor = PDF_COLORS.textMuted;
      if (status === 'conforme') {
        statusLabel = 'Conforme [V]';
        statusColor = PDF_COLORS.lightGreen;
      } else if (status === 'anomalia') {
        statusLabel = isDGAV ? 'Grave [X]' : 'Não Conforme [X]';
        statusColor = rgb(0.85, 0.2, 0.2);
      }

      page.drawText(sanitizeWinAnsi(statusLabel), {
        x: x + COLS.colNum + COLS.colDesc + 6,
        y: y - 13,
        size: 7.5,
        font: fonts.bold,
        color: statusColor
      });

      page.drawLine({
        start: { x: x + COLS.colNum + COLS.colDesc + COLS.colStatus + 4, y: y - 13 },
        end: { x: x + PAGE_LAYOUT.contentWidth - 6, y: y - 13 },
        thickness: 0.5,
        color: PDF_COLORS.borderGray
      });

      y -= rowH;
      globalItemIndex++;
    }
  }

  return { currentPage: page, currentY: y };
}
