/**
 * DATERRA Smart - Modal de Configuração de Co-Branding (3 Cores)
 * Ficheiro: src/features/smart-debito/components/CoBrandingModal.tsx
 *
 * Permite editar dados da empresa, carregar logotipo (Base64 offline)
 * e ajustar a paleta de 3 cores (Primária, Secundária e Texto).
 *
 * REGRAS ESTRITAS: Termos interditos excluídos. Na UI utiliza exclusivamente "débito".
 */

import React, { useState } from 'react';
import { X, Palette, Image, Building, Check } from 'lucide-react';
import type { CoBrandingConfig } from '../types';

interface CoBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CoBrandingConfig;
  onSave: (updated: Partial<CoBrandingConfig>) => void;
}

const PRESET_PALETTES = [
  {
    name: 'DATERRA Clássico',
    primary: '#114037',
    secondary: '#3CA64C',
    text: '#FFFFFF'
  },
  {
    name: 'AgroTec Azul Imperial',
    primary: '#0F2942',
    secondary: '#00A3E0',
    text: '#FFFFFF'
  },
  {
    name: 'Agrícola Ouro & Terra',
    primary: '#2C1D11',
    secondary: '#D4AF37',
    text: '#FFFFFF'
  },
  {
    name: 'Vinha Borgonha',
    primary: '#4A1525',
    secondary: '#E65C00',
    text: '#FFFFFF'
  },
  {
    name: 'Modern Clean Slate',
    primary: '#1E293B',
    secondary: '#10B981',
    text: '#FFFFFF'
  }
];

export const CoBrandingModal: React.FC<CoBrandingModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [form, setForm] = useState<CoBrandingConfig>({ ...config });

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUri = evt.target?.result as string;
      if (dataUri) {
        setForm((prev) => ({ ...prev, logoUrl: dataUri }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPalette = (palette: (typeof PRESET_PALETTES)[0]) => {
    setForm((prev) => ({
      ...prev,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      textColor: palette.text
    }));
  };

  const handleSaveAndClose = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Topo do Modal */}
        <div className="bg-daterra-primary text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-xl">
              <Palette className="w-4 h-4 text-daterra-accent" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">
                Personalização de Co-Branding
              </h2>
              <p className="text-[10px] text-slate-300">
                Configure os dados da sua empresa e a paleta de 3 cores dinâmicas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Scrollável */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Pré-visualização do Banner em Tempo Real */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Pré-visualização do Banner
            </label>
            <div
              style={{
                backgroundColor: form.primaryColor,
                color: form.textColor,
                borderColor: form.secondaryColor
              }}
              className="rounded-xl p-3 border-2 shadow-xs transition-all relative overflow-hidden"
            >
              <div
                style={{ backgroundColor: form.secondaryColor }}
                className="absolute top-0 left-0 right-0 h-1"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    style={{ borderColor: form.secondaryColor }}
                    className="h-9 w-20 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 shadow-xs border border-white/40 overflow-hidden"
                  >
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Building className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Logo</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs truncate">
                      {form.companyName || 'Nome da Sua Empresa'}
                    </h4>
                    <p className="text-[10px] opacity-80 truncate">
                      {form.address || 'Morada'}, {form.postalCode || 'Código-Postal'}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: form.secondaryColor,
                    color: form.textColor
                  }}
                  className="text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs"
                >
                  3 Cores
                </span>
              </div>
            </div>
          </div>

          {/* Seletor Dinâmico de 3 Cores */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                Paleta de 3 Cores Dinâmicas
              </span>
              <span className="text-[9px] text-slate-400">HEX ou Seletor</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Cor Primária */}
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-600 mb-1">
                  1. Primária (Fundo)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, primaryColor: e.target.value }))
                    }
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, primaryColor: e.target.value }))
                    }
                    className="w-full text-[10px] font-mono font-bold uppercase py-0.5 px-1 border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Cor Secundária */}
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-600 mb-1">
                  2. Secundária (Acentos)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, secondaryColor: e.target.value }))
                    }
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                  />
                  <input
                    type="text"
                    value={form.secondaryColor}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, secondaryColor: e.target.value }))
                    }
                    className="w-full text-[10px] font-mono font-bold uppercase py-0.5 px-1 border border-slate-300 rounded"
                  />
                </div>
              </div>

              {/* Cor de Texto */}
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <label className="block text-[9px] font-bold text-slate-600 mb-1">
                  3. Texto
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={form.textColor}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, textColor: e.target.value }))
                    }
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 shrink-0"
                  />
                  <input
                    type="text"
                    value={form.textColor}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, textColor: e.target.value }))
                    }
                    className="w-full text-[10px] font-mono font-bold uppercase py-0.5 px-1 border border-slate-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Sugestões Rápidas de Paletas */}
            <div>
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sugestões Rápidas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PALETTES.map((palette) => (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => handleApplyPalette(palette)}
                    className="py-1 px-2 rounded-lg text-[10px] font-semibold bg-white border border-slate-300 hover:border-daterra-primary text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <span
                      style={{ backgroundColor: palette.primary }}
                      className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                    />
                    <span
                      style={{ backgroundColor: palette.secondary }}
                      className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                    />
                    <span>{palette.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dados Cadastrais da Empresa */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, companyName: e.target.value }))
                }
                placeholder="Ex: AgroTec Soluções Agrícolas"
                className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-daterra-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Morada
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Rua ou Zona Industrial"
                  className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Código-Postal e Localidade
                </label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, postalCode: e.target.value }))
                  }
                  placeholder="Ex: 2000-001 Santarém"
                  className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+351 243 000 000"
                  className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="contacto@empresa.pt"
                  className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={form.website}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, website: e.target.value }))
                  }
                  placeholder="www.empresa.pt"
                  className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Logotipo da Empresa */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Logotipo da Empresa (PNG, JPG, SVG)
              </label>
              <div className="flex items-center gap-2">
                <label className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 cursor-pointer flex items-center gap-1.5 text-xs transition-colors">
                  <Image className="w-3.5 h-3.5 text-daterra-primary" />
                  <span>Carregar Ficheiro</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: null }))}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remover Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-100 p-3.5 px-4 flex items-center justify-between border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-3 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="py-1.5 px-4 bg-daterra-primary hover:bg-daterra-primary-hover text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Configuração</span>
          </button>
        </div>
      </div>
    </div>
  );
};
