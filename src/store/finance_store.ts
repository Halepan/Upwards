// finance_store.ts
// Store de finanzas: gestiona cuentas, ingresos, gastos y reglas de derivación automática.

import { ref, type Ref } from 'vue'
import { db } from '../lib/db'
import { Account, type AccountType } from '../domain/account'
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
import { useAuthStore } from './auth_store'
import { v4 as uuidv4 } from 'uuid'

export class FinanceStore extends BaseStore<Account> {
  protected repository: AccountRepository
  private financeService: FinanceService
  private incomeRepo: IncomeEntryRepository
  private expenseRepo: ExpenseEntryRepository
  private ruleRepo: AutoPercentRuleRepository

  incomes: Ref<IncomeEntry[]>
  expenses: Ref<ExpenseEntry[]>
  spendableBalance: Ref<number>

  constructor() {
    super()

    this.repository = new AccountRepository(db.accounts)
    this.incomeRepo = new IncomeEntryRepository(db.income_entries)
    this.expenseRepo = new ExpenseEntryRepository(db.expense_entries)
    this.ruleRepo = new AutoPercentRuleRepository(db.auto_percent_rules)

    this.financeService = new FinanceService(
      this.repository,
      this.incomeRepo,
      this.expenseRepo,
      this.ruleRepo
    )

    this.incomes = ref<IncomeEntry[]>([]) as Ref<IncomeEntry[]>
    this.expenses = ref<ExpenseEntry[]>([]) as Ref<ExpenseEntry[]>
    this.spendableBalance = ref(0)
  }

  async loadAll(userId: number): Promise<void> {
    await Promise.all([
      this.fetchAll(),
      this.loadTransactions(userId),
    ])
  }

  // ----------------------------------------------------------------
  // Transacciones
  // ----------------------------------------------------------------
  async addIncome(accountId: number, data: Omit<IncomeDTO, 'accountUuid'>): Promise<IncomeEntry> {
    // Obtener el UUID de la cuenta a partir del ID
    const account = this._items.value.find(a => a.id === accountId)
    if (!account) throw new Error('Cuenta no encontrada en el store local')

    const dataWithUuid: IncomeDTO = {
      ...data,
      accountId,
      accountUuid: account.uuid,   // ✅ UUID real de la cuenta
    }
    const entry = await this.financeService.addIncome(dataWithUuid)
    this.incomes.value.push(entry)

    // Refrescar balance y cuenta
    await this.refreshAccount(accountId)
    await this.refreshBalance(account.userId)
    return entry
  }

  async addExpense(accountId: number, data: ExpenseDTO): Promise<ExpenseEntry> {
    const account = this._items.value.find(a => a.id === accountId)
    const accountUuid = account?.uuid || ''
    const dataWithUuid: ExpenseDTO = {
      ...data,
      accountUuid,
    }
    const entry = await this.financeService.addExpense(accountId, dataWithUuid)
    this.expenses.value.push(entry)
    await this.refreshAccount(accountId)
    return entry
  }

  // ----------------------------------------------------------------
  // Gestión de cuentas
  // ----------------------------------------------------------------
  async createAccount(
    userId: number,
    name: string,
    balance: number = 0,
    type: AccountType = 'spendable'
  ): Promise<Account> {
    const userUuid = useAuthStore().currentUser?.uuid || ''
    const now = new Date().toISOString()
    const account = new Account(
      undefined,
      uuidv4(),
      now,
      now,
      userId,
      userUuid,
      name,
      type,
      balance
    )
    const saved = await this.repository.save(account)
    this._items.value.push(saved)
    return saved
  }

  async deleteAccount(accountId: number): Promise<void> {
    await this.deleteById(accountId)
  }

  // ----------------------------------------------------------------
  // Reglas de derivación
  // ----------------------------------------------------------------
  async loadDerivations(targetAccountId: number): Promise<{ sourceAccountId: number; percentage: number }[]> {
    const rules = await this.ruleRepo.findByTargetAccount(targetAccountId)
    return rules.map(rule => ({
      sourceAccountId: rule.targetAccountId,
      percentage: rule.percentage,
    }))
  }

  async saveDerivations(
    targetAccountId: number,
    derivations: { sourceAccountId: string; percentage: number }[]
  ): Promise<void> {
    const existingRules = await this.ruleRepo.findByTargetAccount(targetAccountId)
    for (const rule of existingRules) {
      await this.ruleRepo.delete(rule.id!)
    }

    const targetAccount = this._items.value.find(a => a.id === targetAccountId)
    const targetAccountUuid = targetAccount?.uuid || ''
    const now = new Date().toISOString()
    for (const derivation of derivations) {
      if (derivation.percentage <= 0) continue
      await db.auto_percent_rules.put({
        uuid: uuidv4(),
        created_at: now,
        updated_at: now,
        sync_status: 'pending',
        target_account_id: targetAccountId,
        target_account_uuid: targetAccountUuid,
        source_account_id: derivation.sourceAccountId,
        percentage: derivation.percentage,
        is_active: true,
      })
    }
  }

  // ----------------------------------------------------------------
  // Carga y refrescos
  // ----------------------------------------------------------------
  async loadTransactions(userId: number): Promise<void> {
    // 1. Obtener todas las cuentas del usuario
    const userAccounts = await this.repository.findByUserId(userId)
    const accountIds = userAccounts.map(a => a.id!).filter(id => id !== undefined) as number[]

    // 2. Cargar ingresos de esas cuentas
    const incomes = accountIds.length
      ? await this.incomeRepo.findByAccountIds(accountIds)
      : []

    // 3. Gastos (se mantienen como estaban, pero podrían optimizarse igual)
    const expenses = await this.expenseRepo.findAll()

    this.incomes.value = incomes
    this.expenses.value = expenses
  }

  async refreshBalance(userId: number): Promise<void> {
    this.spendableBalance.value = await this.financeService.calculateSpendableBalance(userId)
    await this.fetchAll()
  }

  private async refreshAccount(accountId: number): Promise<void> {
    const account = this.getById(accountId)
    if (!account) return

    const freshAccount = await this.repository.findById(accountId)
    if (freshAccount) {
      const index = this._items.value.findIndex(a => a.id === accountId)
      if (index >= 0) {
        this._items.value[index] = freshAccount as any
      }
    }
  }
}