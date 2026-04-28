// Este modulo se encarga de manejar las mediciones genericas del cuerpo 
//para medir el indice de grasa corporal 
import { BaseEntity } from './base_entity'

export class BodyMeasurement extends BaseEntity {
  private _userId: number
  private _date: string           // YYYY-MM-DD
  private _weightKg?: number
  private _bodyFatPercent?: number
  private _heightCm?: number
  private _chestCm?: number
  private _waistCm?: number
  private _thighCm?: number

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    userId: number,
    date: string,
    weightKg?: number,
    bodyFatPercent?: number,
    heightCm?: number,
    chestCm?: number,
    waistCm?: number,
    thighCm?: number
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._userId = userId
    this._date = date
    this._weightKg = weightKg
    this._bodyFatPercent = bodyFatPercent
    this._heightCm = heightCm
    this._chestCm = chestCm
    this._waistCm = waistCm
    this._thighCm = thighCm
  }

  // Getters
  get userId(): number { return this._userId }
  get date(): string { return this._date }
  get weightKg(): number | undefined { return this._weightKg }
  get bodyFatPercent(): number | undefined { return this._bodyFatPercent }
  get heightCm(): number | undefined { return this._heightCm }
  get chestCm(): number | undefined { return this._chestCm }
  get waistCm(): number | undefined { return this._waistCm }
  get thighCm(): number | undefined { return this._thighCm }

  // Setters
  set weightKg(value: number | undefined) {
    if (value !== undefined && value <= 0) throw new Error('El peso debe ser mayor que cero')
    this._weightKg = value
    this.updateTimestamp()
  }
  set bodyFatPercent(value: number | undefined) {
    if (value !== undefined && (value < 0 || value > 60)) throw new Error('El porcentaje de grasa debe estar entre 0 y 60')
    this._bodyFatPercent = value
    this.updateTimestamp()
  }
  set heightCm(value: number | undefined) {
    if (value !== undefined && value <= 0) throw new Error('La altura debe ser mayor que cero')
    this._heightCm = value
    this.updateTimestamp()
  }
  set chestCm(value: number | undefined) {
    if (value !== undefined && value <= 0) throw new Error('La medida de pecho debe ser mayor que cero')
    this._chestCm = value
    this.updateTimestamp()
  }
  set waistCm(value: number | undefined) {
    if (value !== undefined && value <= 0) throw new Error('La medida de cintura debe ser mayor que cero')
    this._waistCm = value
    this.updateTimestamp()
  }
  set thighCm(value: number | undefined) {
    if (value !== undefined && value <= 0) throw new Error('La medida de muslos debe ser mayor que cero')
    this._thighCm = value
    this.updateTimestamp()
  }

  // Métodos de negocio
  getBMI(): number | undefined {
    if (!this._weightKg || !this._heightCm) return undefined
    const heightM = this._heightCm / 100
    const bmi = this._weightKg / (heightM * heightM)
    return Math.round(bmi * 10) / 10   // redondeo a 1 decimal
  }

  getBMICategory(): string | undefined {
    const bmi = this.getBMI()
    if (bmi === undefined) return undefined
    if (bmi < 18.5) return 'bajo_peso'
    if (bmi < 25) return 'normal'
    if (bmi < 30) return 'sobrepeso'
    return 'obesidad'
  }

  getWaistHipRatio(): number | undefined {
    // Nota: no tenemos cadera (hip), pero se puede añadir en el futuro. Por ahora devolvemos undefined.
    return undefined
  }

  // Conversión
  static fromDB(data: any): BodyMeasurement {
    return new BodyMeasurement(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.user_id,
      data.date,
      data.weight_kg,
      data.body_fat_percent,
      data.height_cm,
      data.chest_cm,
      data.waist_cm,
      data.thigh_cm
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      user_id: this._userId,
      date: this._date,
      weight_kg: this._weightKg,
      body_fat_percent: this._bodyFatPercent,
      height_cm: this._heightCm,
      chest_cm: this._chestCm,
      waist_cm: this._waistCm,
      thigh_cm: this._thighCm,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}