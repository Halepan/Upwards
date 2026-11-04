// sync_engine.ts
import { db, type BaseEntity, type SyncQueueEntry } from '../lib/db'
import { supabase } from '../lib/supabase'
import type { ISyncEngine } from './isync_engine'
import type { IConflictResolve } from '../service/iconflict_resolver'
import { LastWriteWinsResolver } from '../service/last_write_wins_resolver'
//import type { BaseDexieRepository } from '../repository'

const MAX_SYNC_ATTEMPTS = 5

// Solo tablas que tienen una columna 'user_id' (o 'user_uuid') para filtrar por usuario
// Las tablas puente (routine_exercises, routine_logs, routine_log_details) NO están aquí
// porque su user_id se obtiene a través de la tabla padre (routines)
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
  routine_exercises: 'routine_exercises',
  routine_logs: 'routine_logs',
  routine_log_details: 'routine_log_details',
  body_measurements: 'body_measurements',
  biometric_metrics: 'biometric_metrics',
}

export class SyncEngine implements ISyncEngine {
  //private userUuid: string
  private conflictResolver: IConflictResolve<any>

  constructor(/*userUuid: string, */conflictResolver?: IConflictResolve<any>) {
    //this.userUuid = userUuid
    this.conflictResolver = conflictResolver ?? new LastWriteWinsResolver()
  }

  // ================================================================
  // ENCOLAR OPERACIÓN
  // ================================================================
// sync_engine.ts
  async enqueue(operation: string, table: string, record: BaseEntity, supabasePayload?: any): Promise<void> {
    console.log("estoy siendo encolada desde ", table,"para", operation)
    await db.sync_queue.add({
      operation: operation as SyncQueueEntry['operation'],
      table_name: table,
      record_id: record.id!,
      record_uuid: record.uuid,
      payload: supabasePayload || { ...record }, // ✅ priorizar el payload transformado
      timestamp: new Date().toISOString(),
      attempts: 0,
    })
}

  // ================================================================
  // PROCESAR COLA
  // ================================================================
  async processQueue(): Promise<void> {
    console.log("se empezo a procesar la cola")
    const pendingEntries = await db.sync_queue.orderBy('timestamp').toArray()

    // Priorizar la tabla 'users' para evitar conflictos de clave foránea
    const sorted = pendingEntries.sort((a, b) => {
      if (a.table_name === 'users') return -1
      if (b.table_name === 'users') return 1
      return 0
    })
    console.log("entro en el bucle")
    for (const entry of sorted) {
      try {
        await this.processEntry(entry)
        await db.sync_queue.delete(entry.id!)
      } catch (error) {
        const attempts = entry.attempts + 1
        const lastError = error instanceof Error ? error.message : 'Error desconocido'

        await db.sync_queue.update(entry.id!, {
          attempts,
          last_error: lastError,
        })

        if (attempts >= MAX_SYNC_ATTEMPTS) {
          await this.markAsConflict(entry)
          await db.sync_queue.delete(entry.id!)
          console.error(`[SyncEngine] Conflicto en ${entry.table_name}#${entry.record_id}: ${lastError}`)
        }
      }
    }
  }

  // ================================================================
  // PROCESAR UNA ENTRADA
  // ================================================================
  private async processEntry(entry: SyncQueueEntry): Promise<void> {
    const remoteTable = TABLE_MAPPING[entry.table_name]
    console.log("prooccesanding")
    if (!remoteTable) throw new Error(`Tabla desconocida: ${entry.table_name}`)

    // Obtener el objeto de la entidad desde el payload (es una instancia de la entidad)
    // Nota: el payload guardado en sync_queue es el objeto original, no el toDB().
    // Por lo tanto, debería tener el método toSupabase().
    const entity = entry.payload as any
    if (typeof entity.toSupabase !== 'function') {
      console.log("error por no tener metodo supabase")
      throw new Error(`La entidad ${entry.table_name} no tiene método toSupabase()`)
    }
    console.log("entity.toSupabase()")
    const supabasePayload = entity.toSupabase()
    switch (entry.operation) {
      case 'create':{
        const { error } = await supabase
          .from(remoteTable)
          .insert(supabasePayload)
        if (error) throw error
        break
      }
      case 'update': {
        const { error } = await supabase
          .from(remoteTable)
          .upsert(supabasePayload, { onConflict: 'id' })
        if (error) throw error
        break
      }
      case 'delete': {
        const { error } = await supabase
          .from(remoteTable)
          .delete()
          .eq('id', entry.record_uuid!)
        if (error) throw error
        break
      }
      default:
        throw new Error(`Operación desconocida: ${entry.operation}`)
    }
} 
  // ================================================================
  // MARCAR CONFLICTO
  // ================================================================
  private async markAsConflict(entry: SyncQueueEntry): Promise<void> {
    const table = db[entry.table_name as keyof typeof db] as any
    if (table?.update) {
      await table.update(entry.record_id, { sync_status: 'conflict' })
    } else {
      console.warn(
        `[SyncEngine] No se pudo marcar conflicto en ${entry.table_name}#${entry.record_id}: tabla sin método update`
      )
    }
  }

  // ================================================================
  // TRAER CAMBIOS REMOTOS
  // ================================================================
  async pullRemoteChanges(): Promise<void> {
    const tablesToSync = Object.keys(TABLE_MAPPING)

    for (const localTable of tablesToSync) {
      const remoteTable = TABLE_MAPPING[localTable]

      // ⚠️ Usamos 'user_id' porque en Supabase la columna se llama así (tipo uuid)
      const { data: remoteRecords, error } = await supabase
        .from(remoteTable)
        .select('*')

      if (error) {
        console.error(`[SyncEngine] Error pulling ${remoteTable}:`, error.message)
        continue
      }

      if (!remoteRecords || remoteRecords.length === 0) continue

      for (const remoteRecord of remoteRecords) {
        await this.mergeRemoteRecord(localTable, remoteRecord)
      }
    }
  }

  // ================================================================
  // FUSIONAR REGISTRO REMOTO CON LOCAL
  // ================================================================
private async mergeRemoteRecord(tableName: string, remoteRecord: any): Promise<void> {
  const localTable = db[tableName as keyof typeof db] as any
  if (!localTable?.where) return

  // 🔥 Validar que el UUID remoto exista y sea un string válido
  const remoteUuid = remoteRecord.uuid ?? remoteRecord.id
  if (!remoteUuid || typeof remoteUuid !== 'string') {
    console.warn(`[SyncEngine] ⚠️ Registro sin UUID válido en ${tableName}:`, remoteRecord)
    return
  }

  try {
    const existingLocal = await localTable
      .where('uuid')
      .equals(remoteUuid)
      .first()

    if (!existingLocal) {
      // Nuevo registro: agregar con sync_status = 'synced'
      await localTable.add({
        ...remoteRecord,
        sync_status: 'synced',
      })
      console.log(`[SyncEngine] ✅ Nuevo registro en ${tableName}: ${remoteUuid}`)
    } else {
      // Conflicto: resolver con LastWriteWins
      const resolved = this.conflictResolver.resolve(existingLocal, remoteRecord)
      if (resolved !== existingLocal) {
        await localTable.put({
          ...resolved,
          sync_status: 'synced',
        })
        console.log(`[SyncEngine] 🔄 Actualizado registro en ${tableName}: ${remoteUuid}`)
      }
    }
  } catch (error) {
    console.error(`[SyncEngine] ❌ Error al fusionar registro en ${tableName}:`, error)
  }
}}