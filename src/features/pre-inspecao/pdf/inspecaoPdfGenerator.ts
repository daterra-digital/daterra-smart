import { PDFDocument, StandardFonts } from 'pdf-lib';
import type {
  EquipmentTypeId,
  EvaluationStyle,
  InspecaoEvaluationResult,
  ItemStatus,
  PreInspectionCategory
} from '../types/inspecaoTypes.ts';
import type { CoBrandingConfig } from '../../smart-debito/types.ts';
import { getStoredCoBrandingConfig } from '../../smart-debito/coBrandingStorage.ts';
import { PAGE_LAYOUT } from './inspecaoPdfHelpers.ts';
import {
  drawDocumentHeader,
  drawContinuationHeader,
  drawDroneWarning,
  drawStatusCard,
  drawDiagnosisBox,
  drawSignatureBlock,
  applyPageNumbers
} from './inspecaoPdfPageLayout.ts';
import { renderExhaustiveChecklist } from './inspecaoPdfTableBuilder.ts';

export interface PreInspecaoPdfData {
  equipmentId: EquipmentTypeId;
  equipmentTitle: string;
  evaluationStyle: EvaluationStyle;
  categories: PreInspectionCategory[];
  answers: Record<string, ItemStatus>;
  calcResult: InspecaoEvaluationResult;
  dateIso?: string;
  coBranding?: CoBrandingConfig | null;
}

export async function generatePreInspecaoPdf(data: PreInspecaoPdfData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Boletim_Pre_Inspecao_${data.equipmentId}`);
  pdfDoc.setAuthor('DATERRA Smart');

  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  };

  const coBranding = data.coBranding !== undefined
    ? data.coBranding
    : (typeof window !== 'undefined' ? getStoredCoBrandingConfig() : null);
  const enrichedData: PreInspecaoPdfData = { ...data, coBranding };

  let page = pdfDoc.addPage([PAGE_LAYOUT.width, PAGE_LAYOUT.height]);
  let y = 800;

  y = drawDocumentHeader(page, fonts, enrichedData, y);
  y = drawDroneWarning(page, fonts, data.equipmentId, y);
  y = drawStatusCard(page, fonts, data.calcResult, y);
  y = drawDiagnosisBox(page, fonts, data.calcResult.recommendation, y);

  const onNewPage = () => {
    const newPage = pdfDoc.addPage([PAGE_LAYOUT.width, PAGE_LAYOUT.height]);
    const nextY = drawContinuationHeader(newPage, fonts, data, 800);
    return { page: newPage, startY: nextY };
  };

  const { currentPage, currentY } = renderExhaustiveChecklist(
    fonts,
    data,
    page,
    y,
    onNewPage
  );

  let finalPage = currentPage;
  let finalY = currentY;

  // Se não houver espaço suficiente para o termo de responsabilidade (precisa de ~45 pt)
  if (finalY - 45 < 40) {
    const next = onNewPage();
    finalPage = next.page;
    finalY = next.startY;
  }

  drawSignatureBlock(finalPage, fonts, finalY);
  applyPageNumbers(pdfDoc.getPages(), fonts.regular);

  return await pdfDoc.save();
}

export function downloadPdfBlob(pdfBytes: Uint8Array, fileName: string) {
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
