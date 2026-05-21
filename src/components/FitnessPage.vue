<script setup lang="ts">
import { ref } from 'vue'
import { useLongPress } from '../composables/useLongPress'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import type { FabAction } from './FloatingActionButton.vue'

interface ExerciseCard {
  id: number
  name: string
  type: 'fuerza' | 'resistencia'
  subType: string
  sets?: string
  reps?: string
  duration?: string
  progress: number
  color: string
}

const exercises = ref<ExerciseCard[]>([
  { id: 1, name: 'Press banca', type: 'fuerza', subType: 'superior', sets: '4×10', reps: '60 kg', progress: 85, color: '#ef5350' },
  { id: 2, name: 'Sentadilla', type: 'fuerza', subType: 'inferior', sets: '4×12', reps: '80 kg', progress: 72, color: '#ff7043' },
  { id: 3, name: 'Cardio HIIT', type: 'resistencia', subType: 'cardio', duration: '20 min', progress: 90, color: '#42a5f5' },
  { id: 4, name: 'Plancha', type: 'resistencia', subType: 'core', duration: '3 min', progress: 60, color: '#66bb6a' },
])

const routine = ref([
  { day: 'Lunes', exercises: 'Press banca, Remo, Curl bíceps' },
  { day: 'Miércoles', exercises: 'Sentadilla, Peso muerto, Gemelos' },
  { day: 'Viernes', exercises: 'Cardio HIIT, Plancha, Abdominales' },
])

const bodyMeasurements = ref({
  weight: 74.5,
  bodyFat: 15.2,
  chest: 98,
  waist: 80,
  thigh: 55,
})

const {
  contextVisible, contextItems, contextX, contextY,
  startPress, cancelPress, closeContext,
} = useLongPress()

const editPanel = ref(false)
const panelTitle = ref('')
const editingExercise = ref<ExerciseCard | null>(null)

function onLongPressExercise(ex: ExerciseCard, event: MouseEvent | TouchEvent): void {
  editingExercise.value = ex
  startPress(event, [
    { icon: '✏️', label: 'Editar', action: () => openEdit(ex) },
    { icon: '🗑️', label: 'Eliminar', action: () => deleteExercise(ex) },
  ])
}

function openEdit(ex: ExerciseCard): void {
  panelTitle.value = `Editar ${ex.name}`
  editPanel.value = true
}

function deleteExercise(ex: ExerciseCard): void {
  exercises.value = exercises.value.filter(e => e.id !== ex.id)
}

const fabActions: FabAction[] = [
  { icon: '🏋️', label: 'Registrar ejercicio', action: () => { panelTitle.value = 'Nuevo ejercicio'; editPanel.value = true } },
  { icon: '📝', label: 'Medir cuerpo', action: () => { panelTitle.value = 'Nueva medición'; editPanel.value = true } },
]
</script>

<template>
  <div class="fitness-page">
    <section class="section">
      <h2 class="section-heading">Ejercicios</h2>
      <div class="exercise-grid">
        <div
          v-for="ex in exercises"
          :key="ex.id"
          class="exercise-card"
          :style="{ borderLeftColor: ex.color }"
          @mousedown="onLongPressExercise(ex, $event)"
          @touchstart="onLongPressExercise(ex, $event)"
          @mouseup="cancelPress"
          @mouseleave="cancelPress"
          @touchend="cancelPress"
          @touchmove="cancelPress"
        >
          <div class="ex-header">
            <span class="ex-name">{{ ex.name }}</span>
            <span class="ex-type-badge" :class="ex.type">{{ ex.type }}</span>
          </div>
          <div class="ex-details">
            <span class="ex-subtype">{{ ex.subType }}</span>
            <span v-if="ex.sets" class="ex-metric">{{ ex.sets }} · {{ ex.reps }}</span>
            <span v-if="ex.duration" class="ex-metric">{{ ex.duration }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: ex.progress + '%', background: ex.color }" />
            </div>
            <span class="progress-label">{{ ex.progress }}%</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-heading">Mediciones</h2>
      <div class="body-silhouette-row">
        <div class="silhouette">
          <svg viewBox="0 0 80 160" class="body-svg" fill="none" stroke="var(--color-text-secondary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="40" cy="18" r="8" />
            <path d="M40 26V60" />
            <path d="M18 38L40 42L62 38" />
            <path d="M40 60L18 95" />
            <path d="M40 60L62 95" />
            <path d="M18 95L10 130" />
            <path d="M62 95L70 130" />
            <path d="M30 130L30 155" />
            <path d="M50 130L50 155" />
          </svg>
        </div>
        <div class="measurements-list">
          <div class="measure-item">
            <span class="meas-label">Peso</span>
            <span class="meas-value">{{ bodyMeasurements.weight }} kg</span>
          </div>
          <div class="measure-item">
            <span class="meas-label">Grasa corporal</span>
            <span class="meas-value">{{ bodyMeasurements.bodyFat }}%</span>
          </div>
          <div class="measure-item">
            <span class="meas-label">Pecho</span>
            <span class="meas-value">{{ bodyMeasurements.chest }} cm</span>
          </div>
          <div class="measure-item">
            <span class="meas-label">Cintura</span>
            <span class="meas-value">{{ bodyMeasurements.waist }} cm</span>
          </div>
          <div class="measure-item">
            <span class="meas-label">Muslo</span>
            <span class="meas-value">{{ bodyMeasurements.thigh }} cm</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-heading">Rutina semanal</h2>
      <div class="routine-list">
        <div v-for="day in routine" :key="day.day" class="routine-day">
          <span class="routine-day-name">{{ day.day }}</span>
          <span class="routine-ex-list">{{ day.exercises }}</span>
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
.fitness-page {
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

.exercise-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exercise-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 14px;
  border-left: 4px solid;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;
}

.exercise-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.ex-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ex-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.ex-type-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
}

.ex-type-badge.fuerza {
  background: rgba(239, 83, 80, 0.12);
  color: #ef5350;
}

.ex-type-badge.resistencia {
  background: rgba(66, 165, 245, 0.12);
  color: #42a5f5;
}

.ex-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.ex-subtype {
  text-transform: capitalize;
}

.ex-metric {
  font-weight: 500;
}

.progress-track {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.progress-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 30px;
  text-align: right;
}

.body-silhouette-row {
  display: flex;
  gap: 16px;
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.silhouette {
  width: 70px;
  flex-shrink: 0;
}

.body-svg {
  width: 100%;
  height: auto;
}

.measurements-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.measure-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meas-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.meas-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.routine-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  padding: 12px 16px;
  box-shadow: var(--shadow-sm);
}

.routine-day {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.routine-day:last-child {
  border-bottom: none;
}

.routine-day-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.routine-ex-list {
  font-size: 13px;
  color: var(--color-text);
}

.panel-placeholder {
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 40px;
}
</style>
