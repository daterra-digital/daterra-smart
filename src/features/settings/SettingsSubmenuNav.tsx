import React from 'react';
import { User, Globe, Bell, Database, Map, HelpCircle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type SettingsSubmenu = 'perfil' | 'preferencias' | 'notificacoes' | 'gestao_dados' | 'ajuda' | 'sobre';

export interface SettingsSubmenuNavProps {
  activeSubmenu: SettingsSubmenu;
  onSelectSubmenu: (submenu: SettingsSubmenu) => void;
  onNavigateExploration: () => void;
}

export const SettingsSubmenuNav: React.FC<SettingsSubmenuNavProps> = ({
  activeSubmenu,
  onSelectSubmenu,
  onNavigateExploration
}) => {
  const { t } = useLanguage();

  return (
    <div
      role="tablist"
      aria-label={t('settings.navAriaLabel', 'Navegação de Definições')}
      className="flex items-center gap-2.5 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeSubmenu === 'perfil'}
        onClick={() => onSelectSubmenu('perfil')}
        className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target cursor-pointer ${
          activeSubmenu === 'perfil'
            ? 'bg-[#114037] text-white shadow-md'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <User className="w-4 h-4 text-[#3CA64C]" />
        <span>{t('settings.tabs.profile')}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeSubmenu === 'preferencias'}
        onClick={() => onSelectSubmenu('preferencias')}
        className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target cursor-pointer ${
          activeSubmenu === 'preferencias'
            ? 'bg-[#114037] text-white shadow-md'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Globe className="w-4 h-4 text-[#3CA64C]" />
        <span>{t('settings.tabs.preferences')}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeSubmenu === 'notificacoes'}
        onClick={() => onSelectSubmenu('notificacoes')}
        className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target cursor-pointer ${
          activeSubmenu === 'notificacoes'
            ? 'bg-[#114037] text-white shadow-md'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Bell className="w-4 h-4 text-[#3CA64C]" />
        <span>{t('settings.tabs.notifications')}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeSubmenu === 'gestao_dados'}
        onClick={() => onSelectSubmenu('gestao_dados')}
        className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target cursor-pointer ${
          activeSubmenu === 'gestao_dados'
            ? 'bg-[#114037] text-white shadow-md'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Database className="w-4 h-4 text-[#3CA64C]" />
        <span>{t('settings.tabs.dataManagement')}</span>
      </button>

      <button
        type="button"
        onClick={onNavigateExploration}
        className="px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
        title={t('settings.tabs.farmTitle', 'Gerir Culturas, Pulverizadores, Bicos e Calibrações')}
      >
        <Map className="w-4 h-4 text-[#3CA64C]" />
        <span>{t('settings.tabs.farm', 'Exploração Agrícola')}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeSubmenu === 'ajuda'}
        onClick={() => onSelectSubmenu('ajuda')}
        className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target cursor-pointer ${
          activeSubmenu === 'ajuda'
            ? 'bg-[#114037] text-white shadow-md'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <HelpCircle className="w-4 h-4 text-[#3CA64C]" />
        <span>{t('settings.tabs.help')}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeSubmenu === 'sobre'}
        onClick={() => onSelectSubmenu('sobre')}
        className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target cursor-pointer ${
          activeSubmenu === 'sobre'
            ? 'bg-[#114037] text-white shadow-md'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Info className="w-4 h-4 text-[#3CA64C]" />
        <span>{t('settings.tabs.about')}</span>
      </button>
    </div>
  );
};
