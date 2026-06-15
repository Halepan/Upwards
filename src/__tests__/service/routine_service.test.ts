import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RoutineService } from '../../service/routine_service'

describe('RoutineService', () => {
  let mockRoutineRepo: any
  let mockRoutineLogRepo: any
  let mockRoutineLogDetailRepo: any
  let mockExerciseRepo: any
  let service: RoutineService

  beforeEach(() => {
    mockRoutineRepo = {
      save: vi.fn().mockImplementation((r: any) => Promise.resolve({ ...r, id: 1 })),
      delete: vi.fn(),
      findByUserId: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
    }
    mockRoutineLogRepo = {
      save: vi.fn().mockImplementation((l: any) => Promise.resolve({ ...l, id: 1 })),
      findAllByRoutine: vi.fn().mockResolvedValue([]),
      findByRoutineAndDate: vi.fn(),
    }
    mockRoutineLogDetailRepo = {
      save: vi.fn().mockImplementation((d: any) => Promise.resolve({ ...d, id: 1 })),
      findByLogAndExercise: vi.fn(),
      findByLog: vi.fn().mockResolvedValue([]),
    }
    mockExerciseRepo = {
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'Press banca' }),
    }
    service = new RoutineService(mockRoutineRepo, mockRoutineLogRepo, mockRoutineLogDetailRepo, mockExerciseRepo)
  })

  it('creates a routine', async () => {
    const routine = await service.createRoutine(1, { name: 'Push', description: 'Empuje' })
    expect(routine).toBeDefined()
    expect(routine.name).toBe('Push')
    expect(mockRoutineRepo.save).toHaveBeenCalledOnce()
  })

  it('logs a workout', async () => {
    const log = await service.logWorkout(1, '2024-01-15', [
      { exerciseId: 1, repsDone: 10 },
    ])
    expect(log).toBeDefined()
    expect(mockRoutineLogRepo.save).toHaveBeenCalledOnce()
    expect(mockRoutineLogDetailRepo.save).toHaveBeenCalledOnce()
  })

  it('compares progress with no previous logs', async () => {
    const result = await service.compareProgress(1, 1)
    expect(result.exerciseId).toBe(1)
    expect(result.previousReps).toBe(0)
    expect(result.improvement).toBe(0)
  })

  it('compares progress with two logs', async () => {
    mockRoutineLogRepo.findAllByRoutine = vi.fn().mockResolvedValue([
      { id: 1, date: '2024-01-01', isCompleted: () => true },
      { id: 2, date: '2024-01-08', isCompleted: () => true },
    ])
    mockRoutineLogDetailRepo.findByLogAndExercise = vi.fn()
      .mockResolvedValueOnce({ id: 1, repsDone: 8 })
      .mockResolvedValueOnce({ id: 2, repsDone: 10 })

    const result = await service.compareProgress(1, 1)
    expect(result.previousReps).toBe(8)
    expect(result.currentReps).toBe(10)
    expect(result.improvement).toBe(25)
  })
})
