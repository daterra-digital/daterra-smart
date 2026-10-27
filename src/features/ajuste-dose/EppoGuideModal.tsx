import React, { useEffect } from 'react';
import { X, BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { EppoGuideLabelExpressions } from './EppoGuideLabelExpressions';

export interface EppoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EppoGuideModal: React.FC<EppoGuideModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

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
                {t('ajusteDose.guide.tag', 'Manual de Calibração Agronómica')}
              </span>
              <h2
                id="eppo-guide-title"
                className="text-lg sm:text-xl font-black text-[#114037] leading-tight"
              >
                {t('ajusteDose.guide.title', 'Guia EPPO PP 1/239')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.closeGuide', 'Fechar guia')}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Texto Introdutório */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#114037] text-white space-y-2 shadow-xs">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-100 font-medium">
            <strong className="text-[#8ffa94] font-black">
              {t('ajusteDose.guide.introHeading', '1 hectare de terreno (área de superfície) não equivale a 1 hectare de alvo a tratar.')}
            </strong>{' '}
            {t(
              'ajusteDose.guide.introBody',
              'Duas parcelas com a mesma área de superfície podem ter volumes de copa completamente diferentes. Aplicar uma dose "cega" baseada apenas na área de superfície gera dois problemas graves: Sobredosagem em pomares jovens (desperdício financeiro, poluição e excesso de resíduos) e Subdosagem em pomares adultos (falta de eficácia e criação de resistências nas pragas/doenças). A norma EPPO ajusta a dose à arquitetura real da copa.'
            )}
          </p>
        </div>

        {/* 1 e 2: Formas de Expressão e Variáveis de Campo */}
        <EppoGuideLabelExpressions />

        {/* 3. Superfície vs. Volume (LWA vs. TRV) */}
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900">
            {t('ajusteDose.guide.lwaVsTrvTitle', '3. Superfície vs. Volume (LWA vs. TRV)')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <strong className="text-emerald-950 font-black block">
                {t('ajusteDose.guide.lwaBlockTitle', 'LWA (Treated Leaf Wall Area):')}
              </strong>
              <p className="text-emerald-900">
                {t(
                  'ajusteDose.guide.lwaBlockDesc',
                  'Encare a copa como duas paredes verticais tratadas. É a abordagem ideal para culturas em sebe/parede contínua (ex: vinha, pomares em sebe). Quanto maior a altura tratada ou menor a entrelinha, maior o LWA real da sua parcela.'
                )}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
              <strong className="text-sky-950 font-black block">
                {t('ajusteDose.guide.trvBlockTitle', 'TRV (Tree Row Volume):')}
              </strong>
              <p className="text-sky-900">
                {t(
                  'ajusteDose.guide.trvBlockDesc',
                  'Adiciona a 3ª dimensão (largura). É o método ideal para copas globulares (ex: fruteiras isoladas, citrinos tradicionais), calculando o volume 3D da copa por hectare.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 4. Dose de Produto vs. Volume de Calda */}
        <section className="space-y-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{t('ajusteDose.guide.runoffRiskTitle', '4. Dose de Produto vs. Volume de Calda (Risco de Escorrimento)')}</span>
          </h3>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 leading-relaxed">
            {t(
              'ajusteDose.guide.runoffRiskDesc',
              'O rótulo dita a Dose (quantidade de substância ativa necessária para proteger a cultura). Mas o Volume de Calda (a quantidade de água usada como veículo) tem de se ajustar à máquina e à copa. Aplicar um volume excessivo (ex: "lavar" as folhas até pingar, usando mais de 1000 L/ha sem necessidade) não melhora a eficácia; provoca o escorrimento do produto para o solo, gerando poluição e perda da proteção.'
            )}
          </div>
        </section>

        {/* 5. Sistemas de Apoio à Decisão (DSS) */}
        <section className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
          <h3 className="text-sm sm:text-base font-black text-[#114037]">
            {t('ajusteDose.guide.dssTitle', '5. Sistemas de Apoio à Decisão (DSS)')}
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {t(
              'ajusteDose.guide.dssDesc',
              'A eficiência da aplicação depende fortemente da tecnologia do pulverizador (bicos, ventilador, tipo de fluxo). Para otimizar não só a dose de produto, mas também encontrar o volume de calda ideal sem escorrimento, recomenda-se o uso de ferramentas DSS.'
            )}
          </p>
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-emerald-950">
              {t(
                'ajusteDose.guide.dosavinaNotice',
                'Para calibração tecnológica avançada, sugerimos a plataforma oficial DOSAVIÑA (Universidade Politécnica da Catalunha):'
              )}
            </span>
            <a
              href="https://dosavina.upc.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#114037] hover:bg-[#19584b] text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
            >
              <span>{t('ajusteDose.guide.dosavinaButton', 'Aceder ao DOSAVIÑA')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8ffa94]" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
