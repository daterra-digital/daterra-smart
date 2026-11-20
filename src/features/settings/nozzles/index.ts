// src/features/settings/nozzles/index.ts
export { NozzleSection } from './NozzleSection';
export {
  listScopedNozzleProfiles,
  saveScopedNozzleProfile,
  deleteScopedNozzleProfile
} from './services/nozzleProfileStorage';
export {
  buildNozzleAiContextSummary,
  buildNozzleAiItem,
  type NozzleAiContextItem
} from './services/nozzleAiContextService';
