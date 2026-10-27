import React from 'react';
import type { PortugalMunicipality, PortugalFreguesiaEntry } from '../services/geoApiService.ts';

export interface WeatherSearchResultsProps {
  hasMun: boolean;
  hasFreg: boolean;
  filteredMunicipalities: PortugalMunicipality[];
  filteredFreguesias: PortugalFreguesiaEntry[];
  onSelectMunicipio: (mun: PortugalMunicipality) => void;
  onSelectFreguesia: (fregName: string, munName: string) => void;
}

export const WeatherSearchResults: React.FC<WeatherSearchResultsProps> = ({
  hasMun,
  hasFreg,
  filteredMunicipalities,
  filteredFreguesias,
  onSelectMunicipio,
  onSelectFreguesia
}) => {
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
};
