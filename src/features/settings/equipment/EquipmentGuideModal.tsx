// src/features/settings/equipment/EquipmentGuideModal.tsx
import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, X } from 'lucide-react';

interface GuideItem {
  id: string;
  question: string;
  answer: string;
}

const EQUIPMENT_GUIDE_ITEMS: GuideItem[] = [
  {
    id: 'tipologias-2d-3d',
    question: 'Qual a diferença entre equipamentos 2D, 3D e UAV (Drone)?',
    answer:
      'As barras horizontais (2D) aplicam calda sobre culturas baixas ou solo. Os sistemas 3D (Axial, Fluxo Cruzado e Túnel) utilizam assistência de ar para transportar as gotas ao interior da parede foliar ou copa em pomares e vinhas. Os sistemas UAV (Drone) operam com volumes ultrabaixos e efeito aerodinâmico dos rotores.'
  },
  {
    id: 'caudal-ar-trv',
    question: 'Como é calculado o Caudal de Ar Ótimo em função do TRV?',
    answer:
      'Para pulverizadores 3D com assistência de ar, o caudal de ar ótimo (m³/h) é dimensionado em função do Volume da Copa (TRV em m³/ha) da parcela ativa e da velocidade de avanço (v em km/h), aplicando a relação agronómica Q_ar,ótimo = 0,10 × TRV × v. Uma margem de ±20% define a zona de ventilação ótima.'
  },
  {
    id: 'sub-sobre-ventilacao',
    question: 'Porque devo evitar a subventilação ou a sobreventilação?',
    answer:
      'A subventilação (< -20% do ótimo) não consegue vencer a resistência foliar, deixando o interior da copa desprotegido. A sobreventilação (> +20% do ótimo) atravessa a sebe em excesso, projetando produto fitofarmacêutico para fora do alvo e agravando o risco de deriva e perdas para o solo.'
  },
  {
    id: 'iso-16122-ipp',
    question: 'O que verifica a Pré-Inspeção segundo a norma ISO 16122?',
    answer:
      'A norma ISO 16122 estabelece os requisitos de inspeção periódica de pulverizadores em uso (IPP): manómetro legível e dentro da classe de erro, válvulas antigota estanque (paragem <= 5 segundos após fecho), variação de débito dos bicos <= 10% face ao nominal e integridade da bomba e filtros.'
  }
];

export interface EquipmentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EquipmentGuideModal: React.FC<EquipmentGuideModalProps> = ({ isOpen, onClose }) => {
  const [openId, setOpenId] = useState<string>('tipologias-2d-3d');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Guia Técnico — Equipamentos"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#114037] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#114037]">Guia Técnico</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Dimensionamento aerodinâmico e conformidade ISO 16122
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar Guia Técnico"
            className="min-w-[48px] min-h-[48px] rounded-2xl text-slate-500 hover:bg-slate-100 flex items-center justify-center touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {EQUIPMENT_GUIDE_ITEMS.map((item) => {
            const expanded = openId === item.id;
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenId(expanded ? '' : item.id)}
                  className="w-full min-h-[48px] px-4 py-3 text-left flex items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-100/70 text-xs font-bold text-slate-800"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                      expanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expanded && (
                  <div className="px-4 py-3 text-xs leading-relaxed text-slate-600 bg-white border-t border-slate-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] rounded-2xl bg-[#114037] hover:bg-[#195a4d] text-white text-xs font-extrabold touch-target"
          >
            Voltar aos Equipamentos
          </button>
        </div>
      </div>
    </div>
  );
};
