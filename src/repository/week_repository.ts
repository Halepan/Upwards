import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Week } from '../domain/week'

export class WeekRepository extends BaseDexieRepository<Week> {
  constructor(table: Table<Week, number>) {
    super(table)
  }

  async findByStartDate(startDate: string): Promise<Week | undefined> {
    return this.table.where('start_date').equals(startDate).first()
  }

  async findByUserId(userId: number): Promise<Week[]> {
    return this.table.where('user_id').equals(userId).toArray()
  }
}