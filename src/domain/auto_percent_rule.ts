// domain/auto_percent_rule.ts
import { BaseEntity } from './base_entity'

export class AutoPercentRule extends BaseEntity {
  private _sourceAccountId: string | null // null = regla global
  private _targetAccountId: number
  private _targetAccountUuid: string
  private _percentage: number
  private _isActive: boolean

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    sourceAccountId: string | null,
    targetAccountId: number,
    targetAccountUuid: string,
    percentage: number,
    isActive: boolean = true
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._sourceAccountId = sourceAccountId
    this._targetAccountId = targetAccountId
    this._targetAccountUuid = targetAccountUuid
    this._percentage = percentage
    this._isActive = isActive
  }

  // Getters
  get sourceAccountId(): string | null { return this._sourceAccountId }
  get targetAccountId(): number { return this._targetAccountId }
  get targetAccountUuid(): string { return this._targetAccountUuid }
  get percentage(): number { return this._percentage }
  get isActive(): boolean { return this._isActive }

  // Setters con validación
  set sourceAccountId(value: string | null) {
    this._sourceAccountId = value
    this.updateTimestamp()
  }

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

  // Conversiones
  static fromDB(data: any): AutoPercentRule {
    return new AutoPercentRule(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.source_account_id ?? null,
      data.target_account_id,
      data.target_account_uuid,
      data.percentage,
      data.is_active
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      source_account_id: this._sourceAccountId,
      target_account_id: this._targetAccountId,
      target_account_uuid: this._targetAccountUuid,
      percentage: this._percentage,
      is_active: this._isActive,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}