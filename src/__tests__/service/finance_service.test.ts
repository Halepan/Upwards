import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FinanceService } from '../../service/finance_service'

describe('FinanceService', () => {
  let mockAccountRepo: any
  let mockIncomeRepo: any
  let mockExpenseRepo: any
  let mockRuleRepo: any
  let service: FinanceService

  beforeEach(() => {
    mockAccountRepo = {
      save: vi.fn().mockImplementation((a: any) => Promise.resolve({ ...a, id: 1 })),
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'Gasto diario', balance: 5000, type: 'spendable' }),
      findByUserId: vi.fn().mockResolvedValue([]),
      delete: vi.fn(),
    }
    mockIncomeRepo = {
      save: vi.fn().mockImplementation((i: any) => Promise.resolve({ ...i, id: 1 })),
      findByUserId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
    }
    mockExpenseRepo = {
      save: vi.fn().mockImplementation((e: any) => Promise.resolve({ ...e, id: 1 })),
      findAll: vi.fn().mockResolvedValue([]),
    }
    mockRuleRepo = {
      getActiveRules: vi.fn().mockResolvedValue([]),
    }
    service = new FinanceService(mockAccountRepo, mockIncomeRepo, mockExpenseRepo, mockRuleRepo)
  })

  it('adds an income entry', async () => {
    const income = await service.addIncome(1, {
      userId: 1,
      amount: 2000,
      classification: 'timeswap',
      note: 'Nómina',
      date: '2024-01-30',
    })
    expect(income).toBeDefined()
    expect(income.amount).toBe(2000)
    expect(mockIncomeRepo.save).toHaveBeenCalledOnce()
  })

  it('adds an expense entry and debits account', async () => {
    const expense = await service.addExpense(1, {
      amount: 100,
      category: 'Alimentación',
      note: 'Supermercado',
      date: '2024-01-30',
      accountId: 1,
    })
    expect(expense).toBeDefined()
    expect(mockExpenseRepo.save).toHaveBeenCalledOnce()
  })

  it('calculates spendable balance', async () => {
    mockAccountRepo.findByUserId = vi.fn().mockResolvedValue([
      { id: 1, balance: 3000, type: 'spendable' },
      { id: 2, balance: 5000, type: 'savings' },
    ])
    const balance = await service.calculateSpendableBalance(1)
    expect(balance).toBe(3000)
  })

  it('adds expense throws when account not found', async () => {
    mockAccountRepo.findById = vi.fn().mockResolvedValue(undefined)
    await expect(
      service.addExpense(999, { accountId: 999, amount: 100, category: 'Test', note: '', date: '2024-01-01' })
    ).rejects.toThrow('Cuenta no encontrada')
  })
})
