import { BaseEntity } from './base_entity'

export class AutoPercentRule extends BaseEntity {
  private _targetAccountId: number
  private _percentage: number
  private _isActive: boolean

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    targetAccountId: number,
    percentage: number,
    isActive: boolean = true
  ) {
    super(id, uuid, createdAt, updatedAt)
    if (percentage < 0 || percentage > 100) {
      throw new Error('El porcentaje debe estar entre 0 y 100')
    }
    this._targetAccountId = targetAccountId
    this._percentage = percentage
    this._isActive = isActive
  }

  // Getters
  get targetAccountId(): number { return this._targetAccountId }
  get percentage(): number { return this._percentage }
  get isActive(): boolean { return this._isActive }

  // Setters
  set percentage(value: number) {
    if (value < 0 || value > 100) throw new Error('El porcentaje debe estar entre 0 y 100')
    this._percentage = value
    this.updateTimestamp()
  }
  set isActive(value: boolean) {
    this._isActive = value
    this.updateTimestamp()
  }

  // Método de negocio
  apply(amount: number): number {
    if (!this._isActive) return 0
    return (amount * this._percentage) / 100
  }

  // Conversión
  static fromDB(data: any): AutoPercentRule {
    return new AutoPercentRule(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.target_account_id,
      data.percentage,
      data.is_active
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      target_account_id: this._targetAccountId,
      percentage: this._percentage,
      is_active: this._isActive,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}