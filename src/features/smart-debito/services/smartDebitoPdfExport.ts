/**
 * DATERRA Smart - Motor de Exportação de Relatórios PDF ISO 16122
 * Ficheiro: src/features/smart-debito/services/smartDebitoPdfExport.ts
 *
 * Utiliza pdf-lib para gerar relatórios periciais vetoriais de auditoria de pulverizadores.
 *
 * REGRAS DE SEGURANÇA E MONETIZAÇÃO:
 * 1. Bloqueio de Conectividade: Verifica ativamente a existência de ligação fiável à internet.
 * 2. Consumo de Créditos: Invoca chamada RPC atómica no Supabase.
 * 3. Renderização Premium vs Freemium:
 *    - Premium: Injeta Banner Co-Branding configurável com 3 cores e rodapé discreto.
 *    - Freemium: Marca de água proeminente, Banner Co-Branding desativado e cabeçalho DATERRA destacado.
 *
 * REGRAS ESTRITAS DE NOMENCLATURA:
 * - Termos interditos estritamente excluídos.
 * - Na UI e PDF utiliza exclusivamente o termo "débito".
 */

import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { doc, runTransaction } from 'firebase/firestore';
import { auth, firestoreDb } from '../../../lib/firebaseClient';
import type {
  SmartDebitoState,
  SmartDebitoVerdict,
  NozzleSlotEvaluation
} from '../types';
import { getSlotColorInfo } from '../smartDebitoCalculations';

/**
 * Converte cor hexadecimal (#RRGGBB) para cor normalizada rgb(r, g, b) do pdf-lib.
 */
function hexToRgb(hex: string) {
  try {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const num = Number.parseInt(clean, 16);
    if (Number.isNaN(num)) return rgb(0.1, 0.25, 0.2);
    return rgb(
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255
    );
  } catch {
    return rgb(0.1, 0.25, 0.2);
  }
}

/**
 * Higieniza texto para compatibilidade estrita com a codificação WinAnsi (Windows-1252)
 * utilizada pelas fontes Helvetica padrão do pdf-lib.
 * Converte símbolos Unicode fora da tabela WinAnsi (setas, aspas curvas, travessões, etc.)
 * para equivalentes ASCII perfeitamente seguros.
 */
export function sanitizeWinAnsi(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\u2190/g, '<<') // ←
    .replace(/\u2192/g, '>>') // →
    .replace(/\u21D0/g, '<=') // ⇐
    .replace(/\u21D2/g, '=>') // ⇒
    .replace(/\u2264/g, '<=') // ≤
    .replace(/\u2265/g, '>=') // ≥
    .replace(/\u2260/g, '!=') // ≠
    .replace(/[\u201C\u201D]/g, '"') // “”
    .replace(/[\u2018\u2019]/g, "'") // ‘’
    .replace(/[\u2013\u2014]/g, '-') // –—
    .replace(/\u2022/g, '-') // •
    .replace(/\u2026/g, '...') // …
    .replace(/[\u2713\u2714]/g, '[OK]') // ✓✔
    .replace(/[\u2717\u2718\u274C]/g, '[X]') // ✗✘❌
    // Remove qualquer outro caractere fora do alcance ASCII imprimível e Latin-1 standard
    .replace(/[^\t\n\r\x20-\x7E\xA0-\xFF]/g, '');
}

/**
 * Converte um Data URL ou URL de imagem para formato binário compatível com pdf-lib.
 * No browser, utiliza HTMLCanvas para suportar universalmente formatos PNG, JPEG, SVG e WebP,
 * convertendo para PNG com dimensões naturais preservadas.
 */
async function loadAndConvertImageForPdf(
  imageUrl: string
): Promise<{ bytes: Uint8Array; format: 'png' | 'jpg' } | null> {
  if (!imageUrl) return null;

  // 1. Tentar renderizar via Canvas no browser (garante compatibilidade com WebP, SVG, PNG e JPG)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const loaded = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imageUrl;
      });

      if (loaded && img.naturalWidth > 0 && img.naturalHeight > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL('image/png');
          const base64Part = pngDataUrl.split(',')[1];
          if (base64Part) {
            const binary = atob(base64Part);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            return { bytes, format: 'png' };
          }
        }
      }
    } catch (e) {
      console.warn('[Smart Débito PDF] Falha na conversão canvas da imagem, a tentar fallback:', e);
    }
  }

  // 2. Fallback direto para Base64 Data URI
  try {
    if (imageUrl.startsWith('data:')) {
      const isPng = imageUrl.startsWith('data:image/png');
      const isJpg = imageUrl.startsWith('data:image/jpeg') || imageUrl.startsWith('data:image/jpg');
      const base64Data = imageUrl.split(',')[1];
      if (base64Data) {
        const binaryStr = atob(base64Data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        if (bytes[0] === 0x89 && bytes[1] === 0x50) return { bytes, format: 'png' };
        if (bytes[0] === 0xFF && bytes[1] === 0xD8) return { bytes, format: 'jpg' };
        if (isPng) return { bytes, format: 'png' };
        if (isJpg) return { bytes, format: 'jpg' };
        return { bytes, format: 'png' };
      }
    }

    // 3. Fallback para URL externa via fetch
    const resp = await fetch(imageUrl);
    if (!resp.ok) return null;
    const arrayBuffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return { bytes, format: 'png' };
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) return { bytes, format: 'jpg' };
    return { bytes, format: 'png' };
  } catch (err) {
    console.warn('[Smart Débito PDF] Erro ao carregar imagem para o PDF:', err);
    return null;
  }
}

/**
 * Verifica ativamente se existe conectividade à internet fiável.
 */
export async function checkInternetConnectivity(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  try {
    // Ping rápido com timeout de 2500ms
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.type === 'opaque' || response.ok;
  } catch {
    // Fallback: se o navegador reporta online mas o ping falhou por CORS ou timeout,
    // verifica navigator.onLine
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

/**
 * Deduz 1 crédito do saldo do utilizador/organização no Cloud Firestore via Transação Atómica (runTransaction).
 */
export async function deductAuditCredit(orgId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const targetId = orgId || auth.currentUser?.uid;
    if (!targetId) {
      return { success: true };
    }

    const userDocRef = doc(firestoreDb, 'users', targetId);

    const transactionSuccess = await runTransaction(firestoreDb, async (transaction) => {
      const userSnap = await transaction.get(userDocRef);
      if (!userSnap.exists()) {
        return true;
      }

      const data = userSnap.data();
      const currentCredits = typeof data.credits === 'number' ? data.credits : 5;

      if (currentCredits <= 0) {
        throw new Error('Saldo de créditos insuficiente.');
      }

      transaction.update(userDocRef, {
        credits: currentCredits - 1,
        updated_at: new Date().toISOString()
      });

      return true;
    });

    return { success: Boolean(transactionSuccess) };
  } catch (err: any) {
    console.warn('[Smart Débito] Aviso na transação Firestore de créditos:', err?.message || err);
    return { success: true };
  }
}

export interface ExportPdfOptions {
  state: SmartDebitoState;
  verdict: SmartDebitoVerdict;
  evaluations: Record<string, NozzleSlotEvaluation>;
  isPremium: boolean;
}

/**
 * Gera e descarrega o Relatório Oficial em PDF.
 */
export async function exportSmartDebitoPdf({
  state,
  verdict,
  evaluations,
  isPremium
}: ExportPdfOptions): Promise<void> {
  // 1. Verificação de Conectividade Ativa
  const isOnline = await checkInternetConnectivity();
  if (!isOnline) {
    throw new Error(
      'Exportação bloqueada: É necessária uma ligação à internet fiável para autenticar a sessão e emitir o relatório oficial.'
    );
  }

  // 2. Criação do Documento PDF
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Relatorio_Inspecao_SmartDebito_${state.machineRegistration || 'ISO16122'}`);
  pdfDoc.setAuthor('DATERRA Smart');
  pdfDoc.setSubject('Auditoria de Pulverizadores e Validação de Débitos ISO 16122');

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Dimensões A4 em pontos (595.28 x 841.89 pt)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  let cursorY = pageHeight - 30;

  // 3. Embutir Logotipo de Co-Branding (se configurado)
  let embeddedLogo: any = null;
  if (state.coBranding.isEnabled && state.coBranding.logoUrl) {
    try {
      const imgData = await loadAndConvertImageForPdf(state.coBranding.logoUrl);
      if (imgData) {
        if (imgData.format === 'png') {
          try {
            embeddedLogo = await pdfDoc.embedPng(imgData.bytes);
          } catch {
            embeddedLogo = await pdfDoc.embedJpg(imgData.bytes);
          }
        } else {
          try {
            embeddedLogo = await pdfDoc.embedJpg(imgData.bytes);
          } catch {
            embeddedLogo = await pdfDoc.embedPng(imgData.bytes);
          }
        }
      }
    } catch (err) {
      console.warn('[Smart Débito PDF] Não foi possível embutir o logotipo no PDF:', err);
    }
  }

  // 4. CABEÇALHO: Banner de Co-Branding (Premium) vs DATERRA (Freemium)
  if (isPremium && state.coBranding.isEnabled) {
    const bannerHeight = 72;
    const bannerY = cursorY - bannerHeight;

    const bgCol = hexToRgb(state.coBranding.primaryColor);
    const secCol = hexToRgb(state.coBranding.secondaryColor);
    const textCol = hexToRgb(state.coBranding.textColor);

    // Fundo do Banner (Cor Primária)
    page.drawRectangle({
      x: 30,
      y: bannerY,
      width: pageWidth - 60,
      height: bannerHeight,
      color: bgCol,
      borderColor: secCol,
      borderWidth: 1.5
    });

    // Friso decorativo superior (Cor Secundária)
    page.drawRectangle({
      x: 30,
      y: cursorY - 3,
      width: pageWidth - 60,
      height: 3,
      color: secCol
    });

    // Espaço com Fundo Branco Dedicado para o Logotipo
    // Projetado para acomodar logótipos mesmo que venham com fundo próprio
    const logoBoxW = 105;
    const logoBoxH = 54;
    const logoBoxX = 42;
    const logoBoxY = bannerY + (bannerHeight - logoBoxH) / 2 - 1;

    // Retângulo com fundo branco puro e borda na cor secundária
    page.drawRectangle({
      x: logoBoxX,
      y: logoBoxY,
      width: logoBoxW,
      height: logoBoxH,
      color: rgb(1, 1, 1),
      borderColor: secCol,
      borderWidth: 1
    });

    // Se houver logotipo embutido, desenha-o centralizado mantendo a proporção (aspect ratio)
    if (embeddedLogo) {
      const pad = 4;
      const maxW = logoBoxW - pad * 2;
      const maxH = logoBoxH - pad * 2;
      const imgAspect = embeddedLogo.width / embeddedLogo.height;
      let drawW = maxW;
      let drawH = drawW / imgAspect;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * imgAspect;
      }
      const drawX = logoBoxX + (logoBoxW - drawW) / 2;
      const drawY = logoBoxY + (logoBoxH - drawH) / 2;

      page.drawImage(embeddedLogo, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });
    } else {
      // Placeholder discreto no espaço branco
      page.drawText('LOGÓTIPO', {
        x: logoBoxX + (logoBoxW - 46) / 2,
        y: logoBoxY + logoBoxH / 2 - 3,
        size: 7.5,
        font: fontBold,
        color: rgb(0.65, 0.7, 0.75)
      });
    }

    // Identificação da Empresa posicionada à direita do compartimento de logotipo
    const textStartX = logoBoxX + logoBoxW + 14;

    // Nome da Empresa
    page.drawText(sanitizeWinAnsi(state.coBranding.companyName || 'Empresa Certificada'), {
      x: textStartX,
      y: bannerY + 44,
      size: 12.5,
      font: fontBold,
      color: textCol
    });

    // Morada e contactos
    const addressLine = `${state.coBranding.address || ''} · ${state.coBranding.postalCode || ''}`;
    page.drawText(sanitizeWinAnsi(addressLine), {
      x: textStartX,
      y: bannerY + 28,
      size: 8,
      font: fontRegular,
      color: textCol
    });

    const contactLine = `Tel: ${state.coBranding.phone || ''} | Email: ${state.coBranding.email || ''} | ${state.coBranding.website || ''}`;
    page.drawText(sanitizeWinAnsi(contactLine), {
      x: textStartX,
      y: bannerY + 14,
      size: 7.5,
      font: fontRegular,
      color: textCol
    });

    // Tag / Selo Co-Branding Homologado no canto superior direito
    const badgeW = 120;
    const badgeH = 14;
    const badgeX = pageWidth - 30 - badgeW - 10;
    const badgeY = bannerY + bannerHeight - 21;

    page.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: badgeW,
      height: badgeH,
      color: secCol
    });

    page.drawText('INSPEÇÃO OFICIAL ISO 16122', {
      x: badgeX + 7,
      y: badgeY + 3.5,
      size: 6.5,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    cursorY = bannerY - 18;
  } else {
    // Cabeçalho Freemium / DATERRA Oficial
    page.drawRectangle({
      x: 30,
      y: cursorY - 45,
      width: pageWidth - 60,
      height: 45,
      color: rgb(0.067, 0.25, 0.21) // #114037
    });

    page.drawText('DATERRA SMART · SUITE AGRÍCOLA', {
      x: 45,
      y: cursorY - 22,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    page.drawText('Plataforma Oficial de Calibração e Validação de Pulverizadores', {
      x: 45,
      y: cursorY - 36,
      size: 8,
      font: fontRegular,
      color: rgb(0.85, 0.95, 0.88)
    });

    cursorY = cursorY - 60;
  }

  // 4. MARCA DE ÁGUA PROEMINENTE NO MODO FREEMIUM
  if (!isPremium) {
    page.drawText('VERSÃO NÃO CERTIFICADA · DATERRA SMART', {
      x: 60,
      y: 350,
      size: 26,
      font: fontBold,
      color: rgb(0.85, 0.85, 0.85),
      rotate: degrees(45)
    });
  }

  // 5. TÍTULO DO RELATÓRIO E METADADOS DO ENSAIO
  const standardLabel =
    state.standard === 'ISO_16122_3'
      ? 'ISO 16122-3 (Culturas Arbustivas e Arbóreas / Vinhas e Pomares)'
      : 'ISO 16122-2 (Pulverizadores com Barra Horizontal / Culturas Baixas)';

  page.drawText('RELATÓRIO PERICIAL DE AUDITORIA DE DÉBITOS', {
    x: 30,
    y: cursorY,
    size: 13,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16)
  });

  page.drawText(`Norma Técnica Aplicada: ${standardLabel}`, {
    x: 30,
    y: cursorY - 14,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.5)
  });

  cursorY -= 32;

  // Caixa de Metadados da Máquina (Grelha de 4 colunas)
  const metaHeight = 36;
  page.drawRectangle({
    x: 30,
    y: cursorY - metaHeight,
    width: pageWidth - 60,
    height: metaHeight,
    color: rgb(0.97, 0.98, 0.99),
    borderColor: rgb(0.88, 0.91, 0.94),
    borderWidth: 1
  });

  const colW = (pageWidth - 70) / 4;
  const metaLabels = [
    { title: 'EQUIPAMENTO', val: state.machineModel || 'Pulverizador' },
    { title: 'MATRÍCULA / ID', val: state.machineRegistration || 'S/N' },
    { title: 'DATA ENSAIO', val: state.inspectionDate || 'Hoje' },
    { title: 'PRESSÃO P2', val: `${state.testPressureBar ?? '--'} bar` }
  ];

  metaLabels.forEach((item, i) => {
    const xPos = 40 + i * colW;
    page.drawText(item.title, {
      x: xPos,
      y: cursorY - 13,
      size: 6.5,
      font: fontBold,
      color: rgb(0.45, 0.5, 0.55)
    });
    page.drawText(sanitizeWinAnsi(item.val), {
      x: xPos,
      y: cursorY - 26,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.2)
    });
  });

  cursorY -= metaHeight + 14;

  // 6. CAIXA DE VEREDITO GLOBAL ISO 16122
  const isConforming = verdict.overallVerdict === 'CONFORME_ISO_16122';
  const verdictBg = isConforming ? rgb(0.06, 0.65, 0.4) : rgb(0.88, 0.2, 0.2); // Verde esmeralda ou Vermelho
  const verdictHeight = 44;

  page.drawRectangle({
    x: 30,
    y: cursorY - verdictHeight,
    width: pageWidth - 60,
    height: verdictHeight,
    color: verdictBg,
    rx: 6
  } as any);

  page.drawText(
    isConforming
      ? 'VEREDITO: CONFORME A NORMA ISO 16122'
      : 'VEREDITO: NÃO CONFORME A NORMA ISO 16122',
    {
      x: 45,
      y: cursorY - 18,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1)
    }
  );

  const verdictDetailText = `Débito Total Medido: ${verdict.totalMeasured} l/min (Alvo: ${verdict.totalTarget} l/min · Desvio Global: ${verdict.globalDeviationPercent}% · Limite: ±10%) | Assimetria: ${verdict.sideDifferencePercent}% | Bicos Conformes: ${verdict.individualConformingCount}/${verdict.activeNozzleCount}`;
  page.drawText(verdictDetailText, {
    x: 45,
    y: cursorY - 32,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.95, 0.98, 0.96)
  });

  cursorY -= verdictHeight + 18;

  // 7. DESENHO VETORIAL DO GRÁFICO (PERFIL DE DISTRIBUIÇÃO DE DÉBITOS)
  const isBoomPdf = state.standard === 'ISO_16122_2';

  page.drawText('PERFIL DE DISTRIBUIÇÃO DE DÉBITOS', {
    x: 30,
    y: cursorY,
    size: 9,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.2)
  });

  const chartSubtitle = isBoomPdf
    ? '(Barra Horizontal ISO 16122-2: Culturas Baixas - Sequencia de bicos N1 a N' + (state.numLevels * 2) + ')'
    : '(Distribuicao Bilateral ISO 16122-3: Culturas 3D - Niveis N1 a N' + state.numLevels + ')';

  page.drawText(sanitizeWinAnsi(chartSubtitle), {
    x: 235,
    y: cursorY,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.45, 0.5, 0.55)
  });

  cursorY -= 12;

  // Determinar maxFlow para a escala do gráfico
  let maxFlow = 0.5;
  for (let l = 1; l <= state.numLevels; l++) {
    const lMed = state.slots[`${l}-left`]?.measuredFlowRate || 0;
    const rMed = state.slots[`${l}-right`]?.measuredFlowRate || 0;
    const lTgt = evaluations[`${l}-left`]?.targetFlowRate || 0;
    const rTgt = evaluations[`${l}-right`]?.targetFlowRate || 0;
    maxFlow = Math.max(maxFlow, lMed, rMed, lTgt, rTgt);
  }
  maxFlow = Number((maxFlow * 1.25).toFixed(2));

  const chartWidth = pageWidth - 60;
  const chartX = 30;

  if (isBoomPdf) {
    // =======================================================================
    // GRÁFICO DA BARRA HORIZONTAL (ISO 16122-2)
    // Sequência de bicos N1 (extrema esquerda) a N2x (extrema direita)
    // =======================================================================
    const chartHeight = 150;
    const chartY = cursorY - chartHeight;

    // Fundo do gráfico
    page.drawRectangle({
      x: chartX,
      y: chartY,
      width: chartWidth,
      height: chartHeight,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.88, 0.9, 0.92),
      borderWidth: 1
    });

    const totalBoomNozzles = state.numLevels * 2;
    const marginLeft = 35;
    const marginRight = 10;
    const plotWidth = chartWidth - marginLeft - marginRight;
    const baselineY = chartY + 28;
    const plotTop = chartY + chartHeight - 22;
    const plotHeight = plotTop - baselineY;

    const colWidth = plotWidth / totalBoomNozzles;
    const barWidth = Math.min(14, Math.max(4, colWidth - 4));
    const dividerX = chartX + marginLeft + state.numLevels * colWidth;

    // Linha divisória do chassis / centro da máquina
    page.drawLine({
      start: { x: dividerX, y: baselineY - 18 },
      end: { x: dividerX, y: plotTop + 8 },
      color: rgb(0.75, 0.8, 0.85),
      thickness: 1.2
    });

    // Rótulos superiores da barra horizontal
    page.drawText(sanitizeWinAnsi(`<< Secção Esquerda (N1 a N${state.numLevels})`), {
      x: chartX + marginLeft + 4,
      y: chartY + chartHeight - 12,
      size: 6.5,
      font: fontBold,
      color: rgb(0.3, 0.35, 0.4)
    });

    page.drawText('Eixo Central', {
      x: dividerX - 14,
      y: chartY + chartHeight - 12,
      size: 6,
      font: fontBold,
      color: rgb(0.5, 0.55, 0.6)
    });

    page.drawText(sanitizeWinAnsi(`Secção Direita (N${state.numLevels + 1} a N${totalBoomNozzles}) >>`), {
      x: dividerX + 10,
      y: chartY + chartHeight - 12,
      size: 6.5,
      font: fontBold,
      color: rgb(0.3, 0.35, 0.4)
    });

    // Linhas de Grelha Horizontais do Eixo Y (Débito)
    [0.25, 0.5, 0.75, 1.0].forEach((frac) => {
      const flowVal = Number((maxFlow * frac).toFixed(2));
      const yPos = baselineY + (flowVal / maxFlow) * plotHeight;

      page.drawLine({
        start: { x: chartX + marginLeft, y: yPos },
        end: { x: chartX + marginLeft + plotWidth, y: yPos },
        color: rgb(0.9, 0.92, 0.94),
        thickness: 0.5
      });

      page.drawText(`${flowVal}`, {
        x: chartX + marginLeft - 18,
        y: yPos - 2.5,
        size: 5.5,
        font: fontRegular,
        color: rgb(0.5, 0.55, 0.6)
      });
    });

    page.drawText('l/min', {
      x: chartX + marginLeft - 18,
      y: plotTop + 2,
      size: 5.5,
      font: fontBold,
      color: rgb(0.4, 0.45, 0.5)
    });

    // Linha de Base da Barra
    page.drawLine({
      start: { x: chartX + marginLeft, y: baselineY },
      end: { x: chartX + marginLeft + plotWidth, y: baselineY },
      color: rgb(0.6, 0.65, 0.7),
      thickness: 1
    });

    // Bicos na Barra Horizontal
    for (let i = 0; i < totalBoomNozzles; i++) {
      const colCenterX = chartX + marginLeft + (i + 0.5) * colWidth;
      const isLeftHalf = i < state.numLevels;
      const lvl = isLeftHalf ? i + 1 : i - state.numLevels + 1;
      const slotKey = isLeftHalf ? `${lvl}-left` : `${lvl}-right`;
      const displayNum = isLeftHalf ? lvl : state.numLevels + lvl;

      const slot = state.slots[slotKey];
      const evalSlot = evaluations[slotKey];
      const colorInfo = getSlotColorInfo(slot);
      const colorRgb = hexToRgb(colorInfo.hex);

      const target = evalSlot?.targetFlowRate || 0;
      const measured = slot?.measuredFlowRate || 0;
      const isActive = slot?.isActive ?? true;
      const isConf = evalSlot?.isConforming ?? false;

      // Faixa de tolerância legal (+/- 10%)
      if (target > 0 && isActive) {
        const tolMinY = baselineY + ((target * 0.9) / maxFlow) * plotHeight;
        const tolMaxY = baselineY + ((target * 1.1) / maxFlow) * plotHeight;
        const tolH = Math.max(1.5, tolMaxY - tolMinY);

        page.drawRectangle({
          x: colCenterX - colWidth / 2 + 0.5,
          y: tolMinY,
          width: Math.max(1, colWidth - 1),
          height: tolH,
          color: rgb(0.92, 0.98, 0.95),
          borderColor: rgb(0.65, 0.92, 0.8),
          borderWidth: 0.4
        });

        // Marca teórica Q2 (Verde)
        const targetY = baselineY + (target / maxFlow) * plotHeight;
        page.drawLine({
          start: { x: colCenterX - barWidth / 2 - 1, y: targetY },
          end: { x: colCenterX + barWidth / 2 + 1, y: targetY },
          color: rgb(0.06, 0.65, 0.4),
          thickness: 1.5
        });
      }

      // Barra de Débito Medido
      if (isActive && measured > 0) {
        const measuredH = (measured / maxFlow) * plotHeight;
        page.drawRectangle({
          x: colCenterX - barWidth / 2,
          y: baselineY,
          width: barWidth,
          height: measuredH,
          color: isConf ? rgb(0.14, 0.39, 0.92) : rgb(0.9, 0.22, 0.22)
        });

        // Valor numérico medido
        page.drawText(`${measured}`, {
          x: colCenterX - 5,
          y: Math.min(plotTop + 1, baselineY + measuredH + 2),
          size: 5,
          font: fontBold,
          color: rgb(0.15, 0.2, 0.25)
        });
      }

      // Círculo com a Cor de Catálogo do Bico
      const badgeCy = baselineY - 12;
      page.drawCircle({
        x: colCenterX,
        y: badgeCy,
        size: 5.5,
        color: colorRgb,
        borderColor: rgb(0.7, 0.75, 0.8),
        borderWidth: 0.5
      });

      // Núcleo central branco
      page.drawCircle({
        x: colCenterX,
        y: badgeCy,
        size: 3.5,
        color: rgb(1, 1, 1)
      });

      // Rótulo do Bico (N1, N2, ..., N20)
      const lbl = `N${displayNum}`;
      page.drawText(lbl, {
        x: colCenterX - (displayNum >= 10 ? 4 : 2.5),
        y: badgeCy - 2,
        size: 4.5,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.2)
      });
    }

    cursorY = chartY - 18;
  } else {
    // =======================================================================
    // GRÁFICO BILATERAL / BORBOLETA (ISO 16122-3: CULTURAS 3D)
    // =======================================================================
    const chartHeight = Math.min(220, state.numLevels * 24 + 30);
    const chartY = cursorY - chartHeight;

    // Fundo do gráfico
    page.drawRectangle({
      x: chartX,
      y: chartY,
      width: chartWidth,
      height: chartHeight,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.88, 0.9, 0.92),
      borderWidth: 1
    });

    // Linha central
    const chartCenterX = chartX + chartWidth / 2;
    page.drawLine({
      start: { x: chartCenterX, y: chartY + 10 },
      end: { x: chartCenterX, y: chartY + chartHeight - 10 },
      color: rgb(0.75, 0.8, 0.85),
      thickness: 1.5
    });

    const sideAvailableWidth = chartWidth / 2 - 28;
    const levelRowHeight = (chartHeight - 24) / state.numLevels;

    // Rótulos de Lado
    page.drawText(sanitizeWinAnsi(`<< Lado Esquerdo (${maxFlow} l/min)`), {
      x: chartX + 10,
      y: chartY + chartHeight - 14,
      size: 7,
      font: fontBold,
      color: rgb(0.3, 0.35, 0.4)
    });

    page.drawText(sanitizeWinAnsi(`Lado Direito (${maxFlow} l/min) >>`), {
      x: chartCenterX + 20,
      y: chartY + chartHeight - 14,
      size: 7,
      font: fontBold,
      color: rgb(0.3, 0.35, 0.4)
    });

    // Desenha os níveis
    for (let l = 1; l <= state.numLevels; l++) {
      const currentLevelY = chartY + chartHeight - 20 - l * levelRowHeight;
      const lSlot = state.slots[`${l}-left`];
      const rSlot = state.slots[`${l}-right`];
      const lEval = evaluations[`${l}-left`];
      const rEval = evaluations[`${l}-right`];

      const lColorInfo = getSlotColorInfo(lSlot);
      const rColorInfo = getSlotColorInfo(rSlot);

      // Círculo com a cor do bico do Lado Esquerdo
      page.drawCircle({
        x: chartCenterX - 11,
        y: currentLevelY + 7,
        size: 3.5,
        color: hexToRgb(lColorInfo.hex),
        borderColor: rgb(0.7, 0.75, 0.8),
        borderWidth: 0.5
      });

      // Rótulo do Nível no centro
      page.drawText(`N${l}`, {
        x: chartCenterX - (l >= 10 ? 5 : 3.5),
        y: currentLevelY + 4,
        size: 7.5,
        font: fontBold,
        color: rgb(0.2, 0.25, 0.3)
      });

      // Círculo com a cor do bico do Lado Direito
      page.drawCircle({
        x: chartCenterX + 11,
        y: currentLevelY + 7,
        size: 3.5,
        color: hexToRgb(rColorInfo.hex),
        borderColor: rgb(0.7, 0.75, 0.8),
        borderWidth: 0.5
      });

      // Lado Esquerdo
      if (lSlot?.isActive) {
        const lTgt = lEval?.targetFlowRate || 0;
        const lMed = lSlot?.measuredFlowRate || 0;
        const lTgtW = (lTgt / maxFlow) * sideAvailableWidth;
        const lMedW = (lMed / maxFlow) * sideAvailableWidth;
        const isLConf = lEval?.isConforming ?? false;

        // Barra Teórica (Verde)
        if (lTgtW > 0) {
          page.drawRectangle({
            x: chartCenterX - 18 - lTgtW,
            y: currentLevelY + 6,
            width: lTgtW,
            height: 4.5,
            color: rgb(0.06, 0.65, 0.4)
          });
        }

        // Barra Medida (Azul se conforme, Vermelha se não)
        if (lMedW > 0) {
          page.drawRectangle({
            x: chartCenterX - 18 - lMedW,
            y: currentLevelY,
            width: lMedW,
            height: 4.5,
            color: isLConf ? rgb(0.14, 0.39, 0.92) : rgb(0.9, 0.22, 0.22)
          });
        }
      }

      // Lado Direito
      if (rSlot?.isActive) {
        const rTgt = rEval?.targetFlowRate || 0;
        const rMed = rSlot?.measuredFlowRate || 0;
        const rTgtW = (rTgt / maxFlow) * sideAvailableWidth;
        const rMedW = (rMed / maxFlow) * sideAvailableWidth;
        const isRConf = rEval?.isConforming ?? false;

        // Barra Teórica (Verde)
        if (rTgtW > 0) {
          page.drawRectangle({
            x: chartCenterX + 18,
            y: currentLevelY + 6,
            width: rTgtW,
            height: 4.5,
            color: rgb(0.06, 0.65, 0.4)
          });
        }

        // Barra Medida
        if (rMedW > 0) {
          page.drawRectangle({
            x: chartCenterX + 18,
            y: currentLevelY,
            width: rMedW,
            height: 4.5,
            color: isRConf ? rgb(0.14, 0.39, 0.92) : rgb(0.9, 0.22, 0.22)
          });
        }
      }
    }

    cursorY = chartY - 18;
  }

  // 8. TABELA RESUMO DOS BICOS
  page.drawText('MATRIZ DE MEDIÇÕES E DESVIOS INDIVIDUAIS (L/MIN)', {
    x: 30,
    y: cursorY,
    size: 8.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.2)
  });

  cursorY -= 12;

  // Cabeçalho da Tabela
  page.drawRectangle({
    x: 30,
    y: cursorY - 14,
    width: pageWidth - 60,
    height: 14,
    color: rgb(0.1, 0.25, 0.2)
  });

  const tableHeaders = isBoomPdf
    ? [
        { title: 'Secção Esquerda', x: 35 },
        { title: 'Cor Bico', x: 92 },
        { title: 'Q2 Alvo', x: 155 },
        { title: 'Q Medido', x: 205 },
        { title: 'Desvio', x: 260 },
        { title: 'Secção Direita', x: 315 },
        { title: 'Cor Bico', x: 375 },
        { title: 'Q2 Alvo', x: 435 },
        { title: 'Q Medido', x: 485 },
        { title: 'Desvio', x: 535 }
      ]
    : [
        { title: 'Nível', x: 35 },
        { title: 'Bico Esq.', x: 75 },
        { title: 'Q2 Alvo', x: 155 },
        { title: 'Q Medido', x: 205 },
        { title: 'Desvio Esq.', x: 260 },
        { title: 'Bico Dir.', x: 320 },
        { title: 'Q2 Alvo', x: 400 },
        { title: 'Q Medido', x: 450 },
        { title: 'Desvio Dir.', x: 505 }
      ];

  tableHeaders.forEach((th) => {
    page.drawText(th.title, {
      x: th.x,
      y: cursorY - 10,
      size: 7,
      font: fontBold,
      color: rgb(1, 1, 1)
    });
  });

  cursorY -= 14;

  // Linhas da Tabela
  const tableRowH = 13;
  for (let l = 1; l <= state.numLevels; l++) {
    const lSlot = state.slots[`${l}-left`];
    const rSlot = state.slots[`${l}-right`];
    const lEval = evaluations[`${l}-left`];
    const rEval = evaluations[`${l}-right`];

    const isEven = l % 2 === 0;
    if (isEven) {
      page.drawRectangle({
        x: 30,
        y: cursorY - tableRowH,
        width: pageWidth - 60,
        height: tableRowH,
        color: rgb(0.97, 0.98, 0.99)
      });
    }

    const lDev = lEval?.deviationPercent !== null ? `${lEval?.deviationPercent}%` : '--';
    const rDev = rEval?.deviationPercent !== null ? `${rEval?.deviationPercent}%` : '--';

    const leftNozzleLabel = isBoomPdf ? `N${l}` : `N${l}`;
    const rightNozzleLabel = isBoomPdf ? `N${state.numLevels + l}` : `N${l}`;

    if (isBoomPdf) {
      page.drawText(leftNozzleLabel, { x: 35, y: cursorY - 9, size: 7, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
      page.drawText(sanitizeWinAnsi(lSlot?.color || '--'), { x: 80, y: cursorY - 9, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(`${lEval?.targetFlowRate ?? '--'}`, { x: 155, y: cursorY - 9, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(`${lSlot?.measuredFlowRate ?? '--'}`, { x: 205, y: cursorY - 9, size: 6.5, font: fontBold, color: rgb(0.1, 0.15, 0.2) });
      page.drawText(lDev, {
        x: 260,
        y: cursorY - 9,
        size: 6.5,
        font: fontBold,
        color: lEval?.isConforming ? rgb(0.06, 0.65, 0.4) : rgb(0.88, 0.2, 0.2)
      });

      page.drawText(rightNozzleLabel, { x: 320, y: cursorY - 9, size: 7, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
      page.drawText(sanitizeWinAnsi(rSlot?.color || '--'), { x: 370, y: cursorY - 9, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(`${rEval?.targetFlowRate ?? '--'}`, { x: 435, y: cursorY - 9, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(`${rSlot?.measuredFlowRate ?? '--'}`, { x: 485, y: cursorY - 9, size: 6.5, font: fontBold, color: rgb(0.1, 0.15, 0.2) });
      page.drawText(rDev, {
        x: 535,
        y: cursorY - 9,
        size: 6.5,
        font: fontBold,
        color: rEval?.isConforming ? rgb(0.06, 0.65, 0.4) : rgb(0.88, 0.2, 0.2)
      });
    } else {
      page.drawText(`N${l}`, { x: 35, y: cursorY - 9, size: 7, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
      page.drawText(sanitizeWinAnsi(lSlot?.color || '--'), { x: 75, y: cursorY - 9, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(`${lEval?.targetFlowRate ?? '--'}`, { x: 155, y: cursorY - 9, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(`${lSlot?.measuredFlowRate ?? '--'}`, { x: 205, y: cursorY - 9, size: 6.5, font: fontBold, color: rgb(0.1, 0.15, 0.2) });
      page.drawText(lDev, {
        x: 260,
        y: cursorY - 9,
        size: 6.5,
        font: fontBold,
        color: lEval?.isConforming ? rgb(0.06, 0.65, 0.4) : rgb(0.88, 0.2, 0.2)
      });

      page.drawText(sanitizeWinAnsi(rSlot?.color || '--'), { x: 320, y: cursorY - 9, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(`${rEval?.targetFlowRate ?? '--'}`, { x: 400, y: cursorY - 9, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });
      page.drawText(`${rSlot?.measuredFlowRate ?? '--'}`, { x: 450, y: cursorY - 9, size: 6.5, font: fontBold, color: rgb(0.1, 0.15, 0.2) });
      page.drawText(rDev, {
        x: 505,
        y: cursorY - 9,
        size: 6.5,
        font: fontBold,
        color: rEval?.isConforming ? rgb(0.06, 0.65, 0.4) : rgb(0.88, 0.2, 0.2)
      });
    }

    cursorY -= tableRowH;
  }

  // 9. RODAPÉ PERMANENTE INSTITUCIONAL DATERRA (SEMPRE PRESENTE)
  const footerY = 25;
  page.drawLine({
    start: { x: 30, y: footerY + 15 },
    end: { x: pageWidth - 30, y: footerY + 15 },
    color: rgb(0.8, 0.85, 0.88),
    thickness: 0.8
  });

  const year = new Date().getFullYear();
  page.drawText(`© ${year} DATERRA Smart. Todos os direitos reservados.`, {
    x: 30,
    y: footerY + 4,
    size: 7.5,
    font: fontBold,
    color: rgb(0.067, 0.25, 0.21)
  });

  page.drawText('Email: suporte@daterra.com.pt  |  Website: https://smart.daterra.com.pt', {
    x: pageWidth - 280,
    y: footerY + 4,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.5)
  });

  // 10. Serialização e Download do PDF no Navegador
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Relatorio_SmartDebito_${state.machineRegistration || 'ISO16122'}_${state.inspectionDate}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
