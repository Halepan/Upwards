/* Entidad puente muchos-a-muchos entre Routine y Exercise.
   Almacena las repeticiones objetivo, el orden dentro de la rutina y notas. */
import { BaseEntity } from './base_entity'

export class RoutineExercise extends BaseEntity {
  private _routineId: number
  private _routineUuid: string
  private _exerciseId: number
  private _exerciseUuid: string
  private _targetReps: number
  private _orderIndex: number
  private _notes?: string

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    routineId: number,
    routineUuid: string,
    exerciseId: number,
    exerciseUuid: string,
    targetReps: number,
    orderIndex: number = 0,
    notes?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    if (targetReps <= 0) throw new Error('Las repeticiones objetivo deben ser mayores que cero')
    this._routineId = routineId
    this._routineUuid = routineUuid
    this._exerciseId = exerciseId
    this._exerciseUuid = exerciseUuid
    this._targetReps = targetReps
    this._orderIndex = orderIndex
    this._notes = notes
  }

  get routineId(): number { return this._routineId }
  get routineUuid(): string { return this._routineUuid }
  get exerciseId(): number { return this._exerciseId }
  get exerciseUuid(): string { return this._exerciseUuid }
  get targetReps(): number { return this._targetReps }
  get orderIndex(): number { return this._orderIndex }
  get notes(): string | undefined { return this._notes }

  set targetReps(value: number) {
    if (value <= 0) throw new Error('Las repeticiones objetivo deben ser mayores que cero')
    this._targetReps = value
    this.updateTimestamp()
  }
  set orderIndex(value: number) {
    this._orderIndex = value
    this.updateTimestamp()
  }
  set notes(value: string | undefined) {
    this._notes = value
    this.updateTimestamp()
  }

  static fromDB(data: any): RoutineExercise {
    return new RoutineExercise(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.routine_id,
      data.routine_uuid,
      data.exercise_id,
      data.exercise_uuid,
      data.target_reps,
      data.order_index,
      data.notes
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      routine_id: this._routineId,
      routine_uuid: this._routineUuid,
      exercise_id: this._exerciseId,
      exercise_uuid: this._exerciseUuid,
      target_reps: this._targetReps,
      order_index: this._orderIndex,
      notes: this._notes,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }

  toSupabase(): any {
    return {
      id: this._uuid,
      routine_id: this._routineUuid,
      exercise_id: this._exerciseUuid,
      target_reps: this._targetReps,
      order_index: this._orderIndex,
      notes: this._notes,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    }
  }
}