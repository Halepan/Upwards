import { describe, it, expect } from 'vitest'
import { Account } from '../../domain/account'

describe('Account', () => {
  const createAccount = (overrides = {}) => {
    const defaults = {
      id: undefined,
      uuid: 'acct-uuid',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      userId: 1,
      name: 'Gasto diario',
      type: 'spendable' as const,
      balance: 0,
    }
    return new Account(...Object.values({ ...defaults, ...overrides }))
  }

  it('creates account with zero balance', () => {
    const a = createAccount()
    expect(a.name).toBe('Gasto diario')
    expect(a.balance).toBe(0)
    expect(a.type).toBe('spendable')
  })

  it('deposit increases balance', () => {
    const a = createAccount({ balance: 100 })
    a.deposit(50)
    expect(a.balance).toBe(150)
  })

  it('deposit throws on non-positive amount', () => {
    const a = createAccount()
    expect(() => a.deposit(0)).toThrow('mayor que cero')
    expect(() => a.deposit(-10)).toThrow('mayor que cero')
  })

  it('withdraw decreases balance', () => {
    const a = createAccount({ balance: 200 })
    a.withdraw(80)
    expect(a.balance).toBe(120)
  })

  it('withdraw throws on non-positive amount', () => {
    const a = createAccount({ balance: 100 })
    expect(() => a.withdraw(0)).toThrow('mayor que cero')
    expect(() => a.withdraw(-5)).toThrow('mayor que cero')
  })

  it('withdraw throws on insufficient funds', () => {
    const a = createAccount({ balance: 50 })
    expect(() => a.withdraw(100)).toThrow('Fondos insuficientes')
  })

  it('name setter updates timestamp', () => {
    const a = createAccount()
    const old = a.updatedAt
    a.name = 'Ahorro'
    expect(a.name).toBe('Ahorro')
    expect(a.updatedAt).not.toBe(old)
  })

  it('converts from DB format', () => {
    const data = {
      id: 1,
      uuid: 'db-uuid',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      user_id: 1,
      name: 'Inversión',
      type: 'investment',
      balance: 5000,
    }
    const a = Account.fromDB(data)
    expect(a.id).toBe(1)
    expect(a.name).toBe('Inversión')
    expect(a.type).toBe('investment')
    expect(a.balance).toBe(5000)
  })

  it('converts to DB format', () => {
    const a = createAccount({ id: 2, name: 'Donación', type: 'donation' as const, balance: 1000 })
    const db = a.toDB()
    expect(db.id).toBe(2)
    expect(db.name).toBe('Donación')
    expect(db.type).toBe('donation')
    expect(db.balance).toBe(1000)
    expect(db.sync_status).toBe('pending')
  })
})
