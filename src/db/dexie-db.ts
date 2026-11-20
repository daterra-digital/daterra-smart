// src/db/dexie-db.ts
import { db, DaterraDatabase, type DaterraDatabase as DaterraDB } from './db.ts';
import type { EquipmentRecord } from '../schemas/equipment.schema.ts';

/**
 * Schema Dexie v12: preserva integralmente todas as tabelas da v11
 * e adiciona a tabela canónica `equipments` sem sobrescrever nem eliminar dados.
 */
export { V12_STORES, V13_STORES } from './dbCultureMigration.ts';
export { db, DaterraDatabase };
export type { DaterraDB, EquipmentRecord };
