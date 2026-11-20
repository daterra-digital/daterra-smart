import { rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import { computeBilateralAxisScale } from '../../features/settings/nozzles/components/svg-schemes/SvgBilateralAxisOverlay.tsx';
import { computeBoomAxisScale } from '../../features/settings/nozzles/components/svg-schemes/SvgBoomAxisOverlay.tsx';
import { resolveSlotDotFill } from '../../features/settings/nozzles/components/svg-schemes/SvgUniformFanSymbol.tsx';
import { calculateFlowDeviationPct, isIso16122DeviationExceeded } from '../../features/settings/nozzles/services/nozzleProfileMath.ts';
import type { NozzleProfile, NozzleSlotConfig } from '../../schemas/nozzle-profile.schema.ts';
import { hexToPdfRgb } from './coBrandingConfigReader.ts';

export interface DrawNozzleProfileChartParams {
  page: PDFPage;
  x: number;
  yTop: number;
  width: number;
  height: number;
  nozzleProfile: NozzleProfile | null;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  showToleranceBand?: boolean;
}

const C = {
  bg: rgb(0.973, 0.98, 0.988), border: rgb(0.886, 0.91, 0.941), grid: rgb(0.796, 0.835, 0.882),
  ink: rgb(0.118, 0.161, 0.231), muted: rgb(0.392, 0.455, 0.545), blue: rgb(0.145, 0.388, 0.922),
  rose: rgb(0.882, 0.114, 0.282), tolFill: rgb(0.863, 0.988, 0.906), tolEdge: rgb(0.086, 0.639, 0.29),
  forest: rgb(0.067, 0.251, 0.216)
} as const;

const toRgb = (hex: string): RGB => {
  const { r, g, b } = hexToPdfRgb(hex);
  return rgb(r, g, b);
};
const fmtPt = (v: number): string => v.toFixed(2).replace('.', ',');
const fmtTickPt = (v: number): string => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ','));
const dashLine = (page: PDFPage, x1: number, y1: number, x2: number, y2: number, color: RGB, dash = [2, 2], t = 0.5) =>
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: t, color, dashArray: dash });

function slotMetrics(slot: NozzleSlotConfig) {
  const tabulated = Math.max(0, slot.flowAtPressureLMin ?? 0);
  const measured = slot.measuredFlowLMin;
  const displayFlow = slot.isActive ? Math.max(0, measured ?? tabulated) : 0;
  const critical = slot.isActive && isIso16122DeviationExceeded(calculateFlowDeviationPct(tabulated, measured));
  return { tabulated, displayFlow, barColor: critical ? C.rose : C.blue, dotColor: toRgb(resolveSlotDotFill(slot)) };
}

function drawFrameAndLegend(p: DrawNozzleProfileChartParams, subtitle: string) {
  const { page, x, yTop, width, height, fontRegular, fontBold } = p;
  page.drawRectangle({ x, y: yTop - height, width, height, color: C.bg, borderColor: C.border, borderWidth: 1 });
  page.drawText('PERFIL DE DÉBITOS DOS BICOS (L/min)', { x: x + 10, y: yTop - 13, size: 7, font: fontBold, color: C.forest });
  page.drawText(subtitle, { x: x + width - fontRegular.widthOfTextAtSize(subtitle, 6.5) - 10, y: yTop - 13, size: 6.5, font: fontRegular, color: C.muted });

  const ly = yTop - height + 8;
  const items: Array<{ label: string; kind: 'blue' | 'rose' | 'tol' | 'dot' }> = [
    { label: 'Conforme (<= 10%)', kind: 'blue' }, { label: 'Desvio Crítico (> 10%)', kind: 'rose' },
    { label: 'Faixa Alvo ±10% (ISO 16122)', kind: 'tol' }, { label: 'Fechado', kind: 'dot' }
  ];
  let cx = x + 10;
  for (const item of items) {
    if (item.kind === 'blue' || item.kind === 'rose') {
      page.drawRectangle({ x: cx, y: ly, width: 6, height: 6, color: item.kind === 'blue' ? C.blue : C.rose });
    } else if (item.kind === 'tol') {
      page.drawRectangle({ x: cx, y: ly, width: 8, height: 6, color: C.tolFill });
      dashLine(page, cx, ly + 3, cx + 8, ly + 3, C.tolEdge, [2, 1.5], 1);
    } else {
      page.drawCircle({ x: cx + 3, y: ly + 3, size: 2.8, color: C.grid, borderColor: C.muted, borderWidth: 0.6 });
    }
    cx += item.kind === 'tol' ? 11 : 9;
    page.drawText(item.label, { x: cx, y: ly + 0.5, size: 5.8, font: fontRegular, color: C.muted });
    cx += fontRegular.widthOfTextAtSize(item.label, 5.8) + 10;
  }
  return { plotTop: yTop - 22, plotBottom: yTop - height + 24 };
}

function drawBilateral3dChart(p: DrawNozzleProfileChartParams, slots: NozzleSlotConfig[]) {
  const { page, x, width, fontRegular, fontBold, showToleranceBand } = p;
  const { plotTop, plotBottom } = drawFrameAndLegend(p, 'Simetria Bilateral 3D');
  const scale = computeBilateralAxisScale(slots);
  const centerX = x + width / 2;
  const maxBarW = Math.max(24, width / 2 - 24 - 44);
  const [leftAnchor, rightAnchor] = [centerX - 24, centerX + 24];
  const levels = Array.from(new Set(slots.map((s) => s.levelIndex ?? s.slotIndex))).sort((a, b) => a - b);
  const [axisY, rowsTop] = [plotBottom + 10, plotTop - 12];
  const rowStep = (rowsTop - (axisY + 8)) / Math.max(1, levels.length);
  const barH = Math.min(10, Math.max(4, rowStep * 0.54));

  page.drawText('ESQ.', { x: leftAnchor - maxBarW * 0.5 - 8, y: plotTop - 5, size: 6.5, font: fontBold, color: C.forest });
  page.drawText('DIR.', { x: rightAnchor + maxBarW * 0.5 - 8, y: plotTop - 5, size: 6.5, font: fontBold, color: C.forest });
  page.drawCircle({ x: centerX, y: axisY + 6, size: 5.5, color: C.forest });
  for (const tick of scale.ticks) {
    const dx = (tick / scale.maxAxis) * maxBarW;
    const lbl = fmtTickPt(tick);
    const lw = fontRegular.widthOfTextAtSize(lbl, 5.2);
    for (const tx of [leftAnchor - dx, rightAnchor + dx]) {
      dashLine(page, tx, axisY, tx, rowsTop, C.grid, [2, 2], 0.4);
      page.drawText(lbl, { x: tx - lw / 2, y: axisY - 7, size: 5.2, font: fontRegular, color: C.muted });
    }
  }

  levels.forEach((lvl, idx) => {
    const rowY = axisY + 8 + rowStep * (idx + 0.5);
    page.drawText(`N${lvl}`, { x: centerX - 15, y: rowY - 2, size: 5.5, font: fontBold, color: C.muted });
    const wings: Array<{ slot?: NozzleSlotConfig; dir: -1 | 1; anchor: number }> = [
      { slot: slots.find((s) => (s.levelIndex ?? s.slotIndex) === lvl && s.sectionSide !== 'RIGHT'), dir: -1, anchor: leftAnchor },
      { slot: slots.find((s) => (s.levelIndex ?? s.slotIndex) === lvl && s.sectionSide === 'RIGHT'), dir: 1, anchor: rightAnchor }
    ];
    for (const { slot, dir, anchor } of wings) {
      if (!slot) continue;
      const m = slotMetrics(slot);
      if (showToleranceBand && slot.isActive && m.tabulated > 0) {
        const minW = Math.min(maxBarW, ((m.tabulated * 0.9) / scale.maxAxis) * maxBarW);
        const maxW = Math.min(maxBarW, ((m.tabulated * 1.1) / scale.maxAxis) * maxBarW);
        page.drawRectangle({ x: dir === -1 ? anchor - maxW : anchor + minW, y: rowY - barH / 2 - 1, width: Math.max(1, maxW - minW), height: barH + 2, color: C.tolFill });
        dashLine(page, anchor + dir * minW, rowY - barH / 2 - 1, anchor + dir * minW, rowY + barH / 2 + 1, C.tolEdge, [1.5, 1.5], 0.7);
        dashLine(page, anchor + dir * maxW, rowY - barH / 2 - 1, anchor + dir * maxW, rowY + barH / 2 + 1, C.tolEdge, [1.5, 1.5], 0.7);
      }
      const w = Math.min(maxBarW, (m.displayFlow / scale.maxAxis) * maxBarW);
      if (slot.isActive && w > 0.5) page.drawRectangle({ x: dir === -1 ? anchor - w : anchor, y: rowY - barH / 2, width: w, height: barH, color: m.barColor });
      else if (!slot.isActive) page.drawRectangle({ x: dir === -1 ? anchor - 14 : anchor, y: rowY - barH / 2, width: 14, height: barH, borderColor: C.grid, borderWidth: 0.7, borderDashArray: [2, 2] });
      page.drawCircle({ x: anchor + dir * 2.5, y: rowY, size: 2.5, color: m.dotColor, borderColor: C.ink, borderWidth: 0.4 });
      const valTxt = slot.isActive ? fmtPt(m.displayFlow) : 'Fech.';
      const tipX = anchor + dir * (slot.isActive ? w + 3 : 17);
      page.drawText(valTxt, { x: dir === -1 ? tipX - fontRegular.widthOfTextAtSize(valTxt, 5.5) : tipX, y: rowY - 2, size: 5.5, font: fontRegular, color: m.barColor === C.rose ? C.rose : C.ink });
    }
  });
}

function drawHorizontal2dChart(p: DrawNozzleProfileChartParams, slots: NozzleSlotConfig[]) {
  const { page, x, width, fontRegular, fontBold, showToleranceBand } = p;
  const { plotTop, plotBottom } = drawFrameAndLegend(p, 'Barra Horizontal 2D');
  const ordered = [...slots].sort((a, b) => a.slotIndex - b.slotIndex);
  const scale = computeBoomAxisScale(ordered);
  const leftX = x + 28;
  const rightX = x + width - 14;
  const baseY = plotBottom + 14;
  const chartH = Math.max(30, plotTop - baseY - 12);
  const colStep = (rightX - leftX) / Math.max(1, ordered.length);
  const barW = Math.min(14, Math.max(3.5, colStep * 0.58));

  for (const tick of scale.ticks) {
    const ty = baseY + (tick / scale.maxAxis) * chartH;
    dashLine(page, leftX, ty, rightX, ty, C.grid, [2, 2], 0.4);
    page.drawText(fmtTickPt(tick), { x: x + 8, y: ty - 2, size: 5.2, font: fontRegular, color: C.muted });
  }
  page.drawLine({ start: { x: leftX, y: baseY }, end: { x: rightX, y: baseY }, thickness: 0.9, color: C.muted });

  let lastSector: number | undefined;
  ordered.forEach((slot, idx) => {
    const cx = leftX + colStep * (idx + 0.5);
    if (slot.sectorIndex !== undefined && slot.sectorIndex !== lastSector) {
      if (lastSector !== undefined) dashLine(page, leftX + colStep * idx, baseY, leftX + colStep * idx, plotTop - 2, C.grid, [3, 2], 0.7);
      page.drawText(`S${slot.sectorIndex}`, { x: cx - 3, y: plotTop - 6, size: 5.5, font: fontBold, color: C.forest });
      lastSector = slot.sectorIndex;
    }
    const m = slotMetrics(slot);
    if (showToleranceBand && slot.isActive && m.tabulated > 0) {
      const yMin = baseY + Math.min(chartH, ((m.tabulated * 0.9) / scale.maxAxis) * chartH);
      const yMax = baseY + Math.min(chartH, ((m.tabulated * 1.1) / scale.maxAxis) * chartH);
      page.drawRectangle({ x: cx - barW / 2 - 1, y: yMin, width: barW + 2, height: Math.max(1, yMax - yMin), color: C.tolFill });
      dashLine(page, cx - barW / 2 - 1, yMin, cx + barW / 2 + 1, yMin, C.tolEdge, [1.5, 1.5], 0.6);
      dashLine(page, cx - barW / 2 - 1, yMax, cx + barW / 2 + 1, yMax, C.tolEdge, [1.5, 1.5], 0.6);
    }
    const bh = Math.min(chartH, (m.displayFlow / scale.maxAxis) * chartH);
    if (slot.isActive && bh > 0.5) page.drawRectangle({ x: cx - barW / 2, y: baseY, width: barW, height: bh, color: m.barColor });
    else if (!slot.isActive) page.drawRectangle({ x: cx - barW / 2, y: baseY, width: barW, height: 8, borderColor: C.grid, borderWidth: 0.6, borderDashArray: [2, 2] });
    page.drawCircle({ x: cx, y: baseY, size: 2.3, color: m.dotColor, borderColor: C.ink, borderWidth: 0.4 });
    if (ordered.length <= 24 || idx % 2 === 0) {
      const bLbl = `B${slot.slotIndex}`;
      page.drawText(bLbl, { x: cx - fontRegular.widthOfTextAtSize(bLbl, 5) / 2, y: baseY - 9, size: 5, font: fontRegular, color: C.muted });
    }
    if (slot.isActive && ordered.length <= 18) {
      const vTxt = fmtPt(m.displayFlow);
      page.drawText(vTxt, { x: cx - fontRegular.widthOfTextAtSize(vTxt, 5) / 2, y: baseY + bh + 3, size: 5, font: fontRegular, color: m.barColor === C.rose ? C.rose : C.ink });
    }
  });
}

/** Desenha vetorialmente o perfil de débitos dos bicos em PDF-lib (3D bilateral ou barra 2D). */
export function drawNozzleProfileChartOnPdf(params: DrawNozzleProfileChartParams): number {
  const { page, x, yTop, width, height, nozzleProfile, fontRegular } = params;
  const slots = nozzleProfile?.slots ?? [];
  if (!nozzleProfile || slots.length === 0) {
    page.drawRectangle({ x, y: yTop - height, width, height, color: C.bg, borderColor: C.border, borderWidth: 1 });
    const msg = 'Sem perfil de bicos detalhado associado a esta calibração.';
    page.drawText(msg, { x: x + Math.max(12, (width - fontRegular.widthOfTextAtSize(msg, 7.5)) / 2), y: yTop - height / 2 - 2, size: 7.5, font: fontRegular, color: C.muted });
    return yTop - height;
  }
  if (nozzleProfile.equipmentType === '2D_HORIZONTAL') drawHorizontal2dChart(params, slots);
  else drawBilateral3dChart(params, slots);
  return yTop - height;
}
