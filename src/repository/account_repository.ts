import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Account as AccountData } from '../lib/db'
import { Account } from '../domain/account'

export class AccountRepository extends BaseDexieRepository<AccountData, Account> {
  constructor(table: Table<AccountData, number>) {
    super(table)
  }

  protected fromDB(data: AccountData): Account {
    return Account.fromDB(data)
  }

  protected toDB(domain: Account): AccountData {
    return domain.toDB() as AccountData
  }

  async findByUserId(user_id: number): Promise<Account[]> {
    const data = await this.table.where('user_id').equals(user_id).toArray()
    return data.map(d => this.fromDB(d))
  }

  async findByType(user_id: number, type: AccountData['type']): Promise<Account[]> {
    const data = await this.table
      .where('user_id').equals(user_id)
      .filter(a => a.type === type)
      .toArray()
    return data.map(d => this.fromDB(d))
  }

  async findByName(user_id: number, name: string): Promise<Account[]> {
    const lowerName = name.toLowerCase()
    const data = await this.table
      .where('user_id').equals(user_id)
      .filter(a => a.name.toLowerCase().includes(lowerName))
      .toArray()
    return data.map(d => this.fromDB(d))
  }

  async getTotalBalance(user_id: number): Promise<number> {
    const accounts = await this.findByUserId(user_id)
    return accounts.reduce((sum, a) => sum + a.balance, 0)
  }
}