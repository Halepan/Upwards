/*
Esta clase se encarga de manejar el estado de los habitos por fechas 
*/
import { BaseEntity } from './base_entity'

export type HabitStatus = 'completed' | 'missed' | 'planned'

export class HabitLog extends BaseEntity {
  private _habitId: number
  private _date: string      // YYYY-MM-DD
  private _status: HabitStatus
  private _completedAt?: string

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    habitId: number,
    date: string,
    status: HabitStatus = 'planned',
    completedAt?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._habitId = habitId
    this._date = date
    this._status = status
    this._completedAt = completedAt
  }

  // Getters
  get habitId(): number { return this._habitId }
  get date(): string { return this._date }
  get status(): HabitStatus { return this._status }
  get completedAt(): string | undefined { return this._completedAt }

  // Métodos de negocio (no setters individuales, sino acciones de dominio)
  markCompleted(): void {
    this._status = 'completed'
    this._completedAt = new Date().toISOString()
    this.updateTimestamp()
  }

  markMissed(): void {
    this._status = 'missed'
    this._completedAt = undefined
    this.updateTimestamp()
  }

  resetToPlanned(): void {
    this._status = 'planned'
    this._completedAt = undefined
    this.updateTimestamp()
  }

  isCompleted(): boolean {
    return this._status === 'completed'
  }

  // Conversión
  static fromDB(data: any): HabitLog {
    return new HabitLog(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.habit_id,
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
      date: this._date,
      status: this._status,
      completed_at: this._completedAt,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}