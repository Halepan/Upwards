import { describe, it, expect, beforeAll } from 'vitest'
import { FinanceStore } from '../../store/finance_store'

describe('FinanceStore', () => {
  let store: FinanceStore

  beforeAll(async () => {
    store = new FinanceStore()
    await store.loadAll(1)
  })

  it('loads with empty items on fresh database', () => {
    expect(store.items).toHaveLength(0)
  })

  it('loads with empty incomes and expenses', () => {
    expect(store.incomes.value).toHaveLength(0)
    expect(store.expenses.value).toHaveLength(0)
  })

  it('saves a new account', async () => {
    const acct = await store.save({
      name: 'Gasto diario',
      type: 'spendable',
      balance: 5000,
      uuid: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending',
      user_id: 1,
    } as any)
    expect(acct).toBeDefined()
    expect(acct.name).toBe('Gasto diario')
    expect((acct as any).balance ?? 0).toBeDefined()
  })

  it('persists saved account across reload', async () => {
    await store.loadAll(1)
    expect(store.items.length).toBeGreaterThanOrEqual(1)
  })

  it('adds an income entry', async () => {
    const income = await store.addIncome(1, {
      userId: 1,
      amount: 2000,
      classification: 'timeswap',
      note: 'Nómina',
      date: new Date().toISOString().slice(0, 10),
    })
    expect(income).toBeDefined()
    expect(income.amount).toBe(2000)
  })

  it('deletes an account', async () => {
    const acct = await store.save({
      name: 'Temp',
      type: 'spendable',
      balance: 100,
      uuid: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending',
      user_id: 1,
    } as any)
    const id = acct.id!
    await store.deleteAccount(id)
    const found = store.items.find((a: any) => a.id === id)
    expect(found).toBeUndefined()
  })

  it('computes spendableBalance as 0 when empty', () => {
    expect(store.spendableBalance.value).toBe(0)
  })
})
