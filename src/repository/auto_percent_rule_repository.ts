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

  async findByTargetAccount(account_id: number): Promise<AutoPercentRule[]> {
    const data = await this.table.where('target_account_id').equals(account_id).toArray()
    return data.map(d => this.fromDB(d))
  }

  async getActiveRules(): Promise<AutoPercentRule[]> {
    const data = await this.table
      .filter(r => r.is_active)
      .toArray()
    return data.map(d => this.fromDB(d))
  }
}