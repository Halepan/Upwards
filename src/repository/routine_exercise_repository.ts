import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { RoutineExercise as RoutineExerciseData } from '../lib/db'
import { RoutineExercise } from '../domain/routine_exercise'

export class RoutineExerciseRepository extends BaseDexieRepository<RoutineExerciseData, RoutineExercise> {
  constructor(table: Table<RoutineExerciseData, number>) {
    super(table)
  }

  protected fromDB(data: RoutineExerciseData): RoutineExercise {
    return RoutineExercise.fromDB(data)
  }

  protected toDB(domain: RoutineExercise): RoutineExerciseData {
    return domain.toDB() as RoutineExerciseData
  }

  async findByRoutine(routineId: number): Promise<RoutineExercise[]> {
    const data = await this.table
      .where('routine_id').equals(routineId)
      .sortBy('order_index')
    return data.map(entry => this.fromDB(entry))
  }

  async findByRoutineAndExercise(routineId: number, exerciseId: number): Promise<RoutineExercise | undefined> {
    const data = await this.table.where({ routine_id: routineId, exercise_id: exerciseId }).first()
    return data ? this.fromDB(data) : undefined
  }
}