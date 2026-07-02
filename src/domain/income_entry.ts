/* Ingreso registrado por el usuario, asociado a una cuenta específica.
   Incluye monto, clasificación, fecha y nota. */
import { BaseEntity } from './base_entity'

export type IncomeClassification = 'pasivo' | 'timeswap' | 'give' | 'otro'

export class IncomeEntry extends BaseEntity {
  private _accountId: number
  private _accountUuid: string
  private _amount: number
  private _classification: IncomeClassification
  private _note?: string
  private _date: string

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    accountId: number,          // ID numérico local de la cuenta
    accountUuid: string,        // UUID de la cuenta (para sincronización)
    amount: number,
    classification: IncomeClassification,
    date: string,
    note?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    if (amount <= 0) throw new Error('El monto debe ser mayor que cero')
    this._accountId = accountId
    this._accountUuid = accountUuid
    this._amount = amount
    this._classification = classification
    this._date = date
    this._note = note
  }

  get accountId(): number { return this._accountId }
  get accountUuid(): string { return this._accountUuid }
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
      data.account_id,      // ✅ ahora usa account_id
      data.account_uuid,    // ✅ ahora usa account_uuid
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
      account_id: this._accountId,        // ✅
      account_uuid: this._accountUuid,    // ✅
      amount: this._amount,
      classification: this._classification,
      note: this._note,
      date: this._date,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
  toSupabase(): any {
    return {
      id: this._uuid,
      account_id: this._accountUuid,    // ✅
      amount: this._amount,
      classification: this._classification,
      note: this._note,
      date: this._date,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    }
  }
}