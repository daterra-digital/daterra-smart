import React from 'react';
import {
  User,
  Map,
  Globe,
  Bell,
  Database,
  HelpCircle,
  Info,
  Sprout,
  Wrench,
  Gauge,
  ShieldCheck,
  type LucideIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type SettingsSubmenu =
  | 'perfil'
  | 'exploracao'
  | 'preferencias'
  | 'notificacoes'
  | 'gestao_dados'
  | 'ajuda'
  | 'sobre';

export type ExplorationSubTab = 'cultura' | 'equipamento' | 'bicos' | 'calibracao';

export interface SettingsSubmenuNavProps {
  activeSubmenu: SettingsSubmenu;
  onSelectSubmenu: (submenu: SettingsSubmenu) => void;
  activeExplorationTab?: ExplorationSubTab;
  onSelectExplorationTab?: (tab: ExplorationSubTab) => void;
}

interface MenuDef {
  id: SettingsSubmenu;
  icon: LucideIcon;
  labelKey: string;
  fallback?: string;
  titleKey?: string;
  badge?: string;
}

const SETTINGS_MENUS: MenuDef[] = [
  { id: 'perfil', icon: User, labelKey: 'settings.tabs.profile' },
  {
    id: 'exploracao',
    icon: Map,
    labelKey: 'settings.tabs.farm',
    fallback: 'Exploração Agrícola',
    titleKey: 'settings.tabs.farmTitle',
    badge: 'RC'
  },
  { id: 'preferencias', icon: Globe, labelKey: 'settings.tabs.preferences', badge: 'RC' },
  { id: 'notificacoes', icon: Bell, labelKey: 'settings.tabs.notifications', badge: 'RC' },
  { id: 'gestao_dados', icon: Database, labelKey: 'settings.tabs.dataManagement', badge: 'RC' },
  { id: 'ajuda', icon: HelpCircle, labelKey: 'settings.tabs.help' },
  { id: 'sobre', icon: Info, labelKey: 'settings.tabs.about' }
];

interface ExplorationTabDef {
  id: ExplorationSubTab;
  icon: LucideIcon;
  labelKey: string;
  badge?: string;
}

const EXPLORATION_TABS: ExplorationTabDef[] = [
  { id: 'cultura', icon: Sprout, labelKey: 'exploration.tabs.culture', badge: 'RC' },
  { id: 'equipamento', icon: Wrench, labelKey: 'exploration.tabs.equipment', badge: 'RC' },
  { id: 'bicos', icon: Gauge, labelKey: 'exploration.tabs.nozzles', badge: 'RC' },
  { id: 'calibracao', icon: ShieldCheck, labelKey: 'exploration.tabs.calibration', badge: 'RC' }
];

export const SettingsSubmenuNav: React.FC<SettingsSubmenuNavProps> = ({
  activeSubmenu,
  onSelectSubmenu,
  activeExplorationTab = 'cultura',
  onSelectExplorationTab
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-full overflow-hidden space-y-3">
      {/* LINHA 1: Menus Principais de Definições */}
      <div
        role="tablist"
        aria-label={t('settings.navAriaLabel', 'Navegação de Definições')}
        className="w-full max-w-full flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none touch-pan-x"
      >
        {SETTINGS_MENUS.map((menu) => {
          const Icon = menu.icon;
          const isSelected = activeSubmenu === menu.id;
          return (
            <button
              key={menu.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectSubmenu(menu.id)}
              className={`px-4 min-h-[48px] rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target cursor-pointer ${
                isSelected
                  ? 'bg-[#114037] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
              title={menu.titleKey ? t(menu.titleKey, 'Gerir Culturas, Pulverizadores, Bicos e Calibrações') : undefined}
            >
              <Icon className="w-4 h-4 text-[#3CA64C]" />
              <span>{menu.fallback ? t(menu.labelKey, menu.fallback) : t(menu.labelKey)}</span>
              {menu.badge && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-950 border border-amber-400 uppercase tracking-wider">
                  {menu.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* LINHA 2: Submenus da Exploração Agrícola */}
      {activeSubmenu === 'exploracao' && (
        <div
          role="tablist"
          aria-label={t('exploration.tabsAriaLabel', 'Submenus da Exploração Agrícola')}
          className="w-full max-w-full flex items-center gap-2 border-b border-emerald-200/80 pb-3 overflow-x-auto scrollbar-none touch-pan-x animate-fade-in bg-emerald-50/50 p-2 rounded-2xl"
        >
          {EXPLORATION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeExplorationTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectExplorationTab?.(tab.id)}
                className={`px-4 min-h-[44px] rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 touch-target cursor-pointer ${
                  isSelected
                    ? 'bg-[#114037] text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-emerald-100/70 border border-emerald-200/70'
                }`}
              >
                <Icon className="w-4 h-4 text-[#3CA64C]" />
                <span>{t(tab.labelKey)}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-100 text-amber-950 border border-amber-400 uppercase tracking-wider">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
