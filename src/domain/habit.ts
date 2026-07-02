/* Entidad de dominio que define un hábito: su nombre, frecuencia semanal objetivo,
   color e ícono para la UI, y estado de archivado. */

import { BaseEntity } from './base_entity'

export class Habit extends BaseEntity {
  private _userId: number
  private _userUuid: string
  private _name: string
  private _description?: string
  private _frequencyGoal: number
  private _color: string
  private _icon: string
  private _isArchived: boolean

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    userUuid: string,
    name: string,
    description?: string,
    frequencyGoal: number = 7,
    color: string = '#4CAF50',
    icon: string = 'star',
    isArchived: boolean = false
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._userId = userId
    this._userUuid = userUuid
    this._name = name
    this._description = description
    this._frequencyGoal = frequencyGoal
    this._color = color
    this._icon = icon
    this._isArchived = isArchived
  }

  get userId(): number { return this._userId }
  get userUuid(): string { return this._userUuid }
  get name(): string { return this._name }
  get description(): string | undefined { return this._description }
  get frequencyGoal(): number { return this._frequencyGoal }
  get color(): string { return this._color }
  get icon(): string { return this._icon }
  get isArchived(): boolean { return this._isArchived }

  set name(value: string) {
    this._name = value
    this.updateTimestamp()
  }
  set description(value: string | undefined) {
    this._description = value
    this.updateTimestamp()
  }
  set frequencyGoal(value: number) {
    if (value < 1 || value > 7) throw new Error('La frecuencia debe estar entre 1 y 7 días')
    this._frequencyGoal = value
    this.updateTimestamp()
  }
  set color(value: string) {
    this._color = value
    this.updateTimestamp()
  }
  set icon(value: string) {
    this._icon = value
    this.updateTimestamp()
  }

  /* Marca el hábito como archivado (oculto de la vista activa). */
  archive(): void {
    this._isArchived = true
    this.updateTimestamp()
  }

  /* Restaura un hábito archivado a activo. */
  restore(): void {
    this._isArchived = false
    this.updateTimestamp()
  }

  isActive(): boolean {
    return !this._isArchived
  }

  static fromDB(data: any): Habit {
    return new Habit(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.user_uuid,
      data.name,
      data.description,
      data.frequency_goal,
      data.color,
      data.icon,
      data.is_archived
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
      frequency_goal: this._frequencyGoal,
      color: this._color,
      icon: this._icon,
      is_archived: this._isArchived,
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
      frequency_goal: this._frequencyGoal,
      color: this._color,
      icon: this._icon,
      is_archived: this._isArchived,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    }
  }
}