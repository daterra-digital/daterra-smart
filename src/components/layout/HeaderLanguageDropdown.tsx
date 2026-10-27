import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGE_OPTIONS, type SupportedLanguage } from '../../context/LanguageContext';

export interface HeaderLanguageDropdownProps {
  variant?: 'dark' | 'light';
}

export const HeaderLanguageDropdown: React.FC<HeaderLanguageDropdownProps> = ({ variant = 'dark' }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLight = variant === 'light';

  // Normalização do código ativo para exibição concisa no gatilho
  const normalizedLang = language === 'pt-PT' ? 'pt' : language === 'en-GB' ? 'en' : language;
  const activeOption = LANGUAGE_OPTIONS.find((opt) => opt.code === normalizedLang) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`min-h-[48px] min-w-[48px] px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target active:scale-95 shadow-2xs border ${
          isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-[#114037] border-slate-300'
            : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('common.selectLanguage', 'Selecionar Idioma')}
        title={t('common.selectLanguage', 'Selecionar Idioma')}
      >
        <Globe className="w-4 h-4 text-[#3CA64C] shrink-0" aria-hidden="true" />
        <span className={`font-extrabold text-xs tracking-wider ${isLight ? 'text-[#114037]' : 'text-white'}`}>
          {activeOption.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isLight ? 'text-slate-600' : 'text-slate-300'} ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t('common.selectLanguage', 'Selecionar Idioma')}
          className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0f2e27] border border-white/20 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 border-b border-white/10 mb-1">
            {t('common.availableLanguages', 'Idiomas Disponíveis')}
          </div>
          <div className="max-h-72 overflow-y-auto space-y-0.5 custom-scrollbar">
            {LANGUAGE_OPTIONS.map((option) => {
              const isSelected = normalizedLang === option.code;
              return (
                <button
                  key={option.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`w-full min-h-[48px] px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors touch-target cursor-pointer ${
                    isSelected
                      ? 'bg-[#3CA64C] text-white font-bold shadow-xs'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-black/20 text-emerald-200">
                      {option.code}
                    </span>
                    <span className="truncate">{option.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
