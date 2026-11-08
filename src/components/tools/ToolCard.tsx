// src/components/tools/ToolCard.tsx
import React from 'react';
import { CheckCircle2, Download, ArrowRight, Plus, Trash2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PRO_TOOL_IDS } from '../../types/subscription';
import { getToolReleaseBadge } from '../../utils/rcEvaluationMode';
import type { ToolModule } from '../../views/ToolsView';

export interface ToolCardProps {
  tool: ToolModule;
  isInstalled: boolean;
  isInstalling: boolean;
  onOpenTool: (toolId: string) => void;
  onInstallTool: (tool: ToolModule) => void;
  onUninstallTool: (toolId: string, toolName: string) => void;
}

function getCategoryLabel(category: string, t: (path: string, fallback?: string) => string): string {
  switch (category) {
    case 'Calibração':
      return t('tools.catCalibration', 'Calibração');
    case 'Pulverização':
      return t('tools.catSpraying', 'Pulverização');
    case 'Gestão':
      return t('tools.catManagement', 'Gestão');
    case 'Clima':
      return t('tools.catWeather', 'Clima');
    default:
      return category;
  }
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isInstalled,
  isInstalling,
  onOpenTool,
  onInstallTool,
  onUninstallTool
}) => {
  const { t } = useLanguage();
  const IconComponent = tool.icon;

  const toolName = t(`tools.catalog.${tool.id}.name`, tool.name);
  const toolDescription = t(`tools.catalog.${tool.id}.description`, tool.description);
  const categoryLabel = getCategoryLabel(tool.category, t);
  const releaseBadge = getToolReleaseBadge(tool.id);

  return (
    <div
      className={`relative p-5 sm:p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group ${
        isInstalled
          ? 'bg-gradient-to-br from-emerald-50/40 via-white to-white border-emerald-500/30 shadow-soft hover:shadow-xl hover:border-emerald-500/50'
          : 'bg-slate-50/60 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md'
      }`}
    >
      <div className="space-y-3">
        {/* Topo do Cartão: Ícone, Categoria e Badges de Estado */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                isInstalled
                  ? 'bg-[#114037] text-white shadow-md'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1D734B]">
              {categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {releaseBadge === 'PAGES' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-[#114037] border border-emerald-300 shadow-2xs">
                PAGES
              </span>
            )}
            {releaseBadge === 'RC' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                RC
              </span>
            )}
            {PRO_TOOL_IDS.has(tool.id) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#114037] text-[#3CA64C] border border-[#3CA64C]/30 shadow-xs">
                <Sparkles className="w-3 h-3 text-[#3CA64C]" />
                <span>{t('gating.badge_pro', 'PRO')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Título da Ferramenta com Largura Total (Sem abreviações ou reticências) */}
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug min-h-[2.75rem] flex items-center">
          {toolName}
        </h3>

        {/* Descrição Breve Resiliente (altura uniforme de 2 linhas) */}
        <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2 min-h-[2.5rem]">
          {toolDescription}
        </p>
      </div>

      {/* Estado de Instalação e Botão de Ação */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        {/* Badge de Estado Visual */}
        <div>
          {tool.isCore ? (
            isInstalled ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100/90 text-emerald-800 text-[10px] font-extrabold rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{t('tools.active', 'Ativa')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-200/80 text-slate-600 text-[10px] font-extrabold rounded-full">
                <Download className="w-3 h-3 text-slate-500" />
                <span>{t('tools.available', 'Disponível')}</span>
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-extrabold rounded-full">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{t('tools.comingSoonBadge', 'Em Breve')}</span>
            </span>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          {tool.isCore ? (
            isInstalled ? (
              <>
                <button
                  type="button"
                  onClick={() => onUninstallTool(tool.id, toolName)}
                  className="min-h-[48px] px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all active:scale-95 touch-target flex items-center justify-center gap-1"
                  title={t('tools.uninstallTooltip', 'Desinstalar funcionalidade')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('tools.uninstall', 'Desinstalar')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenTool(tool.id)}
                  className="min-h-[48px] px-4 py-2 bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 touch-target"
                >
                  <span>{t('tools.open', 'Abrir')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={isInstalling}
                onClick={() => onInstallTool(tool)}
                className={`min-h-[48px] px-4 py-2.5 bg-[#3CA64C] hover:bg-[#3AAA35] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 touch-target ${
                  isInstalling ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {isInstalling ? (
                  <span>{t('tools.installing', 'A instalar...')}</span>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('tools.install', 'Instalar')}</span>
                  </>
                )}
              </button>
            )
          ) : (
            <span className="text-[11px] font-bold text-slate-400 italic">
              {t('tools.comingSoonRelease', 'Lançamento em breve')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
