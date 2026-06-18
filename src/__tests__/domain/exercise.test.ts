import { describe, it, expect } from 'vitest'
import { Exercise } from '../../domain/exercise'

describe('Exercise', () => {
  const createExercise = (overrides = {}) => {
    const defaults = {
      id: undefined,
      uuid: 'test-uuid',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      userId: 1,
      name: 'Press banca',
      type: 'fuerza' as const,
      subType: undefined,
      description: undefined,
      isCustom: true,
    }
    const data = { ...defaults, ...overrides }
    return new Exercise(data.id, data.uuid, data.createdAt, data.updatedAt, data.userId, data.name, data.type, data.subType, data.description, data.isCustom)
  }

  it('creates an exercise with required fields', () => {
    const e = createExercise()
    expect(e.name).toBe('Press banca')
    expect(e.type).toBe('fuerza')
    expect(e.userId).toBe(1)
    expect(e.isCustom).toBe(true)
    expect(e.uuid).toBe('test-uuid')
  })

  it('creates an exercise with optional fields', () => {
    const e = createExercise({ subType: 'superior' as const, description: 'Ejercicio de pecho' })
    expect(e.subType).toBe('superior')
    expect(e.description).toBe('Ejercicio de pecho')
  })

  it('updates timestamp when name changes', () => {
    const e = createExercise()
    const oldUpdated = e.updatedAt
    e.name = 'Press inclinado'
    expect(e.name).toBe('Press inclinado')
    expect(e.updatedAt).not.toBe(oldUpdated)
  })

  it('updates timestamp when type changes', () => {
    const e = createExercise()
    const oldUpdated = e.updatedAt
    e.type = 'resistencia'
    expect(e.type).toBe('resistencia')
    expect(e.updatedAt).not.toBe(oldUpdated)
  })

  it('getTargetZone returns subType when available', () => {
    const e = createExercise({ subType: 'core' as const })
    expect(e.getTargetZone()).toBe('core')
  })

  it('getTargetZone returns general for fuerza without subType', () => {
    const e = createExercise({ type: 'fuerza' as const })
    expect(e.getTargetZone()).toBe('general')
  })

  it('getTargetZone returns cardiovascular for resistencia without subType', () => {
    const e = createExercise({ type: 'resistencia' as const })
    expect(e.getTargetZone()).toBe('cardiovascular')
  })

  it('converts from DB format', () => {
    const data = {
      id: 1,
      uuid: 'db-uuid',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      user_id: 1,
      name: 'Remo',
      type: 'fuerza',
      sub_type: 'dorsal',
      description: 'Remo con barra',
      is_custom: false,
    }
    const e = Exercise.fromDB(data)
    expect(e.id).toBe(1)
    expect(e.name).toBe('Remo')
    expect(e.type).toBe('fuerza')
    expect(e.subType).toBe('dorsal')
    expect(e.isCustom).toBe(false)
  })

  it('converts to DB format', () => {
    const e = createExercise({
      id: 1,
      name: 'Curl bíceps',
      type: 'resistencia' as const,
      subType: 'superior' as const,
    })
    const db = e.toDB()
    expect(db.id).toBe(1)
    expect(db.name).toBe('Curl bíceps')
    expect(db.type).toBe('resistencia')
    expect(db.sub_type).toBe('superior')
    expect(db.sync_status).toBe('pending')
  })
})
