<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useLongPress } from '../composables/useLongPress'
import { useTheme } from '../composables/useTheme'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import WeekPlanner from './WeekPlanner.vue'
import type { FabAction } from './FloatingActionButton.vue'
import type { PlannerItem } from './WeekPlanner.vue'
import { themeIcons } from '../config/theme.config'
import { habitStore, useAuthStore } from '../store'
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)
import type { Habit } from '../domain/habit'

const { isDark } = useTheme()

interface HabitLog {
  date: string
  done: boolean
}

interface HabitLocal {
  id: number
  name: string
  icon: string
  frequencyGoal: number
  logs: HabitLog[]
}

const today = new Date()
const todayStr = today.toISOString().slice(0, 10)
const DATA_START = new Date(2025, 0, 1)

const habits = computed<HabitLocal[]>(() =>
  habitStore.items.map((h: Habit) => ({
    id: h.id!,
    name: h.name,
    icon: h.icon,
    frequencyGoal: h.frequencyGoal,
    logs: habitStore.allLogs.value
      .filter((l: any) => l.habitId === h.id)
      .map((l: any) => ({ date: l.date, done: l.status === 'completed' })),
  }))
)

const todayHabits = computed(() =>
  habits.value.map(h => {
    const log = h.logs.find(l => l.date === todayStr)
    return { id: h.id, name: h.name, icon: h.icon, done: log?.done ?? false }
  })
)

const completedToday = computed(() => todayHabits.value.filter(h => h.done).length)
const weeklyGoal = computed(() => habits.value.reduce((s, h) => s + h.frequencyGoal, 0))
const donutRatio = computed(() =>
  weeklyGoal.value > 0 ? completedToday.value / weeklyGoal.value : 0
)

const viewMode = ref<'diario' | 'semanal' | 'mensual'>('diario')

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

interface RoadmapCol {
  key: string
  date: Date
  top: string
  mid: string
  bot: string
  score: (h: HabitLocal) => number
  monthYear: string
}

function weekNum(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = (d.getTime() - start.getTime() + 600000) / 86400000
  return Math.ceil(diff / 7)
}

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Roadmap: render block-sized windows (daily=3mo, weekly=26w, monthly=24mo)
const roadmapColumns = computed<RoadmapCol[]>(() => {
  const cols: RoadmapCol[] = []
  const start = new Date(roadmapStart.value)
  if (viewMode.value === 'diario') {
    const end = new Date(start.getFullYear(), start.getMonth() + 3, 0) // 3 months
    const cur = new Date(start)
    while (cur <= end && cur <= today) {
      const d = new Date(cur)
      cols.push({
        key: fmt(d),
        date: d,
        top: dayNames[d.getDay()],
        mid: '',
        bot: String(d.getDate()),
        monthYear: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        score: (h: HabitLocal) => {
          const log = h.logs.find(l => l.date === fmt(d))
          return log?.done ? 1 : 0
        },
      })
      cur.setDate(cur.getDate() + 1)
    }
  } else if (viewMode.value === 'semanal') {
    const cur = new Date(start)
    cur.setDate(cur.getDate() - cur.getDay() + 1)
    const maxWeeks = 26
    let weekCount = 0
    while (weekCount < maxWeeks && cur <= today) {
      const mon = new Date(cur)
      cols.push({
        key: `w${weekNum(mon)}`,
        date: mon,
        top: `S${weekNum(mon)}`,
        mid: '',
        bot: `${mon.getDate()}/${mon.getMonth() + 1}`,
        monthYear: `${monthNames[mon.getMonth()]} ${mon.getFullYear()}`,
        score: (h: HabitLocal) => {
          let done = 0, total = 0
          const d = new Date(mon)
          const sun = new Date(d); sun.setDate(d.getDate() + 6)
          while (d <= sun && d <= today) {
            const log = h.logs.find(l => l.date === fmt(d))
            if (log) { total++; if (log.done) done++ }
            d.setDate(d.getDate() + 1)
          }
          return total > 0 ? done / total : 0
        },
      })
      cur.setDate(cur.getDate() + 7)
      weekCount++
    }
  } else {
    const end = new Date(start.getFullYear() + 2, start.getMonth(), 1)
    const cur = new Date(start)
    while (cur < end && cur <= today) {
      const y = cur.getFullYear()
      const mm = cur.getMonth()
      cols.push({
        key: `${y}-${String(mm + 1).padStart(2, '0')}`,
        date: new Date(cur),
        top: String(y),
        mid: '',
        bot: monthNames[mm],
        monthYear: `${monthNames[mm]} ${y}`,
        score: (h: HabitLocal) => {
          let done = 0, total = 0
          for (const log of h.logs) {
            const [ly, lm] = log.date.split('-').map(Number)
            if (ly === y && lm === mm + 1) {
              total++
              if (log.done) done++
            }
          }
          return total > 0 ? done / total : 0
        },
      })
      cur.setMonth(cur.getMonth() + 1)
    }
  }
  return cols
})

function cellClass(score: number): string {
  if (score === 0) return 'cell-empty'
  if (score <= 0.33) return 'cell-low'
  if (score <= 0.66) return 'cell-mid'
  if (score < 1) return 'cell-high'
  return 'cell-full'
}

const {
  contextVisible, contextItems, contextX, contextY,
  startPress, cancelPress, closeContext,
} = useLongPress()

const editPanel = ref(false)
const panelTitle = ref('')
const editingHabit = ref<HabitLocal | null>(null)

// Habit form state
const formName = ref('')
const formIcon = ref('📖')
const formFrequencyGoal = ref(7)

const habitIcons = ['📖', '🧘', '💧', '🏋️', '✍️', '🌎', '🚫', '🤸', '😴', '🚶', '🍎', '🚭', '🎯', '🎨', '🎵', '📝', '☕', '🧠', '💪', '🧹']

function openEdit(habit?: HabitLocal): void {
  if (habit) {
    editingHabit.value = habit
    formName.value = habit.name
    formIcon.value = habit.icon
    formFrequencyGoal.value = habit.frequencyGoal
    panelTitle.value = `Editar ${habit.name}`
  } else {
    editingHabit.value = null
    formName.value = ''
    formIcon.value = '📖'
    formFrequencyGoal.value = 7
    panelTitle.value = 'Nuevo hábito'
  }
  editPanel.value = true
}

async function saveHabit() {
  if (!formName.value.trim()) return
  if (editingHabit.value) {
    const updated = habitStore.getById(editingHabit.value.id)
    if (updated) {
      updated.name = formName.value.trim()
      updated.icon = formIcon.value
      updated.frequencyGoal = formFrequencyGoal.value
      await habitStore.save(updated)
    }
  } else {
    await habitStore.createHabit({
      userId: currentUser.value!.id!,
      name: formName.value.trim(),
      description: '',
      icon: formIcon.value,
      color: '#7CB342',
      frequencyGoal: formFrequencyGoal.value,
    })
  }
  editPanel.value = false
  editingHabit.value = null
}

function deleteHabit(habit: HabitLocal): void {
  habitStore.deleteHabit(habit.id)
}

function onLongPressHabit(habit: HabitLocal, event: MouseEvent | TouchEvent): void {
  startPress(event, [
    { icon: isDark.value ? themeIcons.check.dark : themeIcons.check.light, label: 'Editar', action: () => openEdit(habit) },
    { icon: isDark.value ? themeIcons.delete.dark : themeIcons.delete.light, label: 'Eliminar', action: () => deleteHabit(habit) },
  ])
}

const planningMode = ref(false)
const planningTitle = ref('')

const fabActions = computed<FabAction[]>(() => [
  { icon: isDark.value ? themeIcons.book.dark : themeIcons.book.light, label: 'Nuevo hábito', action: () => openEdit() },
  { icon: isDark.value ? themeIcons.leftBar.dark : themeIcons.leftBar.light, label: 'Planificar semana', action: () => { planningTitle.value = 'Planificar semana'; planningMode.value = true } },
  { icon: isDark.value ? themeIcons.check.dark : themeIcons.check.light, label: 'Editar semana planificada', action: () => { planningTitle.value = 'Editar semana planificada'; planningMode.value = true } },
])

function onPlanConfirm(assignments: Record<number, number[]>) {
  console.log('Habits planned:', assignments)
  planningMode.value = false
}

function onPlanCancel() {
  planningMode.value = false
}

function onPlanEdit(item: PlannerItem) {
  const h = habits.value.find(h => h.id === item.id)
  if (h) openEdit(h)
}

function onPlanDelete(item: PlannerItem) {
  habitStore.deleteHabit(item.id)
}

function toggleToday(habitId: number): void {
  habitStore.toggleDay(habitId, todayStr)
}

// Roadmap: block navigation with size per viewMode
// Daily → 3 months (quarter), Weekly → 26 weeks (6 months), Monthly → 24 months (2 years)
const roadmapStart = ref(new Date(today.getFullYear(), today.getMonth(), 1))

function blockSizeMonths(): number {
  return viewMode.value === 'diario' ? 3 : viewMode.value === 'semanal' ? 6 : 24
}

function blockLabelTop(): string {
  const s = roadmapStart.value
  if (viewMode.value === 'semanal') {
    return String(s.getFullYear())
  }
  if (viewMode.value === 'mensual') {
    const end = new Date(s.getFullYear() + 2, 0, 1)
    return `${s.getFullYear()} – ${end.getFullYear() - 1}`
  }
  return ''
}

function blockLabelBot(): string {
  const s = roadmapStart.value
  const m = blockSizeMonths()
  if (viewMode.value === 'diario' || viewMode.value === 'semanal') {
    const end = new Date(s.getFullYear(), s.getMonth() + m, 0)
    return `${monthNames[s.getMonth()]} – ${monthNames[end.getMonth()]}`
  }
  return '' // monthly shows year only (in top)
}

function navigateBlock(delta: number) {
  const d = snapToBlockStart(roadmapStart.value)
  const step = blockSizeMonths()
  d.setMonth(d.getMonth() + delta * step)
  const earliest = new Date(DATA_START.getFullYear(), DATA_START.getMonth(), 1)
  const latest = snapToBlockStart(today)
  if (d < earliest) roadmapStart.value = earliest
  else if (d > latest) roadmapStart.value = latest
  else roadmapStart.value = d
}

function snapToBlockStart(date: Date): Date {
  const m = blockSizeMonths()
  const snapped = new Date(date.getFullYear(), Math.floor(date.getMonth() / m) * m, 1)
  return snapped
}

// Refs para sincronización
const datesScrollRef = ref<HTMLDivElement | null>(null)
const listScrollRef = ref<HTMLDivElement | null>(null)
const gridScrollRef = ref<HTMLDivElement | null>(null)

let syncingVert = false
function syncVerticalScroll() {
  if (syncingVert) return
  syncingVert = true
  if (listScrollRef.value && gridScrollRef.value) {
    gridScrollRef.value.scrollTop = listScrollRef.value.scrollTop
  }
  syncingVert = false
}

let syncingHoriz = false
function syncHorizontalScroll(source: 'dates' | 'grid') {
  if (syncingHoriz) return
  syncingHoriz = true
  if (source === 'grid' && datesScrollRef.value && gridScrollRef.value) {
    datesScrollRef.value.scrollLeft = gridScrollRef.value.scrollLeft
  } else if (source === 'dates' && gridScrollRef.value && datesScrollRef.value) {
    gridScrollRef.value.scrollLeft = datesScrollRef.value.scrollLeft
  }
  syncingHoriz = false
}

function onDatesScroll() { syncHorizontalScroll('dates') }
function onGridScroll() { syncHorizontalScroll('grid') }

// Jump to current block on mount / view change
function jumpToCurrent() {
  roadmapStart.value = snapToBlockStart(today)
}

onMounted(async () => {
  await habitStore.loadAll()
  jumpToCurrent()
  await nextTick()
})

watch(viewMode, async () => {
  jumpToCurrent()
  await nextTick()
})
</script>

<template>
  <WeekPlanner
    v-if="planningMode"
    :items="habits.map(h => ({ id: h.id, name: h.name, icon: h.icon }))"
    :title="planningTitle"
    @confirm="onPlanConfirm"
    @cancel="onPlanCancel"
    @edit="onPlanEdit"
    @delete="onPlanDelete"
  />
  <div v-else class="habits-page">
    <header class="habits-header">
      <div class="progress-box">
        <span class="progress-title"><br>Cumplidos hoy<br></span>
        <div class="donut-wrapper">
          <svg viewBox="0 0 64 64" class="donut-svg">
            <circle cx="32" cy="32" r="28" fill="white-space" class="donut-bg" stroke-width="6" />
            <circle
              cx="32" cy="32" r="28"
              fill= "none"
              class="donut-fg"
              stroke-width="6"
              :stroke-dasharray="`${donutRatio * 176} 176`"
              stroke-linecap="round"
              transform="rotate(-90 32 32)"
            />
          </svg>
          <span class="donut-text">
            <span class="donut-completed">{{ completedToday }}</span>
            <span class="donut-total">/{{ weeklyGoal }}</span>
          </span>
        </div>
      </div>
      <div class="planned-box">
        <span class="planned-box-title">Planificados esta semana</span>
        <span class="planned-stats">{{ habits.length }} hábitos</span>
        <span class="planned-week">Semana {{ weekNum(today) }}</span>
      </div>
    </header>

    <div class="bottom-section">
      <div class="left-panel">
        <div class="roadmap-container">
          <!-- Cabecera de fechas (scroll horizontal sincronizado) -->
          <div class="month-nav">
            <button class="month-nav-btn" @click="navigateBlock(-1)">◀</button>
            <span class="month-nav-label">
              <span v-if="blockLabelTop()" class="mn-top">{{ blockLabelTop() }}</span>
              <span class="mn-bot">{{ blockLabelBot() }}</span>
            </span>
            <button class="month-nav-btn" @click="navigateBlock(1)">▶</button>
          </div>
          <div class="dates-header">
            <div class="spacer-cell">Hábito</div>
            <div
              class="date-cells-wrapper"
              ref="datesScrollRef"
              @scroll="onDatesScroll"
            >
              <div
                v-for="col in roadmapColumns"
                :key="col.key"
                class="date-cell"
              >
                <span class="date-cell-top">{{ col.top }}</span>
                <span class="date-cell-bot">{{ col.bot }}</span>
              </div>
            </div>
          </div>

          <!-- Cuerpo: lista de hábitos + roadmap con scroll vertical sincronizado -->
          <div class="roadmap-body">
            <div
              class="habit-names-column"
              ref="listScrollRef"
              @scroll="syncVerticalScroll()"
            >
              <div
                v-for="habit in habits"
                :key="habit.id"
                class="habit-name-row"
                @mousedown="onLongPressHabit(habit, $event)"
                @touchstart="onLongPressHabit(habit, $event)"
                @mouseup="cancelPress"
                @mouseleave="cancelPress"
                @touchend="cancelPress"
                @touchmove="cancelPress"
              >
                <span class="rm-ni-icon">
                  <img v-if="habit.icon.endsWith('.svg')" :src="habit.icon" class="habit-svg-icon" :alt="habit.name" />
                  <span v-else>{{ habit.icon }}</span>
                </span>
                <span class="rm-ni-name">{{ habit.name }}</span>
              </div>
            </div>

            <div
              class="roadmap-grid-scroll"
              ref="gridScrollRef"
              @scroll="onGridScroll"
            >
              <div class="roadmap-grid">
                <div
                  v-for="habit in habits"
                  :key="habit.id"
                  class="rm-grid-row"
                >
                  <div
                    v-for="col in roadmapColumns"
                    :key="col.key"
                    :class="['rm-cell', cellClass(col.score(habit))]"
                    :title="`${habit.name} - ${col.key}`"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="controls-row">
          <div class="legend-group">
            <span class="legend-item"><span class="legend-swatch swatch-full" />Completado</span>
            <span class="legend-item"><span class="legend-swatch swatch-mid" />Parcial</span>
            <span class="legend-item"><span class="legend-swatch swatch-empty" />No cumplido</span>
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
        </div>
      </div>

      <div class="right-panel">
        <h3 class="today-title">Hoy</h3>
        <div class="today-list">
          <div v-for="habit in todayHabits" :key="habit.id" class="today-item">
            <span class="today-icon">
              <img v-if="habit.icon.endsWith('.svg')" :src="habit.icon" class="habit-svg-icon" :alt="habit.name" />
              <span v-else>{{ habit.icon }}</span>
            </span>
            <span class="today-name">{{ habit.name }}</span>
            <label class="check-wrap">
              <input type="checkbox" :checked="habit.done" @change="toggleToday(habit.id)" class="check-input" />
              <span class="check-circle" :class="{ checked: habit.done }">
                <svg v-if="habit.done" viewBox="0 0 24 24" class="check-svg">
                  <path d="M6 14l3 3 9-9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </label>
          </div>
          <div v-if="todayHabits.length === 0" class="today-empty">Sin hábitos</div>
        </div>
      </div>
    </div>

    <ContextMenu
      :visible="contextVisible"
      :items="contextItems"
      :x="contextX"
      :y="contextY"
      @close="closeContext"
    />

    <FloatingActionButton :actions="fabActions" />

    <SlidePanel :open="editPanel" :title="panelTitle" side="right" @close="editPanel = false; editingHabit = null">
      <div class="habit-form">
        <label class="hf-field">
          <span class="hf-label">Nombre</span>
          <input v-model="formName" type="text" class="hf-input" placeholder="Ej: Leer 30 min" />
        </label>

        <label class="hf-field">
          <span class="hf-label">Icono</span>
          <div class="hf-icon-picker">
            <button
              v-for="ic in habitIcons"
              :key="ic"
              class="hf-icon-btn"
              :class="{ active: formIcon === ic }"
              @click="formIcon = ic"
            >{{ ic }}</button>
          </div>
        </label>

        <label class="hf-field">
          <span class="hf-label">Frecuencia semanal</span>
          <div class="hf-freq">
            <button class="hf-step-btn" @click="formFrequencyGoal = Math.max(1, formFrequencyGoal - 1)">−</button>
            <span class="hf-freq-val">{{ formFrequencyGoal }} / 7 días</span>
            <button class="hf-step-btn" @click="formFrequencyGoal = Math.min(7, formFrequencyGoal + 1)">+</button>
          </div>
        </label>

        <div class="hf-actions">
          <button class="hf-btn cancel" @click="editPanel = false; editingHabit = null">Cancelar</button>
          <button class="hf-btn save" @click="saveHabit" :disabled="!formName.trim()">
            {{ editingHabit ? 'Guardar' : 'Crear' }}
          </button>
        </div>
      </div>
    </SlidePanel>
  </div>
</template>

<style scoped>
.habits-page {
  --accent: #7CB342;
  --accent-dark: #558b2f;
  --accent-light: #aed581;
  --accent-pale: #dcedc8;
  --bg: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-side: #F9F9F9;
  --text: #1a1a1a;
  --text-secondary: #888;
  --border: #e8e8e8;
  --border-light: #f0f0f0;
  --cell-empty: #e8e8e8;
  --cell-low: #dcedc8;
  --cell-mid: #aed581;
  --cell-high: #7cb342;
  --cell-full: #558b2f;
  --shadow: 0px 2px 4px rgba(0,0,0,0.05), 0px 6px 12px rgba(0,0,0,0.1);
  --shadow-item: 0px 1px 3px rgba(0,0,0,0.04);

  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

:root.dark .habits-page {
  --accent: #FFD700;
  --accent-dark: #DAA520;
  --accent-light: #B8860B;
  --accent-pale: #554400;
  --bg: #121212;
  --bg-card: #1E1E1E;
  --bg-side: #1E1E1E;
  --text: #E0E0E0;
  --text-secondary: #999;
  --border: #333;
  --border-light: #2a2a2a;
  --cell-empty: #333;
  --cell-low: #554400;
  --cell-mid: #887700;
  --cell-high: #ccaa00;
  --cell-full: #FFD700;
  --shadow: 0px 2px 4px rgba(0,0,0,0.2), 0px 6px 12px rgba(0,0,0,0.3);
  --shadow-item: 0px 1px 3px rgba(0,0,0,0.2);
}

.habits-header {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--bg);
  flex-shrink: 0;
}

.progress-box {
  flex: 1;
  max-width: 33.33%;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 10px 10px 0;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
  position: relative;
}

.progress-title {
  font-size: 20px;
  font-weight: 600;
  align-self: flex-start;
  margin-bottom: 0;
}

.donut-wrapper {
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: -24px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-bg {
  stroke: var(--border);
  fill:var(--bg);
}

.donut-fg {
  stroke: var(--accent);
}

.donut-text {
  position: absolute;
  bottom: 18px;
  left: 0;
  right: 0;
  text-align: center;
}

.donut-completed {
  font-size: 34px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}

.donut-total {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1;
}

.planned-box {
  flex: 2;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 4px;
}

.planned-box-title {
  font-size: 11px;
  font-weight: 600;
}

.planned-stats {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.planned-week {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.bottom-section {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* ======================== LEFT PANEL ======================== */

.left-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.roadmap-container {
  margin: 0 5% 0 5%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Month navigation bar */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 4px 0 2px;
}

.month-nav-btn {
  border: none;
  background: transparent;
  color: var(--text-color);
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.month-nav-btn:hover {
  background: var(--hover-bg);
}

.month-nav-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
  min-width: 110px;
  text-align: center;
}

.mn-top {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-secondary, #888);
}

.mn-bot {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color);
}

/* Fechas header */
.dates-header {
  display: flex;
  align-items: center;
  height: 40px;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  margin-bottom: 4px;
}

.spacer-cell {
  flex: 1;
  min-width: 316.11px;
  max-width: 316.11px;
  padding: 4px 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  border-right: 1px solid var(--border);
  background: var(--bg);
}

.date-cells-wrapper {
  flex: 1;
  max-width: 303.11px;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
}

.date-cells-wrapper::-webkit-scrollbar {
  height: 8px;
}

.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  max-width: 303.11px;
  height: 100%;
  border-right: 1px solid var(--border-light);
  font-size: 8px;
  color: var(--text-secondary);
  text-align: center;
  box-sizing: border-box;
}
.date-cell:last-child {
  border-right: none;
}
.date-cell-top {
  font-size: 9px;
}
.date-cell-bot {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
}

/* Cuerpo del roadmap (lista + grid) */
.roadmap-body {
  max-height: 274px;
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Columna de nombres */
.habit-names-column {
  max-width: 316.11px;
  flex: 1;
  min-width: 316.11px;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--border);
  background: var(--bg);
}

.habit-names-column::-webkit-scrollbar {
  width: 5px;
}
.habit-names-column::-webkit-scrollbar-track {
  background: var(--border);
  border-radius: 3px;
}
.habit-names-column::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 3px;
}

.habit-name-row {
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--border-light);
  height: 24px;
  padding: 0 4px;
  box-sizing: border-box;
}

.rm-ni-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.rm-ni-icon .habit-svg-icon {
  width: 14px;
  height: 14px;
  display: block;
}
.habit-name-row:hover {
  background: var(--bg-side);
}

/* Grid del roadmap */
.roadmap-grid-scroll {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: auto;
  margin-left: 0px;
  max-width: 304.61px;
}

.roadmap-grid-scroll::-webkit-scrollbar {
  height: 5px;
  width: 0px;
}
.roadmap-grid-scroll::-webkit-scrollbar-track {
  background: var(--border);
  border-radius: 3px;
}
.roadmap-grid-scroll::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 3px;
}

.roadmap-grid {
  display: flex;
  flex-direction: column;
}

.rm-grid-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  height: 24px;
  box-sizing: border-box;
}

.rm-cell {
  width: 18px;
  min-width: 18px;
  height: 18px;
  border-radius: 3px;
  flex-shrink: 0;
  margin: 0 3px;
  transition: opacity 0.15s;
  border: 1px solid var(--border-light);
  box-sizing: border-box;
}
.rm-cell:last-child {
  margin-right: 0;
}

.cell-empty { background: var(--cell-empty); }
.cell-low   { background: var(--cell-low); }
.cell-mid   { background: var(--cell-mid); }
.cell-high  { background: var(--cell-high); }
.cell-full  { background: var(--cell-full); }

/* Controles */
.controls-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  flex-shrink: 0;
  background: var(--bg);
}

.legend-group {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.legend-swatch {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}
.swatch-full { background: var(--cell-full); }
.swatch-mid   { background: var(--cell-mid); }
.swatch-empty { background: var(--cell-empty); }

.view-toggle {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: auto;
}

.toggle-btn {
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.toggle-btn.active {
  background: var(--accent);
  color: #FFFFFF;
  border-color: var(--accent);
}

/* ======================== RIGHT PANEL ======================== */

.right-panel {
  flex: 1;
  background: var(--bg-side);
  margin-top: 4px;
  margin-left: 8px;
  margin-right: 0;
  margin-bottom: 0;
  border-radius: 12px 0 0 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.today-title {
  margin: 0;
  padding: 12px 12px 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}

.today-list {
  max-height: 294px;
  overflow-y: auto;
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.today-list::-webkit-scrollbar {
  width: 5px;
}
.today-list::-webkit-scrollbar-track {
  background: var(--border);
  border-radius: 3px;
}
.today-list::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 3px;
}
.today-list {
  scrollbar-width: thin;
  scrollbar-color: var(--accent) var(--border);
}

.today-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--bg-card);
  border-radius: 8px;
  box-shadow: var(--shadow-item);
}

.today-icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.today-icon .habit-svg-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.today-name {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-wrap {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}

.check-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.check-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-sizing: border-box;
}
.check-circle.checked {
  background: var(--accent);
  border-color: var(--accent);
}

.check-svg {
  width: 16px;
  height: 16px;
}

.today-empty {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

/* ======================== HABIT FORM ======================== */

.habit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 4px 20px;
}

.hf-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hf-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hf-input {
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.hf-input:focus {
  border-color: var(--accent);
}

.hf-icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.hf-icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.hf-icon-btn.active {
  border-color: var(--accent);
  background: var(--accent-pale);
  box-shadow: 0 0 0 2px var(--accent-light);
}

.hf-freq {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hf-step-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: all 0.15s;
}

.hf-step-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.hf-freq-val {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
}

.hf-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.hf-btn {
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

.hf-btn.cancel {
  background: var(--border-color);
  color: var(--text-color);
}

.hf-btn.cancel:hover {
  background: var(--color-text-secondary);
  color: #fff;
}

.hf-btn.save {
  background: var(--accent);
  color: #fff;
}

.hf-btn.save:hover:not(:disabled) {
  opacity: 0.85;
}

.hf-btn.save:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ======================== RESPONSIVE ======================== */

@media (max-width: 640px) {
  .habits-header {
    padding: 8px;
    gap: 6px;
  }
  .progress-box {
    padding: 8px 8px 0;
  }
  .donut-wrapper {
    width: 70px;
    height: 70px;
    margin-bottom: -20px;
  }
  .donut-completed {
    font-size: 28px;
  }
  .donut-total {
    font-size: 11px;
  }
  .planned-stats {
    font-size: 16px;
  }
  .planned-week {
    font-size: 11px;
  }
  .bottom-section {
    flex-direction: column;
  }
  .right-panel {
    margin: 4px 0 0;
    border-radius: 12px 12px 0 0;
    max-height: 160px;
  }
  .spacer-cell,
  .habit-names-column {
    flex: 1;
  }
  .rm-ni-icon {
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }

  .rm-ni-icon .habit-svg-icon {
    width: 14px;
    height: 14px;
    display: block;
  }
  .rm-ni-name {
    font-size: 8px;
  }
  .rm-cell {
    width: 16px;
    min-width: 16px;
    height: 16px;
  }
  .date-cell {
    min-width: 18px;
  }
  .controls-row {
    flex-wrap: wrap;
  }
  .legend-group {
    order: 2;
    width: 100%;
    justify-content: center;
  }
  .view-toggle {
    order: 1;
    width: 100%;
  }
}
</style>