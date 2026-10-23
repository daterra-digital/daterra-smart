import React, { useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  ShieldAlert,
  Droplets,
  Gauge,
  CheckSquare
} from 'lucide-react';

export interface PreInspectionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreInspectionGuideModal: React.FC<PreInspectionGuideModalProps> = ({
  isOpen,
  onClose
}) => {
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
      aria-labelledby="pre-inspection-guide-title"
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
                Microlearning Oficial • DGAV & ISO 16122
              </span>
              <h2
                id="pre-inspection-guide-title"
                className="text-lg sm:text-xl font-black text-[#114037] leading-tight"
              >
                Guia Técnico de Pré-Inspeção de Pulverizadores
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

        {/* Enquadramento Introdutório */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#114037] text-white space-y-1.5 shadow-xs">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-100 font-medium">
            <strong className="text-[#8ffa94] font-black">
              Inspeção Periódica Obrigatória (Decreto-Lei n.º 26/2017 & ISO 16122):
            </strong>{' '}
            A preparação prévia na exploração evita reprovações desnecessárias no Centro de Inspeção
            Periódica de Pulverizadores (IPP), garante a segurança do operador e assegura o rigor da
            aplicação de produtos fitofarmacêuticos.
          </p>
        </div>

        {/* Módulo 1 — Condições Prévias Obrigatórias de Limpeza */}
        <section className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>Módulo 1 — Condições Prévias Obrigatórias de Limpeza</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            É <strong>estritamente obrigatória a tripla lavagem externa e interna</strong> do
            pulverizador e do depósito antes de se deslocar ao Centro IPP. O equipamento deve ser
            apresentado abastecido até metade apenas com água limpa.
          </p>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
            <strong>Motivo de Recusa Imediata:</strong> A presença de lama acumulada, incrustações
            de calda no chassi, sedimentos ou odor a produto fitofarmacêutico no depósito impede a
            admissão à inspeção por risco de exposição química do inspetor e ocultação de fissuras.
          </div>
        </section>

        {/* Módulo 2 — Segurança Mecânica e Transmissão de Potência */}
        <section className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>Módulo 2 — Segurança Mecânica e Transmissão de Potência</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">
                Veio Telescópico de Cardans:
              </strong>
              <span className="text-slate-600">
                Cones plásticos, bainha tubular e correntes de fixação antirotação devem estar
                íntegros e presos a pontos estáticos. A rotação exposta reprova automaticamente a
                máquina.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">
                Resguardo do Veio Recetor e Ventilador:
              </strong>
              <span className="text-slate-600">
                Polias, correias e grelhas da turbina devem impedir o contacto acidental das mãos.
                Trincos de transporte das barras têm de garantir bloqueio mecânico rígido.
              </span>
            </div>
          </div>
        </section>

        {/* Módulo 3 — Circuito Hidráulico, Estanquidade e Depósito */}
        <section className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>Módulo 3 — Circuito Hidráulico, Estanquidade e Depósito</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">Pulsações da Bomba:</strong>
              <span className="text-slate-600">
                Tolerância máxima de oscilação de pressão <strong>≤ 10%</strong> à pressão nominal
                de trabalho.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">Tanque de Oscilação:</strong>
              <span className="text-slate-600">
                A pressão de ar no amortecedor da bomba deve situar-se entre{' '}
                <strong>30% a 70%</strong> (tipicamente 1/3) da pressão de serviço.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">Estanquidade Total:</strong>
              <span className="text-slate-600">
                Zero fugas admitidas no depósito, tampa, filtros, bomba ou mangueiras sob pressão
                máxima. Gotejamento ativo implica reprovação.
              </span>
            </div>
          </div>
        </section>

        {/* Módulo 4 — Comandos, Manómetros e Bicos */}
        <section className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>Módulo 4 — Comandos, Manómetros e Bicos</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">
                Manómetro e Regulação:
              </strong>
              <span className="text-slate-600">
                Diâmetro mínimo de <strong>63 mm</strong> (analógico), escala legível (divisão ≤ 0,2
                bar até 5 bar; ≤ 1 bar entre 5 e 20 bar) e estabilização da pressão em{' '}
                <strong>≤ 10 s</strong>.
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <strong className="text-[#114037] font-black block mb-1">
                Válvulas Antigota e Uniformidade:
              </strong>
              <span className="text-slate-600">
                Ausência total de gotejamento nos bicos após <strong>5 s</strong> do fecho geral;
                pontas idênticas (marca, modelo e calibre) e simetria bilateral de débito.
              </span>
            </div>
          </div>
        </section>

        {/* Módulo 5 — Checklist de Preparação Rápida (24h Antes) */}
        <section className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
          <h3 className="text-sm sm:text-base font-black text-[#114037] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#3CA64C] shrink-0" />
            <span>Módulo 5 — Checklist de Preparação Rápida (24h Antes da Inspeção)</span>
          </h3>
          <ul className="text-xs text-emerald-950 space-y-1.5 list-disc pl-5 font-medium leading-relaxed">
            <li>Executar tripla lavagem do depósito, filtros de aspiração/linha e exterior do chassi.</li>
            <li>Verificar integridade do resguardo do cardan, cones e correntes antirotação.</li>
            <li>Desmontar e limpar bicos e malhas filtrantes com escova macia (nunca objetos metálicos).</li>
            <li>Testar o equipamento com água limpa à pressão de trabalho e confirmar fecho antigota (&lt; 5 s).</li>
            <li>Levar o depósito abastecido a 50% com água limpa e o pulverizador acoplado ao trator habitual.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
