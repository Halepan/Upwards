import { ref, type Ref } from 'vue'
import { db } from '../lib/db'
import { Habit } from '../domain/habit'
import { HabitLog, type HabitStatus } from '../domain/habit_log'
import { HabitRepository } from '../repository/habit_repository'
import { HabitLogRepository } from '../repository/habit_log_repository'
import { WeekRepository } from '../repository/week_repository'
import { HabitWeekPlanRepository } from '../repository/habit_week_plan_repository'
import { HabitService, type CreateHabitDTO, type WeeklyProgress } from '../service/habit_service'
import { BaseStore } from './base_store'

export class HabitStore extends BaseStore<Habit> {
  protected repository: HabitRepository
  private service: HabitService
  private logRepo: HabitLogRepository

  logs: Ref<HabitLog[]>
  allLogs: Ref<HabitLog[]>
  weeklyProgress: Ref<WeeklyProgress | null>
  selectedHabit: Ref<Habit | null>

  constructor() {
    super()
    const habitRepo = new HabitRepository(db.habits)
    this.logRepo = new HabitLogRepository(db.habit_logs)
    const weekRepo = new WeekRepository(db.weeks)
    const weekPlanRepo = new HabitWeekPlanRepository(db.habit_week_plans)

    this.repository = habitRepo
    this.service = new HabitService(habitRepo, this.logRepo, weekRepo, weekPlanRepo)

    this.logs = ref<HabitLog[]>([]) as Ref<HabitLog[]>
    this.allLogs = ref<HabitLog[]>([]) as Ref<HabitLog[]>
    this.weeklyProgress = ref<WeeklyProgress | null>(null)
    this.selectedHabit = ref<Habit | null>(null) as Ref<Habit | null>
  }

  async loadAll(): Promise<void> {
    await this.fetchAll()
    this.allLogs.value = await this.logRepo.findAll()
  }

  async createHabit(data: CreateHabitDTO): Promise<Habit> {
    const habit = await this.service.createHabit(data.userId, data)
    this._items.value.push(habit)
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
