// src/features/weather/components/WeatherLocationSearchDropdown.tsx
import React from 'react';
import { MapPin, Search, X, Navigation, ChevronDown } from 'lucide-react';
import type { WeatherLocation } from '../weatherService.ts';
import { useWeatherLocationSearch } from '../hooks/useWeatherLocationSearch.ts';
import { WeatherLocationList } from './WeatherLocationList.tsx';

interface WeatherLocationSearchDropdownProps {
  currentLocation: WeatherLocation;
  onSelectLocation: (location: WeatherLocation) => void;
  onUseGps: () => void;
}

export const WeatherLocationSearchDropdown: React.FC<WeatherLocationSearchDropdownProps> = ({
  currentLocation,
  onSelectLocation,
  onUseGps
}) => {
  const {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    filterMode,
    toggleFilter,
    selectedMunForFreg,
    isResolving,
    dropdownRef,
    searchInputRef,
    filteredMunicipalities,
    filteredFreguesias,
    handleSelectMunicipio,
    handleSelectFreguesia
  } = useWeatherLocationSearch(currentLocation, onSelectLocation);

  const isMunActive = filterMode === 'municipios' || (!searchQuery.trim() && filterMode === 'all');
  const isFregActive = filterMode === 'freguesias';

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:border-[#1D734B] rounded-2xl px-2.5 py-1.5 self-start sm:self-auto shadow-2xs transition-all">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left outline-none cursor-pointer group"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <MapPin className="w-4 h-4 text-[#114037] shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col pr-1 max-w-[150px] sm:max-w-[200px]">
            <span className="text-xs font-black text-slate-800 truncate leading-tight">
              {currentLocation.name}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold truncate leading-tight">
              {currentLocation.region || 'Portugal'}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onUseGps}
          title="Detetar por GPS"
          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 z-50 space-y-3 animate-fade-in font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#114037] uppercase tracking-wider">
                Localização
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                GEOAPI.PT
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              aria-label="Fechar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar concelho ou freguesia..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#114037] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold text-center w-full">
            <button
              type="button"
              onClick={() => toggleFilter('municipios')}
              className={`w-full py-2 px-1 rounded-lg transition-all cursor-pointer truncate ${
                isMunActive
                  ? 'bg-white text-[#114037] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Municípios {searchQuery.trim() ? `(${filteredMunicipalities.length})` : '(308)'}
            </button>
            <button
              type="button"
              onClick={() => toggleFilter('freguesias')}
              className={`w-full py-2 px-1 rounded-lg transition-all cursor-pointer truncate ${
                isFregActive
                  ? 'bg-white text-[#114037] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Freguesias {searchQuery.trim() ? `(${filteredFreguesias.length})` : '(3.259)'}
            </button>
          </div>

          <WeatherLocationList
            isResolving={isResolving}
            searchQuery={searchQuery}
            filterMode={filterMode}
            currentLocation={currentLocation}
            filteredMunicipalities={filteredMunicipalities}
            filteredFreguesias={filteredFreguesias}
            selectedMunName={selectedMunForFreg?.name || 'Portugal'}
            onSelectPreset={(preset) => {
              onSelectLocation(preset);
              setIsOpen(false);
            }}
            onSelectMunicipio={handleSelectMunicipio}
            onSelectFreguesia={handleSelectFreguesia}
          />

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onUseGps();
                setIsOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs font-extrabold text-[#114037] hover:text-[#1D734B] transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-[#1D734B]" />
              <span>Usar GPS do Telemóvel</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
