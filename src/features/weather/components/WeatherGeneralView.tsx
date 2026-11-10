// src/features/weather/components/WeatherGeneralView.tsx
import React from 'react';
import { WeatherDedicatedCard } from './WeatherDedicatedCard.tsx';
import { DashboardWeatherWeeklyCard } from './DashboardWeatherWeeklyCard.tsx';
import { WeatherHourlyCard } from './WeatherHourlyCard.tsx';
import { WeatherChartsModule } from './charts/WeatherChartsModule.tsx';

interface WeatherGeneralViewProps {
  selectedDateIso: string | null;
  onSelectDate: (dateIso: string | null) => void;
}

export const WeatherGeneralView: React.FC<WeatherGeneralViewProps> = ({
  selectedDateIso,
  onSelectDate
}) => {
  return (
    <div
      role="tabpanel"
      id="panel-weather-mode-meteorologia"
      aria-labelledby="tab-weather-mode-meteorologia"
      className="space-y-6 animate-fade-in"
    >
      {/* 1. Cartão Generalista Dedicado com Distribuição Equilibrada na Largura Total */}
      <WeatherDedicatedCard
        selectedDateIso={selectedDateIso}
        onSelectDate={onSelectDate}
      />

      {/* 2. Faixa Semanal Selecionável (até 7 dias) */}
      <DashboardWeatherWeeklyCard
        selectedDateIso={selectedDateIso}
        onSelectDate={onSelectDate}
        hideFooter={true}
      />

      {/* 3. Previsão Horária do Dia Selecionado */}
      <WeatherHourlyCard selectedDateIso={selectedDateIso} />

      {/* 4. Módulo de Gráficos de Evolução do Dia Selecionado */}
      <WeatherChartsModule selectedDateIso={selectedDateIso} />
    </div>
  );
};
