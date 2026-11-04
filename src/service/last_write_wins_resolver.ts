import type { IConflictResolve } from './iconflict_resolver'

/* Estrategia de resolución que siempre toma la versión remota (último que escribe gana). */
export class LastWriteWinsResolver<T> implements IConflictResolve<T> {
  resolve(_localData: T, remoteData: T): T {
    return remoteData
  }
}
