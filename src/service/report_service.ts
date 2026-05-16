import { HabitRepository } from '../repository/habit_repository'
import { HabitLogRepository } from '../repository/habit_log_repository'
import { IncomeEntryRepository } from '../repository/income_entry_repository'
import { ExpenseEntryRepository } from '../repository/expense_entry_repository'
import { AccountRepository } from '../repository/account_repository'
import { RoutineLogRepository } from '../repository/routine_log_repository'
import { db } from '../lib/db'

/* Reporte mensual consolidado de hábitos, finanzas y fitness. */
export interface MonthlyReport {
  userId: number
  year: number
  month: number
  habits: {
    total: number
    averageCompletion: number
  }
  finances: {
    totalIncome: number
    totalExpenses: number
    balance: number
    byAccount: { name: string; monthExpenses: number }[]
  }
  fitness: {
    workoutsCompleted: number
  }
}

/* Servicio que genera reportes mensuales consolidados de todas las áreas del sistema. */
export class ReportService {
  private habitRepo: HabitRepository
  private habitLogRepo: HabitLogRepository
  private incomeRepo: IncomeEntryRepository
  private expenseRepo: ExpenseEntryRepository
  private accountRepo: AccountRepository
  private routineLogRepo: RoutineLogRepository

  constructor(
    habitRepo?: HabitRepository,
    habitLogRepo?: HabitLogRepository,
    incomeRepo?: IncomeEntryRepository,
    expenseRepo?: ExpenseEntryRepository,
    accountRepo?: AccountRepository,
    routineLogRepo?: RoutineLogRepository
  ) {
    this.habitRepo = habitRepo ?? new HabitRepository(db.habits)
    this.habitLogRepo = habitLogRepo ?? new HabitLogRepository(db.habit_logs)
    this.incomeRepo = incomeRepo ?? new IncomeEntryRepository(db.income_entries)
    this.expenseRepo = expenseRepo ?? new ExpenseEntryRepository(db.expense_entries)
    this.accountRepo = accountRepo ?? new AccountRepository(db.accounts)
    this.routineLogRepo = routineLogRepo ?? new RoutineLogRepository(db.routine_logs)
  }

  async generateMonthlyReport(userId: number, year: number, month: number): Promise<MonthlyReport> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = this.getEndDate(year, month)

    const [habits, accounts, totalIncome, allRoutineLogs] = await Promise.all([
      this.habitRepo.findByUserId(userId),
      this.accountRepo.findByUserId(userId),
      this.incomeRepo.getTotalAmountInRange(userId, startDate, endDate),
      this.routineLogRepo.findAll()
    ])

    let totalCompletion = 0
    let habitsWithRecords = 0
    for (const habit of habits) {
      const logs = await this.habitLogRepo.findByHabitInRange(habit.id!, startDate, endDate)
      if (logs.length === 0) continue
      habitsWithRecords++
      const completedLogs = logs.filter(logEntry => logEntry.isCompleted()).length
      totalCompletion += (completedLogs / logs.length) * 100
    }

    const byAccount = []
    for (const account of accounts) {
      const expenses = await this.expenseRepo.findByAccount(account.id!)
      const totalExpensesForAccount = expenses
        .filter(expense => expense.date >= startDate && expense.date <= endDate)
        .reduce((total, expense) => total + expense.amount, 0)

      byAccount.push({ name: account.name, monthExpenses: totalExpensesForAccount })
    }

    const allExpenses = await this.expenseRepo.findAll()
    const totalExpenses = allExpenses
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .reduce((total, entry) => total + entry.amount, 0)

    const workoutsCompleted = allRoutineLogs.filter(
      routineLog => routineLog.date >= startDate && routineLog.date <= endDate && routineLog.isCompleted()
    ).length

    return {
      userId,
      year,
      month,
      habits: {
        total: habits.length,
        averageCompletion: habitsWithRecords > 0 ? Math.round(totalCompletion / habitsWithRecords) : 0
      },
      finances: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        byAccount
      },
      fitness: {
        workoutsCompleted
      }
    }
  }

  async exportToPDF(report: MonthlyReport): Promise<Blob> {
    const text = JSON.stringify(report, null, 2)
    return new Blob([text], { type: 'application/pdf' })
  }

  private getEndDate(year: number, month: number): string {
    const date = new Date(year, month, 0)
    return `${year}-${String(month).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}
