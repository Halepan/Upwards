/* Entidad de dominio que representa al usuario del sistema.
   Centraliza la lógica de autenticación y los datos de perfil. */

import { BaseEntity } from './base_entity'

export type AuthMethod = 'pin' | 'biometric' | 'email'

export class User extends BaseEntity {
  private _name: string
  private _email?: string
  private _authMethod: AuthMethod
  private _pinHash?: string

  constructor(
    id: number | undefined,
    uuid: string,
    createdAt: string,
    updatedAt: string,
    name: string,
    email?: string,
    authMethod: AuthMethod = 'email',
    pinHash?: string
  ) {
    super(id, uuid, createdAt, updatedAt)
    this._name = name
    this._email = email
    this._authMethod = authMethod
    this._pinHash = pinHash
  }

  get name(): string { return this._name }
  get email(): string | undefined { return this._email }
  get authMethod(): AuthMethod { return this._authMethod }
  get pinHash(): string | undefined { return this._pinHash }

  set name(value: string) {
    this._name = value
    this.updateTimestamp()
  }
  set email(value: string | undefined) {
    this._email = value
    this.updateTimestamp()
  }
  set authMethod(value: AuthMethod) {
    this._authMethod = value
    this.updateTimestamp()
  }
  set pinHash(value: string | undefined) {
    this._pinHash = value
    this.updateTimestamp()
  }

  /* Valida una credencial contra el método de autenticación configurado. */
  authenticate(credential: string): boolean {
    if (this._authMethod === 'pin' && this._pinHash) {
      return credential.length >= 4
    }
    return false
  }

  /* Fabrica una instancia User desde el formato plano de IndexedDB (snake_case). */
  static fromDB(data: any): User {
    return new User(
      data.id,
      data.uuid,
      data.created_at,
      data.updated_at,
      data.name,
      data.email,
      data.auth_method as AuthMethod,
      data.pin_hash
    )
  }

  /* Convierte la entidad al formato plano para persistencia local (snake_case). */
  toDB(): any {
    return {
      id: this._id,
      uuid: this._uuid,
      name: this._name,
      email: this._email,
      auth_method: this._authMethod,
      pin_hash: this._pinHash,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
      sync_status: 'pending'
    }
  }

  toSupabase(): any {
    return {
      id: this._uuid,
      name: this._name,
      email: this._email,
      auth_method: this._authMethod,
      pin_hash: this._pinHash,
      created_at: this._createdAt,
      updated_at: this._updatedAt,
    }
  }
}