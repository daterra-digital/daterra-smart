// src/features/weather/components/DashboardWeatherWeeklyCard.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useWeather } from '../hooks/useWeather.ts';
import { useLanguage } from '../../../context/LanguageContext.tsx';
import { DashboardWeatherWeeklyDayButton } from './DashboardWeatherWeeklyDayButton.tsx';

interface DashboardWeatherWeeklyCardProps {
  selectedDateIso?: string | null;
  onSelectDate?: (dateIso: string | null) => void;
  hideFooter?: boolean;
}

export const DashboardWeatherWeeklyCard: React.FC<DashboardWeatherWeeklyCardProps> = ({
  selectedDateIso,
  onSelectDate,
  hideFooter = false
}) => {
  const { t, language } = useLanguage();
  const { data, isLoading } = useWeather();
  const daily = data?.daily || [];
  const displayDays = daily.slice(0, 7);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, displayDays.length]);

  const scrollBy = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-slate-200 space-y-4">
      {/* 1. Topo: Título + Controlos do Carrossel */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-daterra-accent flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-daterra-accent" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-daterra-primary leading-tight">
              Próximos 7 Dias
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Selecione um dia para consultar a previsão detalhada
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollBy(-160)}
            disabled={!canScrollLeft}
            aria-label="Dia anterior"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition-colors cursor-pointer text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(160)}
            disabled={!canScrollRight}
            aria-label="Próximo dia"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition-colors cursor-pointer text-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Conteúdo da Semana: Botões de Seleção Diária com Flex Adaptativo */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scroll-smooth"
        tabIndex={0}
        aria-label="Faixa de previsão para os próximos 7 dias"
      >
        {displayDays.length > 0 ? (
          displayDays.map((item, index) => {
            const isToday = index === 0;
            const isSelected = selectedDateIso
              ? item.dateIso === selectedDateIso
              : isToday;

            return (
              <DashboardWeatherWeeklyDayButton
                key={item.dateIso || index}
                item={item}
                index={index}
                isSelected={isSelected}
                language={language}
                t={t}
                onSelect={() => {
                  if (isToday) {
                    onSelectDate?.(null);
                  } else {
                    onSelectDate?.(item.dateIso);
                  }
                }}
              />
            );
          })
        ) : (
          <div className="w-full text-center text-xs text-slate-400 py-4">
            {isLoading ? 'A carregar previsão semanal...' : 'Previsão semanal indisponível sem ligação à rede'}
          </div>
        )}
      </div>

      {/* 3. Rodapé: Atalho Secundário Pulverização + Botão Primário Meteorologia */}
      {!hideFooter && (
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <Link
            to="/meteorologia"
            className="group flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-daterra-primary transition-colors py-1 touch-target"
            title="Ver janelas e recomendações fitossanitárias na Meteorologia"
          >
            <span className="w-2 h-2 rounded-full bg-daterra-accent"></span>
            <span>Ver Janelas de Pulverização recomendadas</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/meteorologia"
            className="px-4 py-2 bg-daterra-primary hover:bg-[#0d332c] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 touch-target"
            title="Abrir página completa de Meteorologia"
          >
            <span>Abrir Meteorologia Completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
