import { Habit } from '../domain/habit'
import { HabitLog, type HabitStatus } from '../domain/habit_log'
import { HabitRepository } from '../repository/habit_repository'
import { HabitLogRepository } from '../repository/habit_log_repository'
import { WeekRepository } from '../repository/week_repository'
import { HabitWeekPlanRepository } from '../repository/habit_week_plan_repository'
import { db } from '../lib/db'
import { v4 as uuidv4 } from 'uuid'

/* DTO para la creación de un nuevo hábito. */
export interface CreateHabitDTO {
  userId: number
  userUuid?: string
  name: string
  description?: string
  frequencyGoal?: number
  color?: string
  icon?: string
}

/* Progreso semanal de un hábito: días planificados vs completados. */
export interface WeeklyProgress {
  weekStart: string
  plannedDays: number
  completedDays: number
  missedDays: number
  percentage: number
}

/* Servicio que gestiona el ciclo de vida de hábitos: creación, registro diario y progreso semanal. */
export class HabitService {
  private habitRepo: HabitRepository
  private habitLogRepo: HabitLogRepository
  private weekRepo: WeekRepository
  private weekPlanRepo: HabitWeekPlanRepository

  constructor(
    habitRepo?: HabitRepository,
    habitLogRepo?: HabitLogRepository,
    weekRepo?: WeekRepository,
    weekPlanRepo?: HabitWeekPlanRepository
  ) {
    this.habitRepo = habitRepo ?? new HabitRepository(db.habits)
    this.habitLogRepo = habitLogRepo ?? new HabitLogRepository(db.habit_logs)
    this.weekRepo = weekRepo ?? new WeekRepository(db.weeks)
    this.weekPlanRepo = weekPlanRepo ?? new HabitWeekPlanRepository(db.habit_week_plans)
  }

  async createHabit(userId: number, data: CreateHabitDTO): Promise<Habit> {
    const now = new Date().toISOString()
    const habit = new Habit(
      undefined, uuidv4(), now, now,
      userId, data.userUuid || '', data.name, data.description,
      data.frequencyGoal, data.color, data.icon
    )
    return this.habitRepo.save(habit)
  }

  /* Marca el estado diario de un hábito (completado/perdido/planeado).
     Si ya existe un registro, lo actualiza; si no, crea uno nuevo. */
  async markDay(habitId: number, date: string, status: HabitStatus, habitUuid?: string): Promise<void> {
    const existingLog = await this.habitLogRepo.findByHabitAndDate(habitId, date)
    if (existingLog) {
      if (status === 'completed') existingLog.markCompleted()
      else if (status === 'missed') existingLog.markMissed()
      else existingLog.resetToPlanned()
      await this.habitLogRepo.save(existingLog)
    } else {
      const now = new Date().toISOString()
      const log = new HabitLog(
        undefined, uuidv4(), now, now,
        habitId, habitUuid || '', date, status,
        status === 'completed' ? now : undefined
      )
      await this.habitLogRepo.save(log)
    }
  }

  async getWeeklyProgress(habitId: number, weekStart: string): Promise<WeeklyProgress> {
    const week = await this.weekRepo.findByStartDate(weekStart)
    if (!week) {
      return { weekStart, plannedDays: 0, completedDays: 0, missedDays: 0, percentage: 0 }
    }

    const plan = await this.weekPlanRepo.findByHabitAndWeek(habitId, week.id!)
    const plannedDays = plan ? plan.plannedDays.length : 0

    const endDate = week.endDate ?? weekStart
    const logs = await this.habitLogRepo.findByHabitInRange(habitId, weekStart, endDate)
    const completedDays = logs.filter(logEntry => logEntry.status === 'completed').length
    const missedDays = logs.filter(logEntry => logEntry.status === 'missed').length

    return {
      weekStart,
      plannedDays,
      completedDays,
      missedDays,
      percentage: plannedDays > 0 ? Math.round((completedDays / plannedDays) * 100) : 0
    }
  }

  async detectMissedDays(habitId: number, weekStart: string): Promise<string[]> {
    const week = await this.weekRepo.findByStartDate(weekStart)
    if (!week) return []

    const plan = await this.weekPlanRepo.findByHabitAndWeek(habitId, week.id!)
    if (!plan) return []

    const endDate = week.endDate ?? weekStart
    const logs = await this.habitLogRepo.findByHabitInRange(habitId, weekStart, endDate)
    const completedDates = new Set(logs.filter(logEntry => logEntry.isCompleted()).map(logEntry => logEntry.date))

    return plan.plannedDays
      .filter(day => {
        const date = this.calculateDateFromDay(weekStart, day)
        return !completedDates.has(date)
      })
      .map(day => this.calculateDateFromDay(weekStart, day))
  }

  private calculateDateFromDay(weekStart: string, day: number): string {
    const start = new Date(weekStart)
    start.setDate(start.getDate() + (day - 1))
    return start.toISOString().split('T')[0]
  }
}
