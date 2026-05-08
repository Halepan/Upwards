import type { IRepository } from './irepository'

export interface ISyncableRepository<T> extends IRepository<T> {
  findPendingSync(): Promise<T[]>
  markAsSynced(id: number): Promise<void>
  findByUuid(uuid: string): Promise<T | undefined>
}