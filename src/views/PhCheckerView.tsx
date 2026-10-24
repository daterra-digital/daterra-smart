import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  X,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  Info,
  GraduationCap
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  INITIAL_ACTIVE_SUBSTANCES,
  SubstanceCard,
  PhMicrolearningModal,
  type ActiveSubstance
} from '../features/verificador-ph';

export const PhCheckerView: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isMicrolearningOpen, setIsMicrolearningOpen] = useState<boolean>(false);
  const [activeMicroTopicId, setActiveMicroTopicId] = useState<string>('ph-ideal');

  // Debounce de 200ms para pesquisa fluida
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Seed e leitura reativa da tabela IndexedDB active_substances
  const dbSubstances = useLiveQuery(async () => {
    try {
      const count = await db.active_substances.count();
      if (count < INITIAL_ACTIVE_SUBSTANCES.length) {
        await db.active_substances.clear();
        await db.active_substances.bulkPut(INITIAL_ACTIVE_SUBSTANCES);
        return INITIAL_ACTIVE_SUBSTANCES;
      }
      return await db.active_substances.toArray();
    } catch {
      return INITIAL_ACTIVE_SUBSTANCES;
    }
  }, []);

  const substances: ActiveSubstance[] = dbSubstances ?? INITIAL_ACTIVE_SUBSTANCES;

  // Filtragem por name, nameEn ou moa (normalizando acentos)
  const filteredResults = useMemo(() => {
    if (!debouncedQuery) return [];
    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q = normalize(debouncedQuery);

    return substances.filter(
      (item) =>
        normalize(item.name).includes(q) ||
        normalize(item.nameEn).includes(q) ||
        normalize(item.moa).includes(q)
    );
  }, [debouncedQuery, substances]);

  const handleOpenMicrolearningTopic = (topicId: string) => {
    setActiveMicroTopicId(topicId);
    setIsMicrolearningOpen(true);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in font-sans max-w-6xl mx-auto">
      {/* 1. CABEÇALHO DA FERRAMENTA (PADRÃO COMPARADOR DE BICOS) */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ferramentas')}
            aria-label="Voltar ao catálogo de ferramentas"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-daterra-primary" />
            <span>Voltar</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-daterra-primary leading-tight">
                Consulta de pH
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Ferramenta Ativa
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Consulte o pH ideal da calda, constante pKa, código MoA e estabilidade química offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleOpenMicrolearningTopic('ph-ideal')}
            aria-label="Abrir guia da Consulta de pH"
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-daterra-primary border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-daterra-accent" />
            <span>Guia</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE PESQUISA GRANDE, FLUIDA E REATIVA */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#114037] text-[#3CA64C] flex items-center justify-center shadow-xs">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">
                Motor de Pesquisa Offline
              </span>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Substância Ativa ou Modo de Ação (MoA)
              </h2>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ● {substances.length} substâncias disponíveis
          </span>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Pesquisar por substância ativa (PT/EN) ou código MoA (ex: Enxofre, Glifosato, FRAC 11)..."
            className="w-full pl-12 pr-10 py-3.5 bg-[#FAFBFB] border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#114037]/20 focus:border-[#114037] transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Limpar pesquisa"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Atalhos Rápidos */}
        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400">Exemplos rápidos:</span>
          {['enxofre', 'glifosato', 'azoxistrobina', 'diflufenicão', 'FRAC 11', 'HRAC 9'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSearchInput(preset)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ESTADO INICIAL OU RESULTADOS DE PESQUISA */}
      {!debouncedQuery ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#114037] text-[#3CA64C] flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-800 max-w-xl mx-auto leading-relaxed">
            Pesquise por uma substância ativa (ex: Enxofre) ou código MoA para verificar o pH ideal e regras de compatibilidade.
          </p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-2">
          <Info className="w-7 h-7 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            Nenhuma substância encontrada para "{debouncedQuery}"
          </p>
          <p className="text-xs text-slate-500">
            Verifique a grafia em português, inglês ou o código MoA (ex: FRAC M02, HRAC 9).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map((item) => (
            <SubstanceCard
              key={item.id}
              substance={item}
              onOpenTopic={handleOpenMicrolearningTopic}
              onFilterByMoa={(moaCode) => setSearchInput(moaCode)}
            />
          ))}
        </div>
      )}

      {/* 4. AVISO TÉCNICO DATERRA SMART */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl text-xs text-slate-600 leading-relaxed space-y-1">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-daterra-primary" />
          Aviso Técnico DATERRA Smart
        </span>
        <p>
          Os intervalos de pH ideal e constantes de dissociação (pKa) destinam-se a prevenir a hidrólise alcalina ou ácida da substância ativa no depósito de pulverização. Consulte sempre as recomendações oficiais no rótulo do produto autorizado.
        </p>
      </div>

      {/* 5. MODAL DE MICROLEARNING DEDICADO */}
      <PhMicrolearningModal
        isOpen={isMicrolearningOpen}
        onClose={() => setIsMicrolearningOpen(false)}
        initialTopicId={activeMicroTopicId}
      />
    </div>
  );
};

export default PhCheckerView;
