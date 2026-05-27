<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLongPress } from '../composables/useLongPress'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import FinanceChart from './FinanceChart.vue'
import type { FabAction } from './FloatingActionButton.vue'

type Trend = 'up' | 'down' | 'flat'

interface AccountCard {
  id: number
  name: string
  type: string
  balance: number
  prevBalance: number
  color: string
  spent: number
  trend: Trend
}

const props = defineProps<{
  historyOpen: boolean
}>()

const emit = defineEmits<{
  'close-history': []
}>()

const accounts = ref<AccountCard[]>([
  { id: 1, name: 'Gasto diario', type: 'spendable', balance: 3200, prevBalance: 2800, color: '#00897b', spent: 2700, trend: 'up' },
  { id: 2, name: 'Ahorro', type: 'savings', balance: 18500, prevBalance: 19200, color: '#1565c0', spent: 0, trend: 'down' },
  { id: 3, name: 'Inversión', type: 'investment', balance: 45300, prevBalance: 45300, color: '#e65100', spent: 0, trend: 'flat' },
  { id: 4, name: 'Donación', type: 'donation', balance: 1200, prevBalance: 1100, color: '#6a1b9a', spent: 0, trend: 'up' },
  { id: 5, name: 'Vivienda', type: 'spendable', balance: 5800, prevBalance: 6200, color: '#2e7d32', spent: 5100, trend: 'down' },
  { id: 6, name: 'Transporte', type: 'spendable', balance: 950, prevBalance: 870, color: '#f9a825', spent: 800, trend: 'up' },
  { id: 7, name: 'Salud', type: 'spendable', balance: 3400, prevBalance: 3200, color: '#ec407a', spent: 2100, trend: 'up' },
  { id: 8, name: 'Educación', type: 'investment', balance: 12000, prevBalance: 12500, color: '#ab47bc', spent: 0, trend: 'down' },
  { id: 9, name: 'Vacaciones', type: 'savings', balance: 7800, prevBalance: 7800, color: '#26c6da', spent: 0, trend: 'flat' },
  { id: 10, name: 'Emergencia', type: 'savings', balance: 15000, prevBalance: 14000, color: '#8d6e63', spent: 0, trend: 'up' },
])

const budgetAlert = computed(() => {
  for (const acct of accounts.value) {
    if (acct.spent <= 0) continue
    const pct = Math.round((acct.spent / acct.balance) * 100)
    if (pct >= 80) {
      if (pct >= 100) return { message: `¡${acct.name} ha excedido su presupuesto!`, urgent: true }
      return { message: `Has usado el ${pct}% del presupuesto de ${acct.name}`, urgent: false }
    }
  }
  return null
})

interface HistoryEntry {
  id: number
  concept: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  account: string
}

const history = ref<HistoryEntry[]>([
  { id: 1, concept: 'Nómina', amount: 2400, type: 'income', category: '', date: '2023-01-30', account: 'Gasto diario' },
  { id: 2, concept: 'Supermercado', amount: -185, type: 'expense', category: 'Alimentación', date: '2023-02-05', account: 'Gasto diario' },
  { id: 3, concept: 'Freelance', amount: 800, type: 'income', category: '', date: '2023-03-15', account: 'Gasto diario' },
  { id: 4, concept: 'Gasolina', amount: -55, type: 'expense', category: 'Transporte', date: '2023-04-10', account: 'Transporte' },
  { id: 5, concept: 'Dividendos', amount: 120, type: 'income', category: '', date: '2023-05-01', account: 'Inversión' },
  { id: 6, concept: 'Netflix', amount: -15.99, type: 'expense', category: 'Ocio', date: '2023-06-12', account: 'Gasto diario' },
  { id: 7, concept: 'Traslado a ahorros', amount: -500, type: 'expense', category: 'Otros', date: '2023-07-01', account: 'Ahorro' },
  { id: 8, concept: 'Nómina', amount: 2600, type: 'income', category: '', date: '2023-08-30', account: 'Gasto diario' },
  { id: 9, concept: 'Curso online', amount: -200, type: 'expense', category: 'Otros', date: '2023-09-05', account: 'Educación' },
  { id: 10, concept: 'Renta', amount: -850, type: 'expense', category: 'Vivienda', date: '2023-10-01', account: 'Vivienda' },
  { id: 11, concept: 'Nómina', amount: 2700, type: 'income', category: '', date: '2023-11-30', account: 'Gasto diario' },
  { id: 12, concept: 'Seguro médico', amount: -180, type: 'expense', category: 'Salud', date: '2023-12-10', account: 'Salud' },
  { id: 13, concept: 'Nómina', amount: 2800, type: 'income', category: '', date: '2024-01-30', account: 'Gasto diario' },
  { id: 14, concept: 'Supermercado', amount: -210, type: 'expense', category: 'Alimentación', date: '2024-02-14', account: 'Gasto diario' },
  { id: 15, concept: 'Venta de acciones', amount: 1500, type: 'income', category: '', date: '2024-03-20', account: 'Inversión' },
  { id: 16, concept: 'Gasolina', amount: -60, type: 'expense', category: 'Transporte', date: '2024-04-08', account: 'Transporte' },
  { id: 17, concept: 'Dividendos', amount: 150, type: 'income', category: '', date: '2024-05-01', account: 'Inversión' },
  { id: 18, concept: 'Electricidad', amount: -95, type: 'expense', category: 'Vivienda', date: '2024-06-03', account: 'Vivienda' },
  { id: 19, concept: 'Traslado a ahorros', amount: -600, type: 'expense', category: 'Otros', date: '2024-07-01', account: 'Ahorro' },
  { id: 20, concept: 'Nómina', amount: 3000, type: 'income', category: '', date: '2024-08-30', account: 'Gasto diario' },
  { id: 21, concept: 'Hotel', amount: -450, type: 'expense', category: 'Ocio', date: '2024-09-15', account: 'Vacaciones' },
  { id: 22, concept: 'Farmacia', amount: -45, type: 'expense', category: 'Salud', date: '2024-10-22', account: 'Salud' },
  { id: 23, concept: 'Nómina', amount: 3100, type: 'income', category: '', date: '2024-11-29', account: 'Gasto diario' },
  { id: 24, concept: 'Donación', amount: -100, type: 'expense', category: 'Otros', date: '2024-12-25', account: 'Donación' },
  { id: 25, concept: 'Nómina', amount: 3200, type: 'income', category: '', date: '2025-01-30', account: 'Gasto diario' },
  { id: 26, concept: 'Supermercado', amount: -230, type: 'expense', category: 'Alimentación', date: '2025-02-10', account: 'Gasto diario' },
  { id: 27, concept: 'Freelance', amount: 1200, type: 'income', category: '', date: '2025-03-12', account: 'Gasto diario' },
  { id: 28, concept: 'Renta', amount: -900, type: 'expense', category: 'Vivienda', date: '2025-04-01', account: 'Vivienda' },
])

const filterAccount = ref('')
const filterType = ref<'all' | 'income' | 'expense'>('all')
const filterCategory = ref('')
const filterYear = ref('')
const filterMonth = ref('')

const filteredHistory = computed(() => {
  return history.value.filter(e => {
    if (filterAccount.value && e.account !== filterAccount.value) return false
    if (filterType.value !== 'all' && e.type !== filterType.value) return false
    if (filterCategory.value && e.category !== filterCategory.value) return false
    if (filterYear.value && !e.date.startsWith(filterYear.value)) return false
    if (filterMonth.value && !e.date.startsWith(`${filterYear.value || e.date.slice(0, 4)}-${filterMonth.value}`)) return false
    return true
  })
})

const filterCategories = computed(() => {
  const cats = new Set(history.value.filter(e => e.category).map(e => e.category))
  return Array.from(cats).sort()
})

const categories = ref([
  { label: 'Alimentación', value: 28, color: '#ef5350' },
  { label: 'Vivienda', value: 32, color: '#42a5f5' },
  { label: 'Transporte', value: 12, color: '#ff7043' },
  { label: 'Salud', value: 10, color: '#66bb6a' },
  { label: 'Ocio', value: 8, color: '#ffa726' },
  { label: 'Otros', value: 10, color: '#bdbdbd' },
])

const viewMode = ref<'diario' | 'semanal' | 'mensual'>('diario')

const circumference = 2 * Math.PI * 40

const segments = computed(() => {
  const total = categories.value.reduce((s, c) => s + c.value, 0)
  let offset = 0
  return categories.value.map(c => {
    const ratio = c.value / total
    const dash = ratio * circumference
    const seg = { ...c, dash, offset: -offset }
    offset += dash
    return seg
  })
})



const {
  contextVisible, contextItems, contextX, contextY,
  startPress, cancelPress, closeContext,
} = useLongPress()

const editPanel = ref(false)
const panelTitle = ref('')
const editingAccount = ref<AccountCard | null>(null)

function onLongPressAccount(acct: AccountCard, event: MouseEvent | TouchEvent): void {
  editingAccount.value = acct
  startPress(event, [
    { icon: '✏️', label: 'Editar', action: () => openEdit(acct) },
    { icon: '🗑️', label: 'Eliminar', action: () => deleteAccount(acct) },
  ])
}

function openEdit(acct: AccountCard): void {
  panelTitle.value = `Editar ${acct.name}`
  editPanel.value = true
}

function deleteAccount(acct: AccountCard): void {
  accounts.value = accounts.value.filter(a => a.id !== acct.id)
}

const fabActions: FabAction[] = [
  { icon: '💸', label: 'Nuevo gasto', action: () => {} },
  { icon: '💵', label: 'Nuevo ingreso', action: () => {} },
  { icon: '🏦', label: 'Nueva cuenta', action: () => {} },
]

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2 })
}
</script>

<template>
  <div class="finance-page">
    <section class="accounts-scroll-section">
      <div class="accounts-scroll">
          <div
          v-for="acct in accounts"
          :key="acct.id"
          class="account-card"
          :style="{ borderLeftColor: acct.color }"
          @mousedown="onLongPressAccount(acct, $event)"
          @touchstart="onLongPressAccount(acct, $event)"
          @mouseup="cancelPress"
          @mouseleave="cancelPress"
          @touchend="cancelPress"
          @touchmove="cancelPress"
        >
          <div class="acct-info">
            <span class="acct-name">{{ acct.name }}</span>
          </div>
          <div class="acct-balance-row">
            <span class="trend-indicator" :class="acct.trend">
              <span v-if="acct.trend === 'up'">▲</span>
              <span v-else-if="acct.trend === 'down'">▼</span>
              <span v-else>—</span>
            </span>
            <span class="acct-balance">{{ formatCurrency(acct.balance) }}</span>
          </div>
        </div>
      </div>

      <Transition name="alert-fade">
        <div v-if="budgetAlert" class="budget-alert" :class="{ urgent: budgetAlert.urgent }">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">{{ budgetAlert.message }}</span>
        </div>
      </Transition>
    </section>

    <section class="charts-section">
      <h2 class="section-heading">Gastos de este mes</h2>
      <div class="charts-row">
        <div class="donut-block">
          <div class="donut-container">
            <svg viewBox="0 0 100 100" class="donut-svg">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" stroke-width="12" />
              <circle
                v-for="seg in segments"
                :key="seg.label"
                cx="50" cy="50" r="40"
                fill="none"
                :stroke="seg.color"
                stroke-width="12"
                :stroke-dasharray="`${seg.dash} ${circumference}`"
                :stroke-dashoffset="seg.offset"
                transform="rotate(-90 50 50)"
                stroke-linecap="round"
              />
            </svg>
            <div class="donut-center">
              <span class="donut-total">$12,400</span>
              <span class="donut-label">este mes</span>
            </div>
          </div>
          <div class="legend-list">
            <div v-for="cat in categories" :key="cat.label" class="legend-item">
              <span class="legend-dot" :style="{ background: cat.color }" />
              <span class="legend-label">{{ cat.label }}</span>
              <span class="legend-value">{{ cat.value }}%</span>
            </div>
          </div>
        </div>

        <FinanceChart v-model:view-mode="viewMode" />
      </div>

      <div class="view-toggle">
        <button
          v-for="mode in (['diario', 'semanal', 'mensual'] as const)"
          :key="mode"
          class="toggle-btn"
          :class="{ active: viewMode === mode }"
          @click="viewMode = mode"
        >
          {{ mode === 'diario' ? 'Diario' : mode.charAt(0).toUpperCase() + mode.slice(1) }}
        </button>
      </div>
    </section>

    <ContextMenu
      :visible="contextVisible"
      :items="contextItems"
      :x="contextX"
      :y="contextY"
      @close="closeContext"
    />

    <FloatingActionButton :actions="fabActions" />

    <SlidePanel :open="editPanel" :title="panelTitle" side="right" @close="editPanel = false">
      <p class="panel-placeholder">Contenido del formulario</p>
    </SlidePanel>

    <SlidePanel :open="props.historyOpen" title="Historial" side="left" @close="emit('close-history')">
      <div class="history-filters">
        <div class="filter-row">
          <select v-model="filterAccount" class="filter-select">
            <option value="">Todas las cuentas</option>
            <option v-for="a in accounts" :key="a.id" :value="a.name">{{ a.name }}</option>
          </select>
          <select v-model="filterCategory" class="filter-select">
            <option value="">Todas las categorías</option>
            <option v-for="c in filterCategories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-row">
          <div class="type-toggle">
            <button
              :class="{ active: filterType === 'all' }"
              @click="filterType = 'all'"
            >Todos</button>
            <button
              :class="{ active: filterType === 'income' }"
              @click="filterType = 'income'"
            >Ingresos</button>
            <button
              :class="{ active: filterType === 'expense' }"
              @click="filterType = 'expense'"
            >Gastos</button>
          </div>
        </div>
        <div class="filter-row">
          <input v-model="filterYear" type="text" placeholder="Año (ej. 2024)" class="filter-input" maxlength="4" />
          <select v-model="filterMonth" class="filter-select">
            <option value="">Todos los meses</option>
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>
      </div>
      <div class="history-list">
        <div v-for="entry in filteredHistory" :key="entry.id" class="history-item">
          <div class="hist-left">
            <span class="hist-date">{{ entry.date }}</span>
            <span class="hist-concept">{{ entry.concept }}</span>
            <span class="hist-account">{{ entry.account }}<span v-if="entry.category"> · {{ entry.category }}</span></span>
          </div>
          <span
            class="hist-amount"
            :class="{ income: entry.type === 'income', expense: entry.type === 'expense' }"
          >
            {{ entry.type === 'income' ? '+' : '' }}{{ formatCurrency(Math.abs(entry.amount)) }}
          </span>
        </div>
        <div v-if="filteredHistory.length === 0" class="hist-empty">Sin resultados</div>
      </div>
    </SlidePanel>
  </div>
</template>

<style scoped>
.finance-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.accounts-scroll-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.accounts-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  scroll-snap-type: x proximity;
}

.accounts-scroll::-webkit-scrollbar {
  height: 4px;
}
.accounts-scroll::-webkit-scrollbar-track {
  background: var(--color-border);
  border-radius: 2px;
}
.accounts-scroll::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 2px;
}

.account-card {
  flex: 0 0 320px;
  background: var(--color-surface);
  padding: 20px;
  border-left: 5px solid;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
  scroll-snap-align: start;
  transition: box-shadow 0.15s;
  position: relative;
  min-height: 130px;
}

.account-card:hover {
  box-shadow: var(--shadow-md);
}

.acct-balance-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-indicator {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  flex-shrink: 0;
}

.trend-indicator.up {
  color: #2e7d32;
}

.trend-indicator.down {
  color: #c62828;
}

.trend-indicator.flat {
  color: var(--color-text-disabled);
}

:root.dark .trend-indicator.up {
  color: #66bb6a;
}

:root.dark .trend-indicator.down {
  color: #ef5350;
}

.acct-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.acct-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
}

.acct-type {
  font-size: 12px;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.acct-balance {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
}

.acct-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background 0.2s;
}

.dot.active {
  transform: scale(1.2);
}

.budget-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 167, 38, 0.12);
  border-radius: var(--border-radius-md);
  color: #e65100;
  font-size: 13px;
  font-weight: 500;
}

.budget-alert.urgent {
  background: rgba(229, 57, 53, 0.12);
  color: #c62828;
}

.alert-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.section-heading {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.charts-row {
  display: flex;
  gap: 12px;
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.donut-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  width: 130px;
}

.donut-container {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text);
}

.donut-label {
  font-size: 9px;
  color: var(--color-text-secondary);
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 10px;
  color: var(--color-text);
}

.legend-value {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.view-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.toggle-btn.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.history-item:last-child {
  border-bottom: none;
}

.hist-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hist-date {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.hist-concept {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.hist-account {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.hist-amount {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.hist-amount.income {
  color: #2e7d32;
}

.hist-amount.expense {
  color: #c62828;
}

:root.dark .hist-amount.income {
  color: #66bb6a;
}

:root.dark .hist-amount.expense {
  color: #ef5350;
}

.panel-placeholder {
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 40px;
}

.history-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--color-hover);
  border-radius: var(--border-radius-sm);
}

.filter-row {
  display: flex;
  gap: 6px;
}

.filter-select,
.filter-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-input-bg);
  color: var(--color-text);
  font-size: 12px;
  font-family: inherit;
}

.filter-input {
  max-width: 80px;
}

.type-toggle {
  display: flex;
  gap: 4px;
}

.type-toggle button {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.type-toggle button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.hist-empty {
  text-align: center;
  padding: 24px 0;
  color: var(--color-text-secondary);
  font-size: 13px;
}

  @media (max-width: 640px) {
  .finance-page {
    padding: 12px;
    gap: 16px;
  }
  .account-card {
    flex: 0 0 220px;
    padding: 14px 14px 14px 28px;
    min-height: 110px;
  }
  .acct-balance {
    font-size: 20px;
  }
  .charts-row {
    flex-direction: column;
    gap: 12px;
  }
  .donut-block {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  .trend-indicator {
    font-size: 18px;
  }
}

.alert-fade-enter-active,
.alert-fade-leave-active {
  transition: all 0.3s ease;
}
.alert-fade-enter-from,
.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
