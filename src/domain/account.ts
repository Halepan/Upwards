/* Representa una cuenta financiera del usuario: gasto, ahorro, inversión o donación.
   Maneja el balance mediante depósitos y retiros con validación de fondos. */

import { BaseEntity } from './base_entity'

export type AccountType = 'spendable' | 'savings' | 'investment' | 'donation'

export class Account extends BaseEntity {
  private _userId: number
  private _name: string
  private _type: AccountType
  private _balance: number

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    name: string,
    type: AccountType,
    balance: number = 0
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._userId = userId
    this._name = name
    this._type = type
    this._balance = balance
  }

  get userId(): number { return this._userId }
  get name(): string { return this._name }
  get type(): AccountType { return this._type }
  get balance(): number { return this._balance }

  set name(value: string) {
    this._name = value
    this.updateTimestamp()
  }
  set type(value: AccountType) {
    this._type = value
    this.updateTimestamp()
  }

  /* Incrementa el balance validando que el monto sea positivo. */
  deposit(amount: number): void {
    if (amount <= 0) throw new Error('El depósito debe ser mayor que cero')
    this._balance += amount
    this.updateTimestamp()
  }

  /* Decrementa el balance validando fondos suficientes. */
  withdraw(amount: number): void {
    if (amount <= 0) throw new Error('El retiro debe ser mayor que cero')
    if (amount > this._balance) throw new Error('Fondos insuficientes')
    this._balance -= amount
    this.updateTimestamp()
  }

  static fromDB(data: any): Account {
    return new Account(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.name,
      data.type as AccountType,
      data.balance
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      user_id: this._userId,
      name: this._name,
      type: this._type,
      balance: this._balance,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}