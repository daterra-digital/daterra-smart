import React from 'react';
import {
  GraduationCap,
  X,
  Search,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { NOZZLE_MICROLEARNING_TOPICS } from './nozzleMicrolearningData';

export interface NozzleMicrolearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicId?: string;
}

export const NozzleMicrolearningModal: React.FC<NozzleMicrolearningModalProps> = ({
  isOpen,
  onClose,
  initialTopicId
}) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Todas');
  const [activeTopicId, setActiveTopicId] = React.useState<string>(
    initialTopicId || NOZZLE_MICROLEARNING_TOPICS[0].id
  );

  React.useEffect(() => {
    if (initialTopicId) {
      setActiveTopicId(initialTopicId);
    }
  }, [initialTopicId]);

  // Fechar com a tecla Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['Todas', 'Física Hidráulica', 'Tecnologia de Aplicação', 'Calibração & Normas', 'Segurança & Manutenção'];

  const filteredTopics = NOZZLE_MICROLEARNING_TOPICS.filter(topic => {
    const matchesCat = selectedCategory === 'Todas' || topic.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      topic.title.toLowerCase().includes(q) ||
      topic.summary.toLowerCase().includes(q) ||
      topic.content.some(c => c.toLowerCase().includes(q)) ||
      (topic.referenceStandard && topic.referenceStandard.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const activeTopic =
    NOZZLE_MICROLEARNING_TOPICS.find(t => t.id === activeTopicId) ||
    NOZZLE_MICROLEARNING_TOPICS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="microlearning-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        
        {/* Topo do Modal */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-daterra-accent text-white flex items-center justify-center font-bold shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-daterra-accent block">
                Academia & Guia Técnico DATERRA
              </span>
              <h2 id="microlearning-modal-title" className="text-base sm:text-lg font-black text-white leading-tight">
                Microlearning: Pulverização & Bicos
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal de microlearning"
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all min-h-[48px] min-w-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Split: Barra lateral de tópicos + Conteúdo do tópico */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Lado Esquerdo: Lista de 10 Tópicos com Pesquisa */}
          <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/70 overflow-hidden">
            
            {/* Pesquisa e Filtro de Categoria */}
            <div className="p-3.5 space-y-2 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar tópico ou norma..."
                  aria-label="Pesquisar tópico de microlearning"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-daterra-primary focus-visible:ring-2 focus-visible:ring-daterra-accent/20 outline-none transition-all"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-daterra-primary focus:outline-none ${
                      selectedCategory === cat
                        ? 'bg-daterra-primary text-white shadow-sm'
                        : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Scrollável de Tópicos */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {filteredTopics.length === 0 ? (
                <div className="p-6 text-center text-xs font-medium text-slate-400">
                  Nenhum tópico encontrado para os critérios de pesquisa.
                </div>
              ) : (
                filteredTopics.map(t => {
                  const isActive = t.id === activeTopic.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTopicId(t.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-2.5 min-h-[48px] focus-visible:ring-2 focus-visible:ring-daterra-accent focus:outline-none ${
                        isActive
                          ? 'bg-white border border-daterra-accent shadow-sm'
                          : 'hover:bg-white/80 border border-transparent'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black shrink-0 flex items-center justify-center ${
                          isActive
                            ? 'bg-daterra-primary text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                          {t.category}
                        </span>
                        <h3
                          className={`text-xs font-bold line-clamp-1 ${
                            isActive ? 'text-daterra-primary font-black' : 'text-slate-800'
                          }`}
                        >
                          {t.title}
                        </h3>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 mt-1 transition-transform ${
                          isActive ? 'text-daterra-accent translate-x-0.5' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Lado Direito: Conteúdo do Tópico Selecionado */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col overflow-y-auto p-5 sm:p-7 space-y-5 bg-white">
            
            {/* Cabeçalho do Tópico */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Tópico #{activeTopic.number} • {activeTopic.category}
                </span>
                {activeTopic.referenceStandard && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{activeTopic.referenceStandard}</span>
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {activeTopic.title}
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {activeTopic.summary}
              </p>
            </div>

            {/* Parágrafos de Conteúdo Didático */}
            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
              {activeTopic.content.map((p, idx) => (
                <p key={idx} className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100 font-normal">
                  {p}
                </p>
              ))}
            </div>

            {/* Destaque Prático / Conclusão Técnica */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200 rounded-2xl space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-daterra-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-daterra-accent" />
                Regra Prática de Campo DATERRA
              </span>
              <p className="text-xs text-slate-800 font-bold leading-relaxed">
                {activeTopic.keyTakeaway}
              </p>
            </div>

            {/* Navegação entre tópicos */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={activeTopic.number === 1}
                onClick={() => {
                  const prev = NOZZLE_MICROLEARNING_TOPICS.find(t => t.number === activeTopic.number - 1);
                  if (prev) setActiveTopicId(prev.id);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-daterra-primary focus:outline-none"
              >
                ← Tópico Anterior
              </button>

              <button
                type="button"
                disabled={activeTopic.number === NOZZLE_MICROLEARNING_TOPICS.length}
                onClick={() => {
                  const next = NOZZLE_MICROLEARNING_TOPICS.find(t => t.number === activeTopic.number + 1);
                  if (next) setActiveTopicId(next.id);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-daterra-primary hover:bg-daterra-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-daterra-accent focus:outline-none"
              >
                Próximo Tópico →
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-3.5 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Baseado nos manuais da DGAV, EPPO, ISO 10625 e DATERRA Smart.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
          >
            Concluir Leitura
          </button>
        </div>
      </div>
    </div>
  );
};
