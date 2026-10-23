import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  CheckCircle2,
  Trash2,
  Layers,
  Plus,
  Info
} from 'lucide-react';
import { FORMULATIONS_CATALOG, FORMULATION_GROUPS, FORMULATIONS_BY_ID } from './data';
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
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<FormulationGroupId | 'todas'>('todas');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Lista resolvida das formulações atualmente selecionadas (excluindo H2O)
  const selectedFormulations = useMemo(() => {
    return selectedIds
      .filter((id) => id !== 'H2O')
      .map((id) => FORMULATIONS_BY_ID.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [selectedIds]);

  // Filtragem dinâmica no modal/gaveta por pesquisa e grupo
  const filteredFormulations = useMemo(() => {
    return FORMULATIONS_CATALOG.filter((item) => {
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

  // Estilo suave de badge por grupo técnico (padrão VF/F do Comparador de Bicos)
  const getGroupBadgeClasses = (groupId: FormulationGroupId) => {
    switch (groupId) {
      case 'agua':
        return {
          pill: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500'
        };
      case 'solidos':
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'liquidos':
        return {
          pill: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-500'
        };
      case 'solucoes':
        return {
          pill: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500'
        };
      case 'adjuvantes':
      default:
        return {
          pill: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500'
        };
    }
  };

  return (
    <>
      {/* CARTÃO PRINCIPAL: SELEÇÃO ATUAL — FORMULAÇÕES INTRODUZIDAS */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          {/* Cabeçalho do Cartão (Idêntico a Valores Introduzidos do Comparador) */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                  Seleção Atual
                </span>
                <h2 className="text-base font-black text-slate-900 leading-tight">
                  Formulações Introduzidas ({selectedFormulations.length})
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCatalogOpen(true)}
              className="px-3 py-1.5 bg-[#114037] hover:bg-[#1D734B] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#8ffa94]" />
              <span>Adicionar</span>
            </button>
          </div>

          {/* Lista Compacta de Formulações Selecionadas */}
          {selectedFormulations.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-[#FAFBFB] text-center space-y-2.5">
              <p className="text-xs font-bold text-slate-700">
                Nenhuma formulação na mistura
              </p>
              <p className="text-[11px] text-slate-500">
                Adicione produtos do catálogo (WG, SC, EC, SL, Molhante...) para gerar a ordem W.A.L.E.S.
              </p>
              <button
                type="button"
                onClick={() => setIsCatalogOpen(true)}
                className="px-4 py-2 bg-[#114037] hover:bg-[#1D734B] text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#8ffa94]" />
                <span>Escolher Formulações (31)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedFormulations.map((formulation) => {
                const badgeStyle = getGroupBadgeClasses(formulation.groupId);
                return (
                  <div
                    key={formulation.id}
                    className="p-2.5 px-3 rounded-2xl border border-slate-200/90 bg-[#FAFBFB] hover:bg-slate-50 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs font-black border shrink-0 shadow-2xs ${badgeStyle.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badgeStyle.dot}`} />
                        <span>{formulation.sigla}</span>
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {formulation.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            [#{formulation.number}]
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block truncate">
                          {formulation.shortDescription}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleFormulation(formulation.id)}
                      aria-label={`Remover ${formulation.name}`}
                      title="Remover da mistura"
                      className="w-7 h-7 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              {/* Botão Rápido para Abrir o Catálogo */}
              <button
                type="button"
                onClick={() => setIsCatalogOpen(true)}
                className="w-full py-2 px-3 rounded-2xl border border-dashed border-slate-300 hover:border-[#114037] bg-slate-50/50 hover:bg-emerald-50/30 text-xs font-bold text-slate-600 hover:text-[#114037] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#3CA64C]" />
                <span>Gerir ou adicionar mais formulações (Catálogo de 31 tipos)</span>
              </button>
            </div>
          )}
        </div>

        {/* Rodapé do Cartão: Atalhos de Receitas Comuns e Limpar */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400">Atalhos:</span>
            <button
              type="button"
              onClick={() => applyPreset('fungicida_inseticida')}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              WG + SC + EC
            </button>
            <button
              type="button"
              onClick={() => applyPreset('herbicida_antideriva')}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              SL + Anti-Deriva
            </button>
            <button
              type="button"
              onClick={() => applyPreset('nutricao_protecao')}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              WP + Foliar
            </button>
          </div>

          {selectedFormulations.length > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL / GAVETA DO CATÁLOGO DE 31 FORMULAÇÕES (PROGRESSIVE DISCLOSURE) */}
      {isCatalogOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setIsCatalogOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-3xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho Fixo do Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                      Catálogo Oficial DATERRA • 31 Formulações
                    </span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      Selecionar Formulações a Misturar
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCatalogOpen(false)}
                  aria-label="Fechar catálogo"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pesquisa Rápida */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar por sigla (ex: WG, SC, EC), nome ou grupo..."
                  className="w-full pl-10 pr-9 py-2.5 bg-[#FAFBFB] border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#114037]/20 focus:border-[#114037]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
                    aria-label="Limpar pesquisa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tabs de Filtro por Grupo Técnico */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
                <button
                  type="button"
                  onClick={() => setSelectedGroupId('todas')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    selectedGroupId === 'todas'
                      ? 'bg-[#114037] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Todas (31)</span>
                </button>

                {FORMULATION_GROUPS.map((group) => {
                  const isSelected = selectedGroupId === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#114037] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{group.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de Formulações (Scrollable) */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-50/50">
              {filteredFormulations.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-1.5">
                  <Info className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Nenhuma formulação encontrada</p>
                  <p className="text-[11px] text-slate-500">Tente outro termo de pesquisa ou grupo técnico.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredFormulations.map((formulation) => {
                    const isSelected = selectedSet.has(formulation.id);
                    const badgeStyle = getGroupBadgeClasses(formulation.groupId);

                    return (
                      <div
                        key={formulation.id}
                        onClick={() => onToggleFormulation(formulation.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-emerald-50/70 border-[#3CA64C] ring-1 ring-[#3CA64C]/30 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-mono text-xs font-black border ${badgeStyle.pill}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badgeStyle.dot}`} />
                              <span>{formulation.sigla}</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              #{formulation.number}
                            </span>
                          </div>

                          <h4 className="text-xs font-black text-slate-900 leading-snug">
                            {formulation.name}
                          </h4>

                          <p className="text-[11px] text-slate-500 leading-snug">
                            {formulation.shortDescription}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {formulation.faqTopic && (
                            <DidacticHelp
                              faqFile={`${formulation.faqTopic.replace('mistura-', 'MisturaFAQ').charAt(0).toUpperCase() + formulation.faqTopic.replace('mistura-', 'MisturaFAQ').slice(1)}.md` as any}
                              topic={formulation.faqTopic}
                              buttonLabel=""
                              variant="icon"
                              iconType="info"
                              iconClassName="w-3.5 h-3.5 text-slate-400 hover:text-[#114037]"
                              className="min-w-[28px] min-h-[28px] p-1 !bg-transparent hover:!bg-slate-200/60 rounded-lg"
                            />
                          )}
                          <div
                            onClick={() => onToggleFormulation(formulation.id)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#3CA64C] text-white'
                                : 'border border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4 fill-white text-[#3CA64C]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rodapé Fixo do Modal */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  <strong className="text-[#114037]">{selectedFormulations.length}</strong> selecionadas
                </span>
                {selectedFormulations.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearSelection}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCatalogOpen(false)}
                className="px-5 py-2.5 bg-[#114037] hover:bg-[#1D734B] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Concluir Seleção ({selectedFormulations.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
