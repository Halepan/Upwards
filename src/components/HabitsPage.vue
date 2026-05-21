<script setup lang="ts">
import { ref } from 'vue'
import { useLongPress } from '../composables/useLongPress'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import type { FabAction } from './FloatingActionButton.vue'

interface Habit {
  id: number
  name: string
  icon: string
  color: string
  frequencyGoal: number
  completed: number
  logs: { day: string; done: boolean }[]
}

const habits = ref<Habit[]>([
  {
    id: 1, name: 'Leer', icon: '📖', color: '#42a5f5',
    frequencyGoal: 5, completed: 3,
    logs: [
      { day: 'L', done: true }, { day: 'M', done: true },
      { day: 'M', done: false }, { day: 'J', done: true },
      { day: 'V', done: false }, { day: 'S', done: false }, { day: 'D', done: false },
    ],
  },
  {
    id: 2, name: 'Meditar', icon: '🧘', color: '#66bb6a',
    frequencyGoal: 7, completed: 5,
    logs: [
      { day: 'L', done: true }, { day: 'M', done: true },
      { day: 'M', done: true }, { day: 'J', done: false },
      { day: 'V', done: true }, { day: 'S', done: true }, { day: 'D', done: false },
    ],
  },
  {
    id: 3, name: 'Agua 2L', icon: '💧', color: '#29b6f6',
    frequencyGoal: 7, completed: 7,
    logs: [
      { day: 'L', done: true }, { day: 'M', done: true },
      { day: 'M', done: true }, { day: 'J', done: true },
      { day: 'V', done: true }, { day: 'S', done: true }, { day: 'D', done: true },
    ],
  },
])

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
]

function renderHeatmapCell(log: { day: string; done: boolean }): string {
  return log.done ? 'var(--color-primary)' : 'var(--color-border)'
}

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
</script>

<template>
  <div class="habits-page">
    <section class="section">
      <h2 class="section-heading">Progreso semanal</h2>
      <div class="progress-summary">
        <div class="donut-mini">
          <svg viewBox="0 0 40 40" class="mini-svg">
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-border)" stroke-width="4" />
            <circle
              cx="20" cy="20" r="16"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="4"
              stroke-dasharray="70 100"
              transform="rotate(-90 20 20)"
              stroke-linecap="round"
            />
          </svg>
          <span class="mini-label">15/21</span>
        </div>
        <div class="progress-text">
          <span class="prog-value">71%</span>
          <span class="prog-label">de hábitos completados esta semana</span>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-heading">Hábitos</h2>
      <div class="habits-list">
        <div
          v-for="habit in habits"
          :key="habit.id"
          class="habit-card"
          :style="{ borderLeftColor: habit.color }"
          @mousedown="onLongPressHabit(habit, $event)"
          @touchstart="onLongPressHabit(habit, $event)"
          @mouseup="cancelPress"
          @mouseleave="cancelPress"
          @touchend="cancelPress"
          @touchmove="cancelPress"
        >
          <div class="habit-header">
            <span class="habit-icon">{{ habit.icon }}</span>
            <div class="habit-info">
              <span class="habit-name">{{ habit.name }}</span>
              <span class="habit-freq">{{ habit.completed }}/{{ habit.frequencyGoal }} días</span>
            </div>
            <span
              class="habit-status-dot"
              :style="{ background: habit.completed >= habit.frequencyGoal ? habit.color : 'var(--color-text-disabled)' }"
            />
          </div>
          <div class="heat-row">
            <div
              v-for="(log, i) in habit.logs"
              :key="i"
              class="heat-cell"
              :style="{ background: renderHeatmapCell(log) }"
            />
          </div>
        </div>
      </div>
    </section>

    <ContextMenu
      :visible="contextVisible"
      :items="contextItems"
      :x="contextX"
      :y="contextY"
      @close="closeContext"
    />

    <FloatingActionButton color="#00897b" :actions="fabActions" />

    <SlidePanel :open="editPanel" :title="panelTitle" side="right" @close="editPanel = false">
      <p class="panel-placeholder">Contenido del formulario</p>
    </SlidePanel>
  </div>
</template>

<style scoped>
.habits-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-heading {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.progress-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.donut-mini {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-svg {
  width: 100%;
  height: 100%;
}

.mini-label {
  position: absolute;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text);
}

.progress-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.prog-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

.prog-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.habits-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.habit-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 14px;
  border-left: 4px solid;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;
}

.habit-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.habit-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.habit-icon {
  font-size: 22px;
}

.habit-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.habit-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.habit-freq {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.habit-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.heat-row {
  display: flex;
  gap: 6px;
}

.heat-cell {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  transition: background 0.2s;
}

.panel-placeholder {
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 40px;
}
</style>
