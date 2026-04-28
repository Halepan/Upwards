// Esta clase se encarga de gestionar la rutina completa es decir no solo un ejercico
import { BaseEntity } from './base_entity'

export class Routine extends BaseEntity {
  private _userId: number
  private _name: string
  private _description?: string
  private _isActive: boolean

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    name: string,
    description?: string,
    isActive: boolean = true
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._userId = userId
    this._name = name
    this._description = description
    this._isActive = isActive
  }

  // Getters
  get userId(): number { return this._userId }
  get name(): string { return this._name }
  get description(): string | undefined { return this._description }
  get isActive(): boolean { return this._isActive }

  // Setters
  set name(value: string) {
    this._name = value
    this.updateTimestamp()
  }
  set description(value: string | undefined) {
    this._description = value
    this.updateTimestamp()
  }

  // Métodos de negocio
  activate(): void {
    this._isActive = true
    this.updateTimestamp()
  }

  deactivate(): void {
    this._isActive = false
    this.updateTimestamp()
  }

  // Conversión
  static fromDB(data: any): Routine {
    return new Routine(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.name,
      data.description,
      data.is_active
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      user_id: this._userId,
      name: this._name,
      description: this._description,
      is_active: this._isActive,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}