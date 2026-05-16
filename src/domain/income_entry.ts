/* Ingreso registrado por el usuario: monto, clasificación (pasivo, timeswap, give, otro),
   fecha y nota. Es la entrada del flujo de efectivo. */
import { BaseEntity } from './base_entity'

export type IncomeClassification = 'pasivo' | 'timeswap' | 'give' | 'otro'

export class IncomeEntry extends BaseEntity {
  private _userId: number
  private _amount: number
  private _classification: IncomeClassification
  private _note?: string
  private _date: string

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    amount: number,
    classification: IncomeClassification,
    date: string,
    note?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    if (amount <= 0) throw new Error('El monto debe ser mayor que cero')
    this._userId = userId
    this._amount = amount
    this._classification = classification
    this._date = date
    this._note = note
  }

  get userId(): number { return this._userId }
  get amount(): number { return this._amount }
  get classification(): IncomeClassification { return this._classification }
  get note(): string | undefined { return this._note }
  get date(): string { return this._date }

  set amount(value: number) {
    if (value <= 0) throw new Error('El monto debe ser mayor que cero')
    this._amount = value
    this.updateTimestamp()
  }
  set classification(value: IncomeClassification) {
    this._classification = value
    this.updateTimestamp()
  }
  set note(value: string | undefined) {
    this._note = value
    this.updateTimestamp()
  }
  set date(value: string) {
    this._date = value
    this.updateTimestamp()
  }

  static fromDB(data: any): IncomeEntry {
    return new IncomeEntry(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.amount,
      data.classification as IncomeClassification,
      data.date,
      data.note
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      user_id: this._userId,
      amount: this._amount,
      classification: this._classification,
      note: this._note,
      date: this._date,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}