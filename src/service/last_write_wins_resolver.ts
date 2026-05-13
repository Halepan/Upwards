import type { IConflictResolve } from './iconflict_resolve'

export class LastWriteWinsResolver<T> implements IConflictResolve<T> {
  resolve(_local: T, remote: T): T {
    return remote
  }
}
