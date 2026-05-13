import { IncomeEntry, type IncomeClassification } from '../domain/income_entry'
import { ExpenseEntry } from '../domain/expense_entry'
import { AccountRepository } from '../repository/account_repository'
import { IncomeEntryRepository } from '../repository/income_entry_repository'
import { ExpenseEntryRepository } from '../repository/expense_entry_repository'
import { AutoPercentRuleRepository } from '../repository/auto_percent_rule_repository'
import { db } from '../lib/db'
import { v4 as uuidv4 } from 'uuid'

export interface IncomeDTO {
  userId: number
  amount: number
  classification: IncomeClassification
  date: string
  note?: string
}

export interface ExpenseDTO {
  accountId: number
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

  async addIncome(userId: number, data: IncomeDTO): Promise<IncomeEntry> {
    const now = new Date().toISOString()
    const entry = new IncomeEntry(
      undefined, uuidv4(), now, now,
      userId, data.amount, data.classification, data.date, data.note
    )
    const saved = await this.incomeRepo.save(entry)
    await this.applyAutoPercentRules(saved.id!)
    return saved
  }

  async addExpense(accountId: number, data: ExpenseDTO): Promise<ExpenseEntry> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) throw new Error('Cuenta no encontrada')

    account.withdraw(data.amount)

    const now = new Date().toISOString()
    const entry = new ExpenseEntry(
      undefined, uuidv4(), now, now,
      accountId, data.amount, data.category, data.date, data.note
    )
    const saved = await this.expenseRepo.save(entry)
    await this.accountRepo.save(account)
    return saved
  }

  async calculateSpendableBalance(userId: number): Promise<number> {
    const accounts = await this.accountRepo.findByUserId(userId)
    const spendable = accounts.filter(a => a.type === 'spendable')
    return spendable.reduce((sum, a) => sum + a.balance, 0)
  }

  async applyAutoPercentRules(incomeId: number): Promise<void> {
    const income = await this.incomeRepo.findById(incomeId)
    if (!income) return

    const rules = await this.ruleRepo.getActiveRules()
    for (const rule of rules) {
      const amount = rule.apply(income.amount)
      if (amount <= 0) continue
      const targetAccount = await this.accountRepo.findById(rule.targetAccountId)
      if (targetAccount) {
        targetAccount.deposit(amount)
        await this.accountRepo.save(targetAccount)
      }
    }
  }
}
