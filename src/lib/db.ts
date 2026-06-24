import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'

/* Módulo ORM de la base de datos offline (IndexedDB vía Dexie).
   Corazón de la arquitectura Offline-first: define schemas, tablas y hooks
   que garantizan UUID, timestamps y sync_status en cada registro. */

export interface BaseEntity {
  id?: number
  uuid: string
  created_at: string
  updated_at: string
  sync_status: 'pending' | 'synced' | 'conflict'
}

export interface User extends BaseEntity {
  name: string
  email?: string
  auth_method?: string
  pin_hash?: string
}

export interface Account extends BaseEntity {
  user_id: number
  user_uuid: string
  name: string
  type: 'spendable' | 'savings' | 'investment' | 'donation'
  balance: number
}

export interface IncomeEntry extends BaseEntity {
  user_id: number
  user_uuid: string
  amount: number
  classification: 'pasivo' | 'timeswap' | 'give' | 'otro'
  note?: string
  date: string
}

export interface ExpenseEntry extends BaseEntity {
  account_id: number
  account_uuid: string
  amount: number
  category: string
  note?: string
  date: string
}

export interface AutoPercentRule extends BaseEntity {
  source_account_id: string | null
  target_account_id: number
  target_account_uuid: string
  percentage: number
  is_active: boolean
}

export interface Habit extends BaseEntity {
  user_id: number
  user_uuid: string
  name: string
  description?: string
  frequency_goal: number
  color: string
  icon: string
  is_archived: boolean
}

export interface HabitLog extends BaseEntity {
  habit_id: number
  habit_uuid: string
  date: string
  status: 'completed' | 'missed' | 'planned'
  completed_at?: string
}

export interface Week extends BaseEntity {
  user_id: number
  user_uuid: string
  start_date: string
  end_date?: string
  notes?: string
}

export interface HabitWeekPlan extends BaseEntity {
  habit_id: number
  habit_uuid: string
  week_id: number
  week_uuid: string
  planned_days: number[]
}

export interface Exercise extends BaseEntity {
  user_id: number
  user_uuid: string
  name: string
  type: 'fuerza' | 'resistencia'
  sub_type?: string
  description?: string
  is_custom: boolean
}

export interface Routine extends BaseEntity {
  user_id: number
  user_uuid: string
  name: string
  description?: string
  is_active: boolean
}

export interface RoutineExercise extends BaseEntity {
  routine_id: number
  routine_uuid: string
  exercise_id: number
  exercise_uuid: string
  target_reps: number
  order_index: number
  notes?: string
}

export interface RoutineLog extends BaseEntity {
  routine_id: number
  routine_uuid: string
  date: string
  notes?: string
  completed: boolean
}

export interface RoutineLogDetail extends BaseEntity {
  routine_log_id: number
  routine_log_uuid: string
  exercise_id: number
  exercise_uuid: string
  reps_done: number
}

export interface BodyMeasurement extends BaseEntity {
  user_id: number
  user_uuid: string
  date: string
  weight_kg?: number
  body_fat_percent?: number
  height_cm?: number
  chest_cm?: number
  waist_cm?: number
  thigh_cm?: number
}

export interface BiometricMetric extends BaseEntity {
  user_id: number
  user_uuid: string
  timestamp: string
  heart_rate?: number
  steps?: number
  source?: string
}

export interface SyncQueueEntry {
  id?: number
  operation: 'create' | 'update' | 'delete'
  table_name: string
  record_id: number
  record_uuid?: string
  payload: any
  timestamp: string
  attempts: number
  last_error?: string
}

export class UpwardsDB extends Dexie {
  users!: Table<User, number>
  accounts!: Table<Account, number>
  income_entries!: Table<IncomeEntry, number>
  expense_entries!: Table<ExpenseEntry, number>
  auto_percent_rules!: Table<AutoPercentRule, number>
  habits!: Table<Habit, number>
  habit_logs!: Table<HabitLog, number>
  weeks!: Table<Week, number>
  habit_week_plans!: Table<HabitWeekPlan, number>
  exercises!: Table<Exercise, number>
  routines!: Table<Routine, number>
  routine_exercises!: Table<RoutineExercise, number>
  routine_logs!: Table<RoutineLog, number>
  routine_log_details!: Table<RoutineLogDetail, number>
  body_measurements!: Table<BodyMeasurement, number>
  biometric_metrics!: Table<BiometricMetric, number>
  sync_queue!: Table<SyncQueueEntry, number>

  constructor() {
    super('UpwardsDB')

    this.version(2).stores({
      users: '++id, &uuid, email, sync_status',
      accounts: '++id, &uuid, user_id, user_uuid, type, sync_status',
      income_entries: '++id, &uuid, user_id, user_uuid, date, sync_status',
      expense_entries: '++id, &uuid, account_id, account_uuid, date, sync_status',
      auto_percent_rules: '++id, &uuid, target_account_id, target_account_uuid, sync_status',
      habits: '++id, &uuid, user_id, user_uuid, sync_status',
      habit_logs: '++id, &uuid, habit_id, habit_uuid, date, sync_status, [habit_id+date], [habit_uuid+date]',
      weeks: '++id, &uuid, user_id, user_uuid, &start_date, sync_status',
      habit_week_plans: '++id, &uuid, habit_id, habit_uuid, week_id, week_uuid, sync_status, [habit_id+week_id], [habit_uuid+week_uuid]',
      exercises: '++id, &uuid, user_id, user_uuid, sync_status',
      routines: '++id, &uuid, user_id, user_uuid, sync_status',
      routine_exercises: '++id, &uuid, routine_id, routine_uuid, exercise_id, exercise_uuid, sync_status, [routine_id+exercise_id]',
      routine_logs: '++id, &uuid, routine_id, routine_uuid, date, sync_status',
      routine_log_details: '++id, &uuid, routine_log_id, routine_log_uuid, exercise_id, exercise_uuid, sync_status, [routine_log_id+exercise_id]',
      body_measurements: '++id, &uuid, user_id, user_uuid, date, sync_status',
      biometric_metrics: '++id, &uuid, user_id, user_uuid, timestamp, sync_status',
      sync_queue: '++id, table_name, timestamp, attempts'
    })

    // Hook para autocompletar uuid, timestamps y sync_status en todas las tablas
    const tablesToHook = [
      this.users, this.accounts, this.income_entries, this.expense_entries,
      this.auto_percent_rules, this.habits, this.habit_logs, this.weeks,
      this.habit_week_plans, this.exercises, this.routines, this.routine_exercises,
      this.routine_logs, this.routine_log_details, this.body_measurements,
      this.biometric_metrics
    ]

    tablesToHook.forEach(table => {
      table.hook('creating', (_primKey, obj) => {
        if (!obj.uuid) obj.uuid = uuidv4()
        if (!obj.created_at) obj.created_at = new Date().toISOString()
        if (!obj.updated_at) obj.updated_at = new Date().toISOString()
        if (!obj.sync_status) obj.sync_status = 'pending'
      })
    })
  }
}

export const db = new UpwardsDB()