<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLongPress } from '../composables/useLongPress'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
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

const viewMode = ref<'semanal' | 'mensual' | 'anual'>('mensual')

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

/* Datos base mensuales para cada cuenta (12 meses → anual) */
const monthlyBase: Record<string, number[]> = {
  'Gasto diario':  [1200, 1350, 1400, 1500, 1600, 1700, 1750, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2750, 2800, 2850, 2900, 3000, 3100, 3150, 2900, 3000, 3100, 3200],
  'Ahorro':       [15000,15200,15400,15600,15800,16000,15800,16000,16200,16400,16600,16800,17000,17200,17400,17600,17800,18000,18200,18400,18300,18400,18450,18500,18500,18500,18500,18500],
  'Inversión':    [38000,38500,39000,39500,39800,40000,40500,41000,41500,42000,42500,43000,43500,44000,44300,44500,44800,45000,45100,45200,45250,45300,45300,45300,45300,45300,45300,45300],
  'Donación':     [700,  730,  750,  780,  800,  820,  840,  860,  880,  900,  930,  950,  980,  1000, 1030, 1050, 1080, 1100, 1120, 1140, 1150, 1170, 1190, 1200, 1200, 1200, 1200, 1200],
  'Vivienda':     [3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000, 5100, 5200, 5300, 5400, 5500, 5600, 5700, 5750, 5800, 5750, 5700, 5650, 5700, 5750, 5800],
  'Transporte':   [500,  520,  540,  560,  580,  600,  620,  640,  660,  680,  700,  720,  740,  760,  780,  800,  820,  840,  860,  880,  900,  920,  940,  960,  930,  940,  950,  950],
  'Salud':        [2000, 2100, 2200, 2250, 2300, 2350, 2400, 2450, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3150, 3200, 3250, 3300, 3350, 3380, 3400, 3450, 3420, 3400, 3400, 3400, 3400],
  'Educación':    [8000, 8200, 8400, 8600, 8800, 9000, 9200, 9400, 9600, 9800, 10000,10200,10400,10600,10800,11000,11200,11400,11600,11800,11900,12000,11950,11900,11900,12000,12000,12000],
  'Vacaciones':   [6000, 6100, 6200, 6300, 6400, 6500, 6600, 6700, 6800, 6900, 7000, 7100, 7200, 7300, 7400, 7500, 7600, 7700, 7750, 7780, 7790, 7800, 7820, 7830, 7810, 7800, 7800, 7800],
  'Emergencia':   [10000,10200,10500,10700,11000,11200,11500,11700,12000,12200,12500,12800,13000,13200,13500,13700,14000,14200,14400,14600,14800,14900,15000,15000,15000,15000,15000,15000],
}

/* Nombres de los meses en español */
const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const accountNames = accounts.value.map(a => a.name)

/* Generar chartData según el modo */
const chartData = computed<{ label: string; values: number[] }[]>(() => {
  if (viewMode.value === 'anual') {
    return [2023, 2024, 2025].map((year, yi) => {
      const idx = yi === 0 ? 11 : yi === 1 ? 23 : 27
      return {
        label: `${year}`,
        values: accountNames.map(n => monthlyBase[n][idx]),
      }
    })
  }

  if (viewMode.value === 'mensual') {
    /* Últimos 4 meses: ene 2025, feb 2025, mar 2025, abr 2025 */
    const months = [
      { label: 'ene 2025', idx: 24 },
      { label: 'feb 2025', idx: 25 },
      { label: 'mar 2025', idx: 26 },
      { label: 'abr 2025', idx: 27 },
    ]
    return months.map(m => ({
      label: m.label,
      values: accountNames.map(n => monthlyBase[n][m.idx]),
    }))
  }

  /* semanal: 7 días de la última semana de abr 2025 */
  const dailyLabels = ['lun 28', 'mar 29', 'mié 30', 'jue 1', 'vie 2', 'sáb 3', 'dom 4']
  const prevVal = accountNames.map(n => monthlyBase[n][26]) /* mar 2025 */
  const curVal = accountNames.map(n => monthlyBase[n][27])  /* abr 2025 */
  const diffs = curVal.map((v, i) => (v - prevVal[i]) / 7)

  return dailyLabels.map((label, di) => ({
    label,
    values: prevVal.map((b, i) => Math.round(b + diffs[i] * (di + 1))),
  }))
})

const yMax = computed(() => {
  let max = 0
  for (const dp of chartData.value) {
    for (const v of dp.values) {
      if (v > max) max = v
    }
  }
  return Math.ceil(max / 1000) * 1000 || 1000
})

const chartW = computed(() => Math.max(200, chartData.value.length * 80))
const chartH = computed(() => 180)
const pad = { top: 20, right: 16, bottom: 36, left: 52 }

const plotW = computed(() => chartW.value - pad.left - pad.right)
const plotH = computed(() => chartH.value - pad.top - pad.bottom)

function xPos(i: number): number {
  return pad.left + (i / Math.max(1, chartData.value.length - 1)) * plotW.value
}

function yPos(v: number): number {
  return pad.top + plotH.value - (v / yMax.value) * plotH.value
}

const yTicks = computed(() => {
  const steps = 4
  const step = yMax.value / steps
  const ticks: { label: string; y: number }[] = []
  for (let i = 0; i <= steps; i++) {
    ticks.push({ label: `$${(step * i).toLocaleString()}`, y: yPos(step * i) })
  }
  return ticks
})

const dotSeries = computed(() => {
  return accounts.value.map((acct, ai) => {
    const pts = chartData.value.map((dp, i) => `${xPos(i)},${yPos(dp.values[ai])}`).join(' ')
    return { id: acct.id, color: acct.color, points: pts }
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
          <span class="trend-indicator" :class="acct.trend">
            <span v-if="acct.trend === 'up'">▲</span>
            <span v-else-if="acct.trend === 'down'">▼</span>
            <span v-else>—</span>
          </span>
          <div class="acct-info">
            <span class="acct-name">{{ acct.name }}</span>
          </div>
          <span class="acct-balance">{{ formatCurrency(acct.balance) }}</span>
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

        <div class="dot-chart-block">
          <div class="dot-scroll-wrap">
            <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="dot-svg" :style="{ width: chartW + 'px', minWidth: chartW + 'px' }">
              <defs>
                <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-border)" stroke-width="0.3" opacity="0.4" />
                </pattern>
                <pattern id="grid-large" width="80" height="40" patternUnits="userSpaceOnUse">
                  <rect width="80" height="40" fill="url(#grid-small)" />
                  <path d="M 80 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" stroke-width="0.6" opacity="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-large)" />
              <line v-for="tick in yTicks" :key="tick.label" x1="0" :y1="tick.y" :x2="chartW" :y2="tick.y" stroke="var(--color-text-secondary)" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.5" />
              <line v-for="(dp, i) in chartData" :key="'vline-'+i" :x1="xPos(i)" :y1="pad.top" :x2="xPos(i)" :y2="chartH - pad.bottom" stroke="var(--color-text-secondary)" stroke-width="0.4" stroke-dasharray="2,3" opacity="0.5" />
              <text v-for="tick in yTicks" :key="tick.label" x="4" :y="tick.y + 3" fill="var(--color-text-secondary)" font-size="8" text-anchor="start">{{ tick.label }}</text>
              <text v-for="(dp, i) in chartData" :key="dp.label" :x="xPos(i)" :y="chartH - 4" fill="var(--color-text-secondary)" font-size="8" text-anchor="middle">{{ dp.label }}</text>
              <polyline
                v-for="serie in dotSeries"
                :key="serie.id"
                :points="serie.points"
                :stroke="serie.color"
                stroke-width="1.8"
                fill="none"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <template v-for="(dp, mi) in chartData" :key="'dots-' + mi">
                <circle
                  v-for="(acct, ai) in accounts"
                  :key="`${mi}-${ai}`"
                  :cx="xPos(mi)"
                  :cy="yPos(dp.values[ai])"
                  :fill="acct.color"
                  r="3"
                  stroke="#fff"
                  stroke-width="1"
                />
              </template>
            </svg>
          </div>
          <div class="dot-legend">
            <div v-for="acct in accounts" :key="acct.id" class="legend-item">
              <span class="legend-dot" :style="{ background: acct.color }" />
              <span class="legend-label">{{ acct.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="view-toggle">
        <button
          v-for="mode in (['semanal', 'mensual', 'anual'] as const)"
          :key="mode"
          class="toggle-btn"
          :class="{ active: viewMode === mode }"
          @click="viewMode = mode"
        >
          {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
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

.trend-indicator {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
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

.dot-chart-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.dot-scroll-wrap {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: 8px;
}

.dot-scroll-wrap::-webkit-scrollbar {
  height: 4px;
}
.dot-scroll-wrap::-webkit-scrollbar-track {
  background: var(--color-border);
  border-radius: 2px;
}
.dot-scroll-wrap::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 2px;
}

.dot-svg {
  height: 180px;
  display: block;
}

.dot-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dot-legend .legend-item {
  gap: 3px;
  padding: 2px 6px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.dot-legend .legend-label {
  font-size: 9px;
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
    left: 10px;
    font-size: 20px;
    width: 20px;
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
