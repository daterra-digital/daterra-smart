import React from 'react';
import { Edit2, Sprout, Tractor, History, PenTool } from 'lucide-react';
import type { EppoDoseInputsState } from './eppoDoseDataMapper';
import { EppoManualEntry } from './EppoManualEntry';

interface EppoDoseInputsPanelProps {
  inputs: EppoDoseInputsState;
  onUpdateInput: <K extends keyof EppoDoseInputsState>(key: K, value: EppoDoseInputsState[K]) => void;
  onOpenKeypad: (field: keyof EppoDoseInputsState) => void;
  onOpenProfileModal: (type: 'culture' | 'equipment') => void;
  onOpenHistoryModal: () => void;
  onOpenGuide: () => void;
  onSaveToCultureProfile: () => void;
}

export const EppoDoseInputsPanel: React.FC<EppoDoseInputsPanelProps> = ({
  inputs,
  onUpdateInput,
  onOpenKeypad,
  onOpenProfileModal,
  onOpenHistoryModal,
  onOpenGuide,
  onSaveToCultureProfile
}) => {
  const {
    doseRotulo, volumeCaldaLHa, capacidadeDeposito, unitMode,
    treatmentMode, foliarInputSource, selectedCultureName, selectedEquipmentName, historySourceLabel
  } = inputs;

  const unitLabel = unitMode === 'liquid' ? 'L/ha' : 'kg/ha';

  return (
    <section aria-label="Valores introduzidos para cálculo EPPO" className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Cabeçalho do Painel e Unidade */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-[#114037]">Valores Introduzidos</h2>
          <span className="text-[11px] text-slate-400 font-medium">Configure a vegetação e o equipamento</span>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button type="button" onClick={() => onUpdateInput('unitMode', 'liquid')} className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${unitMode === 'liquid' ? 'bg-[#114037] text-white' : 'text-slate-600'}`}>
            Líquido (L/ha)
          </button>
          <button type="button" onClick={() => onUpdateInput('unitMode', 'solid')} className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${unitMode === 'solid' ? 'bg-[#114037] text-white' : 'text-slate-600'}`}>
            Sólido (kg/ha)
          </button>
        </div>
      </div>

      {/* SEGMENTED CONTROL: TRIPLA ENTRADA DE DADOS */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-700 block">Fonte dos Dados Foliares</span>
        <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-2xl gap-1">
          <button type="button" onClick={() => onUpdateInput('foliarInputSource', 'manual')} className={`min-h-[44px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${foliarInputSource === 'manual' ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
            <PenTool className="w-3.5 h-3.5" />
            <span>Manual</span>
          </button>
          <button type="button" onClick={() => { onUpdateInput('foliarInputSource', 'history'); onOpenHistoryModal(); }} className={`min-h-[44px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${foliarInputSource === 'history' ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
            <History className="w-3.5 h-3.5" />
            <span>Histórico</span>
          </button>
          <button type="button" onClick={() => onUpdateInput('foliarInputSource', 'profiles')} className={`min-h-[44px] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-target ${foliarInputSource === 'profiles' ? 'bg-[#114037] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
            <Sprout className="w-3.5 h-3.5" />
            <span>Perfis</span>
          </button>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL CONFORME A FONTE */}
      {foliarInputSource === 'manual' && (
        <EppoManualEntry inputs={inputs} onUpdateInput={onUpdateInput} onOpenKeypad={onOpenKeypad} onOpenGuide={onOpenGuide} onSaveToCultureProfile={onSaveToCultureProfile} />
      )}

      {foliarInputSource === 'history' && (
        <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-xs font-bold text-sky-950 block">Valor Importado do Histórico</span>
            <span className="text-xs font-mono text-sky-800">{historySourceLabel ?? 'Clique para selecionar um ensaio de LWA ou TRV'}</span>
          </div>
          <button type="button" onClick={onOpenHistoryModal} className="min-h-[44px] px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer touch-target">
            Alterar Registo
          </button>
        </div>
      )}

      {foliarInputSource === 'profiles' && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button type="button" onClick={() => onOpenProfileModal('culture')} className="min-h-[48px] bg-emerald-50/50 hover:bg-emerald-50 border border-[#3CA64C]/40 rounded-2xl px-4 py-2.5 flex items-center justify-between text-[#114037] font-bold text-xs cursor-pointer touch-target">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-[#3CA64C]" />
                <span>{selectedCultureName ? `Cultura: ${selectedCultureName}` : 'Importar Cultura'}</span>
              </div>
              <span className="text-[10px] bg-white border border-[#3CA64C]/30 text-[#1B5E20] px-2 py-0.5 rounded-md font-extrabold uppercase">Perfil</span>
            </button>
            <button type="button" onClick={() => onOpenProfileModal('equipment')} className="min-h-[48px] bg-emerald-50/50 hover:bg-emerald-50 border border-[#1D734B]/40 rounded-2xl px-4 py-2.5 flex items-center justify-between text-[#114037] font-bold text-xs cursor-pointer touch-target">
              <div className="flex items-center gap-2">
                <Tractor className="w-4 h-4 text-[#1D734B]" />
                <span>{selectedEquipmentName ? `Equipamento: ${selectedEquipmentName}` : 'Importar Equipamento'}</span>
              </div>
              <span className="text-[10px] bg-white border border-[#1D734B]/30 text-[#114037] px-2 py-0.5 rounded-md font-extrabold uppercase">Perfil</span>
            </button>
          </div>
          {selectedCultureName && (
            <button type="button" onClick={onSaveToCultureProfile} className="w-full min-h-[40px] px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-[#3CA64C]/50 text-[#114037] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs touch-target">
              <span>Atualizar Dados no Perfil da Cultura ({selectedCultureName})</span>
            </button>
          )}
        </div>
      )}

      {/* Toggle Dinâmico: Tratamento Total vs Tratamento em Faixa */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:px-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <span className="text-xs font-bold text-slate-800 block">Modalidade de Pulverização</span>
          <span className="text-[11px] text-slate-500 font-medium">Sebe completa vs apenas a faixa produtiva</span>
        </div>
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl">
          <button type="button" onClick={() => onUpdateInput('treatmentMode', 'total')} className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${treatmentMode === 'total' ? 'bg-[#114037] text-white' : 'text-slate-600'}`}>
            Total
          </button>
          <button type="button" onClick={() => onUpdateInput('treatmentMode', 'band')} className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${treatmentMode === 'band' ? 'bg-[#114037] text-white' : 'text-slate-600'}`}>
            Em Faixa
          </button>
        </div>
      </div>

      {/* Parâmetros do Produto e da Calda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Dose do Rótulo</span>
            <button type="button" onClick={onOpenGuide} aria-label="Ajuda" className="w-6 h-6 rounded-full bg-slate-200/70 text-slate-600 text-xs font-bold cursor-pointer">i</button>
          </div>
          <button type="button" onClick={() => onOpenKeypad('doseRotulo')} className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer touch-target shadow-2xs">
            <span className="font-mono text-base font-black text-[#114037]">{doseRotulo.toFixed(2)} <span className="text-xs font-bold text-slate-500">{unitLabel}</span></span>
            <Edit2 className="w-4 h-4 text-[#3CA64C]" />
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Calda de Trabalho</span>
            <button type="button" onClick={onOpenGuide} aria-label="Ajuda" className="w-6 h-6 rounded-full bg-slate-200/70 text-slate-600 text-xs font-bold cursor-pointer">i</button>
          </div>
          <button type="button" onClick={() => onOpenKeypad('volumeCaldaLHa')} className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer touch-target shadow-2xs">
            <span className="font-mono text-base font-black text-[#114037]">{volumeCaldaLHa} <span className="text-xs font-bold text-slate-500">L/ha</span></span>
            <Edit2 className="w-4 h-4 text-[#3CA64C]" />
          </button>
        </div>

        <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Depósito</span>
            <button type="button" onClick={onOpenGuide} aria-label="Ajuda" className="w-6 h-6 rounded-full bg-slate-200/70 text-slate-600 text-xs font-bold cursor-pointer">i</button>
          </div>
          <button type="button" onClick={() => onOpenKeypad('capacidadeDeposito')} className="w-full min-h-[48px] bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer touch-target shadow-2xs">
            <span className="font-mono text-base font-black text-[#114037]">{capacidadeDeposito} <span className="text-xs font-bold text-slate-500">L</span></span>
            <Edit2 className="w-4 h-4 text-[#3CA64C]" />
          </button>
        </div>
      </div>
    </section>
  );
};
