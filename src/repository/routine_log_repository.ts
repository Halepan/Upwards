import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { RoutineLog } from '../domain/routine_log'

export class RoutineLogRepository extends BaseDexieRepository<RoutineLog> {
  constructor(table: Table<RoutineLog, number>) {
    super(table)
  }

  async findByRoutineAndDate(routineId: number, date: string): Promise<RoutineLog | undefined> {
    return this.table.where({ routine_id: routineId, date }).first()
  }

  async findAllByRoutine(routineId: number): Promise<RoutineLog[]> {
    return this.table.where('routine_id').equals(routineId).toArray()
  }

  async getCompletedLogs(routineId: number): Promise<RoutineLog[]> {
    return this.table
      .where('routine_id').equals(routineId)
      .filter(log => log.completed)
      .toArray()
  }
}