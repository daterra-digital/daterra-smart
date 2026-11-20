// src/features/settings/preferences/preferencesCatalog.ts
import type { SupportedLanguage } from '../../../context/LanguageContext.tsx';

export type AppThemeId = 'mono' | 'light' | 'dark';
export type UnitsProfileId = 'si' | 'us' | 'uk' | 'trad';

export interface PwaIconThemeOption {
  id: AppThemeId;
  iconSrc: string;
  titleKey: string;
  titleFallback: string;
  noteKey: string;
  noteFallback: string;
  isDefault?: boolean;
}

export interface UnitsProfileOption {
  id: UnitsProfileId;
  titleKey: string;
  titleFallback: string;
  unitsPill: string;
  descKey: string;
  descFallback: string;
}

export const PWA_ICON_THEMES: PwaIconThemeOption[] = [
  {
    id: 'mono',
    iconSrc: './icon-daterra-mono.png',
    titleKey: 'settings.preferencesTab.monoTheme',
    titleFallback: 'Monocromático',
    noteKey: 'settings.preferencesTab.monoNote',
    noteFallback: 'Ícone neutro monocromático oficial (Ativo por defeito).',
    isDefault: true
  },
  {
    id: 'light',
    iconSrc: './icon-daterra-light.png',
    titleKey: 'settings.preferencesTab.lightTheme',
    titleFallback: 'Modo Claro (Light)',
    noteKey: 'settings.preferencesTab.lightNote',
    noteFallback: 'Alto contraste diurno para leitura no campo sob sol intenso.'
  },
  {
    id: 'dark',
    iconSrc: './icon-daterra-dark.png',
    titleKey: 'settings.preferencesTab.darkTheme',
    titleFallback: 'Modo Escuro (Dark)',
    noteKey: 'settings.preferencesTab.darkNote',
    noteFallback: 'Otimizado para operações agronómicas noturnas na cabine.'
  }
];

export const UNITS_PROFILE_OPTIONS: UnitsProfileOption[] = [
  {
    id: 'si',
    titleKey: 'settings.units.si',
    titleFallback: 'Sistema Métrico Internacional (SI)',
    unitsPill: 'ha · kg · L · bar',
    descKey: 'settings.units.siDesc',
    descFallback:
      'Padrão oficial utilizado na Europa, Brasil e na maior parte do mundo. Aplica hectares para área, quilogramas/litros para massa e volume, e bar para pressão.'
  },
  {
    id: 'us',
    titleKey: 'settings.units.us',
    titleFallback: 'Sistema Imperial / Americano (US)',
    unitsPill: 'ac · bu · gal · psi',
    descKey: 'settings.units.usDesc',
    descFallback:
      'Ideal para utilizadores nos EUA ou para quem opera maquinaria agrícola americana. Converte dados para acres, bushels, galões e libras por polegada quadrada (PSI).'
  },
  {
    id: 'uk',
    titleKey: 'settings.units.uk',
    titleFallback: 'Sistema Misto Anglo-Saxónico (UK / CA / AU)',
    unitsPill: 'ha · L · bu · lb',
    descKey: 'settings.units.ukDesc',
    descFallback:
      'Configuração comum no Reino Unido, Canadá e Austrália. Combina hectares e litros com unidades imperiais como bushels e libras.'
  },
  {
    id: 'trad',
    titleKey: 'settings.units.trad',
    titleFallback: 'Sistema Regional Tradicional (Ibérico / LatAm)',
    unitsPill: 'alq · @ · qtl',
    descKey: 'settings.units.tradDesc',
    descFallback:
      'Indicado para pequenas e médias explorações focadas no comércio local tradicional. Inclui suporte a alqueire, arroba e quintal.'
  }
];

export function normalizeLanguageCode(lang: SupportedLanguage): SupportedLanguage {
  if (lang === 'pt-PT') return 'pt';
  if (lang === 'en-GB') return 'en';
  return lang;
}

export function formatLanguageSummary(label: string): string {
  return label.replace(/^([A-Z]{2})-(.+)$/, '$1 — $2');
}
