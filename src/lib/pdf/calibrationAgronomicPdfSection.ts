import { rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import type { CalibrationEppoBalanceResult, ContextualDriftRiskResult } from '../agri-math/calibration-eppo-bridge.ts';
import type { NozzleProfile } from '../../schemas/nozzle-profile.schema.ts';
import type { CalibrationAuditRecord, WeatherAuditSnapshot } from '../../types/calibration-audit.ts';
import { drawNozzleProfileChartOnPdf } from './drawNozzleProfileVector.ts';
import { drawPdfCardBox, fmtPt, PDF_CONTENT_W, PDF_FOOTER_FLOOR_Y, PDF_MARGIN_X, safeWinAnsi } from './pdfHeaderAndFooter.ts';

export interface CalibrationAgronomicPdfPayload {
  calibrationRecord: CalibrationAuditRecord;
  cultureLabel: string;
  locationLabel: string | null;
  areaHa: number | null;
  indexKind: 'LWA' | 'TRV' | null;
  lwaM2Ha: number | null;
  trvM3Ha: number | null;
  equipmentName: string;
  is3DOrAirAssisted: boolean;
  tankCapacityL: number | null;
  nozzleProfileName: string;
  nozzleProfile: NozzleProfile | null;
  eppoBalance: CalibrationEppoBalanceResult;
  driftRisk: ContextualDriftRiskResult;
  weatherSnapshot: WeatherAuditSnapshot | null;
  temperatureC: number | null;
}

export interface DrawCalibrationAgronomicBodyParams {
  page: PDFPage;
  font: PDFFont;
  boldFont: PDFFont;
  yStart: number;
  payload: CalibrationAgronomicPdfPayload;
}

const C_INK = rgb(0.118, 0.161, 0.231);
const C_MUTED = rgb(0.392, 0.455, 0.545);
const C_FOREST = rgb(0.067, 0.251, 0.216);
const C_ACCENT = rgb(0.235, 0.651, 0.298);

function drawKvRow(
  page: PDFPage,
  font: PDFFont,
  boldFont: PDFFont,
  x: number,
  y: number,
  label: string,
  value: string,
  valColor: RGB = C_INK
) {
  page.drawText(safeWinAnsi(label), { x, y, size: 6.5, font, color: C_MUTED });
  page.drawText(safeWinAnsi(value).slice(0, 56), { x, y: y - 9.5, size: 7.8, font: boldFont, color: valColor });
}

function resolveDriftBadge(level: ContextualDriftRiskResult['nivelRisco']): { label: string; bg: RGB; fg: RGB } {
  if (level === 'BAIXO') return { label: 'RISCO BAIXO', bg: rgb(0.84, 0.96, 0.88), fg: C_FOREST };
  if (level === 'MODERADO') return { label: 'RISCO MODERADO', bg: rgb(0.99, 0.95, 0.78), fg: rgb(0.57, 0.25, 0.05) };
  if (level === 'ELEVADO') return { label: 'RISCO ELEVADO', bg: rgb(0.99, 0.89, 0.78), fg: rgb(0.6, 0.2, 0.04) };
  if (level === 'CRITICO_BLOQUEADO') return { label: 'BLOQUEIO LEGAL', bg: rgb(0.99, 0.87, 0.89), fg: rgb(0.62, 0.07, 0.18) };
  return { label: 'RISCO ESTRUTURAL', bg: rgb(0.92, 0.94, 0.96), fg: C_MUTED };
}

/** Desenha o corpo da Modalidade A (Calibração Agronómica — Dir. 2009/128/CE, Lei 26/2013, GlobalG.A.P., EPPO PP 1/239). */
export function drawCalibrationAgronomicBody(p: DrawCalibrationAgronomicBodyParams): number {
  const { page, font, boldFont, yStart, payload } = p;
  const { calibrationRecord: rec, eppoBalance: bal, driftRisk } = payload;
  const [c1, c2, c3] = [PDF_MARGIN_X + 10, PDF_MARGIN_X + 185, PDF_MARGIN_X + 362];
  let y = yStart;

  // Bloco 1: Identificação da Parcela, Cultura & Máquina
  const b1H = 106;
  let ry = drawPdfCardBox(page, PDF_MARGIN_X, y, PDF_CONTENT_W, b1H, '1. IDENTIFICAÇÃO DA PARCELA, CULTURA & MÁQUINA', boldFont);
  drawKvRow(page, font, boldFont, c1, ry, 'Cultura / Parcela', payload.cultureLabel || '-');
  drawKvRow(page, font, boldFont, c2, ry, 'Localização (Freguesia / Município)', payload.locationLabel || 'Não especificada');
  drawKvRow(page, font, boldFont, c3, ry, 'Área / Entrelinha', `${payload.areaHa !== null ? `${fmtPt(payload.areaHa, 2)} ha` : '-'} · ${fmtPt(rec.entrelinhaM, 2)} m`);
  ry -= 24;
  drawKvRow(page, font, boldFont, c1, ry, 'Equipamento', payload.equipmentName || '-');
  drawKvRow(page, font, boldFont, c2, ry, 'Perfil de Bicos', payload.nozzleProfileName || '-');
  drawKvRow(page, font, boldFont, c3, ry, 'Pressão / Bicos Ativos', `${fmtPt(rec.pressaoBar, 1)} bar · ${rec.numBicosAtivos} bicos`);
  ry -= 24;
  drawKvRow(page, font, boldFont, c1, ry, 'Relação de Engrenagem', rec.relacaoEngrenagem?.trim() || 'Não indicado');
  drawKvRow(page, font, boldFont, c2, ry, 'Rotação do Motor (rpm)', rec.rotacaoMotorRpm ? `${Math.round(rec.rotacaoMotorRpm).toLocaleString('pt-PT')} rpm` : 'Não indicado');
  drawKvRow(page, font, boldFont, c3, ry, 'Rotação da TDF (rpm)', rec.rotacaoTdfRpm ? `${Math.round(rec.rotacaoTdfRpm).toLocaleString('pt-PT')} rpm` : 'Não indicado');
  y -= b1H + 8;

  // Bloco 2: Fundamentação Biológica EPPO PP 1/239 & Síntese Hidráulica/Aerodinâmica
  const hasIsoRec = Boolean(bal.recomendacaoBico);
  const b2H = hasIsoRec ? 156 : 122;
  ry = drawPdfCardBox(page, PDF_MARGIN_X, y, PDF_CONTENT_W, b2H, '2. FUNDAMENTAÇÃO BIOLÓGICA (EPPO PP 1/239) & SÍNTESE HIDRÁULICA', boldFont);
  const bioLabel = payload.indexKind === 'LWA' ? 'Índice Vegetativo (LWA)' : payload.indexKind === 'TRV' ? 'Índice Vegetativo (TRV)' : 'Índice Vegetativo';
  const bioVal = payload.indexKind === 'LWA' && payload.lwaM2Ha ? `${Math.round(payload.lwaM2Ha).toLocaleString('pt-PT')} m²/ha`
    : payload.indexKind === 'TRV' && payload.trvM3Ha ? `${Math.round(payload.trvM3Ha).toLocaleString('pt-PT')} m³/ha` : 'Sem cálculo prévio';
  const devTxt = bal.desvioPercentual !== null ? `${bal.desvioPercentual > 0 ? '+' : ''}${fmtPt(bal.desvioPercentual, 1)}%` : 'Sem ref.';
  const eppoTxt = bal.volumeRecomendadoEppoLHa !== null ? `${fmtPt(bal.volumeRecomendadoEppoLHa, 1)} L/ha` : 'Sem ref.';
  drawKvRow(page, font, boldFont, c1, ry, bioLabel, bioVal);
  drawKvRow(page, font, boldFont, c2, ry, 'Volume Sugerido EPPO', eppoTxt);
  drawKvRow(page, font, boldFont, c3, ry, 'Volume Estimado / Desvio', `${fmtPt(rec.volumeCalibradoLHa, 1)} L/ha (${devTxt})`, C_FOREST);

  ry -= 24;
  const autHa = payload.tankCapacityL && rec.volumeCalibradoLHa > 0 ? payload.tankCapacityL / rec.volumeCalibradoLHa : null;
  const depParcel = payload.areaHa && autHa && autHa > 0 ? (payload.areaHa * rec.volumeCalibradoLHa) / (payload.tankCapacityL ?? 1) : null;
  drawKvRow(page, font, boldFont, c1, ry, 'Velocidade / Débito Total', `${fmtPt(rec.velocidadeKmh, 1)} km/h · ${fmtPt(rec.debitoTotalLMin, 2)} L/min`);
  drawKvRow(page, font, boldFont, c2, ry, 'Autonomia / Depósitos p/ Parcela', `${autHa !== null ? `${fmtPt(autHa, 2)} ha/dep.` : '-'} · ${depParcel !== null ? `${fmtPt(depParcel, 1)} dep.` : '-'}`);
  const airTxt = payload.is3DOrAirAssisted && bal.caudalArSugeridoM3H !== null
    ? `${Math.round(bal.caudalArSugeridoM3H).toLocaleString('pt-PT')} m³/h${rec.caudalArAplicadoM3H !== null ? ` (apl. ${Math.round(rec.caudalArAplicadoM3H).toLocaleString('pt-PT')})` : ''}`
    : payload.is3DOrAirAssisted ? 'Sem TRV para cálculo' : 'Não aplicável (2D)';
  drawKvRow(page, font, boldFont, c3, ry, 'Volume de Ar Sugerido (3D)', airTxt);

  ry -= 24;
  const retTxt = bal.litrosPor1000m3Trv !== null ? `${fmtPt(bal.litrosPor1000m3Trv, 1)} L / 1 000 m³ TRV`
    : bal.litrosPor10000m2Lwa !== null ? `${fmtPt(bal.litrosPor10000m2Lwa, 1)} L / 10 000 m² LWA` : '-';
  drawKvRow(page, font, boldFont, c1, ry, 'Retenção na Copa', retTxt);
  drawKvRow(page, font, boldFont, c2, ry, 'Piso Técnico Mínimo', `${fmtPt(bal.pisoMecanicoMinLHa, 0)} L/ha${bal.abaixoPisoMecanico ? ' (Abaixo)' : ' (Conforme)'}`);
  drawKvRow(page, font, boldFont, c3, ry, 'Enquadramento Normativo', 'Dir. 2009/128/CE · Lei 26/2013 · GlobalG.A.P.');

  if (bal.recomendacaoBico) {
    ry -= 33;
    page.drawRectangle({ x: PDF_MARGIN_X + 8, y: ry, width: PDF_CONTENT_W - 16, height: 22, color: rgb(0.91, 0.97, 0.93), borderColor: C_ACCENT, borderWidth: 0.7 });
    page.drawText(safeWinAnsi(`Recomendação Preferencial ISO 10625: ${bal.recomendacaoBico.sugestaoBicoIso}`), { x: PDF_MARGIN_X + 14, y: ry + 12, size: 7.2, font: boldFont, color: C_FOREST });
    page.drawText(safeWinAnsi(bal.recomendacaoBico.explicacaoFisicaPt).slice(0, 108), { x: PDF_MARGIN_X + 14, y: ry + 3.5, size: 6.2, font, color: C_MUTED });
  }
  y -= b2H + 8;

  // Bloco 3: Condições Meteorológicas & Risco Contextual de Deriva
  const b3H = 82;
  ry = drawPdfCardBox(page, PDF_MARGIN_X, y, PDF_CONTENT_W, b3H, '3. CONDIÇÕES METEOROLÓGICAS & RISCO CONTEXTUAL DE DERIVA', boldFont);
  const badge = resolveDriftBadge(driftRisk.nivelRisco);
  const bw = boldFont.widthOfTextAtSize(badge.label, 6.5) + 12;
  page.drawRectangle({ x: PDF_MARGIN_X + PDF_CONTENT_W - bw - 8, y: ry - 2, width: bw, height: 14, color: badge.bg });
  page.drawText(badge.label, { x: PDF_MARGIN_X + PDF_CONTENT_W - bw - 2, y: ry + 2.5, size: 6.5, font: boldFont, color: badge.fg });

  const w = payload.weatherSnapshot;
  const meteoTxt = w
    ? `Vento: ${w.ventoMs !== null ? `${fmtPt(w.ventoMs, 1)} m/s` : 'Sem leitura'} · Temp.: ${payload.temperatureC !== null ? `${fmtPt(payload.temperatureC, 1)} °C` : 'Sem leitura'} · Delta T: ${w.deltaT !== null ? `${fmtPt(w.deltaT, 1)} °C` : 'Sem leitura'}`
    : 'Sem leitura meteorológica ativa (offline ou freguesia não resolvida — valores nulos preservados).';
  drawKvRow(page, font, boldFont, c1, ry, 'Leitura Meteorológica', meteoTxt);
  ry -= 24;
  const pressureMsg = driftRisk.sobrepressaoBico ? 'Pressão acima do limite homologado do bico' : driftRisk.subpressaoBico ? 'Pressão abaixo do mínimo homologado do bico' : 'Pressão compatível com faixa homologada do bico';
  const alertLine = driftRisk.alertasTecnicosPt[0] || pressureMsg;
  drawKvRow(page, font, boldFont, c1, ry, 'Avaliação Operacional de Deriva', `${pressureMsg}${alertLine !== pressureMsg ? ` · ${alertLine}` : ''}`);
  y -= b3H + 8;

  // Bloco 4: Gráfico Compacto do Perfil de Distribuição de Débitos (sem faixa ±10% na Modalidade A)
  const chartH = Math.min(176, Math.max(136, y - PDF_FOOTER_FLOOR_Y - 4));
  return drawNozzleProfileChartOnPdf({
    page, x: PDF_MARGIN_X, yTop: y, width: PDF_CONTENT_W, height: chartH,
    nozzleProfile: payload.nozzleProfile, fontRegular: font, fontBold: boldFont, showToleranceBand: false
  });
}
