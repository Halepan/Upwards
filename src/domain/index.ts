// MÓDULO ESENCIAL (Base + Usuario)
export { BaseEntity } from './base_entity'
export { User } from './user'
export type { AuthMethod } from './user'

// MÓDULO DE HÁBITOS
export { Habit } from './habit'
export { HabitLog } from './habit_log'
export type { HabitStatus } from './habit_log'
export { Week } from './week'
export { HabitWeekPlan } from './habit_weeK_plan'

// MÓDULO DE FINANZAS
export { Account } from './account'
export type { AccountType } from './account'
export { IncomeEntry } from './income_entry'
export type { IncomeClassification } from './income_entry'
export { ExpenseEntry } from './expense_entry'
export { AutoPercentRule } from './auto_percent_rule'

// MÓDULO DE EJERCICIOS Y MEDICIONES
export { Exercise } from './exercise'
export type { ExerciseType, ExerciseSubType } from './exercise'
export { Routine } from './routine'
export { RoutineExercise } from './routine_exercise'
export { RoutineLog } from './routine_log'
export { RoutineLogDetail } from './routine_log_detail'
export { BodyMeasurement } from './body_measurement'