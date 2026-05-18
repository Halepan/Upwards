import { ref, type Ref } from 'vue'
import { db } from '../lib/db'
import { Account } from '../domain/account'
import { IncomeEntry } from '../domain/income_entry'
import { ExpenseEntry } from '../domain/expense_entry'
import { AccountRepository } from '../repository/account_repository'
import { IncomeEntryRepository } from '../repository/income_entry_repository'
import { ExpenseEntryRepository } from '../repository/expense_entry_repository'
import { AutoPercentRuleRepository } from '../repository/auto_percent_rule_repository'
import {
  FinanceService,
  type IncomeDTO,
  type ExpenseDTO,
} from '../service/finance_service'
import { BaseStore } from './base_store'

/* Store reactiva de finanzas. Gestiona cuentas, ingresos, gastos y reglas automáticas.
   Expone balances, filtros por fecha y operaciones de flujo de efectivo. */
export class FinanceStore extends BaseStore<Account> {
  protected repository: AccountRepository
  private service: FinanceService
  private incomeRepo: IncomeEntryRepository
  private expenseRepo: ExpenseEntryRepository

  incomes: Ref<IncomeEntry[]>
  expenses: Ref<ExpenseEntry[]>
  spendableBalance: Ref<number>

  constructor() {
    super()
    this.repository = new AccountRepository(db.accounts)
    this.incomeRepo = new IncomeEntryRepository(db.income_entries)
    this.expenseRepo = new ExpenseEntryRepository(db.expense_entries)
    const ruleRepo = new AutoPercentRuleRepository(db.auto_percent_rules)

    this.service = new FinanceService(this.repository, this.incomeRepo, this.expenseRepo, ruleRepo)

    this.incomes = ref<IncomeEntry[]>([])
    this.expenses = ref<ExpenseEntry[]>([])
    this.spendableBalance = ref(0)
  }

  /* Agrega un ingreso, aplica reglas automáticas y refresca el estado. */
  async addIncome(userId: number, data: IncomeDTO): Promise<IncomeEntry> {
    const entry = await this.service.addIncome(userId, data)
    this.incomes.value.push(entry)
    await this.refreshBalance(userId)
    return entry
  }

  /* Agrega un gasto, descuenta de la cuenta y refresca el estado. */
  async addExpense(accountId: number, data: ExpenseDTO): Promise<ExpenseEntry> {
    const entry = await this.service.addExpense(accountId, data)
    this.expenses.value.push(entry)
    await this.refreshAll(accountId)
    return entry
  }

  /* Calcula el balance disponible (cuentas tipo 'spendable'). */
  async refreshBalance(userId: number): Promise<void> {
    this.spendableBalance.value = await this.service.calculateSpendableBalance(userId)
    await this.fetchAll()
  }

  /* Carga los ingresos y gastos de un usuario. */
  async loadTransactions(userId: number): Promise<void> {
    const [incomes, expenses] = await Promise.all([
      this.incomeRepo.findByUserId(userId),
      this.expenseRepo.findAll(),
    ])
    this.incomes.value = incomes
    this.expenses.value = expenses
  }

  /* Refresca todo el estado financiero de una cuenta. */
  private async refreshAll(accountId: number): Promise<void> {
    const account = this.getById(accountId)
    if (account) {
      const fresh = await this.repository.findById(accountId)
      if (fresh) {
        const index = this._items.value.findIndex(a => a.id === accountId)
        if (index >= 0) {
          this._items.value[index] = fresh as any
        }
      }
    }
  }
}
