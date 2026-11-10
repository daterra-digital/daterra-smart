// src/utils/releasePolicy.ts
import {
  READY_TOOL_IDS,
  BLOCKED_TOOL_IDS_IN_PAGES,
  CANONICAL_TOOL_ROUTES,
  BLOCKED_PAGES_ROUTES,
  ROUTE_ALIASES
} from './releasePolicyRoutes.ts';

export {
  READY_TOOL_IDS,
  BLOCKED_TOOL_IDS_IN_PAGES,
  CANONICAL_TOOL_ROUTES,
  BLOCKED_PAGES_ROUTES,
  ROUTE_ALIASES
};

export type DaterraEnvironment = 'pages' | 'staging' | 'development';

export interface RouteResolution {
  status: 'allowed' | 'redirect' | 'blocked' | 'pass';
  target?: string;
  reason?: string;
  toolId?: string;
}

/**
 * Determina o ambiente ativo da aplicação com política restrita e fail-closed
 */
export const getDaterraEnvironment = (): DaterraEnvironment => {
  const metaEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const explicitEnv = metaEnv?.VITE_DATERRA_ENV as string | undefined;

  if (explicitEnv === 'pages' || explicitEnv === 'staging') {
    return explicitEnv;
  }
  if (explicitEnv === 'development') {
    // Em compilação de produção, rejeitar 'development' forçado
    if (!metaEnv?.DEV) return 'pages';
    return 'development';
  }

  // Em SSR ou ambientes sem DOM, fallback seguro fail-closed para 'pages'
  if (typeof window === 'undefined') return 'pages';

  // Overrides e deteção de localhost confinados ESTRITAMENTE ao modo de desenvolvimento/teste (npm run dev ou build test)
  const isTestOrDev = Boolean(metaEnv?.DEV) || metaEnv?.MODE === 'test';
  if (isTestOrDev) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const mockEnv = searchParams.get('mock_env') || localStorage.getItem('daterra_mock_env');
      if (mockEnv === 'pages' || mockEnv === 'staging' || mockEnv === 'development') {
        return mockEnv;
      }
    } catch {}
    const hostname = window.location.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      return 'development';
    }
  }

  // Em produção, mapear exclusivamente domínios de staging autorizados
  const hostname = window.location.hostname.toLowerCase();
  if (
    hostname === 'staging.daterra.com.pt' ||
    hostname === 'daterra-smart-staging.web.app' ||
    hostname === 'daterra-smart-staging.firebaseapp.com'
  ) {
    return 'staging';
  }

  // Fallback universal padrão estrito e fail-closed para GitHub Pages
  return 'pages';
};

/**
 * Normaliza um caminho URL removendo barras finais e convertendo para minúsculas
 */
export const normalizePathname = (path: string): string => {
  if (!path) return '/';
  const trimmed = path.trim().toLowerCase();
  const withoutTrailing = trimmed.replace(/\/+$/, '');
  return withoutTrailing === '' ? '/' : withoutTrailing;
};

/**
 * Verifica se uma ferramenta é permitida no ambiente fornecido
 */
export const isToolAllowedForEnv = (toolId: string, env: DaterraEnvironment): boolean => {
  if (env !== 'pages') return true;
  return READY_TOOL_IDS.has(toolId);
};

/**
 * Avalia uma rota e parâmetros sem utilizar startsWith, garantindo ausência de loops
 */
export const resolveReleaseRoute = (
  rawPath: string,
  rawSearch: string = '',
  env: DaterraEnvironment = getDaterraEnvironment()
): RouteResolution => {
  const pathname = normalizePathname(rawPath);
  const searchParams = new URLSearchParams(rawSearch);
  const queryTool = searchParams.get('tool');

  // 1. Módulo Assistente
  if (pathname === '/assistente') {
    if (env === 'pages') {
      return {
        status: 'blocked',
        target: '/dashboard',
        reason: 'Assistente indisponível em ambiente de publicação',
        toolId: 'assistente'
      };
    }
    return { status: 'allowed', toolId: 'assistente' };
  }

  // 2. Rota raiz de Ferramentas com parâmetro ?tool=
  if (pathname === '/ferramentas') {
    if (queryTool) {
      if (env === 'pages' && BLOCKED_TOOL_IDS_IN_PAGES.has(queryTool)) {
        return {
          status: 'blocked',
          target: '/ferramentas',
          reason: 'Ferramenta em desenvolvimento/avaliação bloqueada no Pages',
          toolId: queryTool
        };
      }
      if (queryTool === 'geometria_trv_copa') {
        return { status: 'redirect', target: '/ferramentas/volume-copa', toolId: 'calc_volume_copa' };
      }
      if (queryTool === 'calibracao_bicos') {
        return { status: 'redirect', target: '/ferramentas/comparador-bicos', toolId: 'comparador_bicos' };
      }
      return { status: 'allowed', toolId: queryTool };
    }
    return { status: 'pass' };
  }

  // 3. Verificação de rotas bloqueadas no Pages
  if (BLOCKED_PAGES_ROUTES[pathname]) {
    const toolId = BLOCKED_PAGES_ROUTES[pathname];
    if (env === 'pages') {
      return {
        status: 'blocked',
        target: '/ferramentas',
        reason: 'Ferramenta em desenvolvimento/avaliação bloqueada no Pages',
        toolId
      };
    }
    return { status: 'allowed', toolId };
  }

  // 4. Verificação de Aliases
  if (ROUTE_ALIASES[pathname]) {
    const canonicalTarget = ROUTE_ALIASES[pathname];
    if (canonicalTarget !== pathname) {
      return { status: 'redirect', target: canonicalTarget };
    }
  }

  // 5. Rotas Canónicas Aprovadas
  if (CANONICAL_TOOL_ROUTES[pathname]) {
    const toolId = CANONICAL_TOOL_ROUTES[pathname];
    return { status: 'allowed', toolId };
  }

  return { status: 'pass' };
};
