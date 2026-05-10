import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { HabitLog as HabitLogData } from '../lib/db'   // interfaz plana
import { HabitLog } from '../domain/habit_log'

export class HabitLogRepository extends BaseDexieRepository<HabitLogData, HabitLog> {
  constructor(table: Table<HabitLogData, number>) {
    super(table)
  }

  protected fromDB(data: HabitLogData): HabitLog {
    return HabitLog.fromDB(data)
  }

  protected toDB(domain: HabitLog): HabitLogData {
    return domain.toDB() as HabitLogData
  }

  async findByHabitAndDate(habitId: number, date: string): Promise<HabitLog | undefined> {
    const data = await this.table.where({ habit_id: habitId, date }).first()
    return data ? this.fromDB(data) : undefined
  }

  async findByHabitInRange(habitId: number, startDate: string, endDate: string): Promise<HabitLog[]> {
    const data = await this.table
      .where('habit_id').equals(habitId)
      .filter(log => log.date >= startDate && log.date <= endDate)
      .toArray()
    return data.map(d => this.fromDB(d))
  }

  async getCompletedCountForWeek(habitId: number, startDate: string, endDate: string): Promise<number> {
    const logs = await this.findByHabitInRange(habitId, startDate, endDate)
    return logs.filter(l => l.status === 'completed').length
  }
}