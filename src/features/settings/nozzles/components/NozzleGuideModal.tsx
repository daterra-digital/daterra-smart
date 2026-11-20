// src/features/settings/nozzles/components/NozzleGuideModal.tsx
import React from 'react';
import { X, BookOpen, CheckCircle } from 'lucide-react';

interface NozzleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPOLOGY_GUIDE_ITEMS = [
  ['1. Barra Horizontal 2D', 'Bicos uniformes por defeito (1 a 60 pontos), com opção de assistência de ar (manga de ar) para reduzir deriva em culturas arvenses.'],
  ['2. Ventilador Axial 3D', 'Distribuição perimetral (6 níveis simétricos de origem). Permite desativar a ventilação para modelar barras verticais estáticas sem alerta de subventilação.'],
  ['3. Ventilador Tangencial 3D', 'Duas colunas verticais paralelas com fluxo de ar laminar homogéneo de baixo para cima ao longo de toda a parede foliar.'],
  ['4. Ventilador Fluxo Cruzado 3D', 'Torre trapezoidal convergente no topo com 2 ou 4 setores e orientação configurável do jato (exterior, interior ou ambos).'],
  ['5. Túnel 3D', 'Pórtico contínuo com 4 rampas paralelas (2 à esquerda e 2 à direita) e painéis de recuperação de calda, minimizando perdas ambientais.'],
  ['6. Pneumático 3D', 'Turbina de ar de alta velocidade alimentando 2 difusores laterais inferiores e 2 braços articulados superiores ("mãos") com atomização pneumática.'],
  ['7. Canhão 3D', 'Cabeça articulada de longo alcance com cruzeta de bicos na boca principal e defletor secundário inferior para culturas de grande porte.'],
  ['8. Drone UAV', '2, 4, 6 ou 8 pontos sob downwash dos rotores, suportando bicos hidráulicos (BD) ou atomizadores centrífugos rotativos (CDA com RPM e Dv50).'],
  ['9. Manual', 'Configuração individual de 1 a 12 pistolas ou lanças ligadas a enrolador de mangueira, garantindo débito controlado e segurança de pressão.']
] as const;

export const NozzleGuideModal: React.FC<NozzleGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#114037] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#3CA64C]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3CA64C]">Guia Técnico</span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                9 Arquiteturas de Bicos &amp; Normas ISO 10625
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1.5">
            <h4 className="font-black text-[#114037] flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#3CA64C]" />
              Norma ISO 10625 &amp; Redução de Deriva (SDRT)
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Cada ponto ativo é selecionado diretamente da base de dados oficial DATERRA Smart (cor ISO ou conjunto difusor/pastilha), garantindo o cálculo rigoroso do débito real à pressão de trabalho.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-black text-slate-900 text-xs">As 9 Tipologias Oficiais de Pulverização</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              {TYPOLOGY_GUIDE_ITEMS.map(([title, desc]) => (
                <li key={title} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-[#114037]">{title}:</strong> {desc}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 bg-[#114037] hover:bg-[#1D734B] text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
