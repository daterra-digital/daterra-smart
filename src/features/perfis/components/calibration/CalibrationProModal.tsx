// src/features/perfis/components/calibration/CalibrationProModal.tsx
import React from 'react';
import { Award, CheckCircle2, FileText, Lock, ShieldCheck, X } from 'lucide-react';

interface CalibrationProModalProps {
  isOpen: boolean;
  requestedLabel?: string;
  onClose: () => void;
  onViewPlans: () => void;
}

const PRO_BENEFITS = [
  { icon: FileText, text: 'Relatórios PDF Auditáveis duais (Calibração Agronómica EPPO PP 1/239 & Inspeção Técnica EN ISO 16122)' },
  { icon: Award, text: 'Co-Branding Institucional no cabeçalho com o seu logótipo, contactos e paleta de 3 cores' },
  { icon: ShieldCheck, text: 'Selo criptográfico canónico SHA-256 e folha de assinatura pronta para auditorias GlobalG.A.P. e DGAV' }
] as const;

export const CalibrationProModal: React.FC<CalibrationProModalProps> = ({
  isOpen, requestedLabel, onClose, onViewPlans
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cal-pro-modal-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-[#114037] text-white p-5 flex items-start justify-between gap-3 border-b-4 border-[#3CA64C]">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3CA64C] text-white text-[10px] font-black uppercase tracking-wider">
              <Lock className="w-3 h-3" /> Funcionalidade Plano Pro
            </span>
            <h3 id="cal-pro-modal-title" className="text-base font-black leading-snug">
              Emissão Documental Auditável & Co-Branding
            </h3>
            {requestedLabel && (
              <p className="text-[11px] text-emerald-100/90">Documento selecionado: {requestedLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            A simulação agronómica e verificação hidráulica no ecrã permanecem <strong>100% disponíveis</strong>.
            A exportação de relatórios PDF formais com selo SHA-256 integra o pacote <strong>Pro</strong>:
          </p>

          <ul className="space-y-2.5">
            {PRO_BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <Icon className="w-4 h-4 text-[#1D734B] shrink-0 mt-0.5" />
                <span className="leading-snug font-medium">{text}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={onViewPlans}
              className="flex-1 min-h-[48px] px-4 rounded-2xl bg-[#3CA64C] hover:bg-[#359445] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer touch-target"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ver Planos Pro</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold cursor-pointer touch-target"
            >
              Continuar Simulação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
