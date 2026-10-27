// src/features/weather/components/WeatherLocationList.tsx
import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { PortugalMunicipality, PortugalFreguesiaEntry } from '../services/geoApiService.ts';
import { PRESET_AGRICULTURAL_LOCATIONS, type WeatherLocation } from '../weatherService.ts';
import type { LocationFilterMode } from '../hooks/useWeatherLocationSearch.ts';
import { WeatherSearchResults } from './WeatherSearchResults.tsx';

interface WeatherLocationListProps {
  isResolving: boolean;
  searchQuery: string;
  filterMode: LocationFilterMode;
  currentLocation: WeatherLocation;
  filteredMunicipalities: PortugalMunicipality[];
  filteredFreguesias: PortugalFreguesiaEntry[];
  selectedMunName: string;
  onSelectPreset: (preset: WeatherLocation) => void;
  onSelectMunicipio: (mun: PortugalMunicipality) => void;
  onSelectFreguesia: (fregName: string, munName: string) => void;
}

export const WeatherLocationList: React.FC<WeatherLocationListProps> = ({
  isResolving,
  searchQuery,
  filterMode,
  currentLocation,
  filteredMunicipalities,
  filteredFreguesias,
  selectedMunName,
  onSelectPreset,
  onSelectMunicipio,
  onSelectFreguesia
}) => {
  if (isResolving) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-2 text-slate-500 font-bold">
        <Loader2 className="w-5 h-5 animate-spin text-[#1D734B]" />
        <span className="text-xs">A carregar coordenadas geográficas...</span>
      </div>
    );
  }

  const isSearching = Boolean(searchQuery.trim());
  const showMun = filterMode === 'all' || filterMode === 'municipios';
  const showFreg = filterMode === 'all' || filterMode === 'freguesias';

  if (isSearching) {
    const hasMun = showMun && filteredMunicipalities.length > 0;
    const hasFreg = showFreg && filteredFreguesias.length > 0;
    if (!hasMun && !hasFreg) {
      return (
        <div className="p-6 text-center text-slate-400 text-xs">
          Nenhum concelho ou freguesia encontrado para &ldquo;{searchQuery}&rdquo;.
        </div>
      );
    }

    return (
      <WeatherSearchResults
        hasMun={hasMun}
        hasFreg={hasFreg}
        filteredMunicipalities={filteredMunicipalities}
        filteredFreguesias={filteredFreguesias}
        onSelectMunicipio={onSelectMunicipio}
        onSelectFreguesia={onSelectFreguesia}
      />
    );
  }

  if (filterMode === 'freguesias') {
    return (
      <div className="max-h-64 overflow-y-auto space-y-1 pr-1 text-xs">
        <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-400">
          Freguesias de {selectedMunName} ({filteredFreguesias.length})
        </div>
        {filteredFreguesias.map((freg, idx) => {
          const isSelected = currentLocation.name === freg.name;
          return (
            <button
              key={`freg_nav_${freg.name}_${idx}`}
              type="button"
              onClick={() => onSelectFreguesia(freg.name, freg.municipio)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border cursor-pointer ${
                isSelected ? 'bg-emerald-50 border-emerald-300 text-[#114037]' : 'hover:bg-emerald-50 border-transparent text-slate-800'
              }`}
            >
              <div>
                <span className="font-extrabold block">{freg.name}</span>
                <span className="text-[10px] text-slate-500">Concelho de {freg.municipio}</span>
              </div>
              {isSelected ? <Check className="w-4 h-4 text-[#1D734B]" /> : <span className="text-[11px] text-[#1D734B] font-bold">Selecionar →</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-1 pr-1 text-xs">
      <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-400">
        Regiões Agrícolas de Referência
      </div>
      {PRESET_AGRICULTURAL_LOCATIONS.map((preset) => {
        const isSelected = currentLocation.name === preset.name;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between border cursor-pointer ${
              isSelected ? 'bg-emerald-50 border-emerald-300 text-[#114037]' : 'hover:bg-slate-50 border-transparent text-slate-800'
            }`}
          >
            <div>
              <span className="font-extrabold block">{preset.name}</span>
              <span className="text-[10px] text-slate-500">{preset.region}</span>
            </div>
            {isSelected && <Check className="w-4 h-4 text-[#1D734B]" />}
          </button>
        );
      })}

      <div className="px-2 pt-2 py-1 text-[10px] font-black uppercase text-slate-400">
        Todos os Municípios (308)
      </div>
      {filteredMunicipalities.map((mun) => (
        <button
          key={mun.code}
          type="button"
          onClick={() => onSelectMunicipio(mun)}
          className="w-full text-left p-2.5 hover:bg-emerald-50 rounded-xl transition-all flex items-center justify-between border border-transparent hover:border-emerald-200 cursor-pointer"
        >
          <div>
            <span className="font-extrabold text-slate-800 block">{mun.name}</span>
            <span className="text-[10px] text-slate-500">
              {mun.distrito || 'Portugal'} • {mun.freguesias.length} freguesias
            </span>
          </div>
          <span className="text-[11px] text-[#1D734B] font-bold">Selecionar →</span>
        </button>
      ))}
    </div>
  );
};
