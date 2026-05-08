import type { Table } from 'dexie'
import type { BaseEntity } from '../domain/base_entity'
import type { ISyncableRepository } from './isincablerepository'

export abstract class BaseDexieRepository<T extends BaseEntity> implements ISyncableRepository<T> {
  protected table: Table<T, number>

  constructor(table: Table<T, number>) {
    this.table = table
  }

  async findById(id: number): Promise<T | undefined> {
    return this.table.get(id)
  }

  async findAll(): Promise<T[]> {
    return this.table.toArray()
  }

  async save(entity: T): Promise<T> {
    const id = await this.table.put(entity)
    return this.table.get(id) as Promise<T>
  }

  async delete(id: number): Promise<void> {
    await this.table.delete(id)
  }

  async findPendingSync(): Promise<T[]> {
    return this.table.where('sync_status').equals('pending').toArray()
  }

  async markAsSynced(id: number): Promise<void> {
    await this.table.update(id, { sync_status: 'synced' } as any)
  }

  async findByUuid(uuid: string): Promise<T | undefined> {
    return this.table.where('uuid').equals(uuid).first()
  }
}