import React from 'react';
import {
  Beaker,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface JarTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JarTestModal: React.FC<JarTestModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="jar-test-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="bg-[#114037] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#1D734B] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3CA64C]/20 border border-[#3CA64C]/40 flex items-center justify-center text-[#3AAA35] shrink-0">
              <Beaker className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#3AAA35]">
                Protocolo de Validação Prévia
              </span>
              <h3 id="jar-test-modal-title" className="text-base sm:text-lg font-black leading-tight text-white mt-0.5">
                Guia do Teste de Jarra (Jar Test)
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors touch-target flex items-center justify-center shrink-0"
            aria-label="Fechar guia do teste de jarra"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[72vh] scrollbar-thin text-slate-800 text-xs sm:text-sm leading-relaxed">
          {/* Introdução */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-1">
            <h4 className="font-extrabold text-sm text-[#114037]">O que é o Teste de Jarra?</h4>
            <p className="text-xs text-slate-700">
              É um ensaio em pequena escala (recipiente de 1 litro transparente) para verificar a <strong>compatibilidade física</strong> de múltiplos produtos antes de preparar centenas ou milhares de litros no pulverizador.
            </p>
          </div>

          {/* Procedimento Passo a Passo */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#114037] uppercase tracking-wide">
              Procedimento Passo a Passo (1 Litro de Calda)
            </h4>

            <div className="space-y-2.5">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#114037] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">Adicionar 500 mL de água da exploração:</strong>
                  Use a mesma água que será utilizada no pulverizador (com a mesma temperatura e origem) num frasco de vidro graduado de 1 L.
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#114037] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">Adicionar os produtos na sequência recomendada:</strong>
                  Respeite a ordem técnica calculada (Regulador pH/Dureza → Sólidos WP/WG → Suspensões SC → Emulsões EC → Soluções SL). Use uma seringa graduada para líquidos e uma balança de precisão para pós/grânulos proporcionais a 1 litro.
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#114037] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">Completar com água até à marca de 1 L:</strong>
                  Adicione os restantes 500 mL de água, feche o recipiente e inverta-o suavemente 10 a 15 vezes para simular a agitação do pulverizador.
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#114037] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">Adicionar os adjuvantes finais:</strong>
                  Introduza molhantes, espalhantes ou anti-deriva e agite suavemente mais 2 a 3 vezes.
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#114037] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <strong className="text-slate-900 block font-bold">Aguardar 15 a 30 minutos em repouso:</strong>
                  Deixe o frasco assentar à sombra e observe o comportamento da calda.
                </div>
              </div>
            </div>
          </div>

          {/* Como Avaliar o Resultado */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-[#114037] uppercase tracking-wide">
              Interpretação dos Resultados
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mistura Compatível (Aprovada)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  A calda mantém-se homogénea, com cor uniforme e sem sedimentos duros. Se houver ligeira separação por repouso, volta a homogeneizar-se facilmente com 2 a 3 inversões suaves.
                </p>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Mistura Incompatível (Reprovada)</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Ocorrência de <strong>floculação, grumos, separação de fases oleosas ("maionese"), precipitação cristalina no fundo, aquecimento espontâneo</strong> ou depósito gomoso que não se dissolve com agitação. <em>NÃO coloque no pulverizador!</em>
                </p>
              </div>
            </div>
          </div>

          {/* Aviso de Segurança EPI */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-950 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold block">Segurança do Operador:</strong>
              O teste de jarra envolve produtos puros concentrados. Use sempre luvas de nitrilo, óculos de proteção e realize o teste em local ventilado e afastado de animais e crianças. Descarte a mistura do teste de forma segura no depósito do pulverizador durante o tratamento.
            </div>
          </div>

          {/* Link Academia */}
          <div className="p-4 bg-gradient-to-r from-[#114037] to-[#1D734B] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3AAA35] block">
                Formação Contínua
              </span>
              <p className="text-xs text-slate-100 font-medium">
                Saiba mais sobre calibração e tecnologia de aplicação na Academia DATERRA.
              </p>
            </div>
            <a
              href="https://academia.daterra.com.pt"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-5 py-2.5 bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 active:scale-95 touch-target"
            >
              <span>Visitar Academia</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 bg-[#114037] hover:bg-[#1D734B] text-white font-bold text-xs rounded-xl transition-colors shadow-md touch-target"
          >
            Compreendido
          </button>
        </div>
      </div>
    </div>
  );
};
