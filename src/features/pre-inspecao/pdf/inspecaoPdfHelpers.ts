import { rgb, type PDFPage, type PDFFont } from 'pdf-lib';

export const PDF_COLORS = {
  darkGreen: rgb(0.067, 0.251, 0.216),
  lightGreen: rgb(0.235, 0.651, 0.298),
  textDark: rgb(0.12, 0.16, 0.22),
  textMuted: rgb(0.4, 0.45, 0.52),
  bgLight: rgb(0.97, 0.98, 0.99),
  borderGray: rgb(0.85, 0.88, 0.9),
  amberBg: rgb(0.99, 0.96, 0.89),
  amberBorder: rgb(0.96, 0.72, 0.24),
  amberText: rgb(0.45, 0.28, 0.02)
};

export const PAGE_LAYOUT = {
  width: 595.28,
  height: 841.89,
  margin: 40,
  contentWidth: 515.28
};

export function sanitizeWinAnsi(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    .replace(/[•]/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/[≥]/g, '>=')
    .replace(/[≤]/g, '<=')
    .replace(/[±]/g, '+/-')
    .replace(/²/g, '2')
    .replace(/³/g, '3');
}

export function drawBox(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor = rgb(1, 1, 1),
  borderColor = rgb(0.85, 0.88, 0.9)
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: fillColor,
    borderColor,
    borderWidth: 1
  });
}

export function drawHeaderBadge(
  page: PDFPage,
  fontBold: PDFFont,
  text: string,
  x: number,
  y: number,
  bgColor = rgb(0.067, 0.251, 0.216),
  textColor = rgb(1, 1, 1)
) {
  const clean = sanitizeWinAnsi(text);
  const textWidth = fontBold.widthOfTextAtSize(clean, 8);
  page.drawRectangle({
    x,
    y: y - 3,
    width: textWidth + 12,
    height: 16,
    color: bgColor,
    borderWidth: 0
  });
  page.drawText(clean, {
    x: x + 6,
    y,
    size: 8,
    font: fontBold,
    color: textColor
  });
}
