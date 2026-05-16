import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { RoutineLog as RoutineLogData } from '../lib/db'
import { RoutineLog } from '../domain/routine_log'

export class RoutineLogRepository extends BaseDexieRepository<RoutineLogData, RoutineLog> {
  constructor(table: Table<RoutineLogData, number>) {
    super(table)
  }

  protected fromDB(data: RoutineLogData): RoutineLog {
    return RoutineLog.fromDB(data)
  }

  protected toDB(domain: RoutineLog): RoutineLogData {
    return domain.toDB() as RoutineLogData
  }

  async findByRoutineAndDate(routineId: number, date: string): Promise<RoutineLog | undefined> {
    const data = await this.table.where({ routine_id: routineId, date }).first()
    return data ? this.fromDB(data) : undefined
  }

  async findAllByRoutine(routineId: number): Promise<RoutineLog[]> {
    const data = await this.table.where('routine_id').equals(routineId).toArray()
    return data.map(logEntry => this.fromDB(logEntry))
  }

  async getCompletedLogs(routineId: number): Promise<RoutineLog[]> {
    const data = await this.table
      .where('routine_id').equals(routineId)
      .filter(logEntry => logEntry.completed)
      .toArray()
    return data.map(logEntry => this.fromDB(logEntry))
  }
}