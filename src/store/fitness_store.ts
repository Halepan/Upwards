import { ref, type Ref } from 'vue'
import { db } from '../lib/db'
import { Exercise } from '../domain/exercise'
import { Routine } from '../domain/routine'
import { RoutineLog } from '../domain/routine_log'
import type { BodyMeasurement as BMData } from '../lib/db'
import { ExerciseRepository } from '../repository/exercise_repository'
import { RoutineRepository } from '../repository/routine_repository'
import { RoutineLogRepository } from '../repository/routine_log_repository'
import { RoutineLogDetailRepository } from '../repository/routine_log_detail_repository'
import {
  RoutineService,
  type RoutineDTO,
  type LogDetailDTO,
  type ProgressComparison,
} from '../service/routine_service'
import { BaseStore } from './base_store'
import { useAuthStore } from './auth_store'

export class FitnessStore extends BaseStore<Exercise> {
  protected repository: ExerciseRepository
  private service: RoutineService
  private routineRepo: RoutineRepository
  private exerciseRepo: ExerciseRepository

  routines: Ref<Routine[]>
  routineLogs: Ref<RoutineLog[]>
  progressComparison: Ref<ProgressComparison | null>
  bodyMeasurements: Ref<BMData[]>

  constructor() {
    super()
    this.exerciseRepo = new ExerciseRepository(db.exercises)
    this.routineRepo = new RoutineRepository(db.routines)
    const routineLogRepo = new RoutineLogRepository(db.routine_logs)
    const routineLogDetailRepo = new RoutineLogDetailRepository(db.routine_log_details)

    this.repository = this.exerciseRepo
    this.service = new RoutineService(
      this.routineRepo, routineLogRepo, routineLogDetailRepo, this.exerciseRepo
    )

    this.routines = ref<Routine[]>([]) as Ref<Routine[]>
    this.routineLogs = ref<RoutineLog[]>([]) as Ref<RoutineLog[]>
    this.progressComparison = ref<ProgressComparison | null>(null)
    this.bodyMeasurements = ref<BMData[]>([]) as Ref<BMData[]>
  }

  async loadAll(userId: number): Promise<void> {
    await Promise.all([
      this.fetchAll(),
      this.loadRoutines(userId),
      this.loadBodyMeasurements(userId),
    ])
  }

  async createRoutine(userId: number, data: RoutineDTO): Promise<Routine> {
    const dataWithUuid: RoutineDTO = {
      ...data,
      userUuid: useAuthStore().currentUser?.uuid || '',
    }
    const routine = await this.service.createRoutine(userId, dataWithUuid)
    this.routines.value.push(routine)
    return routine
  }

  async loadRoutines(userId: number): Promise<void> {
    this.routines.value = await this.routineRepo.findByUserId(userId)
  }

  async logWorkout(routineId: number, date: string, details: LogDetailDTO[]): Promise<RoutineLog> {
    const routine = this.routines.value.find(r => r.id === routineId)
    const detailsWithUuid: LogDetailDTO[] = details.map(d => ({
      ...d,
      exerciseUuid: this._items.value.find(e => e.id === d.exerciseId)?.uuid || '',
    }))
    const log = await this.service.logWorkout(routineId, routine?.uuid || '', date, detailsWithUuid)
    this.routineLogs.value.push(log)
    return log
  }

  async compareProgress(routineId: number, exerciseId: number): Promise<void> {
    this.progressComparison.value = await this.service.compareProgress(routineId, exerciseId)
  }

  async loadRoutineLogs(routineId: number): Promise<void> {
    const logRepo = new RoutineLogRepository(db.routine_logs)
    this.routineLogs.value = await logRepo.findAllByRoutine(routineId)
  }

  async addExercise(userId: number, name: string, type: string, subType?: string): Promise<any> {
    const userUuid = useAuthStore().currentUser?.uuid || ''
    const id = await db.exercises.put({ name, type, sub_type: subType, is_custom: true, user_id: userId, user_uuid: userUuid } as any)
    await this.fetchAll()
    return this._items.value.find((e: any) => e.id === id)
  }

  async deleteExercise(id: number): Promise<void> {
    await this.deleteById(id)
  }

  async deleteRoutine(id: number): Promise<void> {
    await this.routineRepo.delete(id)
    this.routines.value = this.routines.value.filter(r => (r as any).id !== id)
  }

  async loadBodyMeasurements(userId: number): Promise<void> {
    this.bodyMeasurements.value = await db.body_measurements.where({ user_id: userId }).toArray() as any
  }

  async saveBodyMeasurement(data: Partial<BMData>): Promise<BMData> {
    const userUuid = useAuthStore().currentUser?.uuid || ''
    const id = await db.body_measurements.put({ ...data, user_uuid: userUuid } as any)
    await this.loadBodyMeasurements(data.user_id || 0)
    return (await db.body_measurements.get(id)) as any
  }

  get latestBodyMeasurement(): BMData | null {
    const sorted = [...this.bodyMeasurements.value].sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sorted[0] || null
  }
}
