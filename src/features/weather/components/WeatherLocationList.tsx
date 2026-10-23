// src/features/weather/components/WeatherLocationList.tsx
import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { PortugalMunicipality, PortugalFreguesiaEntry } from '../services/geoApiService.ts';
import { PRESET_AGRICULTURAL_LOCATIONS, type WeatherLocation } from '../weatherService.ts';
import type { LocationFilterMode } from '../hooks/useWeatherLocationSearch.ts';

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
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1 text-xs">
        {hasMun && (
          <div className="space-y-1">
            <div className="px-2 py-0.5 text-[10px] font-black uppercase text-slate-400">
              Municípios ({filteredMunicipalities.length})
            </div>
            {filteredMunicipalities.map((mun) => (
              <button
                key={`mun_${mun.code}`}
                type="button"
                onClick={() => onSelectMunicipio(mun)}
                className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-between border border-slate-100 hover:border-slate-300 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase border border-blue-200">
                      Município
                    </span>
                    <span className="font-extrabold text-slate-800">{mun.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {mun.distrito || 'Portugal'} • {mun.freguesias.length} freguesias
                  </span>
                </div>
                <span className="text-[11px] text-[#1D734B] font-bold">Selecionar →</span>
              </button>
            ))}
          </div>
        )}

        {hasFreg && (
          <div className="space-y-1">
            <div className="px-2 pt-1 py-0.5 text-[10px] font-black uppercase text-slate-400">
              Freguesias ({filteredFreguesias.length})
            </div>
            {filteredFreguesias.map((freg, idx) => (
              <button
                key={`freg_${freg.municipio}_${freg.name}_${idx}`}
                type="button"
                onClick={() => onSelectFreguesia(freg.name, freg.municipio)}
                className="w-full text-left p-2.5 hover:bg-emerald-50 rounded-xl transition-all flex items-center justify-between border border-slate-100 hover:border-emerald-300 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 uppercase border border-emerald-200">
                      Freguesia
                    </span>
                    <span className="font-extrabold text-slate-900">{freg.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Concelho de {freg.municipio} • {freg.distrito}
                  </span>
                </div>
                <span className="text-[11px] text-[#1D734B] font-bold">Selecionar →</span>
              </button>
            ))}
          </div>
        )}
      </div>
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
