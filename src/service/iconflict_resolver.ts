/* Interfaz del patrón Strategy para resolver conflictos de sincronización.
   Toma dos versiones (local y remota) y retorna la versión ganadora. */
export interface IConflictResolve<T> {
  resolve(local: T, remote: T): T
}