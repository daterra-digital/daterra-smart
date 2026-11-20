import { PDFDocument, StandardFonts } from 'pdf-lib';
import { scaleNozzleProfileByPressure } from '../../features/perfis/services/calibrationFormatters.ts';
import type { CalibrationEppoBalanceResult, ContextualDriftRiskResult } from '../agri-math/calibration-eppo-bridge.ts';
import type { EquipmentRecord } from '../../schemas/equipment.schema.ts';
import type { NozzleProfile } from '../../schemas/nozzle-profile.schema.ts';
import type { CalibrationAuditRecord, PdfAuditReportMode, WeatherAuditSnapshot } from '../../types/calibration-audit.ts';
import { drawCalibrationAgronomicBody } from './calibrationAgronomicPdfSection.ts';
import { resolveUserCoBranding } from './coBrandingConfigReader.ts';
import { drawIso16122InspectionBody } from './iso16122InspectionPdfSection.ts';
import { drawAuditPdfFooter, drawAuditPdfHeader } from './pdfHeaderAndFooter.ts';

export interface CalibrationPdfCultureInput {
  label: string; locationLabel?: string | null; areaHa?: number | null;
  indexKind?: 'LWA' | 'TRV' | null; lwaM2Ha?: number | null; trvM3Ha?: number | null;
}

export interface CalibrationPdfEquipmentInput {
  name: string; is3DOrAirAssisted?: boolean; tankCapacityL?: number | null;
  serialNumber?: string | null; typologyLabel?: string; recordV12?: EquipmentRecord | null;
}

export interface ExportCalibrationAuditPdfParams {
  mode: PdfAuditReportMode; userId?: string | null; calibrationRecord: CalibrationAuditRecord;
  culture: CalibrationPdfCultureInput | null; equipment: CalibrationPdfEquipmentInput | null;
  nozzleProfile: NozzleProfile | null; eppoBalance: CalibrationEppoBalanceResult;
  driftRisk: ContextualDriftRiskResult; weatherSnapshot: WeatherAuditSnapshot | null; temperatureC?: number | null;
}

function canonicalize(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(canonicalize);
  if (val && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>).sort()) {
      const v = (val as Record<string, unknown>)[k];
      if (v !== undefined) out[k] = canonicalize(v);
    }
    return out;
  }
  return val;
}

async function ensureSha256Seal(record: CalibrationAuditRecord): Promise<string> {
  if (record.sha256Seal && /^[a-f0-9]{64}$/i.test(record.sha256Seal)) return record.sha256Seal;
  const unsigned = { ...record };
  delete unsigned.sha256Seal;
  const bytes = new TextEncoder().encode(JSON.stringify(canonicalize(unsigned)));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

const slugPart = (raw: string | undefined, fb: string) =>
  ((raw || fb).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || fb).slice(0, 42);

function triggerPdfDownload(bytes: Uint8Array, fileName: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const url = URL.createObjectURL(new Blob([copy], { type: 'application/pdf' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: fileName, style: 'display:none' });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Gera e descarrega o PDF auditável dual (Calibração Agronómica EPPO vs. Inspeção Técnica ISO 16122). */
export async function exportCalibrationAuditPdf(p: ExportCalibrationAuditPdfParams): Promise<{ fileName: string; sha256Seal: string; bytes: Uint8Array }> {
  const [coBranding, sha256Seal, pdfDoc] = await Promise.all([
    resolveUserCoBranding(p.userId),
    ensureSha256Seal(p.calibrationRecord),
    PDFDocument.create()
  ]);
  const [font, boldFont] = await Promise.all([pdfDoc.embedFont(StandardFonts.Helvetica), pdfDoc.embedFont(StandardFonts.HelveticaBold)]);
  const page = pdfDoc.addPage([595.28, 841.89]);
  const isIso = p.mode === 'ISO_16122_INSPECTION';
  const generatedAtIso = new Date().toISOString();
  const scaledNozzle = scaleNozzleProfileByPressure(p.nozzleProfile, p.calibrationRecord.pressaoBar).scaledProfile;

  const yStart = await drawAuditPdfHeader({
    pdfDoc, page, font, boldFont, coBranding,
    reportTitle: isIso ? 'Relatório Técnico de Inspeção Pré-IPP · EN ISO 16122' : 'Relatório Auditável de Calibração Agronómica',
    normativeSubtitle: isIso
      ? 'EN ISO 16122 (Partes 1, 2 e 3) · DL n.º 86/2010 · DL n.º 78/2020 · Boletim Técnico DGAV'
      : 'Diretiva 2009/128/CE (Art.º 8.º) · Lei n.º 26/2013 · GlobalG.A.P. IFA v6 · Norma EPPO PP 1/239'
  });

  if (isIso) {
    drawIso16122InspectionBody({
      page, font, boldFont, yStart,
      payload: {
        calibrationRecord: p.calibrationRecord, equipmentName: p.equipment?.name || 'Pulverizador não identificado',
        equipmentTypologyLabel: p.equipment?.typologyLabel || (scaledNozzle?.equipmentType === '2D_HORIZONTAL' ? 'Barra 2D' : 'Copa 3D'),
        equipmentSerial: p.equipment?.serialNumber, equipmentRecordV12: p.equipment?.recordV12 ?? null, nozzleProfile: scaledNozzle
      }
    });
  } else {
    drawCalibrationAgronomicBody({
      page, font, boldFont, yStart,
      payload: {
        calibrationRecord: p.calibrationRecord, cultureLabel: p.culture?.label || p.calibrationRecord.nomePerfil,
        locationLabel: p.culture?.locationLabel ?? p.weatherSnapshot?.localidade ?? null,
        areaHa: p.culture?.areaHa ?? null, indexKind: p.culture?.indexKind ?? null,
        lwaM2Ha: p.culture?.lwaM2Ha ?? null, trvM3Ha: p.culture?.trvM3Ha ?? null,
        equipmentName: p.equipment?.name || '-', is3DOrAirAssisted: Boolean(p.equipment?.is3DOrAirAssisted),
        tankCapacityL: p.equipment?.tankCapacityL ?? null, nozzleProfileName: scaledNozzle?.name || '-',
        nozzleProfile: scaledNozzle, eppoBalance: p.eppoBalance, driftRisk: p.driftRisk,
        weatherSnapshot: p.weatherSnapshot, temperatureC: p.temperatureC ?? null
      }
    });
  }

  drawAuditPdfFooter({
    page, font, boldFont, sha256Seal, generatedAtIso,
    signerRoleLabel: isIso ? 'Técnico / Responsável da Máquina' : 'Operador / Técnico Responsável'
  });

  const bytes = await pdfDoc.save();
  const datePart = generatedAtIso.slice(0, 10);
  const fileName = isIso
    ? `DATERRA_Inspecao_ISO16122_${slugPart(p.equipment?.name, 'Equipamento')}_${datePart}.pdf`
    : `DATERRA_Calibracao_${slugPart(p.culture?.label, 'Parcela')}_${datePart}.pdf`;
  triggerPdfDownload(bytes, fileName);
  return { fileName, sha256Seal, bytes };
}
