import { rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import { sanitizeWinAnsi } from '../smart-debito/services/smartDebitoPdfExport';

export { sanitizeWinAnsi };

export function hexToPdfRgb(hex: string) {
  try {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const num = Number.parseInt(clean, 16);
    if (Number.isNaN(num)) return rgb(0.067, 0.251, 0.216);
    return rgb(((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255);
  } catch {
    return rgb(0.067, 0.251, 0.216);
  }
}

export async function loadLogoPngBytes(imageUrl: string | null): Promise<Uint8Array | null> {
  if (!imageUrl || typeof window === 'undefined' || typeof document === 'undefined') return null;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
    if (!loaded || img.naturalWidth <= 0 || img.naturalHeight <= 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const pngDataUrl = canvas.toDataURL('image/png');
    const base64Part = pngDataUrl.split(',')[1];
    if (!base64Part) return null;

    const binary = atob(base64Part);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

export function drawSectionBox(
  page: PDFPage,
  yTop: number,
  height: number,
  title: string,
  rows: [string, string][],
  fontRegular: PDFFont,
  fontBold: PDFFont,
  accentColor = rgb(0.067, 0.251, 0.216)
): number {
  const x = 36;
  const width = 595.28 - 72;
  const boxBottom = yTop - height;

  page.drawRectangle({
    x,
    y: boxBottom,
    width,
    height,
    color: rgb(0.98, 0.985, 0.985),
    borderColor: rgb(0.86, 0.89, 0.91),
    borderWidth: 1
  });

  page.drawRectangle({
    x,
    y: yTop - 24,
    width,
    height: 24,
    color: accentColor
  });

  page.drawText(sanitizeWinAnsi(title), {
    x: x + 12,
    y: yTop - 16,
    size: 9.5,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  let rowY = yTop - 42;
  for (const [label, value] of rows) {
    page.drawText(sanitizeWinAnsi(label), {
      x: x + 12,
      y: rowY,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.4)
    });
    page.drawText(sanitizeWinAnsi(value), {
      x: x + 250,
      y: rowY,
      size: 9.5,
      font: fontBold,
      color: rgb(0.08, 0.12, 0.16)
    });
    rowY -= 18;
  }

  return boxBottom - 14;
}
