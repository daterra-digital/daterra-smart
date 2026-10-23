// src/features/agri-chat/services/agronomicResponses.ts
import type { SkillId, ActiveExplorationContext, ChatActionCard } from '../types';
import { generateSpecialistAgronomicResponse } from './agronomicSpecialistsResponses';

interface AgronomicResponseResult {
  reply: string;
  sources: string[];
  actionCard?: ChatActionCard;
}

export function generateLocalAgronomicResponse(
  messageText: string,
  activeSkill: SkillId,
  explorationContext?: ActiveExplorationContext
): AgronomicResponseResult {
  const cropName = explorationContext?.cultureName || 'cultura';
  const rowDist = explorationContext?.rowDistanceM || 2.5;
  const canopyH = explorationContext?.canopyHeightM || 1.5;
  const lwa = Math.round((2 * canopyH * 10000) / rowDist);
  const eqName = explorationContext?.equipmentName || 'pulverizador';
  const nozzle = explorationContext?.nozzleName || 'bicos em perfil';
  const pressure = explorationContext?.calibrationPressureBar || 5.0;
  const speed = explorationContext?.calibrationSpeedKmh || 6.0;

  const isLwaQuery = /(lwa|parede foliar|área foliar|área de parede)/i.test(messageText);
  const isInspectionQuery = /(inspeção|inspecao|citp|periódica|obrigat|inspecionar)/i.test(messageText);
  const isBufferZoneQuery = /(zona tampão|zonas tampão|buffer zone|linhas de água|vento)/i.test(messageText);
  const isDoseQuery = /(dose|concentração|calda|depósito|quantidade de produto)/i.test(messageText);
  const isCadernoQuery = /(caderno de campo|registo|registar|48 horas)/i.test(messageText);
  const isKnowledgeQuery = /(conhecimento|quem és|quem és tu|sobre si|sobre você|o que fazes|ajudar|habilidades|competências|apresentação)/i.test(messageText);
  const isCalibrationQuery = /(calibra|pulverizador|pressão|bicos?|débito|gota|velocidade|deriva)/i.test(messageText);

  // 1. Skill Geral
  if (activeSkill === 'geral') {
    if (isKnowledgeQuery) {
      return {
        reply: `Como **Assistente DATERRA**, o meu conhecimento apoia a tomada de decisão técnica e operacional no terreno com base em normas e metodologias reconhecidas:\n\n` +
          `• **Apoio Transversal:** Princípios de calibração, cálculo de volume de calda por LWA e TRV, tecnologia de aplicação e sustentabilidade de campo.\n` +
          `• **Ligação à sua Exploração:** Sincronizado com a parcela ativa *${cropName}* (${rowDist}m de entrelinha, ${canopyH}m de altura), pulverizador *${eqName}* e bicos *${nozzle}*.\n` +
          `• **10 Skills Especialistas:** Para diagnósticos aprofundados, pode alternar para as skills dedicadas (Fitofármacos, Rega, Fertilização, Solos, Legislação, GlobalGAP, HACCP, Fisiologia e Calibração de Equipamentos).`,
        sources: ['Base Técnica DATERRA', 'Metodologia EPPO PP 1/239']
      };
    }

    if (isLwaQuery) {
      return {
        reply: `Na parcela *${cropName}*, o cálculo da Área de Parede Foliar (LWA) é determinado pela fórmula oficial:\n\n` +
          `• **Fórmula Canónica:** \`LWA = (2 × Altura de Copa × 10.000) / Entrelinha\`\n` +
          `• **Dados de Campo:** Para ${canopyH}m de altura e ${rowDist}m de entrelinha, a área de parede foliar é de **${lwa.toLocaleString('pt-PT')} m² LWA/ha**.\n` +
          `• **Aplicação Prática:** A dosagem expressa por 10.000 m² LWA garante uma deposição uniforme sem sobredosagem nas fases iniciais.`,
        sources: ['Metodologia EPPO PP 1/239', 'Norma ISO 22866'],
        actionCard: {
          title: 'Calculadora de Área de Parede Foliar',
          description: `Abra a ferramenta oficial de LWA com os parâmetros da ${cropName} (${lwa.toLocaleString('pt-PT')} m² LWA/ha).`,
          buttonText: 'Abrir Calculadora LWA',
          url: '/ferramentas/area-parede-foliar',
          badge: 'Norma EPPO'
        }
      };
    }

    if (isCalibrationQuery) {
      if (pressure >= 9) {
        return {
          reply: `⚠️ **Alerta de Pressão Elevada na Parcela "${cropName}":**\n\n` +
            `• **Área Foliar:** Na entrelinha de ${rowDist}m e altura de ${canopyH}m, a área calculada é **${lwa.toLocaleString('pt-PT')} m² LWA/ha**.\n` +
            `• **Risco de Deriva (${pressure} bar):** Trabalhar a ${pressure} bar com bicos de cone oco (como *${nozzle}*) gera um espectro de gotas excessivamente finas (VMD < 140 µm), aumentando a perda de calda por arrastamento e evaporação.\n` +
            `• **Recomendação Prática:** Recomenda-se reduzir a pressão para 5 a 7 bar ou calibrar o débito para a velocidade real de ${speed} km/h.`,
          sources: ['Metodologia EPPO PP 1/239', 'Norma ISO 16122'],
          actionCard: {
            title: 'Smart Débito & Calibração (ISO 16122)',
            description: `Audite a simetria bilateral e desvios de débito do ${eqName} a ${speed} km/h.`,
            buttonText: 'Auditar Calibração',
            url: '/ferramentas/smart-debito',
            badge: 'ISO 16122'
          }
        };
      }
      return {
        reply: `Com base nos dados de *${cropName}*, a área foliar é de **${lwa.toLocaleString('pt-PT')} m² LWA/ha**.\n\n` +
          `• **Conjunto Operacional:** Pressão de **${pressure} bar** a **${speed} km/h** com bicos *${nozzle}* no pulverizador *${eqName}*.\n` +
          `• **Estado da Regulação:** Os parâmetros situam-se num intervalo aceitável. Verifique se os bicos superiores direcionam a calda apenas até à altura da copa (${canopyH}m).`,
        sources: ['Metodologia EPPO PP 1/239', 'Norma ISO 22866'],
        actionCard: {
          title: 'Calculadora de Parede Foliar (LWA)',
          description: `Aceda ao cálculo detalhado de volume de calda sugerido para ${cropName}.`,
          buttonText: 'Ver Detalhes LWA',
          url: '/ferramentas/area-parede-foliar',
          badge: 'EPPO PP 1/239'
        }
      };
    }

    return {
      reply: `Na **Skill Geral**, para a parcela *${cropName}* (${cropName ? `LWA: ${lwa.toLocaleString('pt-PT')} m²/ha` : ''}), a boa prática agronómica recomenda assegurar a cobertura uniforme da parede foliar, evitando excessos no solo e verificando o manómetro antes de cada tratamento.`,
      sources: ['Base Técnica DATERRA', 'Dicionário Técnico']
    };
  }

  // 2. Skill Legislação
  if (activeSkill === 'legislacao') {
    if (isInspectionQuery) {
      return {
        reply: `Em Portugal, a inspeção de pulverizadores é **obrigatória por lei** (Decreto-Lei n.º 86/2010 e Diretiva 2009/128/CE):\n\n` +
          `• **Equipamentos Novos:** Primeira inspeção obrigatória aos **5 anos** após a compra em estado novo.\n` +
          `• **Equipamentos em Uso:** Inspeção periódica obrigatória a cada **3 anos** num Centro de Inspeção Técnica de Pulverizadores (CITP) reconhecido.\n` +
          `• **Selo e Relatório de Ensaio:** O equipamento aprovado recebe um selo no chassis e um relatório técnico que deve ser arquivado no *Caderno de Campo*.\n` +
          `• **Aplicação ao seu ${eqName}:** A ${pressure} bar, o manómetro deve ser testado em banco de ensaio para garantir que o desvio cumpre a norma **ISO 16122**.\n` +
          `• **Condicionalidade PEPAC:** A falta de inspeção válida é contraordenação grave e resulta em penalizações nos apoios da PAC.`,
        sources: ['Decreto-Lei n.º 86/2010', 'Diretiva 2009/128/CE', 'Norma ISO 16122'],
        actionCard: {
          title: 'Smart Débito & Inspeção Oficial',
          description: `Audite as tolerâncias legais e desvios de débito do ${eqName} antes da inspeção do CITP.`,
          buttonText: 'Validar Normas ISO 16122',
          url: '/ferramentas/smart-debito',
          badge: 'DL 86/2010'
        }
      };
    }
    if (isBufferZoneQuery) {
      return {
        reply: `De acordo com o **Decreto-Lei n.º 91/2016**:\n\n` +
          `• **Zonas Tampão Obrigatórias:** Respeite a distância mínima de segurança a cursos de água indicada no rótulo de cada produto.\n` +
          `• **Mitigação com Bicos Antideriva:** O uso de bicos de redução de deriva permite reduzir a largura da zona de amortecimento.\n` +
          `• **Condições Limite:** É proibida a aplicação com ventos superiores a **10–15 km/h** ou temperaturas acima de **25–30 °C**.`,
        sources: ['Decreto-Lei n.º 91/2016', 'Boas Práticas de Aplicação'],
        actionCard: {
          title: 'Drone Buffer Zone & Legal Compliance',
          description: 'Calcule zonas tampão dinâmicas e mitigação de deriva legal.',
          buttonText: 'Calcular Zonas Tampão',
          url: '/ferramentas/drone-buffer-zone',
          badge: 'DL 91/2016'
        }
      };
    }
    if (isCadernoQuery) {
      return {
        reply: `No âmbito das regras legais e do PEPAC sobre o **Caderno de Campo**:\n\n` +
          `• **Prazo de Registo:** Qualquer aplicação na parcela *${cropName}* deve ser registada no prazo máximo de **48 horas**.\n` +
          `• **Dados Obrigatórios:** Data, cultura, área tratada, produto comercial, número de APV, dose aplicada, volume de calda e justificação técnica.\n` +
          `• **Conservação:** Os registos e faturas devem ser guardados durante pelo menos **3 anos**.`,
        sources: ['Decreto-Lei n.º 86/2010', 'Condicionalidade PEPAC']
      };
    }
    return {
      reply: `No âmbito da **Legislação Fitossanitária**, certifique-se de que os produtos aplicados na parcela *${cropName}* possuem número de APV válido no catálogo oficial e registe todos os tratamentos no Caderno de Campo.`,
      sources: ['Decreto-Lei n.º 86/2010', 'Regulamentação Comunitária']
    };
  }

  // 3. Skill Calibração de Equipamentos
  if (activeSkill === 'calibracao-equipamentos') {
    return {
      reply: `🔬 **Diagnóstico Especialista de Calibração (Normas EPPO & ISO 16122):**\n\n` +
        `• **Cultura & Área Foliar:** Na parcela *${cropName}* (entrelinha: ${rowDist}m, altura: ${canopyH}m), a área de parede foliar é **${lwa.toLocaleString('pt-PT')} m² LWA/ha**.\n` +
        `• **Conjunto Operacional:** Pulverizador *${eqName}* com *${nozzle}* a **${pressure} bar** e **${speed} km/h**.\n` +
        `• **Validação EPPO PP 1/239:** ${pressure >= 9 ? 'A pressão de 10 bar excede o intervalo recomendado pela EPPO para bicos de cone oco, criando risco grave de deriva.' : 'A regulação cumpre as diretrizes EPPO de penetração e cobertura.'} Recomenda-se fechar os bicos superiores acima de ${canopyH}m.`,
      sources: ['Metodologia EPPO PP 1/239', 'Norma ISO 16122-2 / 16122-3'],
      actionCard: {
        title: 'Smart Débito — Auditoria de Pulverizador',
        description: `Verifique os caudais bico a bico e a simetria esquerda/direita do ${eqName}.`,
        buttonText: 'Abrir Smart Débito',
        url: '/ferramentas/smart-debito',
        badge: 'ISO 16122'
      }
    };
  }

  // 4. Skill Fitofármacos
  if (activeSkill === 'fitofarmacos') {
    if (isDoseQuery) {
      return {
        reply: `Na **Skill Fitofármacos**, a conversão da dose para a parcela *${cropName}*:\n\n` +
          `• **Dose Proporcional LWA:** \`Dose Real = Dose Rótulo × (LWA Parcela / 10.000)\`\n` +
          `• **Área da Parcela:** Com **${lwa.toLocaleString('pt-PT')} m² LWA/ha**, a dosagem deve ajustar-se ao depósito de ${explorationContext?.tankCapacityL || 1000}L do seu *${eqName}*.\n` +
          `• **Gestão de Resistências (FRAC):** Alterne substâncias com códigos FRAC distintos entre tratamentos consecutivos.`,
        sources: ['Catálogo Oficial de Produtos Fitofarmacêuticos', 'Classificação FRAC', 'Metodologia EPPO'],
        actionCard: {
          title: 'Calculadora de Dose por Hectare',
          description: `Converta a dose do rótulo para o depósito de ${explorationContext?.tankCapacityL || 1000}L do ${eqName}.`,
          buttonText: 'Calcular Dose',
          url: '/ferramentas?tool=calc_dose',
          badge: 'Dose por Tanque'
        }
      };
    }
    return {
      reply: `Na **Skill Fitofármacos**, para a parcela *${cropName}*, consulte o catálogo oficial de produtos fitofarmacêuticos para selecionar matérias ativas homologadas e calcule sempre a dose de produto comercial proporcional ao volume LWA (${lwa} m²/ha).`,
      sources: ['Catálogo Oficial de Produtos Fitofarmacêuticos', 'Classificação FRAC']
    };
  }

  // 5 a 10: Skills Especialistas Delegadas
  return generateSpecialistAgronomicResponse(activeSkill, cropName, rowDist, canopyH, eqName);
}
