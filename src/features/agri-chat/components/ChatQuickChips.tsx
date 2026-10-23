// src/features/agri-chat/components/ChatQuickChips.tsx
import React from 'react';
import { Sparkles } from 'lucide-react';
import type { SkillId, ActiveExplorationContext } from '../types';
import { QUICK_PROMPTS } from '../data/skillsCatalog';

interface ChatQuickChipsProps {
  activeSkillId: SkillId;
  activeContext?: ActiveExplorationContext;
  onSelectPrompt: (prompt: string) => void;
}

export const ChatQuickChips: React.FC<ChatQuickChipsProps> = ({
  activeSkillId,
  activeContext,
  onSelectPrompt
}) => {
  const crop = activeContext?.cultureName;
  const eq = activeContext?.equipmentName;
  const pressure = activeContext?.calibrationPressureBar;
  const nozzle = activeContext?.nozzleName;

  const getDynamicPrompts = (): string[] => {
    switch (activeSkillId) {
      case 'geral':
        return [
          crop ? `Como calcular a área de parede foliar (LWA) para ${crop}?` : 'Como calcular a área de parede foliar (LWA)?',
          pressure ? `Avaliar risco de deriva a ${pressure} bar com ${nozzle || 'os bicos atuais'}` : 'Resumo das boas práticas para evitar a deriva',
          'Qual é o seu conhecimento agronómico e como apoia a exploração?'
        ];
      case 'calibracao-equipamentos':
        return [
          eq ? `Diagnosticar calibração do ${eq} (${pressure || 10} bar • ${activeContext?.calibrationSpeedKmh || 6.5} km/h)` : 'Diagnóstico de calibração oficial (EPPO PP 1/239)',
          'Como calcular o débito por bico para cumprir a norma ISO 16122?',
          crop ? `Verificar se os bicos superiores devem ser fechados na cultura ${crop}` : 'Regras para fecho dos bicos superiores'
        ];
      case 'legislacao':
        return [
          eq ? `Quando devo fazer a inspeção do ${eq} num CITP?` : 'Quando devo fazer a inspeção do pulverizador?',
          'Quais as regras e prazos de registo no caderno de campo?',
          'Limites legais de vento e zonas tampão para aplicação de fitofármacos'
        ];
      case 'fitofarmacos':
        return [
          'Como calcular a dose de produto por 10.000 m² LWA?',
          crop ? `Boas práticas para gestão de resistências (FRAC) em ${crop}` : 'Boas práticas para gestão de resistências (FRAC)',
          'Regras oficiais sobre intervalo de segurança e de reentrada'
        ];
      case 'rega':
        return [
          crop ? `Como calcular as necessidades hídricas (ETc) para ${crop}?` : 'Como calcular as necessidades hídricas (ETc)?',
          'Tempo de rega com base no Kc e evapotranspiração de referência',
          'Como avaliar a capacidade de retenção hídrica do solo?'
        ];
      case 'fertilizacao':
        return [
          crop ? `Qual a marcha de absorção N-P-K para ${crop}?` : 'Qual a marcha de absorção N-P-K da cultura?',
          'Limites legais de azoto em zonas vulneráveis à lixiviação',
          'Como diagnosticar carências nutricionais por via foliar?'
        ];
      case 'solos':
        return [
          'Como interpretar o teor de matéria orgânica e pH do solo?',
          'Qual o impacto da textura na condutividade elétrica e drenagem?',
          'Boas práticas para aumentar a fertilidade biológica do solo'
        ];
      case 'globalgap':
        return [
          'Quais os requisitos do referencial IFA v6 para pulverizadores?',
          'Como registar a limpeza de filtros e tripla lavagem de embalagens?',
          'Parâmetros obrigatórios nas análises da água para auditoria'
        ];
      case 'haccp':
        return [
          'Quais os Pontos Críticos de Controlo (PCC) na preparação da calda?',
          'Regras de armazenamento e armário de produtos fitofarmacêuticos',
          'Procedimento de emergência em caso de derrame acidental'
        ];
      case 'fisiologia':
        return [
          crop ? `Em que estádio fenológico (BBCH) ${crop} é mais vulnerável?` : 'Escala fenológica BBCH e sensibilidade a pragas',
          'Como mitigar o stress térmico e hídrico em dias de calor extremo?',
          'Efeito da aplicação de bioestimulantes no vigor da copa'
        ];
      default:
        return QUICK_PROMPTS[activeSkillId] || [];
    }
  };

  const prompts = getDynamicPrompts();

  return (
    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 shrink-0">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-daterra-accent" />
          Sugestões:
        </span>
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="shrink-0 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 hover:border-slate-300 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
