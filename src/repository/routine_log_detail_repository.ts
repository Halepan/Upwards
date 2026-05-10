import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { RoutineLogDetail } from '../domain/routine_log_detail'

export class RoutineLogDetailRepository extends BaseDexieRepository<RoutineLogDetail> {
  constructor(table: Table<RoutineLogDetail, number>) {
    super(table)
  }

  async findByLog(routineLogId: number): Promise<RoutineLogDetail[]> {
    return this.table.where('routine_log_id').equals(routineLogId).toArray()
  }

  async findByLogAndExercise(routineLogId: number, exerciseId: number): Promise<RoutineLogDetail | undefined> {
    return this.table.where({ routine_log_id: routineLogId, exercise_id: exerciseId }).first()
  }
}