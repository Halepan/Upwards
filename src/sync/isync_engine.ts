import type { BaseEntity } from "../lib/db";

/* Interfaz del motor de sincronización offline-first.
   Encola operaciones locales, procesa la cola contra el remoto y trae cambios remotos. */
export interface ISyncEngine {
  enqueue(operation: string, table: string, record: BaseEntity): Promise<void>

  processQueue(): Promise<void>

  pullRemoteChanges(): Promise<void>
}