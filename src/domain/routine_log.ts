// Esta classe se encarga d manejar el estado y cumplimiento de las rutinas
import { BaseEntity } from './base_entity'

export class RoutineLog extends BaseEntity {
  private _routineId: number
  private _date: string          // YYYY-MM-DD
  private _notes?: string
  private _completed: boolean

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    routineId: number,
    date: string,
    notes?: string,
    completed: boolean = false
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._routineId = routineId
    this._date = date
    this._notes = notes
    this._completed = completed
  }

  // Getters
  get routineId(): number { return this._routineId }
  get date(): string { return this._date }
  get notes(): string | undefined { return this._notes }
  get completed(): boolean { return this._completed }

  // Setters
  set notes(value: string | undefined) {
    this._notes = value
    this.updateTimestamp()
  }

  // Métodos de negocio
  complete(): void {
    this._completed = true
    this.updateTimestamp()
  }

  reset(): void {
    this._completed = false
    this.updateTimestamp()
  }

  isCompleted(): boolean {
    return this._completed
  }

  // Conversión
  static fromDB(data: any): RoutineLog {
    return new RoutineLog(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.routine_id,
      data.date,
      data.notes,
      data.completed
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      routine_id: this._routineId,
      date: this._date,
      notes: this._notes,
      completed: this._completed,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}