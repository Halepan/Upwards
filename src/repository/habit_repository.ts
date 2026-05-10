import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Habit as HabitData } from '../lib/db'   // interfaz plana
import { Habit } from '../domain/habit'               // clase de dominio

export class HabitRepository extends BaseDexieRepository<HabitData, Habit> {

  constructor(table: Table<HabitData, number>) {
    super(table)
  }

  // Conversiones requeridas, delegan en los métodos estáticos de la entidad
  protected fromDB(data: HabitData): Habit {
    return Habit.fromDB(data)
  }

  protected toDB(habit: Habit): HabitData {
    return habit.toDB() as HabitData
  }

  // Métodos específicos (trabajan sobre TData y convierten al final)
  async findByUserId(userId: number): Promise<Habit[]> {
    const data = await this.table
      .where('user_id').equals(userId)
      .toArray()
    return data.map(d => this.fromDB(d))
  }

  async findActiveByUserId(userId: number): Promise<Habit[]> {
    const data = await this.table
      .where('user_id').equals(userId)
      .filter(h => !h.is_archived)   // aquí 'h' es HabitData → snake_case
      .toArray()
    return data.map(d => this.fromDB(d))
  }

  async archiveHabit(id: number): Promise<void> {
    await this.table.update(id, { is_archived: true } as any)
    await this.markAsSynced(id)
  }

  async findByName(userId: number, name: string): Promise<Habit[]> {
    const lowerName = name.toLowerCase()
    const data = await this.table
      .where('user_id').equals(userId)
      .filter(h => h.name.toLowerCase().includes(lowerName))
      .toArray()
    return data.map(d => this.fromDB(d))
  }
}