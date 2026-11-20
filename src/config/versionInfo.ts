// src/config/versionInfo.ts
import manifestData from './releaseManifest.generated.json' with { type: 'json' };

export interface VersionInfo {
  name: string;
  releaseBase: string;
  envType: string;
  version: string;
  releaseDate: string;
  buildNumber: string;
  commitHash: string;
  canonicalPagesTag: string;
  canonicalRcTag: string;
  canonicalProdTag: string;
  changelog: readonly string[];
}

export const APP_VERSION_INFO: VersionInfo = {
  name: manifestData.name,
  releaseBase: manifestData.releaseBase,
  envType: manifestData.envType,
  version: manifestData.version,
  releaseDate: manifestData.releaseDate,
  buildNumber: manifestData.buildNumber,
  commitHash: manifestData.commitHash,
  canonicalPagesTag: manifestData.canonicalPagesTag,
  canonicalRcTag: manifestData.canonicalRcTag,
  canonicalProdTag: manifestData.canonicalProdTag,
  changelog: manifestData.changelog
};
