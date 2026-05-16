/* Asocia un hábito a una semana específica con los días planeados (ISO: 1=lunes..7=domingo).
   Permite planificar qué días de la semana se ejecutará cada hábito. */

import { BaseEntity } from './base_entity'

export class HabitWeekPlan extends BaseEntity {
  private _habitId: number
  private _weekId: number
  private _plannedDays: number[]

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

  get habitId(): number { return this._habitId }
  get weekId(): number { return this._weekId }
  get plannedDays(): number[] { return [...this._plannedDays] }

  set plannedDays(value: number[]) {
    if (value.some(dayNumber => dayNumber < 1 || dayNumber > 7)) {
      throw new Error('Los días deben estar entre 1 (lunes) y 7 (domingo)')
    }
    this._plannedDays = [...value]
    this.updateTimestamp()
  }

  /* Agrega un día al plan si no está ya incluido, manteniendo orden ascendente. */
  addDay(day: number): void {
    if (day < 1 || day > 7) throw new Error('Día inválido')
    if (!this._plannedDays.includes(day)) {
      this._plannedDays.push(day)
      this._plannedDays.sort((a, b) => a - b)
      this.updateTimestamp()
    }
  }

  /* Elimina un día del plan. */
  removeDay(day: number): void {
    this._plannedDays = this._plannedDays.filter(plannedDay => plannedDay !== day)
    this.updateTimestamp()
  }

  isDayPlanned(day: number): boolean {
    return this._plannedDays.includes(day)
  }

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