import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { HabitLog } from '../domain/habit_log'

export class HabitLogRepository extends BaseDexieRepository<HabitLog> {
  constructor(table: Table<HabitLog, number>) {
    super(table)
  }

  async findByHabitAndDate(habitId: number, date: string): Promise<HabitLog | undefined> {
    return this.table.where({ habit_id: habitId, date }).first()
  }

  async findByHabitInRange(habitId: number, startDate: string, endDate: string): Promise<HabitLog[]> {
    return this.table
      .where('habit_id').equals(habitId)
      .filter(log => log.date >= startDate && log.date <= endDate)
      .toArray()
  }

  async getCompletedCountForWeek(habitId: number, startDate: string, endDate: string): Promise<number> {
    const logs = await this.findByHabitInRange(habitId, startDate, endDate)
    return logs.filter(l => l.status === 'completed').length
  }
}