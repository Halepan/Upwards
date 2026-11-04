import type { Table } from 'dexie'
import type { BaseEntity } from '../domain/base_entity'
import type { ISyncableRepository } from './isyncable_repository'
import type { BaseEntity as BE } from '../lib/db'
/**
 * Repositorio base que maneja dos tipos:
 * - TData : la interfaz plana que Dexie devuelve / espera (snake_case)
 * - TDomain : la clase de dominio que usan los servicios (camelCase)
 */
export abstract class BaseDexieRepository<
  TData extends BE,
  TDomain extends BaseEntity
> implements ISyncableRepository<TDomain> {

  protected table: Table<TData, number>

  constructor(table: Table<TData, number>) {
    this.table = table
  }

  // Métodos de conversión que cada subclase implementará usando los estáticos del dominio
  protected abstract fromDB(data: TData): TDomain
  protected abstract toDB(domain: TDomain): TData

  async findById(id: number): Promise<TDomain | undefined> {
    const data = await this.table.get(id)
    return data ? this.fromDB(data) : undefined
  }

  async findAll(): Promise<TDomain[]> {
    const allData = await this.table.toArray()
    return allData.map(item => this.fromDB(item))
  }

  async save(entity: TDomain): Promise<TDomain> {
    const dbObj = this.toDB(entity)
    const id = await this.table.put(dbObj as any)
    const saved = await this.table.get(id)
    return this.fromDB(saved!)
  }

  async delete(id: number): Promise<void> {
    await this.table.delete(id)
  }

  async findPendingSync(): Promise<TDomain[]> {
    const data = await this.table
      .where('sync_status').equals('pending')
      .toArray()
    return data.map(item => this.fromDB(item))
  }

  async markAsSynced(id: number): Promise<void> {
    await this.table.update(id, { sync_status: 'synced' } as any)
  }

  async findByUuid(uuid: string): Promise<TDomain | undefined> {
    const data = await this.table.where('uuid').equals(uuid).first()
    return data ? this.fromDB(data) : undefined
  }
}