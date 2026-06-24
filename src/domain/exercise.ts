/* Ejercicio individual: define nombre, tipo (fuerza/resistencia), subtipo muscular
   y si es personalizado o predefinido. */
import { BaseEntity } from './base_entity'

export type ExerciseType = 'fuerza' | 'resistencia'
export type ExerciseSubType = 'core' | 'abdominal' | 'inferior' | 'superior' | 'full_body' | 'cardio'

export class Exercise extends BaseEntity {
  private _userId: number
  private _userUuid: string
  private _name: string
  private _type: ExerciseType
  private _subType?: ExerciseSubType
  private _description?: string
  private _isCustom: boolean

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    userUuid: string,
    name: string,
    type: ExerciseType,
    subType?: ExerciseSubType,
    description?: string,
    isCustom: boolean = true
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._userId = userId
    this._userUuid = userUuid
    this._name = name
    this._type = type
    this._subType = subType
    this._description = description
    this._isCustom = isCustom
  }

  get userId(): number { return this._userId }
  get userUuid(): string { return this._userUuid }
  get name(): string { return this._name }
  get type(): ExerciseType { return this._type }
  get subType(): ExerciseSubType | undefined { return this._subType }
  get description(): string | undefined { return this._description }
  get isCustom(): boolean { return this._isCustom }

  set name(value: string) {
    this._name = value
    this.updateTimestamp()
  }
  set type(value: ExerciseType) {
    this._type = value
    this.updateTimestamp()
  }
  set subType(value: ExerciseSubType | undefined) {
    this._subType = value
    this.updateTimestamp()
  }
  set description(value: string | undefined) {
    this._description = value
    this.updateTimestamp()
  }

  /* Devuelve la zona muscular o tipo de esfuerzo que trabaja el ejercicio. */
  getTargetZone(): string {
    if (this._subType) return this._subType
    return this._type === 'fuerza' ? 'general' : 'cardiovascular'
  }

  static fromDB(data: any): Exercise {
    return new Exercise(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.user_uuid,
      data.name,
      data.type as ExerciseType,
      data.sub_type as ExerciseSubType | undefined,
      data.description,
      data.is_custom
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      user_id: this._userId,
      user_uuid: this._userUuid,
      name: this._name,
      type: this._type,
      sub_type: this._subType,
      description: this._description,
      is_custom: this._isCustom,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}