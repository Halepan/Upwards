import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Exercise,ExerciseSubType } from '../domain/exercise'

export class ExerciseRepository extends BaseDexieRepository<Exercise> {
  constructor(table: Table<Exercise, number>) {
    super(table)
  }

  async findByUserId(userId: number): Promise<Exercise[]> {
    return this.table.where('user_id').equals(userId).toArray()
  }

  async findByType(userId: number, type: 'fuerza' | 'resistencia'): Promise<Exercise[]> {
    return this.table
      .where('user_id').equals(userId)
      .filter(e => e.type === type)
      .toArray()
  }

    // Búsqueda por sub‑tipo (core, abdominal, inferior, superior, etc.)
  async findBySubType(userId: number, subType: ExerciseSubType): Promise<Exercise[]> {
    return this.table
      .where('user_id').equals(userId)
      .filter(e => e.subType === subType)
      .toArray()
  }

  // Búsqueda por nombre (coincidencia exacta o parcial, insensible a mayúsculas)
  async findByName(userId: number, name: string): Promise<Exercise[]> {
    const lowerName = name.toLowerCase()
    return this.table
      .where('user_id').equals(userId)
      .filter(e => e.name.toLowerCase().includes(lowerName))
      .toArray()
  }
}