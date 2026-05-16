import { Routine } from '../domain/routine'
import { RoutineLog } from '../domain/routine_log'
import { RoutineLogDetail } from '../domain/routine_log_detail'
import { RoutineRepository } from '../repository/routine_repository'
import { RoutineLogRepository } from '../repository/routine_log_repository'
import { RoutineLogDetailRepository } from '../repository/routine_log_detail_repository'
import { ExerciseRepository } from '../repository/exercise_repository'
import { db } from '../lib/db'
import { v4 as uuidv4 } from 'uuid'

/* DTO para crear una rutina nueva. */
export interface RoutineDTO {
  userId: number
  name: string
  description?: string
}

/* DTO para registrar el detalle de un ejercicio dentro de un entrenamiento. */
export interface LogDetailDTO {
  exerciseId: number
  repsDone: number
}

/* Resultado de la comparativa de progreso entre dos entrenamientos consecutivos. */
export interface ProgressComparison {
  exerciseId: number
  exerciseName: string
  previousReps: number
  currentReps: number
  improvement: number
}

/* Servicio que gestiona rutinas de ejercicio, registros de entrenamiento y comparativa de progreso. */
export class RoutineService {
  private routineRepo: RoutineRepository
  private routineLogRepo: RoutineLogRepository
  private routineLogDetailRepo: RoutineLogDetailRepository
  private exerciseRepo: ExerciseRepository

  constructor(
    routineRepo?: RoutineRepository,
    routineLogRepo?: RoutineLogRepository,
    routineLogDetailRepo?: RoutineLogDetailRepository,
    exerciseRepo?: ExerciseRepository
  ) {
    this.routineRepo = routineRepo ?? new RoutineRepository(db.routines)
    this.routineLogRepo = routineLogRepo ?? new RoutineLogRepository(db.routine_logs)
    this.routineLogDetailRepo = routineLogDetailRepo ?? new RoutineLogDetailRepository(db.routine_log_details)
    this.exerciseRepo = exerciseRepo ?? new ExerciseRepository(db.exercises)
  }

  async createRoutine(userId: number, data: RoutineDTO): Promise<Routine> {
    const now = new Date().toISOString()
    const routine = new Routine(
      undefined, uuidv4(), now, now,
      userId, data.name, data.description
    )
    return this.routineRepo.save(routine)
  }

  async logWorkout(routineId: number, date: string, details: LogDetailDTO[]): Promise<RoutineLog> {
    const now = new Date().toISOString()
    const log = new RoutineLog(
      undefined, uuidv4(), now, now,
      routineId, date, undefined, true
    )
    const savedLog = await this.routineLogRepo.save(log)

    for (const detail of details) {
      const logDetail = new RoutineLogDetail(
        undefined, uuidv4(), now, now,
        savedLog.id!, detail.exerciseId, detail.repsDone
      )
      await this.routineLogDetailRepo.save(logDetail)
    }

    return savedLog
  }

  async compareProgress(routineId: number, exerciseId: number): Promise<ProgressComparison> {
    const logs = await this.routineLogRepo.findAllByRoutine(routineId)
    const completedLogs = logs.filter(logEntry => logEntry.isCompleted())
      .sort((logA, logB) => logA.date.localeCompare(logB.date))

    const exercise = await this.exerciseRepo.findById(exerciseId)

    if (completedLogs.length < 2) {
      const latestDetail = await this.findDetailFromLogs(completedLogs, exerciseId)
      return {
        exerciseId,
        exerciseName: exercise?.name ?? 'Desconocido',
        previousReps: 0,
        currentReps: latestDetail?.repsDone ?? 0,
        improvement: 0
      }
    }

    const latestLog = completedLogs[completedLogs.length - 1]
    const previousLog = completedLogs[completedLogs.length - 2]

    const [latestDetail, previousDetail] = await Promise.all([
      this.routineLogDetailRepo.findByLogAndExercise(latestLog.id!, exerciseId),
      this.routineLogDetailRepo.findByLogAndExercise(previousLog.id!, exerciseId)
    ])

    const currentReps = latestDetail?.repsDone ?? 0
    const previousReps = previousDetail?.repsDone ?? 0

    return {
      exerciseId,
      exerciseName: exercise?.name ?? 'Desconocido',
      previousReps,
      currentReps,
      improvement: previousReps > 0 ? Math.round(((currentReps - previousReps) / previousReps) * 100) : 0
    }
  }

  private async findDetailFromLogs(logs: RoutineLog[], exerciseId: number): Promise<RoutineLogDetail | undefined> {
    for (const log of logs) {
      const detail = await this.routineLogDetailRepo.findByLogAndExercise(log.id!, exerciseId)
      if (detail) return detail
    }
    return undefined
  }
}
