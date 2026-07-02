/* Entidad base abstracta que define los atributos comunes de toda entidad del sistema.
   Implementa el principio DRY al centralizar id, uuid y timestamps. */
export abstract class BaseEntity {
  protected _id?: number
  protected _uuid: string
  protected _createdAt: string
  protected _updatedAt: string

  constructor(id: number | undefined, uuid: string, createdAt: string, updatedAt: string) {
    this._id = id
    this._uuid = uuid
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  get id(): number | undefined {
    return this._id
  }

  get uuid(): string {
    return this._uuid
  }

  get createdAt(): string {
    return this._createdAt
  }

  get updatedAt(): string {
    return this._updatedAt
  }

  /* Actualiza el timestamp de modificación. Se invoca desde los setters de cada subclase. */
  public updateTimestamp(): void {
    this._updatedAt = new Date().toISOString()
  }

  toSupabase(): any{
    return
  }
}