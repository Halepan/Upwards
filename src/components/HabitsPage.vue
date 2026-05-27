<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLongPress } from '../composables/useLongPress'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import type { FabAction } from './FloatingActionButton.vue'

interface HabitLog {
  date: string
  done: boolean
}

interface Habit {
  id: number
  name: string
  icon: string
  frequencyGoal: number
  logs: HabitLog[]
}

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function generateLogs(seed: number, rate: number): HabitLog[] {
  const rand = seededRand(seed)
  const logs: HabitLog[] = []
  const end = new Date()
  const start = new Date(end)
  start.setMonth(start.getMonth() - 4)
  start.setDate(1)
  const cur = new Date(start)
  while (cur <= end) {
    const date = cur.toISOString().slice(0, 10)
    logs.push({ date, done: rand() < rate })
    cur.setDate(cur.getDate() + 1)
  }
  return logs
}

const habits = ref<Habit[]>([
  { id: 1, name: 'Leer 30 min', icon: '📖', frequencyGoal: 5, logs: generateLogs(42, 0.65) },
  { id: 2, name: 'Meditar', icon: '🧘', frequencyGoal: 7, logs: generateLogs(123, 0.75) },
  { id: 3, name: 'Agua 2L', icon: '💧', frequencyGoal: 7, logs: generateLogs(777, 0.9) },
  { id: 4, name: 'Ejercicio', icon: '🏋️', frequencyGoal: 4, logs: generateLogs(456, 0.5) },
  { id: 5, name: 'Escribir', icon: '✍️', frequencyGoal: 3, logs: generateLogs(789, 0.4) },
  { id: 6, name: 'Inglés 20 min', icon: '🌎', frequencyGoal: 5, logs: generateLogs(234, 0.6) },
  { id: 7, name: 'Sin azúcar', icon: '🚫', frequencyGoal: 7, logs: generateLogs(567, 0.8) },
  { id: 8, name: 'Estiramientos', icon: '🤸', frequencyGoal: 6, logs: generateLogs(890, 0.55) },
])

const today = new Date()
const todayStr = today.toISOString().slice(0, 10)

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
  score: (h: Habit) => number
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

const roadmapColumns = computed<RoadmapCol[]>(() => {
  const cols: RoadmapCol[] = []
  if (viewMode.value === 'diario') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      cols.push({
        key: fmt(d),
        date: d,
        top: dayNames[d.getDay()],
        mid: '',
        bot: String(d.getDate()),
        monthYear: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        score: (h: Habit) => {
          const log = h.logs.find(l => l.date === fmt(d))
          return log?.done ? 1 : 0
        },
      })
    }
  } else if (viewMode.value === 'semanal') {
    for (let w = 11; w >= 0; w--) {
      const mon = new Date(today)
      mon.setDate(today.getDate() - today.getDay() - w * 7 + 1)
      const sun = new Date(mon)
      sun.setDate(mon.getDate() + 6)
      cols.push({
        key: `w${weekNum(mon)}`,
        date: mon,
        top: `S${weekNum(mon)}`,
        mid: '',
        bot: `${mon.getDate()}/${mon.getMonth() + 1}`,
        monthYear: `${monthNames[mon.getMonth()]} ${mon.getFullYear()}`,
        score: (h: Habit) => {
          let done = 0, total = 0
          const cur = new Date(mon)
          while (cur <= sun) {
            const log = h.logs.find(l => l.date === fmt(cur))
            if (log) { total++; if (log.done) done++ }
            cur.setDate(cur.getDate() + 1)
          }
          return total > 0 ? done / total : 0
        },
      })
    }
  } else {
    for (let m = 11; m >= 0; m--) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 1)
      const y = d.getFullYear()
      const mm = d.getMonth()
      cols.push({
        key: `${y}-${String(mm + 1).padStart(2, '0')}`,
        date: d,
        top: String(y),
        mid: '',
        bot: monthNames[mm],
        monthYear: `${monthNames[mm]} ${y}`,
        score: (h: Habit) => {
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
    }
  }
  return cols
})

const scrollLeft = ref(0)
const roadmapBodyRef = ref<HTMLDivElement | null>(null)
const listScrollRef = ref<HTMLDivElement | null>(null)
const gridScrollRef = ref<HTMLDivElement | null>(null)
let syncing = false

function onListScroll(e: Event) {
  if (syncing) return
  const el = e.target as HTMLElement
  if (gridScrollRef.value) {
    syncing = true
    gridScrollRef.value.scrollTop = el.scrollTop
    syncing = false
  }
}

function onGridScroll(e: Event) {
  const el = e.target as HTMLElement
  scrollLeft.value = el.scrollLeft
  if (syncing) return
  if (listScrollRef.value) {
    syncing = true
    listScrollRef.value.scrollTop = el.scrollTop
    syncing = false
  }
}

const dynamicTitle = computed(() => {
  if (roadmapColumns.value.length === 0) return ''
  const colW = 26
  const idx = Math.max(0, Math.min(
    Math.floor(scrollLeft.value / colW),
    roadmapColumns.value.length - 1
  ))
  return roadmapColumns.value[idx].monthYear
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
const editingHabit = ref<Habit | null>(null)

function onLongPressHabit(habit: Habit, event: MouseEvent | TouchEvent): void {
  editingHabit.value = habit
  startPress(event, [
    { icon: '✏️', label: 'Editar', action: () => openEdit(habit) },
    { icon: '🗑️', label: 'Eliminar', action: () => deleteHabit(habit) },
  ])
}

function openEdit(habit: Habit): void {
  panelTitle.value = `Editar ${habit.name}`
  editPanel.value = true
}

function deleteHabit(habit: Habit): void {
  habits.value = habits.value.filter(h => h.id !== habit.id)
}

const fabActions: FabAction[] = [
  { icon: '➕', label: 'Nuevo hábito', action: () => { panelTitle.value = 'Nuevo hábito'; editPanel.value = true } },
  { icon: '📅', label: 'Planificar semana', action: () => { panelTitle.value = 'Planificar semana'; editPanel.value = true } },
  { icon: '✏️', label: 'Editar semana planificada', action: () => { panelTitle.value = 'Editar semana'; editPanel.value = true } },
]

function toggleToday(habitId: number): void {
  const h = habits.value.find(h => h.id === habitId)
  if (!h) return
  const log = h.logs.find(l => l.date === todayStr)
  if (log) {
    log.done = !log.done
  } else {
    h.logs.push({ date: todayStr, done: true })
  }
}
</script>

<template>
  <div class="habits-page">
    <header class="habits-header">
      <div class="progress-box">
        <span class="progress-title"><br>Cumplidos hoy<br></span>
        <div class="donut-wrapper">
          <svg viewBox="0 0 64 64" class="donut-svg">
            <circle
              cx="32" cy="32" r="28"
              fill="none"
              class="donut-fg"
              stroke-width="6"
              :stroke-dasharray="`${donutRatio * 176} 176`"
              stroke-linecap="butt"
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
          <div class="dynamic-month">{{ dynamicTitle }}</div>
          <div class="roadmap-scroll-area" ref="roadmapBodyRef">
            <div class="rm-top-header">
              <div class="rm-th-spacer">Hábito</div>
              <div class="rm-th-grid">
                <div v-for="col in roadmapColumns" :key="col.key" class="rm-th-cell">
                  <span class="rm-th-top">{{ col.top }}</span>
                  <span class="rm-th-bot">{{ col.bot }}</span>
                </div>
              </div>
            </div>

            <div class="rm-body-wrap">
              <div class="rm-name-list" ref="listScrollRef" @scroll="onListScroll">
                <div
                  v-for="habit in habits"
                  :key="habit.id"
                  class="rm-name-item"
                  @mousedown="onLongPressHabit(habit, $event)"
                  @touchstart="onLongPressHabit(habit, $event)"
                  @mouseup="cancelPress"
                  @mouseleave="cancelPress"
                  @touchend="cancelPress"
                  @touchmove="cancelPress"
                >
                  <span class="rm-ni-icon">{{ habit.icon }}</span>
                  <span class="rm-ni-name">{{ habit.name }}</span>
                </div>
              </div>
              <div class="rm-grid-scroll" ref="gridScrollRef" @scroll="onGridScroll">
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
            <span class="today-icon">{{ habit.icon }}</span>
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

    <SlidePanel :open="editPanel" :title="panelTitle" side="right" @close="editPanel = false">
      <p class="panel-placeholder">Contenido del formulario</p>
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

.donut-fg {
  stroke: var(--accent);
}

.donut-text {
  position: absolute;
  bottom: 0;
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

.left-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.roadmap-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.dynamic-month {
  padding: 6px 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}

.roadmap-scroll-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.rm-top-header {
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.rm-th-spacer {
  width: 100px;
  min-width: 100px;
  padding: 4px 6px;
  font-size: 9px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
}

.rm-th-grid {
  display: flex;
  padding: 2px 4px;
  overflow: hidden;
}

.rm-th-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 22px;
  min-width: 22px;
  font-size: 7px;
  color: var(--text-secondary);
  line-height: 1.1;
  border-right: 1px solid var(--border-light);
}

.rm-th-cell:last-child {
  border-right: none;
}

.rm-th-top {
  font-size: 7px;
}

.rm-th-bot {
  font-size: 9px;
  font-weight: 700;
  color: var(--text);
}

.rm-body-wrap {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.rm-name-list {
  width: 100px;
  min-width: 100px;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid var(--border);
  background: var(--bg);
}

.rm-name-item {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 6px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--border-light);
  min-height: 28px;
  box-sizing: border-box;
}

.rm-name-item:hover {
  background: var(--bg-side);
}

.rm-ni-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.rm-ni-name {
  font-size: 10px;
  font-weight: 500;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rm-grid-scroll {
  flex: 1;
  overflow: auto;
  min-width: 0;
}

.rm-grid-row {
  display: flex;
  padding: 4px 4px;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  min-height: 28px;
  box-sizing: border-box;
}

.rm-cell {
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: opacity 0.15s;
  border-right: 1px solid var(--border-light);
}

.rm-cell:last-child {
  border-right: none;
}

.rm-cell:hover {
  opacity: 0.7;
}

.cell-empty { background: var(--cell-empty); }
.cell-low   { background: var(--cell-low); }
.cell-mid   { background: var(--cell-mid); }
.cell-high  { background: var(--cell-high); }
.cell-full  { background: var(--cell-full); }

.rm-name-list::-webkit-scrollbar,
.rm-grid-scroll::-webkit-scrollbar,
.today-list::-webkit-scrollbar,
.roadmap-scroll-area::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.rm-name-list::-webkit-scrollbar-track,
.rm-grid-scroll::-webkit-scrollbar-track,
.today-list::-webkit-scrollbar-track,
.roadmap-scroll-area::-webkit-scrollbar-track {
  background: var(--border);
  border-radius: 3px;
}

.rm-name-list::-webkit-scrollbar-thumb,
.rm-grid-scroll::-webkit-scrollbar-thumb,
.today-list::-webkit-scrollbar-thumb,
.roadmap-scroll-area::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 3px;
  opacity: 0.6;
}

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
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.panel-placeholder {
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 40px;
}

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
  .donut-text {
    font-size: 14px;
  }
  .planned-text {
    font-size: clamp(13px, 3.5vw, 20px);
  }
  .bottom-section {
    flex-direction: column;
  }
  .right-panel {
    margin: 4px 0 0;
    border-radius: 12px 12px 0 0;
    max-height: 160px;
  }
  .rm-th-spacer,
  .rm-name-list {
    width: 70px;
    min-width: 70px;
  }
  .rm-ni-icon {
    font-size: 10px;
  }
  .rm-ni-name {
    font-size: 8px;
  }
  .rm-cell {
    width: 16px;
    min-width: 16px;
    height: 16px;
  }
  .rm-th-cell {
    width: 18px;
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
