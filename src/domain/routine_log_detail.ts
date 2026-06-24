/* Detalle de un registro de rutina: asocia un ejercicio específico con
   las repeticiones realizadas. Permite trackear progreso por ejercicio. */
import { BaseEntity } from './base_entity'

export class RoutineLogDetail extends BaseEntity {
  private _routineLogId: number
  private _routineLogUuid: string
  private _exerciseId: number
  private _exerciseUuid: string
  private _repsDone: number

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    routineLogId: number,
    routineLogUuid: string,
    exerciseId: number,
    exerciseUuid: string,
    repsDone: number
  ) {
    super(id, uuid, createdAt, updatedAt)
    if (repsDone < 0) throw new Error('Las repeticiones realizadas no pueden ser negativas')
    this._routineLogId = routineLogId
    this._routineLogUuid = routineLogUuid
    this._exerciseId = exerciseId
    this._exerciseUuid = exerciseUuid
    this._repsDone = repsDone
  }

  get routineLogId(): number { return this._routineLogId }
  get routineLogUuid(): string { return this._routineLogUuid }
  get exerciseId(): number { return this._exerciseId }
  get exerciseUuid(): string { return this._exerciseUuid }
  get repsDone(): number { return this._repsDone }

  set repsDone(value: number) {
    if (value < 0) throw new Error('Las repeticiones realizadas no pueden ser negativas')
    this._repsDone = value
    this.updateTimestamp()
  }

  static fromDB(data: any): RoutineLogDetail {
    return new RoutineLogDetail(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.routine_log_id,
      data.routine_log_uuid,
      data.exercise_id,
      data.exercise_uuid,
      data.reps_done
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      routine_log_id: this._routineLogId,
      routine_log_uuid: this._routineLogUuid,
      exercise_id: this._exerciseId,
      exercise_uuid: this._exerciseUuid,
      reps_done: this._repsDone,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}