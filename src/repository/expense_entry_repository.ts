import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { ExpenseEntry as ExpenseEntryData } from '../lib/db'
import { ExpenseEntry } from '../domain/expense_entry'

export class ExpenseEntryRepository extends BaseDexieRepository<ExpenseEntryData, ExpenseEntry> {
  constructor(table: Table<ExpenseEntryData, number>) {
    super(table)
  }

  protected fromDB(data: ExpenseEntryData): ExpenseEntry {
    return ExpenseEntry.fromDB(data)
  }

  protected toDB(domain: ExpenseEntry): ExpenseEntryData {
    return domain.toDB() as ExpenseEntryData
  }

  async findByAccount(account_id: number): Promise<ExpenseEntry[]> {
    const data = await this.table.where('account_id').equals(account_id).toArray()
    return data.map(entry => this.fromDB(entry))
  }

  async findByDateRange(startDate: string, endDate: string): Promise<ExpenseEntry[]> {
    const data = await this.table
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .toArray()
    return data.map(entry => this.fromDB(entry))
  }

  async findByCategory(category: string): Promise<ExpenseEntry[]> {
    const lowerCategory = category.toLowerCase()
    const data = await this.table
      .filter(entry => entry.category.toLowerCase().includes(lowerCategory))
      .toArray()
    return data.map(entry => this.fromDB(entry))
  }

  async getTotalAmount(account_id?: number): Promise<number> {
    const entries = account_id
      ? await this.findByAccount(account_id)
      : await this.table.toArray()
    return entries.reduce((total, entry) => total + entry.amount, 0)
  }
}