import React from 'react';
import { Edit2, BookmarkCheck, Trees } from 'lucide-react';
import type { EppoDoseInputsState } from './eppoDoseDataMapper';
import { calculateLwa, calculateTrv } from './eppoDoseDataMapper';

interface EppoManualEntryProps {
  inputs: EppoDoseInputsState;
  onUpdateInput: <K extends keyof EppoDoseInputsState>(key: K, value: EppoDoseInputsState[K]) => void;
  onOpenKeypad: (field: keyof EppoDoseInputsState) => void;
  onOpenGuide: () => void;
  onSaveToCultureProfile: () => void;
}

export const EppoManualEntry: React.FC<EppoManualEntryProps> = ({
  inputs,
  onUpdateInput,
  onOpenKeypad,
  onOpenGuide,
  onSaveToCultureProfile
}) => {
  const { alturaM, larguraCopaM, entrelinhaM, treatmentMode, cropStructure } = inputs;
  const isGlobular = cropStructure === 'globular';

  const liveLwa = calculateLwa(alturaM, entrelinhaM);
  const liveTrv = isGlobular ? calculateTrv(alturaM, larguraCopaM, entrelinhaM) : 0;

  return (
    <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3.5">
      {/* Seletor de Arquitetura da Copa: Sebe vs Globular */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Trees className="w-4 h-4 text-[#114037]" />
          <div>
            <span className="text-xs font-bold text-slate-800 block">Arquitetura da Cultura</span>
            <span className="text-[10px] text-slate-500 font-medium">Adapta os parâmetros geométricos</span>
          </div>
        </div>
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onUpdateInput('cropStructure', 'sebe')}
            className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              !isGlobular ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Sebe (LWA)
          </button>
          <button
            type="button"
            onClick={() => onUpdateInput('cropStructure', 'globular')}
            className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              isGlobular ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Globular (TRV)
          </button>
        </div>
      </div>

      {/* Inputs Geométricos Condicionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Altura da Vegetação */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {treatmentMode === 'band' ? 'Altura da Faixa Tratada' : 'Altura da Parede Foliar'}
            </span>
            <button type="button" onClick={onOpenGuide} aria-label="Ajuda sobre altura" className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer">i</button>
          </div>
          <button type="button" onClick={() => onOpenKeypad('alturaM')} className="w-full min-h-[48px] bg-slate-50/60 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center justify-between cursor-pointer touch-target">
            <span className="font-mono text-base font-black text-[#114037]">{alturaM.toFixed(2)} <span className="text-xs text-slate-500">m</span></span>
            <Edit2 className="w-4 h-4 text-[#3CA64C]" />
          </button>
        </div>

        {/* Largura da Copa (Apenas para Pomar Globular) */}
        {isGlobular && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Largura da Copa</span>
              <button type="button" onClick={onOpenGuide} aria-label="Ajuda sobre largura" className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer">i</button>
            </div>
            <button type="button" onClick={() => onOpenKeypad('larguraCopaM')} className="w-full min-h-[48px] bg-slate-50/60 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center justify-between cursor-pointer touch-target">
              <span className="font-mono text-base font-black text-[#114037]">{larguraCopaM.toFixed(2)} <span className="text-xs text-slate-500">m</span></span>
              <Edit2 className="w-4 h-4 text-[#3CA64C]" />
            </button>
          </div>
        )}

        {/* Distância Entrelinha */}
        <div className={`bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 shadow-2xs ${!isGlobular ? '' : 'sm:col-span-2'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Distância Entrelinha</span>
            <button type="button" onClick={onOpenGuide} aria-label="Ajuda sobre entrelinha" className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer">i</button>
          </div>
          <button type="button" onClick={() => onOpenKeypad('entrelinhaM')} className="w-full min-h-[48px] bg-slate-50/60 hover:bg-slate-100/70 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center justify-between cursor-pointer touch-target">
            <span className="font-mono text-base font-black text-[#114037]">{entrelinhaM.toFixed(2)} <span className="text-xs text-slate-500">m</span></span>
            <Edit2 className="w-4 h-4 text-[#3CA64C]" />
          </button>
        </div>
      </div>

      {/* Rodapé do Bloco Manual: Pré-visualização e Botão Discreto de Guardar no Perfil */}
      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#114037]">
            LWA: {liveLwa.toLocaleString('pt-PT')} m²/ha
          </span>
          {isGlobular && (
            <span className="text-xs font-mono text-slate-500">
              • TRV: {liveTrv.toLocaleString('pt-PT')} m³/ha
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onSaveToCultureProfile}
          className="min-h-[42px] px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-[#3CA64C]/50 text-[#114037] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs touch-target"
        >
          <BookmarkCheck className="w-4 h-4 text-[#3CA64C]" />
          <span>Atualizar Dados no Perfil da Cultura</span>
        </button>
      </div>
    </div>
  );
};
