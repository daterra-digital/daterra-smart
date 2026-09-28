/**
 * DATERRA Smart - Gestão de Persistência de Co-Branding (SaaS / Definições)
 * Ficheiro: src/features/smart-debito/coBrandingStorage.ts
 *
 * Providencia persistência unificada de Co-Branding para as Definições do Utilizador
 * e as ferramentas da suite agrícola (como o Smart Débito).
 *
 * REGRAS ESTRITAS: Termos interditos estritamente excluídos.
 */

import type { CoBrandingConfig } from './types';

export const CO_BRANDING_STORAGE_KEY = 'daterra_cobranding_config';

export const DEFAULT_CO_BRANDING: CoBrandingConfig = {
  isEnabled: true,
  companyName: 'AgroTec Serviços & Calibração Lda',
  logoUrl: null,
  address: 'Zona Industrial Lote 14',
  postalCode: '2000-001 Santarém, Portugal',
  phone: '+351 243 000 111',
  email: 'engenharia@agrotec-servicos.pt',
  website: 'www.agrotec-servicos.pt',
  // Paleta dinâmica de 3 cores
  primaryColor: '#114037',    // Cor Principal para fundo/destaques
  secondaryColor: '#3CA64C',  // Cor Secundária para botões/linhas/acentos
  textColor: '#FFFFFF'        // Cor de Texto
};

export const PRESET_CO_BRANDING_PALETTES = [
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

/**
 * Lê a configuração de Co-Branding persistida no localStorage ou devolve a pré-definida.
 */
export function getStoredCoBrandingConfig(): CoBrandingConfig {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_CO_BRANDING;
    }
    const saved = localStorage.getItem(CO_BRANDING_STORAGE_KEY);
    if (!saved) return DEFAULT_CO_BRANDING;
    return { ...DEFAULT_CO_BRANDING, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_CO_BRANDING;
  }
}

/**
 * Guarda a configuração de Co-Branding no localStorage.
 */
export function saveStoredCoBrandingConfig(config: CoBrandingConfig): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(CO_BRANDING_STORAGE_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.warn('[Co-Branding] Falha ao persistir configuração no localStorage:', e);
  }
}
