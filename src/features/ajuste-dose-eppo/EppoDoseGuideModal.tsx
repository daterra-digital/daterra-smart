import React, { useEffect } from 'react';
import { X, BookOpen, Layers, Target, ShieldCheck, Droplets } from 'lucide-react';
import { formatDidacticText } from '../../utils/formatDidacticText';

interface EppoDoseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_SECTIONS = [
  {
    icon: Target,
    title: '1. O que é o Método EPPO PP 1/239?',
    text: 'A norma europeia **EPPO PP 1/239** estabelece que a dose de **produto fitofarmacêutico** deve ser proporcional à área real da massa foliar (**LWA - Leaf Wall Area**). Ao contrário do modelo bidimensional clássico por hectare de solo, o método calcula a área vertical tratada, evitando subdosagens ou sobredosagens desnecessárias.'
  },
  {
    icon: Layers,
    title: '2. Tratamento Total vs Tratamento em Faixa',
    text: 'No **Tratamento Total**, a altura considerada cobre toda a vegetação da sebe. No **Tratamento em Faixa**, a altura corresponde unicamente à **faixa tratada** direcionada aos cachos ou à zona produtiva. A fórmula é: **LWA = (2 × Altura × 10 000) / Entrelinha**.'
  },
  {
    icon: Droplets,
    title: '3. Desacoplamento: Calda (Máquina) vs Dose (Cultura)',
    text: 'A **calda** necessária depende da eficiência e regulação do pulverizador (**L/ha calibrados**). A **dose de produto** depende estritamente da densidade foliar. Ajustar a dose não altera o volume de água do depósito, mas sim a **concentração de produto por 100 L de água**.'
  },
  {
    icon: ShieldCheck,
    title: '4. Regras de Segurança e DGAV',
    text: 'Nunca exceda a dose máxima autorizada no **rótulo oficial da DGAV**. Para estados fenológicos avançados com LWA superior à referência, a dose de produto por hectare não deve ultrapassar 100% da homologação legal sem validação técnica expressa.'
  }
];

export const EppoDoseGuideModal: React.FC<EppoDoseGuideModalProps> = ({ isOpen, onClose }) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] overflow-y-auto w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#114037] text-[#8ffa94] flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3CA64C] block">
                Manual Didático Integrado
              </span>
              <h2 id="eppo-guide-title" className="text-base sm:text-lg font-black text-[#114037]">
                Guia Oficial: Ajuste de Dose EPPO
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar guia"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {GUIDE_SECTIONS.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#1D734B] shrink-0" />
                  <h3 className="text-xs font-bold text-slate-900">{sec.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  {formatDidacticText(sec.text)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Normativa EPPO PP 1/239 • DATERRA Smart</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 bg-[#114037] hover:bg-[#16564a] text-white text-xs font-bold rounded-xl transition-all cursor-pointer touch-target"
          >
            Compreendi
          </button>
        </div>
      </div>
    </div>
  );
};
