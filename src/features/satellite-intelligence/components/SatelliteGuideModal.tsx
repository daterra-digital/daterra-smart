import React from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SatelliteGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl text-slate-300">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#3CA64C]" />
            <h3 className="text-base font-bold text-white">Manual Técnico: NDVI & Satélite Copernicus</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-xs leading-relaxed">
          <section>
            <h4 className="font-bold text-[#3CA64C] text-sm mb-1">
              1. O que é o NDVI (Normalized Difference Vegetation Index)?
            </h4>
            <p>
              O NDVI quantifica a densidade e vigor da biomassa verde medindo o contraste entre a reflexão no infravermelho próximo (NIR) e a absorção no vermelho (Red) pela clorofila:
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl font-mono text-[11px] text-center my-2 text-white border border-slate-800">
              NDVI = (NIR - RED) / (NIR + RED)
            </div>
            <p>
              Em culturas agrícolas, valores &gt; 0.65 indicam plantas sãs e vegetação densa; valores entre 0.35 e 0.50 apontam para menor desenvolvimento foliar ou stress hídrico; valores &lt; 0.20 correspondem a solo exposto.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#3CA64C] text-sm mb-1">
              2. Sentinel-2 (10m) vs Sentinel-3 (300m)
            </h4>
            <p>
              Para a escala de parcelas agrícolas em Portugal (vinha, olival, pomares e hortícolas), o DATERRA Smart recorre aos sensores multiespectrais do <strong>Sentinel-2 (Copernicus CDSE)</strong> com resolução de 10 metros por pixel. A resolução global de 300m do Sentinel-3 destina-se apenas a monitorização macrorregional de biomas.
            </p>
          </section>

          <section>
            <h4 className="font-bold text-[#3CA64C] text-sm mb-1">
              3. Princípio de Modulação de Calda (DGAV / EPPO PP 1/239)
            </h4>
            <p>
              As diretrizes oficiais da DGAV e normas europeias EPPO determinam que o débito de pulverização e a quantidade de produto fitofarmacêutico devem ser ajustados à área de parede foliar (LWA). O NDVI funciona como estimador de biomassa em tempo real, permitindo poupanças substanciais de calda e redução do escorrimento para o solo.
            </p>
          </section>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-[#114037] hover:bg-[#1D734B] text-white font-bold py-3 rounded-xl border border-[#3CA64C]/50 text-xs flex items-center justify-center gap-1.5 touch-target"
        >
          <CheckCircle2 className="w-4 h-4 text-[#3CA64C]" />
          Entendido • Fechar Guia
        </button>
      </div>
    </div>
  );
};
