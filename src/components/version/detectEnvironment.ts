// src/components/version/detectEnvironment.ts
import { ShieldCheck, Clock, Globe, Wrench, RotateCcw } from 'lucide-react';
import { APP_VERSION_INFO } from '../../config/versionInfo.ts';

export type EnvironmentType = 'dev' | 'rc' | 'pages' | 'prod' | 'rollback';

export interface EnvironmentConfig {
  type: EnvironmentType;
  label: string;
  badgeClass: string;
  Icon: typeof Globe;
  statusText: string;
  datePrefix: string;
  description: string;
  firebaseEnv: string;
  tag: string;
  version: string;
  canonicalUrl: string;
}

export function detectEnvironment(): EnvironmentConfig {
  const base = APP_VERSION_INFO.releaseBase;
  if (typeof window === 'undefined') {
    return {
      type: 'pages', label: 'Homologação — GitHub Pages', badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
      Icon: Globe, statusText: 'Disponível para validação pública', datePrefix: 'Publicada em',
      description: 'Esta versão está disponível para validação pública antes da publicação oficial em smart.daterra.com.pt.',
      firebaseEnv: 'Testes', tag: APP_VERSION_INFO.canonicalPagesTag,
      version: `${base}-pages`, canonicalUrl: 'https://daterra-digital.github.io/daterra-smart/'
    };
  }

  const hostname = window.location.hostname.toLowerCase();
  const isRollback = new URLSearchParams(window.location.search).get('rollback') === 'true';

  if (isRollback) {
    const isProdHost = hostname === 'smart.daterra.com.pt';
    return {
      type: 'rollback', label: 'Rollback aplicado', badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
      Icon: RotateCcw, statusText: 'Versão restaurada', datePrefix: 'Restaurada em',
      description: 'Esta versão foi restaurada a partir de uma release anterior.',
      firebaseEnv: isProdHost ? 'Produção' : 'Testes', tag: APP_VERSION_INFO.canonicalPagesTag,
      version: APP_VERSION_INFO.version, canonicalUrl: window.location.origin
    };
  }

  if (hostname === 'smart.daterra.com.pt') {
    return {
      type: 'prod', label: 'Produção Oficial — DATERRA Smart', badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      Icon: ShieldCheck, statusText: 'Versão oficial ativa', datePrefix: 'Publicada em',
      description: 'Esta é a versão oficial ativa em produção da DATERRA Smart.',
      firebaseEnv: 'Produção', tag: APP_VERSION_INFO.canonicalProdTag,
      version: `${base}-prod`, canonicalUrl: 'https://smart.daterra.com.pt'
    };
  }

  if (hostname.includes('github.io')) {
    return {
      type: 'pages', label: 'Homologação — GitHub Pages', badgeClass: 'bg-teal-50 text-teal-900 border-teal-300',
      Icon: Globe, statusText: 'Disponível para validação pública', datePrefix: 'Publicada em',
      description: 'Esta versão está disponível para validação pública antes da publicação oficial em smart.daterra.com.pt.',
      firebaseEnv: 'Testes', tag: APP_VERSION_INFO.canonicalPagesTag,
      version: `${base}-pages`, canonicalUrl: 'https://daterra-digital.github.io/daterra-smart/'
    };
  }

  const isRc = window.location.port === '5175' || import.meta.env?.MODE === 'rc' || APP_VERSION_INFO.version.includes('-rc');
  if (isRc) {
    return {
      type: 'rc', label: 'Candidata a publicação', badgeClass: 'bg-amber-50 text-amber-950 border-amber-300',
      Icon: Clock, statusText: 'Pronta para validação final', datePrefix: 'Preparada em',
      description: 'Versão candidata testada localmente e pronta para validação em GitHub Pages.',
      firebaseEnv: 'Testes', tag: APP_VERSION_INFO.canonicalRcTag,
      version: `${base}-rc`, canonicalUrl: window.location.origin
    };
  }

  return {
    type: 'dev', label: 'Desenvolvimento', badgeClass: 'bg-blue-50 text-blue-950 border-blue-300',
    Icon: Wrench, statusText: 'Em desenvolvimento e testes', datePrefix: 'Atualizado em',
    description: 'Versão de trabalho em desenvolvimento e testes contínuos.',
    firebaseEnv: 'Testes', tag: 'develop',
    version: `${base}-dev`, canonicalUrl: window.location.origin
  };
}
