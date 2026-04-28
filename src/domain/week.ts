/*
Esta clase se encarga de manejar el inicio y fin de las semanas,
ademas de las notas que se agregaran para manejar mejor los habitos y tomar 
aprendizajes de esto.
*/
import { BaseEntity } from './base_entity'

export class Week extends BaseEntity {
  private _userId: number
  private _startDate: string   // YYYY-MM-DD (lunes)
  private _endDate?: string    // YYYY-MM-DD (domingo)
  private _notes?: string

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    startDate: string,
    endDate?: string,
    notes?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._userId = userId
    this._startDate = startDate
    this._endDate = endDate
    this._notes = notes
  }

  // Getters
  get userId(): number { return this._userId }
  get startDate(): string { return this._startDate }
  get endDate(): string | undefined { return this._endDate }
  get notes(): string | undefined { return this._notes }

  // Setters
  set notes(value: string | undefined) {
    this._notes = value
    this.updateTimestamp()
  }
  set endDate(value: string | undefined) {
    this._endDate = value
    this.updateTimestamp()
  }

  // Método de negocio
  getDayOfWeek(dateStr: string): number {
    // Retorna 1 (lunes) a 7 (domingo) según ISO
    const date = new Date(dateStr)
    const day = date.getDay()
    return day === 0 ? 7 : day
  }

  // Conversión
  static fromDB(data: any): Week {
    return new Week(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.start_date,
      data.end_date,
      data.notes
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      user_id: this._userId,
      start_date: this._startDate,
      end_date: this._endDate,
      notes: this._notes,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}