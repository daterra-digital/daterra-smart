import { rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import { calculateFlowDeviationPct, isIso16122DeviationExceeded } from '../../features/settings/nozzles/services/nozzleProfileMath.ts';
import type { EquipmentRecord } from '../../schemas/equipment.schema.ts';
import type { NozzleProfile, NozzleSlotConfig } from '../../schemas/nozzle-profile.schema.ts';
import type { CalibrationAuditRecord } from '../../types/calibration-audit.ts';
import { drawNozzleProfileChartOnPdf } from './drawNozzleProfileVector.ts';
import { drawPdfCardBox, fmtPt, PDF_CONTENT_W, PDF_FOOTER_FLOOR_Y, PDF_MARGIN_X, safeWinAnsi } from './pdfHeaderAndFooter.ts';

export interface Iso16122InspectionPdfPayload {
  calibrationRecord: CalibrationAuditRecord;
  equipmentName: string;
  equipmentTypologyLabel: string;
  equipmentSerial?: string | null;
  equipmentRecordV12: EquipmentRecord | null;
  nozzleProfile: NozzleProfile | null;
}

export interface DrawIso16122InspectionBodyParams {
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  yStart: number;
  payload: Iso16122InspectionPdfPayload;
}

const C_INK = rgb(0.118, 0.161, 0.231);
const C_MUTED = rgb(0.392, 0.455, 0.545);
const C_FOREST = rgb(0.067, 0.251, 0.216);
const C_ROSE = rgb(0.882, 0.114, 0.282);
const C_BORDER = rgb(0.86, 0.89, 0.92);

function resolveIppValidityLabel(rec: CalibrationAuditRecord, eq: EquipmentRecord | null): string {
  if (rec.iso16122.dataValidadeIpp) return `${rec.iso16122.dataValidadeIpp} (Ciclo 3 anos DL 78/2020)`;
  const rawLast = eq?.iso16122Inspection?.lastInspectionDate?.trim();
  if (!rawLast) return 'Não registada (Ciclo 3 anos DL 78/2020)';
  const d = new Date(rawLast);
  if (Number.isNaN(d.getTime())) return `${rawLast} (+3 anos DL 78/2020)`;
  d.setFullYear(d.getFullYear() + 3);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${d.getFullYear()} (Ciclo 3 anos DL 78/2020)`;
}

function slotPositionLabel(slot: NozzleSlotConfig, is2d: boolean): string {
  if (is2d) return `Barra B${slot.slotIndex}`;
  const side = slot.sectionSide === 'RIGHT' ? 'Dir.' : slot.sectionSide === 'LEFT' ? 'Esq.' : 'Centro';
  return `${side} N${slot.levelIndex ?? slot.slotIndex}`;
}

function drawKv(page: PDFPage, font: PDFFont, boldFont: PDFFont, x: number, y: number, lbl: string, val: string, color: RGB = C_INK) {
  page.drawText(safeWinAnsi(lbl), { x, y, size: 6.4, font, color: C_MUTED });
  page.drawText(safeWinAnsi(val).slice(0, 52), { x, y: y - 9, size: 7.6, font: boldFont, color });
}

/** Desenha o corpo da Modalidade B (Inspeção Técnica EN ISO 16122, DL 86/2010, DL 78/2020, Boletim DGAV). */
export function drawIso16122InspectionBody(p: DrawIso16122InspectionBodyParams): number {
  const { page, font, boldFont, yStart, payload } = p;
  const { calibrationRecord: rec, equipmentRecordV12: eqV12, nozzleProfile } = payload;
  const [c1, c2, c3] = [PDF_MARGIN_X + 10, PDF_MARGIN_X + 185, PDF_MARGIN_X + 362];
  let y = yStart;

  // Bloco 1: Identificação Técnica do Equipamento & Estado IPP
  const b1H = 106;
  let ry = drawPdfCardBox(page, PDF_MARGIN_X, y, PDF_CONTENT_W, b1H, '1. IDENTIFICAÇÃO TÉCNICA DO EQUIPAMENTO & ESTADO IPP (DL 78/2020)', boldFont);
  const serial = rec.iso16122.numeroSerieChassi || payload.equipmentSerial || eqV12?.serialNumber || 'Não registado';
  drawKv(page, font, boldFont, c1, ry, 'Equipamento & Tipologia', `${payload.equipmentName || '-'} (${payload.equipmentTypologyLabel})`);
  drawKv(page, font, boldFont, c2, ry, 'N.º Série / Chassi', serial);
  drawKv(page, font, boldFont, c3, ry, 'Validade IPP', resolveIppValidityLabel(rec, eqV12));
  ry -= 24;
  const maxDev = rec.iso16122.desvioMaximoBicosPct;
  const symDev = rec.iso16122.simetriaEsqDirPct;
  const devColor = maxDev !== null && maxDev > 10 ? C_ROSE : C_FOREST;
  drawKv(page, font, boldFont, c1, ry, 'Pressão de Ensaio', `${fmtPt(rec.pressaoBar, 1)} bar · ${rec.numBicosAtivos} bicos ativos`);
  drawKv(page, font, boldFont, c2, ry, 'Simetria Transversal Esq./Dir.', symDev !== null ? `${fmtPt(symDev, 1)}% (Limite <= 10,0%)` : 'Não aplicável / Sem medição');
  drawKv(page, font, boldFont, c3, ry, 'Desvio Máx. Individual (<= ±10%)', maxDev !== null ? `${fmtPt(maxDev, 1)}% · ${maxDev > 10 ? 'REQUER CORREÇÃO' : 'CONFORME'}` : 'Sem medição real', devColor);
  ry -= 24;
  drawKv(page, font, boldFont, c1, ry, 'Relação de Engrenagem', rec.relacaoEngrenagem?.trim() || 'Não indicado');
  drawKv(page, font, boldFont, c2, ry, 'Rotação do Motor (rpm)', rec.rotacaoMotorRpm ? `${Math.round(rec.rotacaoMotorRpm).toLocaleString('pt-PT')} rpm` : 'Não indicado');
  drawKv(page, font, boldFont, c3, ry, 'Rotação da TDF (rpm)', rec.rotacaoTdfRpm ? `${Math.round(rec.rotacaoTdfRpm).toLocaleString('pt-PT')} rpm` : 'Não indicado');
  y -= b1H + 8;

  // Bloco 2: Gráfico Diagnóstico do Perfil de Débitos (Faixa ±10% ISO 16122)
  const chartH = 144;
  drawNozzleProfileChartOnPdf({
    page, x: PDF_MARGIN_X, yTop: y, width: PDF_CONTENT_W, height: chartH,
    nozzleProfile, fontRegular: font, fontBold: boldFont, showToleranceBand: true
  });
  y -= chartH + 8;

  // Bloco 3: Tabela Individual de Bicos (altura adaptada para manter Bloco 4 acima do rodapé)
  const b4H = 82;
  const maxTableH = Math.max(76, y - b4H - 8 - PDF_FOOTER_FLOOR_Y);
  const allSlots = [...(nozzleProfile?.slots ?? [])].sort((a, b) => a.slotIndex - b.slotIndex);
  const is2d = nozzleProfile?.equipmentType === '2D_HORIZONTAL';
  const rowH = 12;
  const maxRows = Math.max(1, Math.floor((maxTableH - 42) / rowH));
  const truncated = allSlots.length > maxRows;
  const shownSlots = truncated ? allSlots.slice(0, Math.max(1, maxRows - 1)) : allSlots;
  const tableH = Math.min(maxTableH, 42 + Math.max(1, shownSlots.length + (truncated ? 1 : 0)) * rowH + 6);

  ry = drawPdfCardBox(page, PDF_MARGIN_X, y, PDF_CONTENT_W, tableH, '3. AUDITORIA INDIVIDUAL DE BICOS (EN ISO 16122-2 / 16122-3)', boldFont);
  const cols = [PDF_MARGIN_X + 10, PDF_MARGIN_X + 92, PDF_MARGIN_X + 258, PDF_MARGIN_X + 332, PDF_MARGIN_X + 402, PDF_MARGIN_X + 455];
  ['Posição', 'Modelo / Cor ISO', 'Déb. Tab.', 'Déb. Real', 'Desvio', 'Estado'].forEach((h, i) => {
    page.drawText(safeWinAnsi(h), { x: cols[i], y: ry + 2, size: 6.5, font: boldFont, color: C_FOREST });
  });
  page.drawLine({ start: { x: PDF_MARGIN_X + 8, y: ry - 2 }, end: { x: PDF_MARGIN_X + PDF_CONTENT_W - 8, y: ry - 2 }, thickness: 0.6, color: C_BORDER });
  ry -= 12;

  if (shownSlots.length === 0) {
    page.drawText('Sem bicos individuais registados neste perfil para auditoria.', { x: cols[0], y: ry, size: 7, font, color: C_MUTED });
  } else {
    for (const s of shownSlots) {
      const tab = s.flowAtPressureLMin;
      const real = s.measuredFlowLMin;
      const dev = s.isActive ? calculateFlowDeviationPct(tab, real) : null;
      const bad = s.isActive && isIso16122DeviationExceeded(dev);
      const status = !s.isActive ? 'FECHADO' : dev === null ? 'SEM MEDIÇÃO' : bad ? 'SUBSTITUIR >10%' : 'CONFORME';
      const stColor = bad ? C_ROSE : status === 'CONFORME' ? C_FOREST : C_MUTED;
      page.drawText(safeWinAnsi(slotPositionLabel(s, is2d)), { x: cols[0], y: ry, size: 6.6, font: boldFont, color: C_INK });
      page.drawText(safeWinAnsi(`${s.model || s.brand || '-'} (${s.color || '-'})`).slice(0, 30), { x: cols[1], y: ry, size: 6.6, font, color: C_INK });
      page.drawText(`${fmtPt(tab, 2)} L/min`, { x: cols[2], y: ry, size: 6.6, font, color: C_INK });
      page.drawText(s.isActive && real != null ? `${fmtPt(real, 2)} L/min` : '-', { x: cols[3], y: ry, size: 6.6, font, color: C_INK });
      page.drawText(dev !== null ? `${dev > 0 ? '+' : ''}${fmtPt(dev, 1)}%` : '-', { x: cols[4], y: ry, size: 6.6, font: bad ? boldFont : font, color: bad ? C_ROSE : C_INK });
      page.drawText(status, { x: cols[5], y: ry, size: 6.4, font: boldFont, color: stColor });
      ry -= rowH;
    }
    if (truncated) {
      const rem = allSlots.length - shownSlots.length;
      page.drawText(`... +${rem} bico(s) omitido(s) para preservar a margem legal da página (Desvio máx. global: ${fmtPt(maxDev, 1)}%).`, { x: cols[0], y: ry, size: 6.3, font, color: C_MUTED });
    }
  }
  y -= tableH + 8;

  // Bloco 4: Lista de Verificação Pré-Inspeção (EN ISO 16122-1)
  ry = drawPdfCardBox(page, PDF_MARGIN_X, y, PDF_CONTENT_W, b4H, '4. LISTA DE VERIFICAÇÃO PRÉ-INSPEÇÃO (EN ISO 16122-1 · BOLETIM DGAV)', boldFont);
  const insp = eqV12?.iso16122Inspection;
  const checks: Array<[string, boolean | undefined]> = [
    ['1. Ausência de fugas no circuito hidráulico e tubagens', insp?.hoseAndTriggerOk],
    ['2. Manómetro legível e com escala adequada à pressão', insp?.pressureGaugeOk],
    ['3. Filtros de aspiração, pressão e linha limpos', insp?.pumpAndFiltersOk],
    ['4. Proteção da tomada de força (TDF) íntegra e segura', undefined],
    ['5. Corte antigota funcional (estancamento <= 5 s)', insp?.antiDripValveOk]
  ];
  checks.forEach(([label, ok], idx) => {
    const colX = idx < 3 ? c1 : PDF_MARGIN_X + 275;
    const rowY = ry - (idx < 3 ? idx : idx - 3) * 14;
    const mark = ok === true ? '[OK]' : ok === false ? '[REVER]' : '[  ]';
    page.drawText(safeWinAnsi(`${mark} ${label}`), { x: colX, y: rowY, size: 6.8, font: ok ? boldFont : font, color: ok === false ? C_ROSE : C_INK });
  });
  return y - b4H;
}
