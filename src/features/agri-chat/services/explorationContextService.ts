// src/features/agri-chat/services/explorationContextService.ts
import { db } from '../../../db/db.ts';
import type { ProfileCulture, ProfileEquipment, ProfileNozzle, ProfileCalibration } from '../../../db/db.ts';
import type { ActiveExplorationContext } from '../types.ts';

export const explorationContextService = {
  // Carregar perfis autorizados do utilizador autenticado (SEC-REM-01)
  async loadUserExplorationProfiles(userId?: string | null): Promise<{
    cultures: ProfileCulture[];
    equipments: ProfileEquipment[];
    nozzles: ProfileNozzle[];
    calibrations: ProfileCalibration[];
  }> {
    if (!userId || userId.trim() === '') {
      return { cultures: [], equipments: [], nozzles: [], calibrations: [] };
    }
    try {
      const [cultures, equipments, nozzles, calibrations] = await Promise.all([
        db.profiles_cultures.where('userId').equals(userId).toArray(),
        db.profiles_equipment.where('userId').equals(userId).toArray(),
        db.profiles_nozzles.where('userId').equals(userId).toArray(),
        db.profiles_calibrations.where('userId').equals(userId).toArray()
      ]);
      return { cultures, equipments, nozzles, calibrations };
    } catch (err) {
      console.warn('Erro ao carregar perfis de exploração:', err);
      return { cultures: [], equipments: [], nozzles: [], calibrations: [] };
    }
  },

  // Montar bloco de texto estruturado para enriquecer a prompt da IA
  formatContextForPrompt(ctx?: ActiveExplorationContext): string {
    if (!ctx || (!ctx.cultureName && !ctx.equipmentName && !ctx.nozzleName)) {
      return '';
    }

    const lines: string[] = ['[DADOS REAIS DA EXPLORAÇÃO DO UTILIZADOR]:'];

    if (ctx.cultureName) {
      const cropDetails = [
        ctx.cropType ? `Cultura: ${ctx.cropType}` : '',
        ctx.variety ? `Variedade: ${ctx.variety}` : '',
        ctx.phenologicalStage ? `Estádio Fenológico: ${ctx.phenologicalStage}` : '',
        ctx.rowDistanceM ? `Entrelinha: ${ctx.rowDistanceM}m` : '',
        ctx.canopyHeightM ? `Altura da Copa: ${ctx.canopyHeightM}m` : '',
        ctx.canopyWidthM ? `Largura da Copa: ${ctx.canopyWidthM}m` : '',
        ctx.trainingSystem ? `Condução: ${ctx.trainingSystem}` : '',
        ctx.lwaM2Ha ? `LWA: ${ctx.lwaM2Ha} m²/ha` : '',
        ctx.trvM3Ha ? `TRV: ${ctx.trvM3Ha} m³/ha` : '',
        ctx.recommendedSprayVolumeLHa ? `Calda Recomendada EPPO: ${ctx.recommendedSprayVolumeLHa} L/ha` : ''
      ].filter(Boolean).join(' | ');

      lines.push(`- Parcela/Cultura: "${ctx.cultureName}" (${cropDetails})`);
    }

    if (ctx.equipmentName) {
      const eqDetails = [
        ctx.tankCapacityL ? `Capacidade do Depósito: ${ctx.tankCapacityL}L` : '',
        ctx.pumpType ? `Bomba: ${ctx.pumpType}` : ''
      ].filter(Boolean).join(' | ');

      lines.push(`- Pulverizador: "${ctx.equipmentName}" (${eqDetails})`);
    }

    if (ctx.nozzleName) {
      lines.push(`- Bicos Instalados: ${ctx.nozzleName} ${ctx.nozzleColor ? `(${ctx.nozzleColor})` : ''}`);
    }

    if (ctx.calibrationSpeedKmh || ctx.calibrationPressureBar || ctx.calibrationVolumeLHa) {
      const calDetails = [
        ctx.calibrationSpeedKmh ? `Velocidade: ${ctx.calibrationSpeedKmh} km/h` : '',
        ctx.calibrationPressureBar ? `Pressão: ${ctx.calibrationPressureBar} bar` : '',
        ctx.calibrationVolumeLHa ? `Volume Aplicado: ${ctx.calibrationVolumeLHa} L/ha` : ''
      ].filter(Boolean).join(' | ');

      lines.push(`- Regulação de Calibração Atual: ${calDetails}`);
    }

    lines.push('INSTRUÇÃO: Avalie a questão cruzando especificamente estas variáveis reais com as normas técnicas oficiais.');
    return lines.join('\n');
  }
};
