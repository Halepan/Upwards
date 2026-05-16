import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { IncomeEntry as IncomeEntryData } from '../lib/db'
import { IncomeEntry } from '../domain/income_entry'

export class IncomeEntryRepository extends BaseDexieRepository<IncomeEntryData, IncomeEntry> {
  constructor(table: Table<IncomeEntryData, number>) {
    super(table)
  }

  protected fromDB(data: IncomeEntryData): IncomeEntry {
    return IncomeEntry.fromDB(data)
  }

  protected toDB(domain: IncomeEntry): IncomeEntryData {
    return domain.toDB() as IncomeEntryData
  }

  async findByUserId(user_id: number): Promise<IncomeEntry[]> {
    const data = await this.table.where('user_id').equals(user_id).toArray()
    return data.map(entry => this.fromDB(entry))
  }

  async findByDateRange(user_id: number, startDate: string, endDate: string): Promise<IncomeEntry[]> {
    const data = await this.table
      .where('user_id').equals(user_id)
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .toArray()
    return data.map(entry => this.fromDB(entry))
  }

  async findByClassification(user_id: number, classification: IncomeEntryData['classification']): Promise<IncomeEntry[]> {
    const data = await this.table
      .where('user_id').equals(user_id)
      .filter(entry => entry.classification === classification)
      .toArray()
    return data.map(entry => this.fromDB(entry))
  }

  async getTotalAmount(user_id: number): Promise<number> {
    const entries = await this.findByUserId(user_id)
    return entries.reduce((total, entry) => total + entry.amount, 0)
  }

  async getTotalAmountInRange(user_id: number, startDate: string, endDate: string): Promise<number> {
    const entries = await this.findByDateRange(user_id, startDate, endDate)
    return entries.reduce((total, entry) => total + entry.amount, 0)
  }
}