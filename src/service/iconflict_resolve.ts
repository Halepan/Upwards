
export interface IConflictResolve <T>{
    resolve(local:T , remote: T): T
}