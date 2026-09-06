import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  CheckCircle2,
  Filter,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import { FORMULATIONS_CATALOG, FORMULATION_GROUPS } from './data';
import type { FormulationGroupId } from './types';
import { DidacticHelp } from '../concentracao/DidacticHelp';

interface FormulationSelectorProps {
  selectedIds: string[];
  onToggleFormulation: (id: string) => void;
  onSelectMultiple: (ids: string[]) => void;
  onClearSelection: () => void;
}

export const FormulationSelector: React.FC<FormulationSelectorProps> = ({
  selectedIds,
  onToggleFormulation,
  onSelectMultiple,
  onClearSelection
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<FormulationGroupId | 'todas'>('todas');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Filtragem dinâmica por pesquisa e grupo
  const filteredFormulations = useMemo(() => {
    return FORMULATIONS_CATALOG.filter((item) => {
      // Ocultar H2O da seleção manual de produtos, pois a água já é o passo base obrigatório
      if (item.id === 'H2O') return false;

      const matchesGroup = selectedGroupId === 'todas' || item.groupId === selectedGroupId;
      if (!matchesGroup) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        item.sigla.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.information.toLowerCase().includes(q) ||
        String(item.number).includes(q)
      );
    });
  }, [searchQuery, selectedGroupId]);

  // Presets rápidos para o terreno
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'fungicida_inseticida':
        onSelectMultiple(['PH', 'WG', 'SC', 'EC', 'MOL']);
        break;
      case 'herbicida_antideriva':
        onSelectMultiple(['CD', 'SL', 'MOL', 'AD']);
        break;
      case 'nutricao_protecao':
        onSelectMultiple(['PH', 'WP', 'SC', 'AF', 'MN', 'ADER']);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-5 sm:p-7 space-y-6">
      {/* Cabeçalho do Seletor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1D734B]">
              Passo 1 • Seleção de Produtos
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#114037]">
            Formulações a Misturar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione todos os tipos de produtos que pretende introduzir no pulverizador.
          </p>
        </div>

        {/* Indicador de Seleção e Botão Limpar */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-[#114037]/10 text-[#114037] text-xs font-black rounded-xl">
            {selectedIds.filter(id => id !== 'H2O').length} selecionadas
          </span>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="min-h-[44px] px-3.5 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 touch-target active:scale-95"
              title="Limpar todas as formulações selecionadas"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Presets Rápidos */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#3CA64C]" />
          <span>Exemplos e Combinações Frequentes</span>
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          <button
            type="button"
            onClick={() => applyPreset('fungicida_inseticida')}
            className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap touch-target border border-slate-200"
          >
            Fungicida WG + Inseticida SC + EC
          </button>
          <button
            type="button"
            onClick={() => applyPreset('herbicida_antideriva')}
            className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap touch-target border border-slate-200"
          >
            Herbicida SL + Anti-Deriva + Molhante
          </button>
          <button
            type="button"
            onClick={() => applyPreset('nutricao_protecao')}
            className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap touch-target border border-slate-200"
          >
            Pó WP + Adubo Foliar + Aderente
          </button>
        </div>
      </div>

      {/* Campo de Pesquisa em Tempo Real */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por sigla (ex: WG, SC, EC), nome ou tipo..."
          className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D734B] focus:border-transparent transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Limpar pesquisa"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chips de Filtragem por Grupo */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filtrar por Grupo Técnico</span>
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          <button
            type="button"
            onClick={() => setSelectedGroupId('todas')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap touch-target flex items-center gap-1.5 ${
              selectedGroupId === 'todas'
                ? 'bg-[#114037] text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>Todas as Formulações</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">31</span>
          </button>

          {FORMULATION_GROUPS.map((group) => {
            const isSelected = selectedGroupId === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroupId(group.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap touch-target flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#114037] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{group.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grelha de Formulações */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>A mostrar {filteredFormulations.length} formulações</span>
          <span className="text-slate-400 text-[11px]">Toque para selecionar / desmarcar</span>
        </div>

        {filteredFormulations.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Nenhuma formulação encontrada</p>
            <p className="text-xs text-slate-500">Tente ajustar o termo de pesquisa ou selecionar outro grupo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFormulations.map((formulation) => {
              const isSelected = selectedSet.has(formulation.id);

              return (
                <div
                  key={formulation.id}
                  onClick={() => onToggleFormulation(formulation.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between group min-h-[120px] touch-target ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Linha de Topo: Sigla + Número + Checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-xl font-mono text-sm font-black tracking-tight border ${
                            isSelected
                              ? 'bg-[#114037] text-white border-[#114037]'
                              : 'bg-slate-100 text-slate-800 border-slate-300 group-hover:border-[#1D734B]'
                          }`}
                        >
                          {formulation.sigla}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-400">
                          #{formulation.number}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {formulation.faqTopic && (
                          <DidacticHelp
                            faqFile={`${formulation.faqTopic.replace('mistura-', 'MisturaFAQ').charAt(0).toUpperCase() + formulation.faqTopic.replace('mistura-', 'MisturaFAQ').slice(1)}.md` as any}
                            topic={formulation.faqTopic}
                            buttonLabel=""
                            variant="icon"
                            iconType="info"
                            iconClassName="w-4 h-4 text-slate-500 hover:text-[#114037]"
                            className="min-w-[36px] min-h-[36px] p-1.5 !bg-transparent hover:!bg-slate-200/60 rounded-lg"
                          />
                        )}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#3CA64C] text-white shadow-xs'
                              : 'border-2 border-slate-300 group-hover:border-[#3CA64C]'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-5 h-5 fill-white text-[#3CA64C]" />}
                        </div>
                      </div>
                    </div>

                    {/* Nome do Produto */}
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {formulation.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                        {formulation.group}
                      </span>
                    </div>

                    {/* Descrição Curta */}
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {formulation.shortDescription}
                    </p>
                  </div>

                  {/* Informação Técnica Prática */}
                  <div className="pt-2 mt-2 border-t border-slate-100/80 text-[11px] text-slate-500 font-medium">
                    <span className="text-[#1D734B] font-bold">Nota:</span> {formulation.information}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
