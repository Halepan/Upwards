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
    if (user_id === undefined || user_id === null || isNaN(user_id)) {
      console.warn('[AccountRepository] findByUserId called with invalid userId:', user_id);
      return []; 
  }
    const data = await this.table.where('user_id').equals(user_id).toArray()
    return data.map(account => this.fromDB(account))
  }

  async findByType(user_id: number, type: AccountData['type']): Promise<Account[]> {
    const data = await this.table
      .where('user_id').equals(user_id)
      .filter(account => account.type === type)
      .toArray()
    return data.map(account => this.fromDB(account))
  }

  async findByName(user_id: number, name: string): Promise<Account[]> {
    const lowerName = name.toLowerCase()
    const data = await this.table
      .where('user_id').equals(user_id)
      .filter(account => account.name.toLowerCase().includes(lowerName))
      .toArray()
    return data.map(account => this.fromDB(account))
  }

  async getTotalBalance(user_id: number): Promise<number> {
    const accounts = await this.findByUserId(user_id)
    return accounts.reduce((total, account) => total + account.balance, 0)
  }
}