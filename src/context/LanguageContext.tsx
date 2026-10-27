import React, { createContext, useContext, useState } from 'react';

import ptPT from '../i18n/locales/pt-PT.json';
import enGB from '../i18n/locales/en-GB.json';
import br from '../i18n/locales/br.json';
import es from '../i18n/locales/es.json';
import fr from '../i18n/locales/fr.json';
import it from '../i18n/locales/it.json';
import de from '../i18n/locales/de.json';
import el from '../i18n/locales/el.json';

export type SupportedLanguage = 'pt' | 'pt-PT' | 'en' | 'en-GB' | 'br' | 'es' | 'fr' | 'it' | 'de' | 'el';

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; name: string }[] = [
  { code: 'pt', label: 'PT-Português de Portugal', name: 'Português (PT)' },
  { code: 'en', label: 'EN-English (UK)', name: 'English (UK)' },
  { code: 'br', label: 'BR-Português do Brasil', name: 'Português (BR)' },
  { code: 'es', label: 'ES-Español', name: 'Español' },
  { code: 'fr', label: 'FR-Français', name: 'Français' },
  { code: 'it', label: 'IT-Italiano', name: 'Italiano' },
  { code: 'de', label: 'DE-Deutsch', name: 'Deutsch' },
  { code: 'el', label: 'EL-Ελληνικά', name: 'Ελληνικά' }
];

const DICTIONARIES: Record<SupportedLanguage, any> = {
  pt: ptPT,
  'pt-PT': ptPT,
  en: enGB,
  'en-GB': enGB,
  br,
  es,
  fr,
  it,
  de,
  el
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, fallbackOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars || !template) return template;
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`;
  });
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('daterra_language');
    if (saved && saved in DICTIONARIES) {
      return saved as SupportedLanguage;
    }
    return 'pt';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('daterra_language', lang);
  };

  // Função utilitária t() para procurar chaves em caminhos como "nav.tools" com suporte a variáveis {{param}}
  const t = (
    path: string,
    fallbackOrParams?: string | Record<string, string | number>,
    params?: Record<string, string | number>
  ): string => {
    const fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : undefined;
    const interpolationVars = typeof fallbackOrParams === 'object' && fallbackOrParams !== null ? fallbackOrParams : params;

    const keys = path.split('.');
    
    // Procura no idioma ativo
    let currentDict: any = DICTIONARIES[language] || DICTIONARIES.pt;
    for (const key of keys) {
      if (currentDict && typeof currentDict === 'object' && key in currentDict) {
        currentDict = currentDict[key];
      } else {
        currentDict = undefined;
        break;
      }
    }

    if (typeof currentDict === 'string') {
      return interpolate(currentDict, interpolationVars);
    }

    // Fallback para Português de Portugal (pt-PT)
    let fallbackDict: any = DICTIONARIES.pt;
    for (const key of keys) {
      if (fallbackDict && typeof fallbackDict === 'object' && key in fallbackDict) {
        fallbackDict = fallbackDict[key];
      } else {
        fallbackDict = undefined;
        break;
      }
    }

    if (typeof fallbackDict === 'string') {
      return interpolate(fallbackDict, interpolationVars);
    }

    return interpolate(fallback || path, interpolationVars);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser utilizado dentro de um LanguageProvider');
  }
  return context;
};

export const useTranslation = useLanguage;
