import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Habit } from '../domain/habit'

export class HabitRepository extends BaseDexieRepository<Habit> {
  constructor(table: Table<Habit, number>) {
    super(table)
  }

  // Métodos específicos
  async findByUserId(userId: number): Promise<Habit[]> {
    return this.table.where('user_id').equals(userId).toArray()
  }

  async findActiveByUserId(userId: number): Promise<Habit[]> {
    return this.table
      .where('user_id').equals(userId)
      .filter(h => !h.isArchived)
      .toArray()
  }

  async archiveHabit(id: number): Promise<void> {
    await this.table.update(id, { is_archived: true } as any)
    await this.markAsSynced(id) // opcional: forzar que se sincronice
  }

  async findByName(userId: number, name: string): Promise<Habit[]> {
    const lowerName = name.toLowerCase()
    return this.table
      .where('user_id').equals(userId)
      .filter(h => h.name.toLowerCase().includes(lowerName))
      .toArray()
  }
}