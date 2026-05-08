import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { HabitWeekPlan } from '../domain/habit_weeK_plan'

export class HabitWeekPlanRepository extends BaseDexieRepository<HabitWeekPlan> {
  constructor(table: Table<HabitWeekPlan, number>) {
    super(table)
  }

  async findByHabitAndWeek(habitId: number, weekId: number): Promise<HabitWeekPlan | undefined> {
    return this.table.where({ habit_id: habitId, week_id: weekId }).first()
  }

  async findAllByWeek(weekId: number): Promise<HabitWeekPlan[]> {
    return this.table.where('week_id').equals(weekId).toArray()
  }

  async getPlannedDays(habitId: number, weekId: number): Promise<number[]> {
    const plan = await this.findByHabitAndWeek(habitId, weekId)
    return plan?.plannedDays?? []
  }
}