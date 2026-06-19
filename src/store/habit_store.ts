import { ref, type Ref } from 'vue'
import { db } from '../lib/db'
import { Habit } from '../domain/habit'
import { HabitLog, type HabitStatus } from '../domain/habit_log'
import { Week } from '../domain/week'
import { HabitWeekPlan } from '../domain/habit_week_plan'
import { HabitRepository } from '../repository/habit_repository'
import { HabitLogRepository } from '../repository/habit_log_repository'
import { WeekRepository } from '../repository/week_repository'
import { HabitWeekPlanRepository } from '../repository/habit_week_plan_repository'
import { HabitService, type CreateHabitDTO, type WeeklyProgress } from '../service/habit_service'
import { BaseStore } from './base_store'
import { v4 as uuidv4 } from 'uuid'

export class HabitStore extends BaseStore<Habit> {
  protected repository: HabitRepository
  private service: HabitService
  private logRepo: HabitLogRepository
  private weekRepo: WeekRepository
  private weekPlanRepo: HabitWeekPlanRepository

  logs: Ref<HabitLog[]>
  allLogs: Ref<HabitLog[]>
  weeklyProgress: Ref<WeeklyProgress | null>
  selectedHabit: Ref<Habit | null>
  plannedForToday: Ref<number[]>
  currentWeekStart: Ref<string>

  constructor() {
    super()
    const habitRepo = new HabitRepository(db.habits)
    this.logRepo = new HabitLogRepository(db.habit_logs)
    this.weekRepo = new WeekRepository(db.weeks)
    this.weekPlanRepo = new HabitWeekPlanRepository(db.habit_week_plans)

    this.repository = habitRepo
    this.service = new HabitService(habitRepo, this.logRepo, this.weekRepo, this.weekPlanRepo)

    this.logs = ref<HabitLog[]>([]) as Ref<HabitLog[]>
    this.allLogs = ref<HabitLog[]>([]) as Ref<HabitLog[]>
    this.weeklyProgress = ref<WeeklyProgress | null>(null)
    this.selectedHabit = ref<Habit | null>(null) as Ref<Habit | null>
    this.plannedForToday = ref<number[]>([]) as Ref<number[]>
    this.currentWeekStart = ref('') as Ref<string>
  }

  async loadAll(): Promise<void> {
    await this.fetchAll()
    this.allLogs.value = await this.logRepo.findAll()
  }

  async createHabit(data: CreateHabitDTO): Promise<Habit> {
    const habit = await this.service.createHabit(data.userId, data)
    this._items.value.push(habit)
    await this.loadWeekPlans()
    return habit
  }

  async markDay(habitId: number, date: string, status: HabitStatus): Promise<void> {
    await this.service.markDay(habitId, date, status)
    await this.refreshLogs(habitId)
  }

  async toggleDay(habitId: number, date: string): Promise<void> {
    const existing = this.allLogs.value.find(l => l.habitId === habitId && l.date === date)
    if (existing) {
      const newStatus: HabitStatus = existing.status === 'completed' ? 'missed' : 'completed'
      await this.service.markDay(habitId, date, newStatus)
    } else {
      await this.service.markDay(habitId, date, 'completed')
    }
    this.allLogs.value = await this.logRepo.findAll()
  }

  async loadWeeklyProgress(habitId: number, weekStart: string): Promise<void> {
    this.weeklyProgress.value = await this.service.getWeeklyProgress(habitId, weekStart)
  }

  async archiveHabit(habitId: number): Promise<void> {
    await this.repository.archiveHabit(habitId)
    const habit = this.getById(habitId)
    if (habit) {
      habit.archive()
    }
  }

  async deleteHabit(habitId: number): Promise<void> {
    await this.repository.delete(habitId)
    this._items.value = this._items.value.filter(h => (h as any).id !== habitId)
    this.allLogs.value = this.allLogs.value.filter(l => l.habitId !== habitId)
    await this.loadWeekPlans()
  }

  async selectHabit(habit: Habit): Promise<void> {
    this.selectedHabit.value = habit
    await this.refreshLogs(habit.id!)
  }

  private async refreshLogs(habitId: number): Promise<void> {
    if (!this.selectedHabit.value || this.selectedHabit.value.id !== habitId) return
    this.logs.value = await this.logRepo.findByHabitInRange(
      habitId,
      this.getWeekStart(),
      this.getWeekEnd()
    )
  }

  async saveWeekPlan(assignments: Record<number, number[]>): Promise<void> {
    console.log("saveWeekplan")
    const weekStart = this.getWeekStart()
    this.currentWeekStart.value = weekStart
    let week = await this.weekRepo.findByStartDate(weekStart)
    if (!week) {
      console.log("la semana no existe")
      const now = new Date().toISOString()
      const endDate = this.getWeekEnd()
      week = await this.weekRepo.save(new Week(
        undefined, uuidv4(), now, now,
        0, weekStart, endDate
      ))
    }
    const existingPlans = await this.weekPlanRepo.findAllByWeek(week.id!)
    for (const plan of existingPlans) {
      await this.weekPlanRepo.delete(plan.id!)
    }
    for (const [habitIdStr, days] of Object.entries(assignments)) {
      const habitId = Number(habitIdStr)
      if (days.length === 0) continue
      const now = new Date().toISOString()
      const plan = new HabitWeekPlan(
        undefined, uuidv4(), now, now,
        habitId, week.id!, days
      )
      console.log(days,habitId)
      await this.weekPlanRepo.save(plan)
    }
    console.log("guardada la semana con exito")
    this.loadWeekPlans()
  }

  async loadWeekPlans(): Promise<void> {
    console.log("se esta cargando la semana")
    const weekStart = this.getWeekStart()
    const today = new Date()
    const dayIndex = ((today.getDay() + 6) % 7)
    this.currentWeekStart.value = weekStart
    const week = await this.weekRepo.findByStartDate(weekStart)
    if (!week) {
      console.log("la semana no existe")
      this.plannedForToday.value = []
      return
    }
    console.log("la semana ",week.id," se cargo correctamante")
    const lhabits = await this.weekPlanRepo.findByHabitAndWeek(dayIndex, week.id!)
    const ids: number[] = []
    if (!lhabits){
      this.plannedForToday.value = []
      return
    }

    console.log("existen planes")
    for (const habit of lhabits.plannedDays) {
      console.log("el id del habito es ", habit)
      ids.push(habit)
    }
    console.log("se cargo todos los putos planes de ",dayIndex)
    this.plannedForToday.value = ids
  }

  private getWeekStart(): string {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  private getWeekEnd(): string {
    const start = new Date(this.getWeekStart())
    const sunday = new Date(start)
    sunday.setDate(sunday.getDate() + 6)
    return sunday.toISOString().split('T')[0]
  }
}
