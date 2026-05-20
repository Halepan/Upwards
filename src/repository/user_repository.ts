import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { User as UserData } from '../lib/db'
import { User } from '../domain/user'

export class UserRepository extends BaseDexieRepository<UserData, User> {
  constructor(table: Table<UserData, number>) {
    super(table)
  }

  protected fromDB(data: UserData): User {
    return User.fromDB(data)
  }

  protected toDB(domain: User): UserData {
    return domain.toDB() as UserData
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const data = await this.table.where('email').equals(email).first()
    return data ? this.fromDB(data) : undefined
  }

  async findByName(name: string): Promise<User | undefined> {
    const lowerName = name.toLowerCase()
    const allUsers = await this.table.toArray()
    return allUsers.find(
      userData => userData.name.toLowerCase() === lowerName
    )
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.table.where('email').equals(email).count()
    return count > 0
  }

  async nameExists(name: string): Promise<boolean> {
    const user = await this.findByName(name)
    return user !== undefined
  }
}
