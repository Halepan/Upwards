import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { FitnessStore } from '../../store/fitness_store'

describe('FitnessStore', () => {
  let store: FitnessStore

  beforeAll(async () => {
    store = new FitnessStore()
    await store.loadAll(1)
  })

  it('loads with empty items on fresh database', () => {
    expect(store.items).toHaveLength(0)
  })

  it('loads with empty routines on fresh database', () => {
    expect(store.routines.value).toHaveLength(0)
  })

  it('adds an exercise and returns it', async () => {
    const exercise = await store.addExercise('Press banca', 'fuerza', 'Pectoral')
    expect(exercise).toBeDefined()
    expect(exercise.name).toBe('Press banca')
    expect(exercise.type).toBe('fuerza')
  })

  it('persists added exercise across reload', async () => {
    await store.loadAll(1)
    const exercises = store.items
    expect(exercises.some((e: any) => e.name === 'Press banca')).toBe(true)
  })

  it('deletes an exercise', async () => {
    const exercise = await store.addExercise('Remo', 'resistencia', 'Dorsal')
    const id = exercise.id!
    await store.deleteExercise(id)
    const found = store.items.find((e: any) => e.id === id)
    expect(found).toBeUndefined()
  })

  it('creates a routine', async () => {
    const routine = await store.createRoutine(1, { name: 'Push', description: 'Empuje' } as any)
    expect(routine).toBeDefined()
    expect(routine.name).toBe('Push')
  })

  it('deletes a routine', async () => {
    const routine = await store.createRoutine(1, { name: 'Pull', description: 'Tirón' } as any)
    await store.deleteRoutine(routine.id!)
    const found = store.routines.value.find((r: any) => r.id === routine.id!)
    expect(found).toBeUndefined()
  })

  it('computes latestBodyMeasurement as null when empty', () => {
    expect(store.latestBodyMeasurement).toBeNull()
  })
})
