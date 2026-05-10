import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Routine } from '../domain/routine'

export class RoutineRepository extends BaseDexieRepository<Routine> {
  constructor(table: Table<Routine, number>) {
    super(table)
  }

  async findByUserId(userId: number): Promise<Routine[]> {
    return this.table.where('user_id').equals(userId).toArray()
  }

  async findActiveByUserId(userId: number): Promise<Routine[]> {
    return this.table
      .where('user_id').equals(userId)
      .filter(r => r.isActive)
      .toArray()
  }
}