import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Routine as RoutineData } from '../lib/db'    // interfaz plana
import { Routine } from '../domain/routine'

export class RoutineRepository extends BaseDexieRepository<RoutineData, Routine> {
  constructor(table: Table<RoutineData, number>) {
    super(table)
  }

  protected fromDB(data: RoutineData): Routine {
    return Routine.fromDB(data)
  }

  protected toDB(domain: Routine): RoutineData {
    return domain.toDB() as RoutineData
  }

  async findByUserId(userId: number): Promise<Routine[]> {
    const data = await this.table.where('user_id').equals(userId).toArray()
    return data.map(routineData => this.fromDB(routineData))
  }

  async findActiveByUserId(userId: number): Promise<Routine[]> {
    const data = await this.table
      .where('user_id').equals(userId)
      .filter(routineData => routineData.is_active)
      .toArray()
    return data.map(routineData => this.fromDB(routineData))
  }

  async findByName(userId: number, name: string): Promise<Routine[]> {
    const lowerName = name.toLowerCase()
    const data = await this.table
      .where('user_id').equals(userId)
      .filter(routineData => routineData.name.toLowerCase().includes(lowerName))
      .toArray()
    return data.map(routineData => this.fromDB(routineData))
  }
}