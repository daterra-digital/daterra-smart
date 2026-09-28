/**
 * DATERRA Smart - Rodapé Permanente Smart Débito
 * Ficheiro: src/features/smart-debito/components/SmartDebitoFooter.tsx
 *
 * Exibe o logotipo oficial DATERRA, denominação DATERRA Smart, copyright,
 * endereço de email institucional e website oficial da DATERRA.
 *
 * REGRA ESTRITA: Termo interdito proibido. UI sem qualquer menção a "caudal".
 */

import React from 'react';
import daterraLogo from '../../../assets/daterra-logo.svg';

export const SmartDebitoFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-daterra-primary text-white border-t border-daterra-secondary/40 py-4 px-4 sm:px-6 lg:px-8 shrink-0 mt-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Lado Esquerdo: Logotipo + Marca */}
        <div className="flex items-center gap-3">
          <img
            src={daterraLogo}
            alt="DATERRA Logo"
            className="h-7 w-auto object-contain brightness-0 invert"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white leading-tight">
              DATERRA Smart
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              Auditoria & Calibração de Débito (ISO 16122)
            </span>
          </div>
        </div>

        {/* Centro: Direitos Reservados */}
        <div className="text-[11px] text-slate-300 font-medium text-center">
          © {currentYear} DATERRA Smart. Todos os direitos reservados.
        </div>

        {/* Lado Direito: Contactos e Website */}
        <div className="flex items-center gap-4 text-[11px] text-slate-200">
          <a
            href="mailto:suporte@daterra.com.pt"
            className="hover:text-daterra-accent transition-colors font-medium"
          >
            suporte@daterra.com.pt
          </a>
          <span className="text-white/30">·</span>
          <a
            href="https://daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-daterra-accent transition-colors font-bold underline-offset-2 hover:underline"
          >
            daterra.com.pt
          </a>
        </div>
      </div>
    </footer>
  );
};
