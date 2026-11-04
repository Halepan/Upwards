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

  // Busca por account_id (local)
  async findByAccountId(accountId: number): Promise<IncomeEntry[]> {
    const data = await this.table.where('account_id').equals(accountId).toArray()
    return data.map(entry => this.fromDB(entry))
  }

  // Busca por account_uuid (global)
  async findByAccountUuid(accountUuid: string): Promise<IncomeEntry[]> {
    const data = await this.table.where('account_uuid').equals(accountUuid).toArray()
    return data.map(entry => this.fromDB(entry))
  }

  // Busca por lista de account_ids (para sincronización o consultas por usuario)
  async findByAccountIds(accountIds: number[]): Promise<IncomeEntry[]> {
    if (!accountIds.length) return []
    const data = await this.table
      .where('account_id')
      .anyOf(accountIds)
      .toArray()
    return data.map(entry => this.fromDB(entry))
  }

  // Rango de fechas para una cuenta específica
  async findByDateRange(accountId: number, startDate: string, endDate: string): Promise<IncomeEntry[]> {
    const data = await this.table
      .where('account_id').equals(accountId)
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .toArray()
    return data.map(entry => this.fromDB(entry))
  }

  // Por clasificación
  async findByClassification(accountId: number, classification: IncomeEntryData['classification']): Promise<IncomeEntry[]> {
    const data = await this.table
      .where('account_id').equals(accountId)
      .filter(entry => entry.classification === classification)
      .toArray()
    return data.map(entry => this.fromDB(entry))
  }

  // Total de ingresos de una cuenta
  async getTotalAmount(accountId: number): Promise<number> {
    const entries = await this.findByAccountId(accountId)
    return entries.reduce((total, entry) => total + entry.amount, 0)
  }

  // Total en un rango de fechas
  async getTotalAmountInRange(accountId: number, startDate: string, endDate: string): Promise<number> {
    const entries = await this.findByDateRange(accountId, startDate, endDate)
    return entries.reduce((total, entry) => total + entry.amount, 0)
  }
}