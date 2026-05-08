export interface IRepository<T> {
  findById(id: number): Promise<T | undefined>
  findAll(): Promise<T[]>
  save(entity: T): Promise<T>
  delete(id: number): Promise<void>
}