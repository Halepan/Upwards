export { BaseStore } from './base_store'
export { HabitStore } from './habit_store'
export { FitnessStore } from './fitness_store'
export { FinanceStore } from './finance_store'
export { useAuthStore } from './auth_store'

import { HabitStore } from './habit_store'
import { FitnessStore } from './fitness_store'
import { FinanceStore } from './finance_store'

export const financeStore = new FinanceStore()
export const fitnessStore = new FitnessStore()
export const habitStore = new HabitStore()
