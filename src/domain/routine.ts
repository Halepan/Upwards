/* Agrupa un conjunto de ejercicios en una rutina. Puede activarse/desactivarse
   para controlar qué rutinas están disponibles en el día a día. */
import { BaseEntity } from './base_entity'

export class Routine extends BaseEntity {
  private _userId: number
  private _userUuid: string
  private _name: string
  private _description?: string
  private _isActive: boolean

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    userUuid: string,
    name: string,
    description?: string,
    isActive: boolean = true
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._userId = userId
    this._userUuid = userUuid
    this._name = name
    this._description = description
    this._isActive = isActive
  }

  get userId(): number { return this._userId }
  get userUuid(): string { return this._userUuid }
  get name(): string { return this._name }
  get description(): string | undefined { return this._description }
  get isActive(): boolean { return this._isActive }

  set name(value: string) {
    this._name = value
    this.updateTimestamp()
  }
  set description(value: string | undefined) {
    this._description = value
    this.updateTimestamp()
  }

  activate(): void {
    this._isActive = true
    this.updateTimestamp()
  }

  deactivate(): void {
    this._isActive = false
    this.updateTimestamp()
  }

  static fromDB(data: any): Routine {
    return new Routine(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.user_uuid,
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
      user_uuid: this._userUuid,
      name: this._name,
      description: this._description,
      is_active: this._isActive,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }

  toSupabase(): any {
    return {
      id: this._uuid,
      user_id: this._userUuid,
      name: this._name,
      description: this._description,
      is_active: this._isActive,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    }
  }
}