// src/features/weather/components/weatherI18n.ts

const SPRAY_BADGE_KEYS: Record<string, string> = {
  'Risco Baixo (Ótimo)': 'weather.sprayBadges.optimal',
  'Risco de Deriva Baixo (Ótimo)': 'weather.sprayBadges.optimal',
  'Chuva Ativa': 'weather.sprayBadges.activeRain',
  'Vento Crítico': 'weather.sprayBadges.criticalWind',
  'Evaporação Extrema': 'weather.sprayBadges.extremeEvaporation',
  'Risco de Escorrimento': 'weather.sprayBadges.runoffRisk',
  'Atenção Evaporação': 'weather.sprayBadges.cautionEvaporation',
  'Viável c/ Indução de Ar': 'weather.sprayBadges.viableAirInduction',
  'Atenção ao Vento': 'weather.sprayBadges.cautionWind',
  'Atenção Deriva': 'weather.sprayBadges.cautionDrift',
  'Possível Inversão': 'weather.sprayBadges.possibleInversion'
};

/**
 * Traduz o badge de avaliação da janela de pulverização de acordo com o idioma ativo.
 */
export function getLocalizedSprayBadge(
  badgeLabel: string | undefined,
  t: (path: string, fallback?: string) => string
): string {
  if (!badgeLabel) {
    return t('weather.sprayBadges.optimal', 'Risco de Deriva Baixo (Ótimo)');
  }
  const key = SPRAY_BADGE_KEYS[badgeLabel];
  return key ? t(key, badgeLabel) : badgeLabel;
}

/**
 * Converte o código WMO na sua descrição localizada.
 */
export function getLocalizedWeatherCondition(
  code: number | undefined,
  fallbackLabel: string | undefined,
  t: (path: string, fallback?: string) => string
): string {
  const safeCode = code ?? 0;
  return t(`weather.wmo.${safeCode}`, fallbackLabel || 'Céu Limpo');
}

/**
 * Formata o rótulo do dia da semana respeitando a localização ativa (ex.: "Today (Tue)" / "Hoje (Ter)").
 */
export function getLocalizedDayLabel(
  dateIso: string,
  index: number,
  fallbackLabel: string,
  language: string,
  t: (path: string, fallback?: string) => string
): string {
  try {
    const dObj = new Date(dateIso.includes('T') ? dateIso : `${dateIso}T12:00:00Z`);
    if (isNaN(dObj.getTime())) return fallbackLabel;
    const localeCode = language === 'en' ? 'en-GB' : 'pt-PT';
    const weekdayShort = dObj.toLocaleDateString(localeCode, { weekday: 'short' });
    const cleanWeekday = weekdayShort.replace('.', '');
    const capitalizedWeekday = cleanWeekday.charAt(0).toUpperCase() + cleanWeekday.slice(1);

    if (index === 0) {
      return `${t('weather.today', 'Hoje')} (${capitalizedWeekday})`;
    }
    return capitalizedWeekday;
  } catch {
    return fallbackLabel;
  }
}
