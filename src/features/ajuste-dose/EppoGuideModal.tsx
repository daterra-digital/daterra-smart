import React, { useEffect } from 'react';
import { X, BookOpen, ExternalLink, AlertTriangle, FileText, Layers } from 'lucide-react';

export interface EppoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EppoGuideModal: React.FC<EppoGuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="eppo-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] overflow-y-auto w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Principal */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#114037] text-[#8ffa94] flex items-center justify-center shadow-sm shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3CA64C] block">
                Manual de Calibração Agronómica
              </span>
              <h2
                id="eppo-guide-title"
                className="text-lg sm:text-xl font-black text-[#114037] leading-tight"
              >
                Guia EPPO PP 1/239
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Texto Introdutório */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#114037] text-white space-y-2 shadow-xs">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-100 font-medium">
            <strong className="text-[#8ffa94] font-black">
              1 hectare de terreno (área de superfície) não equivale a 1 hectare de alvo a tratar.
            </strong>{' '}
            Duas parcelas com a mesma área de superfície podem ter volumes de copa completamente
            diferentes. Aplicar uma dose &ldquo;cega&rdquo; baseada apenas na área de superfície
            gera dois problemas graves:{' '}
            <strong className="text-amber-300">Sobredosagem em pomares jovens</strong> (desperdício
            financeiro, poluição e excesso de resíduos) e{' '}
            <strong className="text-amber-300">Subdosagem em pomares adultos</strong> (falta de
            eficácia e criação de resistências nas pragas/doenças). A norma EPPO ajusta a dose à
            arquitetura real da copa.
          </p>
        </div>

        {/* 1. As 4 Formas de Expressão no Rótulo */}
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#3CA64C]" />
            <span>1. As 4 Formas de Expressão no Rótulo</span>
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Ao ler a literatura do fabricante, a dose recomendada pode vir expressa de 4 formas
            distintas:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">
                Área de Superfície (D_GA):
              </strong>
              <span className="text-slate-600">
                A dose clássica em L/ha ou kg/ha. Pressupõe um pomar ou vinha num estado de
                desenvolvimento &ldquo;padrão&rdquo;. Precisa de ser ajustada à sua copa real.
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">
                Parede Foliar (D_LWA):
              </strong>
              <span className="text-slate-600">
                Dose expressa para tratar 10.000 m² de parede foliar.
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">
                Volume de Copa (D_TRV):
              </strong>
              <span className="text-slate-600">
                Dose expressa para tratar 10.000 m³ de volume de copa.
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">
                Concentração (D_hL ou %):
              </strong>
              <span className="text-slate-600">
                Quantidade de produto a diluir em 100 Litros de água. Sozinha não dita a dose por
                hectare; depende sempre do volume de calda que a máquina vai aplicar.
              </span>
            </div>
          </div>
        </section>

        {/* 2. As Variáveis de Campo (O que medir no terreno?) */}
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3CA64C]" />
            <span>2. As Variáveis de Campo (O que medir no terreno?)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-[#114037] font-mono font-black block mb-1">
                h (Altura Tratada):
              </strong>
              <span className="text-slate-600">
                A altura da faixa vertical que vai efetivamente pulverizar (ex: apenas a zona dos
                cachos). Não é a altura total da planta!
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-[#114037] font-mono font-black block mb-1">
                w (Largura da Copa):
              </strong>
              <span className="text-slate-600">
                A espessura da copa, medida a meio da altura tratada (uma vez que a largura varia
                com a altura).
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-[#114037] font-mono font-black block mb-1">
                r (Entrelinha):
              </strong>
              <span className="text-slate-600">
                A distância entre o centro de uma linha e o centro da linha seguinte.{' '}
                <strong>Regra para linhas duplas:</strong> Meça desde o centro de um grupo de linhas
                até ao centro do grupo seguinte.
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <strong className="text-[#114037] font-mono font-black block mb-1">
                SF (Fator de Forma):
              </strong>
              <span className="text-slate-600">
                Fator de ajuste de volume para árvores que não são um bloco retangular (ex: copas
                globulares arredondadas).
              </span>
            </div>
          </div>
        </section>

        {/* 3. Superfície vs. Volume (LWA vs. TRV) */}
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            3. Superfície vs. Volume (LWA vs. TRV)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <strong className="text-emerald-950 font-black block">
                LWA (Treated Leaf Wall Area):
              </strong>
              <p className="text-emerald-900">
                Encare a copa como duas paredes verticais tratadas. É a abordagem ideal para
                culturas em sebe/parede contínua (ex: vinha, pomares em sebe). Quanto maior a altura
                tratada ou menor a entrelinha, maior o LWA real da sua parcela.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
              <strong className="text-sky-950 font-black block">
                TRV (Tree Row Volume):
              </strong>
              <p className="text-sky-900">
                Adiciona a 3ª dimensão (largura). É o método ideal para copas globulares (ex:
                fruteiras isoladas, citrinos tradicionais), calculando o volume 3D da copa por
                hectare.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Dose de Produto vs. Volume de Calda (Risco de Escorrimento) */}
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>4. Dose de Produto vs. Volume de Calda (Risco de Escorrimento)</span>
          </h3>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 leading-relaxed">
            O rótulo dita a <strong>Dose</strong> (quantidade de substância ativa necessária para
            proteger a cultura). Mas o <strong>Volume de Calda</strong> (a quantidade de água usada
            como veículo) tem de se ajustar à máquina e à copa. Aplicar um volume excessivo (ex:
            &ldquo;lavar&rdquo; as folhas até pingar, usando mais de 1000 L/ha sem necessidade) não
            melhora a eficácia; provoca o escorrimento do produto para o solo, gerando poluição e
            perda da proteção.
          </div>
        </section>

        {/* 5. Sistemas de Apoio à Decisão (DSS) */}
        <section className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
          <h3 className="text-sm sm:text-base font-black text-[#114037]">
            5. Sistemas de Apoio à Decisão (DSS)
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            A eficiência da aplicação depende fortemente da tecnologia do pulverizador (bicos,
            ventilador, tipo de fluxo). Para otimizar não só a dose de produto, mas também encontrar
            o volume de calda ideal sem escorrimento, recomenda-se o uso de ferramentas DSS.
          </p>
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-emerald-950">
              Para calibração tecnológica avançada, sugerimos a plataforma oficial{' '}
              <strong>DOSAVIÑA</strong> (Universidade Politécnica da Catalunha):
            </span>
            <a
              href="https://dosavina.upc.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#114037] hover:bg-[#19584b] text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
            >
              <span>Aceder ao DOSAVIÑA</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8ffa94]" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
