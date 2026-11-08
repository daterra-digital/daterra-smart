// src/config/versionInfo.ts
/**
 * Fonte Única de Verdade para Versionamento e Metadados de Release da DATERRA Smart
 * (< 200 LOC)
 */

export interface VersionInfo {
  name: string;
  version: string;
  releaseDate: string;
  buildNumber: string;
  commitHash: string;
  canonicalPagesTag: string;
  canonicalRcTag: string;
  canonicalProdTag: string;
}

export const APP_VERSION_INFO: VersionInfo = {
  name: 'DATERRA Smart',
  version: '1.0.1-rc1',
  releaseDate: '08/11/2026',
  buildNumber: '20261108.1',
  commitHash: '5f602d2',
  canonicalPagesTag: 'v1.0.0-pages',
  canonicalRcTag: 'v1.0.1-rc1',
  canonicalProdTag: 'v1.0.0-prod'
};
