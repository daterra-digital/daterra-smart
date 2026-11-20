import { computeNozzleIso16122Stats, resolveNozzlePressureBounds } from '../../features/perfis/services/calibrationFormatters.ts';
import type { ActiveAgronomicContext } from '../../types/calibration-audit.ts';
import { computeCalibrationEppoBalance } from '../agri-math/calibration-eppo-bridge.ts';

export interface AgronomicContextPromptOptions {
  includeCulture?: boolean;
  includeEquipment?: boolean;
  includeNozzle?: boolean;
  includeCalibration?: boolean;
}

const fmtPt = (v: number | null | undefined, dec = 2): string =>
  typeof v === 'number' && Number.isFinite(v) ? v.toFixed(dec).replace('.', ',') : 'Não definido';

const fmtIntPt = (v: number | null | undefined): string =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v).toLocaleString('pt-PT') : 'Não definido';

function resolveIppValidityPt(lastDate?: string): string {
  if (!lastDate?.trim()) return 'Não registada';
  const parsed = new Date(lastDate);
  if (Number.isNaN(parsed.getTime())) return lastDate;
  parsed.setFullYear(parsed.getFullYear() + 3);
  return `${String(parsed.getDate()).padStart(2, '0')}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${parsed.getFullYear()} (ciclo 3 anos DL 78/2020)`;
}

/**
 * Serializa de forma concisa, estruturada e fiel os 4 perfis ativos (@cultura, @equipamento, @bico, @calibracao)
 * para injeção no Assistente IA, preservando estritamente `null` quando não definido.
 */
export function buildActiveExplorationContextSummary(
  context: ActiveAgronomicContext | null | undefined,
  options: AgronomicContextPromptOptions = {}
): string {
  if (!context) return '';
  const incCult = options.includeCulture !== false && context.culture !== null;
  const incEq = options.includeEquipment !== false && context.equipment !== null;
  const incNoz = options.includeNozzle !== false && context.nozzleProfile !== null;
  const incCal = options.includeCalibration !== false && context.calibration !== null;
  if (!incCult && !incEq && !incNoz && !incCal) return '';

  const lines: string[] = ['[CONTEXTO AGRONÓMICO ATIVO DA EXPLORAÇÃO (DADOS REAIS DO UTILIZADOR)]:'];

  if (incCult && context.culture) {
    const c = context.culture;
    const r = c.record;
    const loc = [r.parish, r.municipality, r.location].filter(Boolean).join(' / ') || 'Não definida';
    const bioIdx = c.lwaM2Ha !== null ? `LWA: ${fmtIntPt(c.lwaM2Ha)} m²/ha`
      : c.trvM3Ha !== null ? `TRV: ${fmtIntPt(c.trvM3Ha)} m³/ha` : 'Índice vegetativo: Não definido';
    const momentName = c.activeMoment?.stageLabel || c.momentSnapshot?.stageLabel || r.phenological_stage || 'Não definido';
    lines.push([
      `- @cultura: "${c.name}"`,
      `Cultura/Variedade: ${c.cropType}${r.variety ? ` (${r.variety})` : ''}`,
      `Localização: ${loc}`,
      `Área: ${r.area_ha ? `${fmtPt(r.area_ha, 2)} ha` : 'Não definida'}`,
      `Entrelinha: ${c.entrelinhaM !== null ? `${fmtPt(c.entrelinhaM, 2)} m` : 'Não definida'}`,
      `Momento ativo: ${momentName}`,
      bioIdx,
      `Volume Sugerido EPPO PP 1/239: ${c.volumeRecomendadoEppoLHa !== null ? `${fmtPt(c.volumeRecomendadoEppoLHa, 1)} L/ha` : 'Não definido'}`
    ].join(' | '));
  }

  if (incEq && context.equipment) {
    const eq = context.equipment;
    const v12 = eq.recordV12;
    const leg = eq.legacyRecord;
    const tip = eq.isDroneUav ? 'Drone UAV' : eq.is3DOrAirAssisted ? `3D / Copa (${v12?.type ?? eq.equipmentType ?? '3D'})` : `2D (${v12?.type ?? eq.equipmentType ?? '2D'})`;
    const cap = v12?.tankCapacityL ?? leg?.tank_capacity_l ?? null;
    const serial = v12?.serialNumber ?? leg?.serial_number ?? null;
    lines.push([
      `- @equipamento: "${eq.name}"`,
      `Tipologia: ${tip}`,
      `Depósito: ${cap !== null ? `${fmtIntPt(cap)} L` : 'Não definido'}`,
      `Caudal nominal de ar: ${eq.caudalArAplicadoM3H !== null ? `${fmtIntPt(eq.caudalArAplicadoM3H)} m³/h` : 'Não aplicável / Não definido'}`,
      `Validade IPP: ${resolveIppValidityPt(v12?.iso16122Inspection?.lastInspectionDate ?? leg?.inspection_date)}`,
      `Série/Chassi: ${serial || 'Não registado'}`
    ].join(' | '));
  }

  if (incNoz && context.nozzleProfile) {
    const nz = context.nozzleProfile;
    const prof = nz.profile;
    const stats = computeNozzleIso16122Stats(prof);
    const bounds = resolveNozzlePressureBounds(prof);
    const activeCount = prof?.activeSlotsCount ?? nz.activeNozzleCount;
    const totalCount = prof?.totalSlotsCount ?? nz.activeNozzleCount;
    const devTxt = stats.desvioMaximoBicosPct !== null ? `Desvio máx. bicos: ${fmtPt(stats.desvioMaximoBicosPct, 1)}%` : 'Desvio ISO 16122: Sem medição real';
    const symTxt = stats.simetriaEsqDirPct !== null ? `Simetria Esq./Dir.: ${fmtPt(stats.simetriaEsqDirPct, 1)}%` : null;
    const winTxt = bounds.minBar !== null && bounds.maxBar !== null ? `${fmtPt(bounds.minBar, 1)}–${fmtPt(bounds.maxBar, 1)} bar` : 'Não definida';
    lines.push([
      `- @bico: "${nz.label}"`,
      `Tipologia: ${prof?.equipmentType ?? 'Legado'}`,
      `Pressão base: ${nz.referencePressureBar !== null ? `${fmtPt(nz.referencePressureBar, 1)} bar` : 'Não definida'}`,
      `Bicos ativos/totais: ${activeCount !== null && totalCount !== null ? `${activeCount}/${totalCount}` : 'Não definido'}`,
      `Débito total: ${nz.totalActiveFlowLMin !== null ? `${fmtPt(nz.totalActiveFlowLMin, 2)} L/min` : 'Não definido'}`,
      [devTxt, symTxt].filter(Boolean).join(', '),
      `Janela homologada: ${winTxt}`
    ].join(' | '));
  }

  if (incCal && context.calibration) {
    const cal = context.calibration;
    const refEppo = cal.volumeRecomendadoEppoLHa ?? context.culture?.volumeRecomendadoEppoLHa ?? null;
    const is3d = Boolean(context.culture?.trvM3Ha || context.culture?.lwaM2Ha || context.equipment?.is3DOrAirAssisted);
    const bal = computeCalibrationEppoBalance({
      debitoTotalLMin: cal.debitoTotalLMin, velocidadeKmh: cal.velocidadeKmh, entrelinhaM: cal.entrelinhaM,
      pressaoBar: cal.pressaoBar, numBicosAtivos: cal.numBicosAtivos, culturaTipologia: is3d ? '3D_COPA' : '2D',
      volumeRecomendadoEppoLHa: refEppo, trvM3Ha: context.culture?.trvM3Ha ?? null,
      lwaM2Ha: context.culture?.lwaM2Ha ?? null, caudalArAplicadoM3H: cal.caudalArAplicadoM3H, isDroneUav: context.equipment?.isDroneUav
    });
    const devTxt = bal.desvioPercentual !== null ? `${bal.desvioPercentual > 0 ? '+' : ''}${fmtPt(bal.desvioPercentual, 1)}%` : 'Sem ref. EPPO';
    const mech = [
      cal.relacaoEngrenagem ? `Engrenagem: ${cal.relacaoEngrenagem}` : null,
      cal.rotacaoMotorRpm ? `Motor: ${fmtIntPt(cal.rotacaoMotorRpm)} rpm` : null,
      cal.rotacaoTdfRpm ? `TDF: ${fmtIntPt(cal.rotacaoTdfRpm)} rpm` : null
    ].filter(Boolean).join(', ') || 'Não indicado';
    lines.push([
      `- @calibracao: "${cal.nomePerfil}"`,
      `Velocidade: ${fmtPt(cal.velocidadeKmh, 1)} km/h`,
      `Pressão calibrada: ${fmtPt(cal.pressaoBar, 1)} bar`,
      `Volume estimado: ${fmtPt(cal.volumeCalibradoLHa, 1)} L/ha (Desvio vs. EPPO: ${devTxt})`,
      bal.recomendacaoBico ? `Sugestão ISO 10625: ${bal.recomendacaoBico.sugestaoBicoIso}` : 'Sugestão ISO 10625: Alinhado',
      `Ar aplicado: ${cal.caudalArAplicadoM3H !== null ? `${fmtIntPt(cal.caudalArAplicadoM3H)} m³/h` : 'Não definido'}`,
      `Transmissão: ${mech}`,
      `SHA-256: ${cal.sha256Seal ?? 'Não selado'}`
    ].join(' | '));
  }

  if (context.weatherSnapshot) {
    const w = context.weatherSnapshot;
    lines.push(
      `- Meteorologia: Vento ${w.ventoMs !== null ? `${fmtPt(w.ventoMs, 1)} m/s` : 'null (sem leitura)'} | Rajada ${w.rajadaMs !== null ? `${fmtPt(w.rajadaMs, 1)} m/s` : 'null'} | Delta T ${w.deltaT !== null ? `${fmtPt(w.deltaT, 1)} °C` : 'null'}`
    );
  }

  lines.push('INSTRUÇÃO ORIENTATIVA: Responde em PT-PT cruzando estes dados reais com a legislação DGAV, EPPO PP 1/239 e EN ISO 16122. Nunca inventes valores em falta.');
  return lines.join('\n');
}
