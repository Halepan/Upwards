import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { Exercise as ExerciseData } from '../lib/db'        // interfaz plana (snake_case)
import { Exercise, type ExerciseSubType } from '../domain/exercise' // clase de dominio

export class ExerciseRepository extends BaseDexieRepository<ExerciseData, Exercise> {
  constructor(table: Table<ExerciseData, number>) {
    super(table)
  }

  // Conversiones requeridas
  protected fromDB(data: ExerciseData): Exercise {
    return Exercise.fromDB(data)
  }

  protected toDB(domain: Exercise): ExerciseData {
    return domain.toDB() as ExerciseData
  }

  async findByUserId(userId: number): Promise<Exercise[]> {
    const data = await this.table.where('user_id').equals(userId).toArray()
    return data.map(d => this.fromDB(d))
  }

  async findByType(userId: number, type: 'fuerza' | 'resistencia'): Promise<Exercise[]> {
    const data = await this.table
      .where('user_id').equals(userId)
      .filter(e => e.type === type)
      .toArray()
    return data.map(d => this.fromDB(d))
  }

  async findBySubType(userId: number, subType: ExerciseSubType): Promise<Exercise[]> {
    const data = await this.table
      .where('user_id').equals(userId)
      .filter(e => e.sub_type === subType)   // snake_case
      .toArray()
    return data.map(d => this.fromDB(d))
  }

  async findByName(userId: number, name: string): Promise<Exercise[]> {
    const lowerName = name.toLowerCase()
    const data = await this.table
      .where('user_id').equals(userId)
      .filter(e => e.name.toLowerCase().includes(lowerName))
      .toArray()
    return data.map(d => this.fromDB(d))
  }
}