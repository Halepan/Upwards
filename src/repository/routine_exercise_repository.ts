import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { RoutineExercise } from '../domain/routine_exercise'

export class RoutineExerciseRepository extends BaseDexieRepository<RoutineExercise> {
  constructor(table: Table<RoutineExercise, number>) {
    super(table)
  }

  async findByRoutine(routineId: number): Promise<RoutineExercise[]> {
    return this.table
      .where('routine_id').equals(routineId)
      .sortBy('order_index')
  }

  async findByRoutineAndExercise(routineId: number, exerciseId: number): Promise<RoutineExercise | undefined> {
    return this.table.where({ routine_id: routineId, exercise_id: exerciseId }).first()
  }
}