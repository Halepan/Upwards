// repository/auto_percent_rule_repository.ts
import type { Table } from 'dexie'
import { BaseDexieRepository } from './base_dexie_repository'
import type { AutoPercentRule as AutoPercentRuleData } from '../lib/db'
import { AutoPercentRule } from '../domain/auto_percent_rule'

export class AutoPercentRuleRepository extends BaseDexieRepository<AutoPercentRuleData, AutoPercentRule> {
  constructor(table: Table<AutoPercentRuleData, number>) {
    super(table)
  }

  protected fromDB(data: AutoPercentRuleData): AutoPercentRule {
    return AutoPercentRule.fromDB(data)
  }

  protected toDB(domain: AutoPercentRule): AutoPercentRuleData {
    return domain.toDB() as AutoPercentRuleData
  }

  // Buscar por cuenta destino (reglas que aplican a esta cuenta)
  async findByTargetAccount(targetAccountId: number): Promise<AutoPercentRule[]> {
    const data = await this.table.where('target_account_id').equals(targetAccountId).toArray()
    return data.map(rule => this.fromDB(rule))
  }

  // Buscar por cuenta origen (reglas que se activan al recibir ingresos en esta cuenta)
  async findBySourceAccount(sourceAccountId: string): Promise<AutoPercentRule[]> {
    const data = await this.table
      .where('source_account_id').equals(sourceAccountId)
      .toArray()
    return data.map(rule => this.fromDB(rule))
  }

  // Buscar reglas globales (source_account_id = null)
  async findGlobalRules(): Promise<AutoPercentRule[]> {
    const data = await this.table
      .filter(rule => rule.source_account_id === null || rule.source_account_id === undefined)
      .toArray()
    return data.map(rule => this.fromDB(rule))
  }

  // Obtener reglas activas (globales o por origen)
  async getActiveRules(): Promise<AutoPercentRule[]> {
    const data = await this.table
      .filter(rule => rule.is_active)
      .toArray()
    return data.map(rule => this.fromDB(rule))
  }

  // Buscar regla específica (para validar unicidad)
  async findBySourceAndTarget(sourceAccountId: string | null, targetAccountId: number): Promise<AutoPercentRule | undefined> {
    const data = await this.table
      .where('target_account_id').equals(targetAccountId)
      .filter(rule => rule.source_account_id === sourceAccountId)
      .first()
    return data ? this.fromDB(data) : undefined
  }
}