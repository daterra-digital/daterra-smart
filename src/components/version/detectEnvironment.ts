// src/components/version/detectEnvironment.ts
import {
  ShieldCheck,
  Clock,
  Globe,
  Wrench,
  RotateCcw
} from 'lucide-react';
import { APP_VERSION_INFO } from '../../config/versionInfo.ts';

export type EnvironmentType = 'dev' | 'rc' | 'pages' | 'prod' | 'rollback';

export interface EnvironmentConfig {
  type: EnvironmentType;
  label: string;
  badgeClass: string;
  Icon: any;
  statusText: string;
  datePrefix: string;
  description: string;
  firebaseEnv: string;
  tag: string;
}

export function detectEnvironment(): EnvironmentConfig {
  if (typeof window === 'undefined') {
    return {
      type: 'pages',
      label: 'Homologação — GitHub Pages',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
      Icon: Globe,
      statusText: 'Disponível para validação pública',
      datePrefix: 'Publicada em',
      description: 'Esta versão está disponível para validação pública antes da publicação oficial em smart.daterra.com.pt.',
      firebaseEnv: 'Testes',
      tag: APP_VERSION_INFO.canonicalPagesTag
    };
  }

  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const isRollback = searchParams.get('rollback') === 'true';

  if (isRollback) {
    return {
      type: 'rollback',
      label: 'Rollback aplicado',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
      Icon: RotateCcw,
      statusText: 'Versão restaurada',
      datePrefix: 'Restaurada em',
      description: 'Esta versão foi restaurada a partir de uma versão anterior, devido a um problema detetado na versão anteriormente publicada.',
      firebaseEnv: hostname === 'smart.daterra.com.pt' ? 'Produção' : 'Testes',
      tag: APP_VERSION_INFO.canonicalPagesTag
    };
  }

  if (hostname === 'smart.daterra.com.pt') {
    return {
      type: 'prod',
      label: 'Produção',
      badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      Icon: ShieldCheck,
      statusText: 'Versão pública oficial',
      datePrefix: 'Publicada em',
      description: 'Esta é a versão pública oficial da DATERRA Smart.',
      firebaseEnv: 'Produção',
      tag: APP_VERSION_INFO.canonicalProdTag
    };
  }

  if (hostname.includes('github.io')) {
    return {
      type: 'pages',
      label: 'Homologação — GitHub Pages',
      badgeClass: 'bg-teal-50 text-teal-900 border-teal-300',
      Icon: Globe,
      statusText: 'Disponível para validação pública',
      datePrefix: 'Publicada em',
      description: 'Esta versão está disponível para validação pública antes da publicação oficial em smart.daterra.com.pt.',
      firebaseEnv: 'Testes',
      tag: APP_VERSION_INFO.canonicalPagesTag
    };
  }

  const isRc = window.location.port === '5175' ||
               import.meta.env?.MODE === 'rc' ||
               APP_VERSION_INFO.version.includes('-rc');

  if (isRc) {
    return {
      type: 'rc',
      label: 'Candidata a publicação',
      badgeClass: 'bg-amber-50 text-amber-950 border-amber-300',
      Icon: Clock,
      statusText: 'Pronta para validação final',
      datePrefix: 'Preparada em',
      description: 'Esta versão foi testada localmente e está preparada para publicação no GitHub Pages, após aprovação.',
      firebaseEnv: 'Testes',
      tag: APP_VERSION_INFO.canonicalRcTag
    };
  }

  return {
    type: 'dev',
    label: 'Desenvolvimento',
    badgeClass: 'bg-blue-50 text-blue-950 border-blue-300',
    Icon: Wrench,
    statusText: 'Em desenvolvimento e testes',
    datePrefix: 'Atualizado em',
    description: 'Esta é uma versão de trabalho. Pode conter funcionalidades em teste e não deve ser considerada estável.',
    firebaseEnv: 'Testes',
    tag: 'develop'
  };
}
