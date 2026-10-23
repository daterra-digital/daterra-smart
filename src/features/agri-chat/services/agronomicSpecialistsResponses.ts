// src/features/agri-chat/services/agronomicSpecialistsResponses.ts
import type { SkillId, ChatActionCard } from '../types';

export interface SpecialistResponseResult {
  reply: string;
  sources: string[];
  actionCard?: ChatActionCard;
}

export function generateSpecialistAgronomicResponse(
  activeSkill: SkillId,
  cropName: string,
  rowDist: number,
  canopyH: number,
  eqName: string
): SpecialistResponseResult {
  switch (activeSkill) {
    case 'rega':
      return {
        reply: `Na **Skill Rega**, para a parcela *${cropName}* (${rowDist}m de entrelinha):\n\n` +
          `• **Necessidades Hídricas ($ET_c$):** Multiplique a evapotranspiração de referência ($ET_0$) pelo coeficiente cultural ($K_c$) correspondente à fase fenológica atual.\n` +
          `• **Volume de Copa (TRV):** Em copas tridimensionais, o volume foliar (m³/ha) orienta a taxa de transpiração e a reposição hídrica no solo.`,
        sources: ['FAO 56 Irrigation and Drainage', 'Diretrizes Hidráulica Agrícola'],
        actionCard: {
          title: 'Calculadora de Volume de Copa (TRV)',
          description: `Determine o volume tridimensional da copa na parcela ${cropName}.`,
          buttonText: 'Calcular TRV',
          url: '/ferramentas/volume-copa',
          badge: 'Modelo TRV'
        }
      };

    case 'fertilizacao':
      return {
        reply: `Na **Skill Fertilização**, o plano nutricional para *${cropName}* fundamenta-se na marcha de absorção:\n\n` +
          `• **Balanço N-P-K:** Fracione as unidades de Azoto (N) ao longo do ciclo vegetativo para prevenir o excesso de vigor e suscetibilidade a fungos.\n` +
          `• **Zonas Vulneráveis a Nitratos:** Cumpra o limite legal de unidades fertilizantes azotadas estabelecido para a sua bacia hidrográfica.`,
        sources: ['Manual de Fertilização das Culturas', 'Diretiva Nitratos']
      };

    case 'solos':
      return {
        reply: `Na **Skill Solos**, a gestão da fertilidade para *${cropName}* foca-se na saúde edáfica:\n\n` +
          `• **Matéria Orgânica:** Mantenha teores acima de 1,5–2,0% através de enrelvamento ou incorporação de biomassa triturada.\n` +
          `• **pH e CTC:** O pH ideal assegura a máxima disponibilidade de fósforo e micronutrientes sem toxicidade de alumínio.`,
        sources: ['Manual de Fertilidade do Solo', 'Normas de Análise Edáfica']
      };

    case 'globalgap':
      return {
        reply: `No referencial **GlobalGAP (IFA v6)**, a conformidade da parcela *${cropName}* exige:\n\n` +
          `• **Rastreabilidade Total:** Cada lote de colheita deve estar associado aos registos de aplicação de fitofármacos e fertilizantes.\n` +
          `• **Calibração e Manutenção:** Prova documental de calibração anual do pulverizador *${eqName}* e registo de limpeza e tripla lavagem de embalagens.`,
        sources: ['GlobalGAP IFA v6 Standards', 'Checklist de Auditoria']
      };

    case 'haccp':
      return {
        reply: `No sistema **HACCP na Produção Primária**:\n\n` +
          `• **Pontos Críticos de Controlo (PCC):** O controlo dos LMR (Limites Máximos de Resíduos) e a qualidade microbiológica da água de calda são PCCs fundamentais.\n` +
          `• **Higiene e Armazenamento:** Os produtos devem ser armazenados em armário ventilado e trancado com retenção de derrames.`,
        sources: ['Codex Alimentarius', 'Regulamento (CE) n.º 852/2004']
      };

    case 'fisiologia':
    default:
      return {
        reply: `Na **Skill Fisiologia Vegetal**, para a cultura *${cropName}*:\n\n` +
          `• **Escala Fenológica (BBCH):** O estádio fenológico determina a sensibilidade a pragas e o coeficiente de transpiração da copa (${canopyH}m de altura).\n` +
          `• **Mitigação de Stress Abiótico:** Em picos de calor e radiação ultravioleta, a aplicação preventiva de bioestimulantes ou protetores solares reduz o stress térmico foliar.`,
        sources: ['Escala BBCH Oficial', 'Fisiologia Vegetal Aplicada']
      };
  }
}
