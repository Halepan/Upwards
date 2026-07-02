/* Registro diario del estado de un hábito: completado, perdido o planeado.
   Encapsula las transiciones de estado como métodos de dominio. */
import { BaseEntity } from './base_entity'

export type HabitStatus = 'completed' | 'missed' | 'planned'

export class HabitLog extends BaseEntity {
  private _habitId: number
  private _habitUuid: string
  private _date: string
  private _status: HabitStatus
  private _completedAt?: string

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    habitId: number,
    habitUuid: string,
    date: string,
    status: HabitStatus = 'planned',
    completedAt?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._habitId = habitId
    this._habitUuid = habitUuid
    this._date = date
    this._status = status
    this._completedAt = completedAt
  }

  get habitId(): number { return this._habitId }
  get habitUuid(): string { return this._habitUuid }
  get date(): string { return this._date }
  get status(): HabitStatus { return this._status }
  get completedAt(): string | undefined { return this._completedAt }

  /* Transiciona el registro a completado y registra el timestamp. */
  markCompleted(): void {
    this._status = 'completed'
    this._completedAt = new Date().toISOString()
    this.updateTimestamp()
  }

  /* Transiciona el registro a perdido. */
  markMissed(): void {
    this._status = 'missed'
    this._completedAt = undefined
    this.updateTimestamp()
  }

  /* Reinicia el registro a su estado de planeado inicial. */
  resetToPlanned(): void {
    this._status = 'planned'
    this._completedAt = undefined
    this.updateTimestamp()
  }

  isCompleted(): boolean {
    return this._status === 'completed'
  }

  static fromDB(data: any): HabitLog {
    return new HabitLog(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.habit_id,
      data.habit_uuid,
      data.date,
      data.status as HabitStatus,
      data.completed_at
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      habit_id: this._habitId,
      habit_uuid: this._habitUuid,
      date: this._date,
      status: this._status,
      completed_at: this._completedAt,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }

  toSupabase(): any {
    return {
      id: this._uuid,
      habit_id: this._habitUuid,
      date: this._date,
      status: this._status,
      completed_at: this._completedAt,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    }
  }
}