import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { HabitWeekPlan as HabitWeekPlanData } from '../lib/db'
import { HabitWeekPlan } from '../domain/habit_weeK_plan'

export class HabitWeekPlanRepository extends BaseDexieRepository<HabitWeekPlanData, HabitWeekPlan> {
  constructor(table: Table<HabitWeekPlanData, number>) {
    super(table)
  }

  protected fromDB(data: HabitWeekPlanData): HabitWeekPlan {
    return HabitWeekPlan.fromDB(data)
  }

  protected toDB(domain: HabitWeekPlan): HabitWeekPlanData {
    return domain.toDB() as HabitWeekPlanData
  }

  async findByHabitAndWeek(habitId: number, weekId: number): Promise<HabitWeekPlan | undefined> {
    const data = await this.table.where({ habit_id: habitId, week_id: weekId }).first()
    return data ? this.fromDB(data) : undefined
  }

  async findAllByWeek(weekId: number): Promise<HabitWeekPlan[]> {
    const data = await this.table.where('week_id').equals(weekId).toArray()
    return data.map(d => this.fromDB(d))
  }

  async getPlannedDays(habitId: number, weekId: number): Promise<number[]> {
    const plan = await this.findByHabitAndWeek(habitId, weekId)
    return plan?.plannedDays ?? []   // 'plannedDays' es el getter de la clase dominio
  }
}