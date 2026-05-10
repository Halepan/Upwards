import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { RoutineLogDetail as RoutineLogDetailData } from '../lib/db'
import { RoutineLogDetail } from '../domain/routine_log_detail'

export class RoutineLogDetailRepository extends BaseDexieRepository<RoutineLogDetailData, RoutineLogDetail> {
  constructor(table: Table<RoutineLogDetailData, number>) {
    super(table)
  }

  protected fromDB(data: RoutineLogDetailData): RoutineLogDetail {
    return RoutineLogDetail.fromDB(data)
  }

  protected toDB(domain: RoutineLogDetail): RoutineLogDetailData {
    return domain.toDB() as RoutineLogDetailData
  }

  async findByLog(routineLogId: number): Promise<RoutineLogDetail[]> {
    const data = await this.table.where('routine_log_id').equals(routineLogId).toArray()
    return data.map(d => this.fromDB(d))
  }

  async findByLogAndExercise(routineLogId: number, exerciseId: number): Promise<RoutineLogDetail | undefined> {
    const data = await this.table.where({ routine_log_id: routineLogId, exercise_id: exerciseId }).first()
    return data ? this.fromDB(data) : undefined
  }
}