import { describe, it, expect } from 'vitest'
import { BaseStore } from '../../store/base_store'

class TestStore extends BaseStore<{ id?: number; uuid: string; name: string }> {
  protected repository = {
    findAll: async () => [{ id: 1, uuid: 'a', name: 'test' }],
    findById: async (id: number) => ({ id, uuid: 'a', name: 'test' }),
    save: async (item: any) => ({ ...item, id: item.id || 1 }),
    delete: async (id: number) => {},
    findPendingSync: async () => [],
    markAsSynced: async (id: number) => {},
    findByUuid: async (uuid: string) => ({ id: 1, uuid, name: 'test' }),
  } as any

  constructor() {
    super()
    ;(this as any).repository = this.repository
  }
}

describe('BaseStore', () => {
  it('creates with empty items', () => {
    const store = new TestStore()
    expect(store.items).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchAll loads items from repository', async () => {
    const store = new TestStore()
    await store.fetchAll()
    expect(store.items.length).toBeGreaterThanOrEqual(1)
  })

  it('getById returns correct item', async () => {
    const store = new TestStore()
    await store.fetchAll()
    const found = store.getById(1)
    expect(found).toBeDefined()
    expect(found!.uuid).toBe('a')
  })

  it('getByUuid returns correct item', async () => {
    const store = new TestStore()
    await store.fetchAll()
    const found = store.getByUuid('a')
    expect(found).toBeDefined()
    expect(found!.id).toBe(1)
  })

  it('getById returns undefined for non-existent item', () => {
    const store = new TestStore()
    expect(store.getById(999)).toBeUndefined()
  })

  it('save adds new item to list', async () => {
    const store = new TestStore()
    const saved = await store.save({ uuid: 'new-uuid', name: 'new item' } as any)
    expect(store.items.some(i => i.uuid === 'new-uuid')).toBe(true)
  })

  it('deleteById removes item from list', async () => {
    const store = new TestStore()
    await store.fetchAll()
    await store.deleteById(1)
    expect(store.items.some(i => i.id === 1)).toBe(false)
  })

  it('reset clears all state', () => {
    const store = new TestStore()
    store['_items'].value = [{ id: 1, uuid: 'a', name: 'test' } as any]
    store['_error'].value = 'some error'
    store.reset()
    expect(store.items).toEqual([])
    expect(store.error).toBeNull()
  })
})
