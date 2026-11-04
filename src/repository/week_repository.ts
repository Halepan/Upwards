import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Week as WeekData } from '../lib/db'
import { Week } from '../domain/week'

export class WeekRepository extends BaseDexieRepository<WeekData, Week> {
  constructor(table: Table<WeekData, number>) {
    super(table)
  }

  protected fromDB(data: WeekData): Week {
    return Week.fromDB(data)
  }

  protected toDB(domain: Week): WeekData {
    return domain.toDB() as WeekData
  }

  async findByStartDate(startDate: string): Promise<Week | undefined> {
    const data = await this.table.where('start_date').equals(startDate).first()
    return data ? this.fromDB(data) : undefined
  }

  async findByUserId(userId: number): Promise<Week[]> {
    const data = await this.table.where('user_id').equals(userId).toArray()
    return data.map(weekData => this.fromDB(weekData))
  }
}