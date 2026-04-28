import { BaseEntity } from './base_entity'

export class ExpenseEntry extends BaseEntity {
  private _accountId: number
  private _amount: number
  private _category: string
  private _note?: string
  private _date: string // YYYY-MM-DD

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    accountId: number,
    amount: number,
    category: string,
    date: string,
    note?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    if (amount <= 0) throw new Error('El monto debe ser mayor que cero')
    this._accountId = accountId
    this._amount = amount
    this._category = category
    this._date = date
    this._note = note
  }

  // Getters
  get accountId(): number { return this._accountId }
  get amount(): number { return this._amount }
  get category(): string { return this._category }
  get note(): string | undefined { return this._note }
  get date(): string { return this._date }

  // Setters
  set amount(value: number) {
    if (value <= 0) throw new Error('El monto debe ser mayor que cero')
    this._amount = value
    this.updateTimestamp()
  }
  set category(value: string) {
    this._category = value
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

  // Conversión
  static fromDB(data: any): ExpenseEntry {
    return new ExpenseEntry(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.account_id,
      data.amount,
      data.category,
      data.date,
      data.note
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      account_id: this._accountId,
      amount: this._amount,
      category: this._category,
      note: this._note,
      date: this._date,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}