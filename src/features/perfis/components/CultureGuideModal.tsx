// src/features/perfis/components/CultureGuideModal.tsx
// Modal didático "Guia Técnico" do perfil Cultura (PT-PT estrito, <= 200 LOC, zero perda de rascunho).

import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, X } from 'lucide-react';

interface GuideItem {
  id: string;
  question: string;
  answer: string;
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    id: 'area-optional',
    question: 'Porque é que a área da parcela é opcional?',
    answer:
      'Para registar uma cultura e planear tratamentos com base na parede foliar (LWA) ou volume de copa (TRV), nem sempre precisa da área exata no primeiro momento. A área nunca é inventada automaticamente: quando indicada, é usada para estimar calda total ou produto fitofarmacêutico necessário.'
  },
  {
    id: 'cascata-variedades',
    question: 'Como funciona a seleção de Variedade e opções locais?',
    answer:
      'Sempre que uma lista ainda não tenha opções oficiais validadas para a cultura escolhida, pode adicionar a sua variedade, sistema ou estádio localmente. Fica assinalado como "Pendente" apenas para sua utilização privada nesta conta.'
  },
  {
    id: 'momentos-snapshots',
    question: 'O que são Momentos da cultura e porque se mantêm as datas antigas?',
    answer:
      'Cada observação de campo é guardada com data civil (DD-MM-AAAA) e fotografia própria das dimensões desse dia. Se alterar a entrelinha ou registar novos momentos mais tarde, os registos anteriores não perdem os seus valores históricos.'
  },
  {
    id: 'lwa-trv-faces',
    question: 'Qual a relação entre entrelinha, espessura da copa e faces tratadas?',
    answer:
      'O perfil da cultura guarda as dimensões físicas reais medidas no campo (entrelinha, altura, largura da copa) e calcula LWA e TRV de referência. Na Vinha em espaldeira, a largura ajuda a sugerir a classe de espessura LWA-V. A escolha entre 1 ou 2 faces tratadas depende da operação e é definida diretamente na calculadora.'
  },
  {
    id: 'oliveira-armazenamento',
    question: 'Como é mapeada a Oliveira e onde ficam os dados guardados?',
    answer:
      'Na Oliveira, o sistema de condução ("Sebe contínua" ou "Vaso / globo") permite associar o perfil aos motores de cálculo EPPO correspondentes. Os dados são armazenados localmente no dispositivo com isolamento por conta e permanecem sujeitos à política atual de encerramento de sessão em dispositivos partilhados.'
  }
];

export interface CultureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CultureGuideModal: React.FC<CultureGuideModalProps> = ({ isOpen, onClose }) => {
  const [openId, setOpenId] = useState<string>('area-optional');

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
        aria-label="Guia Técnico — Cultura"
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
              <p className="text-[11px] text-slate-500 font-medium">Apoio ao preenchimento do perfil Cultura</p>
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
          {GUIDE_ITEMS.map((item) => {
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
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
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
            Voltar ao formulário
          </button>
        </div>
      </div>
    </div>
  );
};
