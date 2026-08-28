import React, { createContext, useContext, useState } from 'react';

import pt from '../i18n/locales/pt.json';
import en from '../i18n/locales/en.json';
import br from '../i18n/locales/br.json';
import es from '../i18n/locales/es.json';
import fr from '../i18n/locales/fr.json';
import it from '../i18n/locales/it.json';
import de from '../i18n/locales/de.json';
import el from '../i18n/locales/el.json';

export type SupportedLanguage = 'pt' | 'en' | 'br' | 'es' | 'fr' | 'it' | 'de' | 'el';

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; name: string }[] = [
  { code: 'pt', label: 'PT-Português de Portugal', name: 'Português (PT)' },
  { code: 'en', label: 'EN-English (US)', name: 'English (US)' },
  { code: 'br', label: 'BR-Português do Brasil', name: 'Português (BR)' },
  { code: 'es', label: 'ES-Español', name: 'Español' },
  { code: 'fr', label: 'FR-Français', name: 'Français' },
  { code: 'it', label: 'IT-Italiano', name: 'Italiano' },
  { code: 'de', label: 'DE-Deutsch', name: 'Deutsch' },
  { code: 'el', label: 'EL-Ελληνικά', name: 'Ελληνικά' }
];

const DICTIONARIES: Record<SupportedLanguage, any> = {
  pt,
  en,
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
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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

  // Função utilitária t() para procurar chaves em caminhos como "nav.tools"
  const t = (path: string, fallback?: string): string => {
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
      return currentDict;
    }

    // Fallback para Português de Portugal (pt.json)
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
      return fallbackDict;
    }

    return fallback || path;
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
