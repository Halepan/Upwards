import { IncomeEntry, type IncomeClassification } from '../domain/income_entry'
import { ExpenseEntry } from '../domain/expense_entry'
import { AccountRepository } from '../repository/account_repository'
import { IncomeEntryRepository } from '../repository/income_entry_repository'
import { ExpenseEntryRepository } from '../repository/expense_entry_repository'
import { AutoPercentRuleRepository } from '../repository/auto_percent_rule_repository'
import { db } from '../lib/db'
import { v4 as uuidv4 } from 'uuid'

export interface IncomeDTO {
  accountId: number        // ID numérico de la cuenta
  accountUuid: string      // UUID de la cuenta
  amount: number
  classification: IncomeClassification
  date: string
  note?: string
}

export interface ExpenseDTO {
  accountId: number
  accountUuid?: string
  amount: number
  category: string
  date: string
  note?: string
}

export class FinanceService {
  private accountRepo: AccountRepository
  private incomeRepo: IncomeEntryRepository
  private expenseRepo: ExpenseEntryRepository
  private ruleRepo: AutoPercentRuleRepository

  constructor(
    accountRepo?: AccountRepository,
    incomeRepo?: IncomeEntryRepository,
    expenseRepo?: ExpenseEntryRepository,
    ruleRepo?: AutoPercentRuleRepository
  ) {
    this.accountRepo = accountRepo ?? new AccountRepository(db.accounts)
    this.incomeRepo = incomeRepo ?? new IncomeEntryRepository(db.income_entries)
    this.expenseRepo = expenseRepo ?? new ExpenseEntryRepository(db.expense_entries)
    this.ruleRepo = ruleRepo ?? new AutoPercentRuleRepository(db.auto_percent_rules)
  }

  async addIncome(data: IncomeDTO): Promise<IncomeEntry> {
    // 1. Validar que la cuenta existe
    const account = await this.accountRepo.findById(data.accountId)
    if (!account) throw new Error('Cuenta no encontrada')

    // 2. Crear el ingreso (ya asociado a la cuenta)
    const now = new Date().toISOString()
    const entry = new IncomeEntry(
      undefined,
      uuidv4(),
      now,
      now,
      data.accountId,
      data.accountUuid,
      data.amount,
      data.classification,
      data.date,
      data.note
    )
    const savedEntry = await this.incomeRepo.save(entry)

    // 3. Depositar el monto en la cuenta
    account.deposit(data.amount)
    await this.accountRepo.save(account)

    // 4. Aplicar reglas de derivación (si existen)
    await this.applyAutoPercentRules(savedEntry.id!)

    return savedEntry
  }

  async addExpense(accountId: number, data: ExpenseDTO): Promise<ExpenseEntry> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) throw new Error('Cuenta no encontrada')

    account.withdraw(data.amount)

    const now = new Date().toISOString()
    const entry = new ExpenseEntry(
      undefined, uuidv4(), now, now,
      accountId, data.accountUuid || '', data.amount, data.category, data.date, data.note
    )
    const savedEntry = await this.expenseRepo.save(entry)
    await this.accountRepo.save(account)
    return savedEntry
  }

  async calculateSpendableBalance(userId: number): Promise<number> {
    const accounts = await this.accountRepo.findByUserId(userId)
    const spendable = accounts.filter(account => account.type === 'spendable')
    return spendable.reduce((total, account) => total + account.balance, 0)
  }

  async applyAutoPercentRules(incomeId: number): Promise<void> {
    const income = await this.incomeRepo.findById(incomeId)
    if (!income) return

    const rules = await this.ruleRepo.getActiveRules()
    for (const rule of rules) {
      const derivedAmount = rule.apply(income.amount)
      if (derivedAmount <= 0) continue
      const targetAccount = await this.accountRepo.findById(rule.targetAccountId)
      if (targetAccount) {
        targetAccount.deposit(derivedAmount)
        await this.accountRepo.save(targetAccount)
      }
    }
  }
}