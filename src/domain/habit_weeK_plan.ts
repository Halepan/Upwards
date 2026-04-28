/*
Esta clase se encarga de enlazar los habitos con las semanas, 
creando la sincronizacion de un plan bien estructurado
*/    
    
import { BaseEntity } from './base_entity'

export class HabitWeekPlan extends BaseEntity {
  private _habitId: number
  private _weekId: number
  private _plannedDays: number[]   // Array de días ISO (1=Lunes..7=Domingo)

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    habitId: number,
    weekId: number,
    plannedDays: number[] = []
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._habitId = habitId
    this._weekId = weekId
    this._plannedDays = plannedDays
  }

  // Getters
  get habitId(): number { return this._habitId }
  get weekId(): number { return this._weekId }
  get plannedDays(): number[] { return [...this._plannedDays] } // copia defensiva

  // Setters
  set plannedDays(value: number[]) {
    // Validar que cada día esté entre 1 y 7
    if (value.some(d => d < 1 || d > 7)) {
      throw new Error('Los días deben estar entre 1 (lunes) y 7 (domingo)')
    }
    this._plannedDays = [...value]
    this.updateTimestamp()
  }

  // Métodos de negocio
  addDay(day: number): void {
    if (day < 1 || day > 7) throw new Error('Día inválido')
    if (!this._plannedDays.includes(day)) {
      this._plannedDays.push(day)
      this._plannedDays.sort((a, b) => a - b)
      this.updateTimestamp()
    }
  }

  removeDay(day: number): void {
    this._plannedDays = this._plannedDays.filter(d => d !== day)
    this.updateTimestamp()
  }

  isDayPlanned(day: number): boolean {
    return this._plannedDays.includes(day)
  }

  // Conversión
  static fromDB(data: any): HabitWeekPlan {
    return new HabitWeekPlan(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.habit_id,
      data.week_id,
      data.planned_days ? JSON.parse(JSON.stringify(data.planned_days)) : []
    )
  }

  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      habit_id: this._habitId,
      week_id: this._weekId,
      planned_days: this._plannedDays,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }
}