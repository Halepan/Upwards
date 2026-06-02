<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLongPress } from '../composables/useLongPress'
import { useTheme } from '../composables/useTheme'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import GenericChart from './GenericChart.vue'
import type { FabAction } from './FloatingActionButton.vue'
import type { ChartSeries } from './GenericChart.vue'
import walletIcon from '../assets/icons/mdi--wallet-bifold.svg'
import incomeIcon from '../assets/icons/mdi--wallet-bifold-outline.svg'
import accountIcon from '../assets/icons/mdi--account-outline.svg'
import editIcon from '../assets/icons/mdi--check-outline.svg'
import deleteIcon from '../assets/icons/weui--delete-outlined.svg'
import alertIcon from '../assets/icons/weui--delete-filled.svg'
import checkIcon from '../assets/icons/mdi--check-bold.svg'

type Trend = 'up' | 'down' | 'flat'

interface Derivation {
  sourceAccountId: number
  percentage: number
}

interface AccountCard {
  id: number
  name: string
  balance: number
  prevBalance: number
  color: string
  spent: number
  trend: Trend
  derivations: Derivation[]  // what % of each source account's income flows here
}

const props = defineProps<{
  historyOpen: boolean
}>()

const emit = defineEmits<{
  'close-history': []
}>()

const accounts = ref<AccountCard[]>([
  { id: 1, name: 'Gasto diario', balance: 3200, prevBalance: 2800, color: '#00897b', spent: 2700, trend: 'up', derivations: [] },
  { id: 2, name: 'Ahorro', balance: 18500, prevBalance: 19200, color: '#1565c0', spent: 0, trend: 'down', derivations: [{ sourceAccountId: 1, percentage: 20 }] },
  { id: 3, name: 'Inversión', balance: 45300, prevBalance: 45300, color: '#e65100', spent: 0, trend: 'flat', derivations: [{ sourceAccountId: 1, percentage: 10 }] },
  { id: 4, name: 'Donación', balance: 1200, prevBalance: 1100, color: '#6a1b9a', spent: 0, trend: 'up', derivations: [{ sourceAccountId: 1, percentage: 5 }] },
  { id: 5, name: 'Vivienda', balance: 5800, prevBalance: 6200, color: '#2e7d32', spent: 5100, trend: 'down', derivations: [] },
  { id: 6, name: 'Transporte', balance: 950, prevBalance: 870, color: '#f9a825', spent: 800, trend: 'up', derivations: [] },
  { id: 7, name: 'Salud', balance: 3400, prevBalance: 3200, color: '#ec407a', spent: 2100, trend: 'up', derivations: [] },
  { id: 8, name: 'Educación', balance: 12000, prevBalance: 12500, color: '#ab47bc', spent: 0, trend: 'down', derivations: [{ sourceAccountId: 1, percentage: 10 }] },
  { id: 9, name: 'Vacaciones', balance: 7800, prevBalance: 7800, color: '#26c6da', spent: 0, trend: 'flat', derivations: [{ sourceAccountId: 1, percentage: 5 }] },
  { id: 10, name: 'Emergencia', balance: 15000, prevBalance: 14000, color: '#8d6e63', spent: 0, trend: 'up', derivations: [] },
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
  return history.value
    .filter(e => {
      if (filterAccount.value && e.account !== filterAccount.value) return false
      if (filterType.value !== 'all' && e.type !== filterType.value) return false
      if (filterCategory.value && e.category !== filterCategory.value) return false
      if (filterYear.value && !e.date.startsWith(filterYear.value)) return false
      if (filterMonth.value && !e.date.startsWith(`${filterYear.value || e.date.slice(0, 4)}-${filterMonth.value}`)) return false
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date))
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

const { isDark } = useTheme()

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function generateData(
  startVal: number,
  volatility: number,
  drift: number,
  seed: number,
  minVal = 10,
  maxVal = 10000,
): { x: Date; y: number }[] {
  const rand = seededRand(seed)
  let val = startVal
  const data: { x: Date; y: number }[] = []
  const start = new Date(2023, 0, 1)
  const end = new Date(2026, 11, 31)
  const cur = new Date(start)

  while (cur <= end) {
    val += drift + (rand() - 0.5) * volatility
    val = Math.max(minVal, Math.min(maxVal, val))
    data.push({ x: new Date(cur), y: Math.round(val) })
    cur.setDate(cur.getDate() + 1)
  }
  return data
}

const financeSeries = computed<ChartSeries[]>(() =>
  accounts.value.map(acct => {
    const b = Math.max(acct.balance, 100)
    const drift = acct.trend === 'up' ? b * 0.001 : acct.trend === 'down' ? -b * 0.001 : 0
    return {
      label: acct.name,
      data: generateData(b * 0.8, b * 0.15, drift, acct.id, 0, b * 2),
      color: acct.color,
    }
  })
)

const {
  contextVisible, contextItems, contextX, contextY,
  startPress, cancelPress, closeContext,
} = useLongPress()

// ---------- Account editing state ----------
const editPanel = ref(false)
const panelTitle = ref('')
const editingAccount = ref<AccountCard | null>(null)

// Account form fields
const acctFormName = ref('')
const acctFormBalance = ref(0)
const acctFormColor = ref('#00897b')
const acctFormAdvanced = ref(false)
// Derivations config: for each source account (excluding self), store percentage
const acctFormDerivations = ref<{ accountId: number; name: string; pct: number }[]>([])

const accountColors = ['#00897b', '#1565c0', '#e65100', '#6a1b9a', '#2e7d32', '#f9a825', '#ec407a', '#ab47bc', '#26c6da', '#8d6e63']

function initDerivations(excludeId?: number) {
  acctFormDerivations.value = accounts.value
    .filter(a => a.id !== excludeId)
    .map(a => {
      const existing = excludeId
        ? accounts.value.find(ac => ac.id === excludeId)?.derivations.find(d => d.sourceAccountId === a.id)
        : null
      return { accountId: a.id, name: a.name, pct: existing?.percentage || 0 }
    })
}

function openAccountForm(acct?: AccountCard) {
  if (acct) {
    editingAccount.value = acct
    acctFormName.value = acct.name
    acctFormBalance.value = acct.balance
    acctFormColor.value = acct.color
    acctFormAdvanced.value = acct.derivations.length > 0
    initDerivations(acct.id)
    panelTitle.value = `Editar ${acct.name}`
  } else {
    editingAccount.value = null
    acctFormName.value = ''
    acctFormBalance.value = 0
    acctFormColor.value = '#00897b'
    acctFormAdvanced.value = false
    initDerivations()
    panelTitle.value = 'Nueva cuenta'
  }
  editPanel.value = true
}

function saveAccount() {
  if (!acctFormName.value.trim()) return
  const derivations: Derivation[] = acctFormAdvanced.value
    ? acctFormDerivations.value.filter(d => d.pct > 0).map(d => ({ sourceAccountId: d.accountId, percentage: d.pct }))
    : []
  if (editingAccount.value) {
    const a = editingAccount.value
    a.name = acctFormName.value.trim()
    a.balance = acctFormBalance.value
    a.color = acctFormColor.value
    a.derivations = derivations
  } else {
    accounts.value.push({
      id: Date.now() + Math.floor(Math.random() * 10000),
      name: acctFormName.value.trim(),
      balance: acctFormBalance.value,
      prevBalance: acctFormBalance.value,
      color: acctFormColor.value,
      spent: 0,
      trend: 'flat',
      derivations,
    })
  }
  editPanel.value = false
  editingAccount.value = null
}

function onLongPressAccount(acct: AccountCard, event: MouseEvent | TouchEvent): void {
  startPress(event, [
    { icon: editIcon, label: 'Editar', action: () => openAccountForm(acct) },
    { icon: deleteIcon, label: 'Eliminar', action: () => deleteAccount(acct) },
  ])
}

function deleteAccount(acct: AccountCard): void {
  accounts.value = accounts.value.filter(a => a.id !== acct.id)
}

// ---------- Transaction dialog state ----------
const showTxDialog = ref(false)
const txType = ref<'income' | 'expense'>('expense')
const txConcept = ref('')
const txAmount = ref(0)
const txCategory = ref('')
const txAccount = ref('')
const txDate = ref('')

// Income-specific
const txIncomeType = ref<'Trabajo' | 'Negocio' | 'Donativo'>('Trabajo')
// Derivation amounts: account name → actual amount received
const txDerivedAmounts = ref<Record<string, number>>({})

const incomeTypes = ['Trabajo', 'Negocio', 'Donativo'] as const
const txCategories = ['Alimentación', 'Vivienda', 'Transporte', 'Salud', 'Ocio', 'Educación', 'Ropa', 'Suscripciones', 'Otros']

function openTxDialog(type: 'income' | 'expense') {
  txType.value = type
  txConcept.value = ''
  txAmount.value = 0
  txCategory.value = type === 'expense' ? 'Alimentación' : ''
  txAccount.value = accounts.value[0]?.name || ''
  txDate.value = new Date().toISOString().slice(0, 10)
  txIncomeType.value = 'Trabajo'
  txDerivedAmounts.value = {}
  showTxDialog.value = true
}

// Find accounts derived from the selected source account
function getDerivedAccounts() {
  const sourceAcct = accounts.value.find(a => a.name === txAccount.value)
  if (!sourceAcct || !txAmount.value || txAmount.value <= 0) return []
  const result: { account: AccountCard; pct: number; amount: number }[] = []
  for (const acct of accounts.value) {
    for (const d of acct.derivations) {
      if (d.sourceAccountId === sourceAcct.id && d.percentage > 0) {
        result.push({
          account: acct,
          pct: d.percentage,
          amount: (txAmount.value * d.percentage) / 100,
        })
      }
    }
  }
  return result
}

// Watch account or amount changes to recompute derived amounts
import { watch } from 'vue'
watch([txAccount, txAmount], () => {
  if (txType.value !== 'income') return
  const derived = getDerivedAccounts()
  const amounts: Record<string, number> = {}
  for (const d of derived) {
    amounts[d.account.name] = d.amount
  }
  txDerivedAmounts.value = amounts
})

function saveTransaction() {
  if (!txConcept.value.trim() || txAmount.value <= 0) return
  if (txType.value === 'expense') {
    if (!txAccount.value) return
    const expenseAccount = accounts.value.find(a => a.name === txAccount.value)
    if (expenseAccount) expenseAccount.balance -= txAmount.value
    history.value.push({
      id: Date.now() + Math.floor(Math.random() * 10000),
      concept: txConcept.value.trim(),
      amount: -txAmount.value,
      type: 'expense',
      category: txCategory.value,
      date: txDate.value,
      account: txAccount.value,
    })
  } else {
    const derivedList = getDerivedAccounts()
    // Main income entry
    const source = accounts.value.find(a => a.name === txAccount.value)
    if (!source) return
    // Full amount enters source account first
    source.balance += txAmount.value
    history.value.push({
      id: Date.now() + Math.floor(Math.random() * 10000),
      concept: `${txConcept.value.trim()} (${txIncomeType.value})`,
      amount: txAmount.value,
      type: 'income',
      category: txIncomeType.value,
      date: txDate.value,
      account: txAccount.value,
    })

    // Derived entries: transfer from source to derived accounts
    for (const d of derivedList) {
      const actualAmount = txDerivedAmounts.value[d.account.name] ?? d.amount
      if (actualAmount <= 0) continue
      // Transfer: subtract from source, add to target
      source.balance -= actualAmount
      d.account.balance += actualAmount
      history.value.push({
        id: Date.now() + Math.floor(Math.random() * 10000) + 1,
        concept: `↳ Traspaso: ${txConcept.value.trim()} → ${d.account.name}`,
        amount: actualAmount,
        type: 'income',
        category: 'Derivado',
        date: txDate.value,
        account: d.account.name,
      })
    }
  }
  showTxDialog.value = false
}

const fabActions: FabAction[] = [
  { icon: walletIcon, label: 'Nuevo gasto', action: () => openTxDialog('expense') },
  { icon: incomeIcon, label: 'Nuevo ingreso', action: () => openTxDialog('income') },
  { icon: accountIcon, label: 'Nueva cuenta', action: () => openAccountForm() },
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
          <img :src="alertIcon" class="alert-svg-icon" alt="alert" />
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

        <GenericChart
          :series="financeSeries"
          :view-mode="viewMode"
          :yFormat="(v: number) => '$' + v.toLocaleString('es-MX')"
          :dark-mode="isDark === 'dark'"
          @update:view-mode="viewMode = $event"
        />
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

    <!-- ======================== ACCOUNT FORM (SLIDE PANEL) ======================== -->
    <SlidePanel :open="editPanel" :title="panelTitle" side="right" @close="editPanel = false; editingAccount = null">
      <div class="fin-form">
        <label class="ff-field">
          <span class="ff-label">Nombre</span>
          <input v-model="acctFormName" type="text" class="ff-input" placeholder="Ej: Gasto diario" />
        </label>

        <label class="ff-field">
          <span class="ff-label">Saldo</span>
          <input v-model.number="acctFormBalance" type="number" class="ff-input" min="0" />
        </label>

        <label class="ff-field ff-advanced">
          <label class="ff-check-wrap">
            <input type="checkbox" v-model="acctFormAdvanced" class="ff-check-input" />
            <span class="ff-check-mark"><img :src="checkIcon" class="check-svg-icon" alt="✓" /></span>
            <span class="ff-check-label">Avanzado</span>
          </label>
        </label>

        <div v-if="acctFormAdvanced" class="ff-derivations">
          <span class="ff-label">Cuenta derivada de</span>
          <div class="ff-deriv-list">
            <div
              v-for="item in acctFormDerivations"
              :key="item.accountId"
              class="ff-deriv-row"
            >
              <span class="ff-deriv-name" :style="{ color: accounts.find(a => a.id === item.accountId)?.color }">{{ item.name }}</span>
              <div class="ff-deriv-controls">
                <input v-model.number="item.pct" type="number" class="ff-input deriv-pct-input" min="0" max="100" />
                <span class="ff-dist-pct">%</span>
                <input type="range" min="0" max="100" v-model.number="item.pct" class="ff-range" />
              </div>
            </div>
          </div>
        </div>

        <label class="ff-field">
          <span class="ff-label">Color</span>
          <div class="ff-colors">
            <button
              v-for="c in accountColors"
              :key="c"
              class="ff-color-btn"
              :style="{ background: c }"
              :class="{ active: acctFormColor === c }"
              @click="acctFormColor = c"
            />
          </div>
        </label>

        <div class="ff-actions">
          <button class="ff-btn cancel" @click="editPanel = false; editingAccount = null">Cancelar</button>
          <button class="ff-btn save" @click="saveAccount" :disabled="!acctFormName.trim()">
            {{ editingAccount ? 'Guardar' : 'Crear' }}
          </button>
        </div>
      </div>
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

    <!-- ======================== TRANSACTION DIALOG ======================== -->
    <Teleport to="body">
      <div v-if="showTxDialog" class="tx-overlay" @click.self="showTxDialog = false">
        <div class="tx-dialog">
          <h3 class="tx-title">{{ txType === 'expense' ? 'Nuevo gasto' : 'Nuevo ingreso' }}</h3>

          <label class="ff-field">
            <span class="ff-label">Concepto</span>
            <input v-model="txConcept" type="text" class="ff-input" placeholder="Ej: Supermercado" />
          </label>

          <label class="ff-field">
            <span class="ff-label">Monto</span>
            <input v-model.number="txAmount" type="number" class="ff-input" min="0" step="0.01" placeholder="0.00" />
          </label>

          <!-- Income: type selector -->
          <div v-if="txType === 'income'" class="ff-field">
            <span class="ff-label">Tipo de ingreso</span>
            <div class="tx-type-toggle">
              <button
                v-for="t in incomeTypes"
                :key="t"
                :class="{ active: txIncomeType === t }"
                @click="txIncomeType = t"
              >{{ t }}</button>
            </div>
          </div>

          <label v-if="txType === 'expense'" class="ff-field">
            <span class="ff-label">Categoría</span>
            <select v-model="txCategory" class="ff-select">
              <option v-for="cat in txCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </label>

          <label class="ff-field">
            <span class="ff-label">Cuenta</span>
            <select v-model="txAccount" class="ff-select">
              <option v-for="acct in accounts" :key="acct.id" :value="acct.name">{{ acct.name }}</option>
            </select>
          </label>

          <!-- Income: derived accounts from this source -->
          <div v-if="txType === 'income' && getDerivedAccounts().length > 0" class="ff-field">
            <span class="ff-label">Cuentas derivadas</span>
            <div class="tx-derived">
              <div v-for="d in getDerivedAccounts()" :key="d.account.id" class="tx-derived-row">
                <span class="tx-derived-name" :style="{ color: d.account.color }">{{ d.account.name }}</span>
                <span class="tx-derived-pct">{{ d.pct }}%</span>
                <span class="tx-derived-calc">${{ d.amount.toFixed(2) }}</span>
                <input
                  v-model.number="txDerivedAmounts[d.account.name]"
                  type="number"
                  class="ff-input derived-amt-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <label class="ff-field">
            <span class="ff-label">Fecha</span>
            <input v-model="txDate" type="date" class="ff-input" />
          </label>

          <div class="ff-actions">
            <button class="ff-btn cancel" @click="showTxDialog = false">Cancelar</button>
            <button class="ff-btn save" @click="saveTransaction" :disabled="!txConcept.trim() || txAmount <= 0 || (txType === 'expense' && !txAccount)">
              Añadir
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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

.alert-svg-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: block;
  color: #e65100;
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

/* ======================== FINANCE FORM ======================== */

.fin-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 4px 20px;
}

.ff-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ff-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ff-input {
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.ff-input:focus {
  border-color: var(--color-primary);
}

.ff-select {
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.ff-select:focus {
  border-color: var(--color-primary);
}

.ff-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ff-color-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}

.ff-color-btn.active {
  border-color: var(--color-text);
  transform: scale(1.15);
}

.ff-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.ff-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.ff-btn.cancel {
  background: var(--border-color);
  color: var(--color-text);
}

.ff-btn.cancel:hover {
  opacity: 0.8;
}

.ff-btn.save {
  background: var(--color-primary, #00897b);
  color: #fff;
}

.ff-btn.save:hover:not(:disabled) {
  opacity: 0.85;
}

.ff-btn.save:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ======================== TRANSACTION DIALOG ======================== */

.tx-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.tx-dialog {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  width: 360px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.tx-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* ======================== ADVANCED CHECKBOX (ACCOUNT FORM) ======================== */

.ff-advanced {
  flex-direction: row !important;
  align-items: center;
  padding-top: 4px;
}

.ff-check-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.ff-check-input {
  display: none;
}

.ff-check-mark {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.ff-check-mark .check-svg-icon {
  width: 14px;
  height: 14px;
  display: none;
  color: #fff;
}

.ff-check-input:checked + .ff-check-mark {
  background: var(--color-primary, #00897b);
  border-color: var(--color-primary, #00897b);
}

.ff-check-input:checked + .ff-check-mark .check-svg-icon {
  display: block;
}

.ff-check-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}

/* ======================== DERIVATIONS LIST (ACCOUNT FORM) ======================== */

.ff-derivations {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: var(--color-hover);
  border-radius: 8px;
}

.ff-deriv-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.ff-deriv-list::-webkit-scrollbar {
  width: 4px;
}
.ff-deriv-list::-webkit-scrollbar-track {
  background: transparent;
}
.ff-deriv-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.ff-deriv-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ff-deriv-name {
  font-size: 12px;
  font-weight: 600;
  min-width: 70px;
}

.ff-deriv-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.deriv-pct-input {
  width: 48px !important;
  text-align: center;
}

.ff-range {
  flex: 1;
  height: 4px;
  appearance: none;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.ff-range::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary, #00897b);
  cursor: pointer;
  border: none;
}

.ff-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-primary, #00897b);
  cursor: pointer;
  border: none;
}

.ff-dist-pct {
  font-size: 11px;
  color: var(--color-text-secondary);
  min-width: 10px;
}

/* ======================== INCOME TYPE TOGGLE ======================== */

.tx-type-toggle {
  display: flex;
  gap: 4px;
}

.tx-type-toggle button {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.tx-type-toggle button.active {
  background: var(--color-primary, #00897b);
  border-color: var(--color-primary, #00897b);
  color: #fff;
}

/* ======================== DERIVED ACCOUNTS (INCOME DIALOG) ======================== */

.tx-derived {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: var(--color-hover);
  border-radius: 8px;
}

.tx-derived-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tx-derived-name {
  font-size: 11px;
  font-weight: 600;
  min-width: 64px;
}

.tx-derived-pct {
  font-size: 10px;
  color: var(--color-text-secondary);
  min-width: 24px;
}

.tx-derived-calc {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-sec, #888);
  min-width: 52px;
}

.derived-amt-input {
  width: 64px !important;
  text-align: center;
  margin-left: auto;
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
