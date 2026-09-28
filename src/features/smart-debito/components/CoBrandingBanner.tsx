/**
 * DATERRA Smart - Banner de Co-Branding Configurável (3 Cores Dinâmicas)
 * Ficheiro: src/features/smart-debito/components/CoBrandingBanner.tsx
 *
 * Apresentado no topo da ferramenta e no cabeçalho do PDF oficial.
 * Cores configuráveis:
 * - primaryColor: fundo / destaques
 * - secondaryColor: linhas / botões / acentos
 * - textColor: texto principal e detalhes
 *
 * REGRAS ESTRITAS: Termos interditos excluídos. Na UI utiliza exclusivamente "débito".
 */

import React from 'react';
import { Building2, Phone, Mail, Globe, MapPin, Palette } from 'lucide-react';
import type { CoBrandingConfig } from '../types';

interface CoBrandingBannerProps {
  config: CoBrandingConfig;
  onOpenConfig: () => void;
  isPremium: boolean;
}

export const CoBrandingBanner: React.FC<CoBrandingBannerProps> = ({
  config,
  onOpenConfig,
  isPremium
}) => {
  if (!config.isEnabled && isPremium) {
    return (
      <div className="w-full bg-white border border-dashed border-slate-300 rounded-2xl p-3 flex items-center justify-between text-xs text-slate-500 mb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-daterra-primary" />
          <span>O Banner de Co-Branding personalizado encontra-se desativado.</span>
        </div>
        <button
          type="button"
          onClick={onOpenConfig}
          className="font-bold text-daterra-primary hover:underline text-xs"
        >
          Ativar e Configurar 3 Cores
        </button>
      </div>
    );
  }

  // Se for freemium (sem créditos), exibe aviso discreto sobre a desativação no PDF
  return (
    <div
      style={{
        backgroundColor: config.primaryColor,
        color: config.textColor,
        borderColor: config.secondaryColor
      }}
      className="w-full rounded-2xl p-3 sm:p-4 mb-3 border-2 shadow-xs transition-all relative overflow-hidden"
    >
      {/* Detalhe estético: Barra decorativa na cor secundária */}
      <div
        style={{ backgroundColor: config.secondaryColor }}
        className="absolute top-0 left-0 right-0 h-1"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Lado Esquerdo: Logotipo em Compartimento Branco + Identificação da Empresa */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{ borderColor: config.secondaryColor }}
            className="h-12 w-28 sm:h-14 sm:w-32 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-xs border border-white/40 overflow-hidden"
          >
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config.companyName}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Building2 className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Logo</span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                {config.companyName}
              </h2>
              {isPremium ? (
                <span
                  style={{
                    backgroundColor: config.secondaryColor,
                    color: config.textColor
                  }}
                  className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded shadow-xs"
                >
                  Co-Branding Ativo
                </span>
              ) : (
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                  Modo Freemium
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] opacity-85 mt-0.5 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>
                {config.address} · {config.postalCode}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Contactos Rápidos e Botão de Personalização */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-3 text-[11px] opacity-90">
            {config.phone && (
              <a
                href={`tel:${config.phone}`}
                className="flex items-center gap-1 hover:underline shrink-0"
              >
                <Phone className="w-3 h-3" />
                <span className="hidden md:inline">{config.phone}</span>
              </a>
            )}

            {config.email && (
              <a
                href={`mailto:${config.email}`}
                className="flex items-center gap-1 hover:underline shrink-0"
              >
                <Mail className="w-3 h-3" />
                <span className="hidden lg:inline">{config.email}</span>
              </a>
            )}

            {config.website && (
              <a
                href={
                  config.website.startsWith('http')
                    ? config.website
                    : `https://${config.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline shrink-0 font-semibold"
              >
                <Globe className="w-3 h-3" />
                <span className="hidden md:inline">{config.website}</span>
              </a>
            )}
          </div>

          {/* Botão de Ajuste das 3 Cores e Dados */}
          <button
            type="button"
            onClick={onOpenConfig}
            style={{
              borderColor: config.secondaryColor,
              backgroundColor: 'rgba(255, 255, 255, 0.15)'
            }}
            className="py-1 px-2 text-[10px] font-bold rounded-lg border hover:bg-white/25 transition-colors flex items-center gap-1 shrink-0 ml-auto sm:ml-0"
            title="Configurar Logotipo, Dados e Paleta de 3 Cores"
          >
            <Palette className="w-3 h-3" />
            <span>Configurar Cores & Dados</span>
          </button>
        </div>
      </div>
    </div>
  );
};
