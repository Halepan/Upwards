// sync_engine.ts
import { db, type BaseEntity, type SyncQueueEntry } from '../lib/db'
import { supabase } from '../lib/supabase'
import type { ISyncEngine } from './isync_engine'
import type { IConflictResolve } from '../service/iconflict_resolver'
import { LastWriteWinsResolver } from '../service/last_write_wins_resolver'

const MAX_SYNC_ATTEMPTS = 5

// Solo tablas con user_id (UUID)
const TABLE_MAPPING: Record<string, string> = {
  users: 'users',
  accounts: 'accounts',
  income_entries: 'income_entries',
  expense_entries: 'expense_entries',
  auto_percent_rules: 'auto_percent_rules',
  habits: 'habits',
  habit_logs: 'habit_logs',
  weeks: 'weeks',
  habit_week_plans: 'habit_week_plans',
  exercises: 'exercises',
  routines: 'routines',
  // Tablas puente sin user_id directo (se sincronizan a través de routines)
  // routine_exercises: 'routine_exercises',
  // routine_logs: 'routine_logs',
  // routine_log_details: 'routine_log_details',
  body_measurements: 'body_measurements',
  biometric_metrics: 'biometric_metrics',
}

export class SyncEngine implements ISyncEngine {
  private userUuid: string
  private conflictResolver: IConflictResolve<any>

  constructor(userUuid: string, conflictResolver?: IConflictResolve<any>) {
    this.userUuid = userUuid
    this.conflictResolver = conflictResolver ?? new LastWriteWinsResolver()
  }

  async enqueue(operation: string, table: string, record: BaseEntity): Promise<void> {
    await db.sync_queue.add({
      operation: operation as SyncQueueEntry['operation'],
      table_name: table,
      record_id: record.id!,
      record_uuid: record.uuid,
      payload: { ...record },
      timestamp: new Date().toISOString(),
      attempts: 0,
    })
  }

  async processQueue(): Promise<void> {
    const pendingEntries = await db.sync_queue.orderBy('timestamp').toArray()
    for (const entry of pendingEntries) {
      try {
        await this.processEntry(entry)
        await db.sync_queue.delete(entry.id!)
      } catch (error) {
        const attempts = entry.attempts + 1
        const lastError = error instanceof Error ? error.message : 'Error desconocido'
        await db.sync_queue.update(entry.id!, { attempts, last_error: lastError })
        if (attempts >= MAX_SYNC_ATTEMPTS) {
          await this.markAsConflict(entry)
          await db.sync_queue.delete(entry.id!)
        }
      }
    }
  }

  private async processEntry(entry: SyncQueueEntry): Promise<void> {
    const remoteTable = TABLE_MAPPING[entry.table_name]
    if (!remoteTable) throw new Error(`Tabla desconocida: ${entry.table_name}`)
    switch (entry.operation) {
      case 'create':
      case 'update': {
        const { error } = await supabase.from(remoteTable).upsert(entry.payload, { onConflict: 'uuid' })
        if (error) throw error
        break
      }
      case 'delete': {
        const { error } = await supabase.from(remoteTable).delete().eq('uuid', entry.record_uuid!)
        if (error) throw error
        break
      }
    }
  }

  private async markAsConflict(entry: SyncQueueEntry): Promise<void> {
    const table = db[entry.table_name as keyof typeof db] as any
    if (table?.update) {
      await table.update(entry.record_id, { sync_status: 'conflict' })
    } else {
      console.warn(`[SyncEngine] No se pudo marcar conflicto en ${entry.table_name}#${entry.record_id}: tabla sin método update`)
    }
  }

  async pullRemoteChanges(): Promise<void> {
    const tablesToSync = Object.keys(TABLE_MAPPING)
    for (const localTable of tablesToSync) {
      const remoteTable = TABLE_MAPPING[localTable]
      // ⚠️ Usa la columna correspondiente: si es 'user_uuid', cámbiala
      const { data: remoteRecords, error } = await supabase
        .from(remoteTable)
        .select('*')
        .eq('user_id', this.userUuid)   // Ahora es UUID

      if (error) {
        console.error(`Error pulling ${remoteTable}:`, error.message)
        continue
      }
      if (!remoteRecords || remoteRecords.length === 0) continue
      for (const remoteRecord of remoteRecords) {
        await this.mergeRemoteRecord(localTable, remoteRecord)
      }
    }
  }

  private async mergeRemoteRecord(tableName: string, remoteRecord: any): Promise<void> {
    const localTable = db[tableName as keyof typeof db] as any
    if (!localTable?.where) return
    const existingLocal = await localTable.where('uuid').equals(remoteRecord.uuid).first()
    if (!existingLocal) {
      await localTable.add({ ...remoteRecord, sync_status: 'synced' })
    } else {
      const resolved = this.conflictResolver.resolve(existingLocal, remoteRecord)
      if (resolved !== existingLocal) {
        await localTable.put({ ...resolved, sync_status: 'synced' })
      }
    }
  }
}