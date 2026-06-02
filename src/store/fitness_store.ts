import { ref, type Ref } from 'vue'
import { db } from '../lib/db'
import { Exercise } from '../domain/exercise'
import { Routine } from '../domain/routine'
import { RoutineLog } from '../domain/routine_log'
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

/* Store reactiva de fitness. Gestiona ejercicios, rutinas y registros de entrenamiento.
   Expone la lista de ejercicios, rutinas activas, logs diarios y progreso. */
export class FitnessStore extends BaseStore<Exercise> {
  protected repository: ExerciseRepository
  private service: RoutineService
  private routineRepo: RoutineRepository

  routines: Ref<Routine[]>
  routineLogs: Ref<RoutineLog[]>
  progressComparison: Ref<ProgressComparison | null>

  constructor() {
    super()
    const exerciseRepo = new ExerciseRepository(db.exercises)
    this.routineRepo = new RoutineRepository(db.routines)
    const routineLogRepo = new RoutineLogRepository(db.routine_logs)
    const routineLogDetailRepo = new RoutineLogDetailRepository(db.routine_log_details)

    this.repository = exerciseRepo
    this.service = new RoutineService(
      this.routineRepo, routineLogRepo, routineLogDetailRepo, exerciseRepo
    )

    this.routines = ref<Routine[]>([]) as Ref<Routine[]>
    this.routineLogs = ref<RoutineLog[]>([]) as Ref<RoutineLog[]>
    this.progressComparison = ref<ProgressComparison | null>(null)
  }

  /* Crea una rutina nueva y la agrega al estado local. */
  async createRoutine(userId: number, data: RoutineDTO): Promise<Routine> {
    const routine = await this.service.createRoutine(userId, data)
    this.routines.value.push(routine)
    return routine
  }

  /* Carga las rutinas de un usuario. */
  async loadRoutines(userId: number): Promise<void> {
    this.routines.value = await this.routineRepo.findByUserId(userId)
  }

  /* Registra un entrenamiento completo con sus detalles. */
  async logWorkout(routineId: number, date: string, details: LogDetailDTO[]): Promise<RoutineLog> {
    const log = await this.service.logWorkout(routineId, date, details)
    this.routineLogs.value.push(log)
    return log
  }

  /* Compara el progreso de un ejercicio entre los dos últimos entrenamientos. */
  async compareProgress(routineId: number, exerciseId: number): Promise<void> {
    this.progressComparison.value = await this.service.compareProgress(routineId, exerciseId)
  }

  /* Carga los logs de una rutina. */
  async loadRoutineLogs(routineId: number): Promise<void> {
    const logRepo = new RoutineLogRepository(db.routine_logs)
    this.routineLogs.value = await logRepo.findAllByRoutine(routineId)
  }
}
