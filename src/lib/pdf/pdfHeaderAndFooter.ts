import { rgb, type PDFDocument, type PDFFont, type PDFImage, type PDFPage, type RGB } from 'pdf-lib';
import { hexToPdfRgb, type ResolvedCoBranding } from './coBrandingConfigReader.ts';

export const PDF_MARGIN_X = 34;
export const PDF_CONTENT_W = 595.28 - PDF_MARGIN_X * 2;
export const PDF_FOOTER_FLOOR_Y = 98;

const C_FOREST = rgb(0.067, 0.251, 0.216);
const C_ACCENT = rgb(0.235, 0.651, 0.298);
const C_WHITE = rgb(1, 1, 1);
const C_SLATE_BG = rgb(0.973, 0.98, 0.988);
const C_BORDER = rgb(0.855, 0.882, 0.914);
const C_INK = rgb(0.118, 0.161, 0.231);
const C_MUTED = rgb(0.392, 0.455, 0.545);

const toRgb = (hex: string): RGB => {
  const { r, g, b } = hexToPdfRgb(hex);
  return rgb(r, g, b);
};

/** Normaliza texto PT-PT para codificação WinAnsi compatível com fontes Standard pdf-lib. */
export function safeWinAnsi(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\u0394/g, 'Delta ').replace(/\u2264/g, '<=').replace(/\u2265/g, '>=')
    .replace(/\u2260/g, '!=').replace(/\u2192/g, '->').replace(/\u2026/g, '...')
    .replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\u0020-\u00FF\u20AC]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function fmtPt(val: number | null | undefined, decimals = 2): string {
  if (typeof val !== 'number' || !Number.isFinite(val)) return '-';
  return val.toFixed(decimals).replace('.', ',');
}

export function drawPdfCardBox(
  page: PDFPage,
  x: number,
  yTop: number,
  width: number,
  height: number,
  title: string,
  boldFont: PDFFont,
  accent: RGB = C_FOREST
): number {
  page.drawRectangle({ x, y: yTop - height, width, height, color: C_SLATE_BG, borderColor: C_BORDER, borderWidth: 0.9 });
  page.drawRectangle({ x, y: yTop - 18, width, height: 18, color: accent });
  page.drawText(safeWinAnsi(title), { x: x + 8, y: yTop - 12.5, size: 7.5, font: boldFont, color: C_WHITE });
  return yTop - 28;
}

async function embedCoBrandLogo(pdfDoc: PDFDocument, dataUrl: string | null): Promise<PDFImage | null> {
  if (!dataUrl) return null;
  const m = /^data:image\/(png|jpeg|jpg);base64,(.+)$/i.exec(dataUrl.trim());
  if (!m) return null;
  try {
    const bin = atob(m[2]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return m[1].toLowerCase() === 'png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
  } catch {
    return null;
  }
}

export interface DrawAuditPdfHeaderParams {
  pdfDoc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  coBranding: ResolvedCoBranding;
  reportTitle: string;
  normativeSubtitle: string;
}

/** Desenha o cabeçalho institucional (Co-Branding Pro ativo ou padrão DATERRA Smart) e devolve o topo útil. */
export async function drawAuditPdfHeader(p: DrawAuditPdfHeaderParams): Promise<number> {
  const { pdfDoc, page, font, boldFont, coBranding, reportTitle, normativeSubtitle } = p;
  const pageH = page.getHeight();
  const pageW = page.getWidth();
  const badgeText = 'CALIBRAÇÃO & AUDITORIA ISO 16122';

  if (coBranding.enabled) {
    const bannerH = 74;
    const primary = toRgb(coBranding.primaryHex);
    const secondary = toRgb(coBranding.secondaryHex);
    const textCol = toRgb(coBranding.textHex);
    page.drawRectangle({ x: 0, y: pageH - bannerH, width: pageW, height: bannerH, color: primary });
    page.drawRectangle({ x: 0, y: pageH - bannerH - 3, width: pageW, height: 3, color: secondary });

    const [lx, ly, lw, lh] = [PDF_MARGIN_X, pageH - bannerH + 11, 78, 52];
    page.drawRectangle({ x: lx, y: ly, width: lw, height: lh, color: C_WHITE, borderColor: C_BORDER, borderWidth: 0.7 });
    const img = await embedCoBrandLogo(pdfDoc, coBranding.logoDataUrl);
    if (img) {
      const s = Math.min((lw - 8) / img.width, (lh - 8) / img.height);
      const [dw, dh] = [img.width * s, img.height * s];
      page.drawImage(img, { x: lx + (lw - dw) / 2, y: ly + (lh - dh) / 2, width: dw, height: dh });
    } else {
      const initials = safeWinAnsi(coBranding.companyName).split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || 'DT';
      const iw = boldFont.widthOfTextAtSize(initials, 15);
      page.drawText(initials, { x: lx + (lw - iw) / 2, y: ly + 20, size: 15, font: boldFont, color: primary });
    }

    const tx = lx + lw + 12;
    page.drawText(safeWinAnsi(coBranding.companyName) || 'Entidade Técnica', { x: tx, y: pageH - 25, size: 11, font: boldFont, color: textCol });
    const addr = safeWinAnsi([coBranding.address, coBranding.postalCodeAndCity].filter(Boolean).join(' · '));
    const contacts = safeWinAnsi([coBranding.phone, coBranding.email, coBranding.website].filter(Boolean).join(' · '));
    if (addr) page.drawText(addr.slice(0, 68), { x: tx, y: pageH - 39, size: 7.2, font, color: textCol });
    if (contacts) page.drawText(contacts.slice(0, 68), { x: tx, y: pageH - 51, size: 7.2, font, color: textCol });

    const bw = boldFont.widthOfTextAtSize(badgeText, 6.2) + 12;
    page.drawRectangle({ x: pageW - PDF_MARGIN_X - bw, y: pageH - 30, width: bw, height: 15, color: secondary });
    page.drawText(badgeText, { x: pageW - PDF_MARGIN_X - bw + 6, y: pageH - 25, size: 6.2, font: boldFont, color: C_WHITE });

    const subY = pageH - bannerH - 22;
    page.drawText(safeWinAnsi(reportTitle), { x: PDF_MARGIN_X, y: subY + 4, size: 10.5, font: boldFont, color: C_FOREST });
    page.drawText(safeWinAnsi(normativeSubtitle), { x: PDF_MARGIN_X, y: subY - 7, size: 7.2, font, color: C_MUTED });
    return subY - 16;
  }

  const bannerH = 66;
  page.drawRectangle({ x: 0, y: pageH - bannerH, width: pageW, height: bannerH, color: C_FOREST });
  page.drawRectangle({ x: 0, y: pageH - bannerH - 3, width: pageW, height: 3, color: C_ACCENT });
  page.drawText('DATERRA SMART', { x: PDF_MARGIN_X, y: pageH - 22, size: 8, font: boldFont, color: C_ACCENT });
  page.drawText(safeWinAnsi(reportTitle), { x: PDF_MARGIN_X, y: pageH - 38, size: 12, font: boldFont, color: C_WHITE });
  page.drawText(safeWinAnsi(normativeSubtitle), { x: PDF_MARGIN_X, y: pageH - 52, size: 7.2, font, color: rgb(0.84, 0.94, 0.89) });

  const bw = boldFont.widthOfTextAtSize(badgeText, 6.2) + 12;
  page.drawRectangle({ x: pageW - PDF_MARGIN_X - bw, y: pageH - 28, width: bw, height: 15, color: C_ACCENT });
  page.drawText(badgeText, { x: pageW - PDF_MARGIN_X - bw + 6, y: pageH - 23, size: 6.2, font: boldFont, color: C_WHITE });
  return pageH - bannerH - 14;
}

export interface DrawAuditPdfFooterParams {
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  sha256Seal: string;
  generatedAtIso: string;
  signerRoleLabel: string;
}

/** Desenha o rodapé legal com assinatura, timestamp UTC, selo SHA-256 e referência normativa. */
export function drawAuditPdfFooter(p: DrawAuditPdfFooterParams): void {
  const { page, font, boldFont, sha256Seal, generatedAtIso, signerRoleLabel } = p;
  const [boxY, boxH, leftW, rightX, rightW] = [34, 54, 305, PDF_MARGIN_X + 313, PDF_CONTENT_W - 313];
  page.drawRectangle({ x: PDF_MARGIN_X, y: boxY, width: leftW, height: boxH, color: C_SLATE_BG, borderColor: C_BORDER, borderWidth: 0.8 });
  page.drawText(safeWinAnsi(`Assinatura · ${signerRoleLabel}`), { x: PDF_MARGIN_X + 8, y: boxY + boxH - 12, size: 7, font: boldFont, color: C_FOREST });
  page.drawText(safeWinAnsi(`Emissão UTC: ${generatedAtIso.replace('T', ' ').slice(0, 19)} UTC`), { x: PDF_MARGIN_X + 8, y: boxY + boxH - 22, size: 6.5, font, color: C_MUTED });
  page.drawLine({ start: { x: PDF_MARGIN_X + 8, y: boxY + 13 }, end: { x: PDF_MARGIN_X + leftW - 10, y: boxY + 13 }, thickness: 0.6, color: C_MUTED, dashArray: [2, 2] });
  page.drawText('Rubrica do Operador / Técnico Responsável', { x: PDF_MARGIN_X + 8, y: boxY + 4, size: 6, font, color: C_MUTED });

  page.drawRectangle({ x: rightX, y: boxY, width: rightW, height: boxH, color: C_SLATE_BG, borderColor: C_BORDER, borderWidth: 0.8 });
  page.drawText('SELO CRIPTOGRÁFICO SHA-256', { x: rightX + 8, y: boxY + boxH - 12, size: 7, font: boldFont, color: C_FOREST });
  const seal = safeWinAnsi(sha256Seal).toLowerCase() || '-';
  page.drawText(seal.slice(0, 32), { x: rightX + 8, y: boxY + 25, size: 6.2, font, color: C_INK });
  page.drawText(seal.slice(32, 64), { x: rightX + 8, y: boxY + 16, size: 6.2, font, color: C_INK });
  page.drawText('Integridade determinística verificável', { x: rightX + 8, y: boxY + 5, size: 5.8, font, color: C_MUTED });

  const note = 'Calculado e auditado via motor agronómico DATERRA Smart (EPPO PP 1/239 · EN ISO 16122)';
  const nw = font.widthOfTextAtSize(note, 6.5);
  page.drawText(note, { x: (page.getWidth() - nw) / 2, y: 18, size: 6.5, font, color: C_MUTED });
}
