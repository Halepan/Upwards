/* Representa una semana calendario con fecha de inicio (lunes) y fin (domingo),
   más notas de reflexión del usuario. Es la unidad de planificación de hábitos. */
import { BaseEntity } from './base_entity'

export class Week extends BaseEntity {
  private _userId: number
  private _userUuid: string
  private _startDate: string
  private _endDate?: string
  private _notes?: string

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    userUuid: string,
    startDate: string,
    endDate?: string,
    notes?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._userId = userId
    this._userUuid = userUuid
    this._startDate = startDate
    this._endDate = endDate
    this._notes = notes
  }

  get userId(): number { return this._userId }
  get userUuid(): string { return this._userUuid }
  get startDate(): string { return this._startDate }
  get endDate(): string | undefined { return this._endDate }
  get notes(): string | undefined { return this._notes }

  set notes(value: string | undefined) {
    this._notes = value
    this.updateTimestamp()
  }
  set endDate(value: string | undefined) {
    this._endDate = value
    this.updateTimestamp()
  }

  /* Convierte una fecha ISO a número de día ISO (1=lunes, 7=domingo). */
  getDayOfWeek(dateString: string): number {
    const parsedDate = new Date(dateString)
    const javascriptDay = parsedDate.getDay()
    return javascriptDay === 0 ? 7 : javascriptDay
  }

  static fromDB(data: any): Week {
    return new Week(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.user_uuid,
      data.start_date,
      data.end_date,
      data.notes
    )
  }

  toDB(): any {
    return {
      id: this._uuid,
      user_id: this._userUuid,
      start_date: this._startDate,
      end_date: this._endDate,
      notes: this._notes,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    }
  }

  toSupabase(): any {
    return {
      id: this._uuid,
      user_id: this._userUuid,
      start_date: this._startDate,
      end_date: this._endDate,
      notes: this._notes,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    }
  }
}