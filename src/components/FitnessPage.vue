<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useLongPress } from '../composables/useLongPress'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import BodyAvatar from './BodyAvatar.vue'
import GenericChart from './GenericChart.vue'
import WeekPlanner from './WeekPlanner.vue'
import RoutinePlanner from './RoutinePlanner.vue'
import type { FabAction } from './FloatingActionButton.vue'
import type { ChartSeries } from './GenericChart.vue'
import type { PlannerItem } from './WeekPlanner.vue'
import gymIcon from '../assets/icons/healthicons--gym.svg'
import clipboardIcon from '../assets/icons/si--book-fill.svg'
import calendarIcon from '../assets/icons/icon-park-outline--left-bar.svg'
import editIcon from '../assets/icons/mdi--check-outline.svg'
import deleteIcon from '../assets/icons/weui--delete-outlined.svg'
import exDefaultIcon from '../assets/icons/healthicons--gym-outline.svg'
import legIcon from '../assets/icons/healthicons--leg.svg'
import armIcon from '../assets/icons/mdi--arm-flex.svg'
import gymFillIcon from '../assets/icons/healthicons--gym.svg'

// ---------- interfaz de ejercicios con series ----------
interface ExerciseSet {
  plannedReps: number
  actualReps: number
  confirmed: boolean
}

interface Exercise {
  id: number
  name: string
  icon: string
  muscleGroup: string
  type: 'fuerza' | 'resistencia'
  sets: ExerciseSet[]
}

const exercises = ref<Exercise[]>([
  { id: 1, name: 'Press banca', icon: gymFillIcon, muscleGroup: 'Pectoral', type: 'fuerza', sets: [{ plannedReps: 10, actualReps: 10, confirmed: true }, { plannedReps: 8, actualReps: 8, confirmed: true }] },
  { id: 2, name: 'Remo', icon: gymFillIcon, muscleGroup: 'Dorsal', type: 'fuerza', sets: [{ plannedReps: 12, actualReps: 10, confirmed: false }, { plannedReps: 10, actualReps: 8, confirmed: false }] },
  { id: 3, name: 'Sentadilla', icon: legIcon, muscleGroup: 'Piernas', type: 'fuerza', sets: [{ plannedReps: 15, actualReps: 15, confirmed: true }, { plannedReps: 12, actualReps: 12, confirmed: true }, { plannedReps: 10, actualReps: 10, confirmed: true }] },
  { id: 4, name: 'Press militar', icon: gymFillIcon, muscleGroup: 'Hombros', type: 'fuerza', sets: [{ plannedReps: 8, actualReps: 6, confirmed: false }] },
  { id: 5, name: 'Cardio HIIT', icon: exDefaultIcon, muscleGroup: 'Cardio', type: 'resistencia', sets: [{ plannedReps: 20, actualReps: 20, confirmed: true }, { plannedReps: 15, actualReps: 15, confirmed: true }] },
  { id: 6, name: 'Plancha', icon: exDefaultIcon, muscleGroup: 'Core', type: 'resistencia', sets: [{ plannedReps: 3, actualReps: 2, confirmed: false }, { plannedReps: 2, actualReps: 1, confirmed: false }] },
  { id: 7, name: 'Curl bíceps', icon: armIcon, muscleGroup: 'Bíceps', type: 'resistencia', sets: [{ plannedReps: 15, actualReps: 15, confirmed: true }, { plannedReps: 12, actualReps: 12, confirmed: true }] },
  { id: 8, name: 'Fondos', icon: armIcon, muscleGroup: 'Tríceps', type: 'resistencia', sets: [{ plannedReps: 12, actualReps: 10, confirmed: false }, { plannedReps: 10, actualReps: 8, confirmed: false }] },
])

interface Routine {
  id: number
  name: string
  icon: string
  exerciseIds: number[]
}

const routines = ref<Routine[]>([
  { id: 101, name: 'Push', icon: armIcon, exerciseIds: [1, 4, 8] },
  { id: 102, name: 'Pull', icon: gymFillIcon, exerciseIds: [2, 7] },
  { id: 103, name: 'Piernas', icon: legIcon, exerciseIds: [3, 6] },
])

const { isDark } = useTheme()

const warmGroups = ['Pectoral', 'Dorsal', 'Piernas', 'Hombros']
const coolGroups = ['Cardio', 'Core', 'Bíceps', 'Tríceps']

const warmPalette = ['#e53935', '#fb8c00', '#ff5252', '#ff6d00']
const coolPalette = ['#1e88e5', '#43a047', '#00acc1', '#7b1fa2']

const warmColors = computed(() => isDark.value ? coolPalette : warmPalette)
const coolColors = computed(() => isDark.value ? warmPalette : coolPalette)

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function generateMuscleData(
  groups: string[],
  colors: string[],
  seedBase: number,
  baseValues: number[],
  trend: number,
): ChartSeries[] {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 11 * 7)
  start.setDate(start.getDate() - start.getDay())

  return groups.map((group, gi) => {
    const rand = seededRand(seedBase + gi * 10)
    const data: { x: Date; y: number }[] = []
    const cur = new Date(start)
    let val = baseValues[gi]
    while (cur <= now) {
      val += trend + (rand() - 0.5) * 4
      val = Math.max(30, Math.min(100, val))
      data.push({ x: new Date(cur), y: Math.round(val * 10) / 10 })
      cur.setDate(cur.getDate() + 7)
    }
    return { label: group, data, color: colors[gi] }
  })
}

const strengthSeries = computed<ChartSeries[]>(() =>
  generateMuscleData(warmGroups, warmColors.value, 42, [62, 55, 68, 48], 2.2)
)

const resistanceSeries = computed<ChartSeries[]>(() =>
  generateMuscleData(coolGroups, coolColors.value, 100, [40, 35, 38, 32], 1.5)
)

// view mode sync between both charts
const fitViewMode = ref<'diario' | 'semanal' | 'mensual'>('mensual')

// ---------- estado del panel de edición y menú contextual ----------
const editPanel = ref(false)
const panelTitle = ref('')
const editingExerciseId = ref<number | null>(null)

const {
  contextVisible, contextItems, contextX, contextY,
  startPress, cancelPress, closeContext,
} = useLongPress()

const planningMode = ref(false)
const planningTitle = ref('')
const routinePlannerMode = ref<'new' | 'edit' | null>(null)
const editingRoutine = ref<Routine | null>(null)

const fabActions: FabAction[] = [
  { icon: gymIcon, label: 'Nuevo ejercicio', action: () => openAddDialog() },
  { icon: clipboardIcon, label: 'Nueva rutina', action: () => { routinePlannerMode.value = 'new'; editingRoutine.value = null } },
  { icon: calendarIcon, label: 'Planificación semanal', action: () => { planningTitle.value = 'Planificación semanal'; planningMode.value = true } },
  { icon: editIcon, label: 'Editar planificación semanal', action: () => { planningTitle.value = 'Editar planificación semanal'; planningMode.value = true } },
]

// Items for the week planner: both exercises and routines
const plannerItems = computed<PlannerItem[]>(() => [
  ...exercises.value.map(e => ({ id: e.id, name: e.name, icon: e.icon, type: 'exercise' as const })),
  ...routines.value.map(r => ({ id: r.id, name: r.name, icon: r.icon, type: 'routine' as const, exerciseIds: r.exerciseIds })),
])

function onPlanConfirm(assignments: Record<number, number[]>) {
  console.log('Exercises planned:', assignments)
  planningMode.value = false
}

function onPlanCancel() {
  planningMode.value = false
}

function onPlanEdit(item: PlannerItem) {
  if (item.type === 'routine') {
    const r = routines.value.find(rt => rt.id === item.id)
    if (r) {
      editingRoutine.value = r
      routinePlannerMode.value = 'edit'
    }
  } else {
    const ex = exercises.value.find(e => e.id === item.id)
    if (ex) {
      panelTitle.value = `Editar ${ex.name}`
      editingExerciseId.value = ex.id
      editPanel.value = true
    }
  }
}

function onPlanDelete(item: PlannerItem) {
  if (item.type === 'routine') {
    routines.value = routines.value.filter(r => r.id !== item.id)
  } else {
    exercises.value = exercises.value.filter(e => e.id !== item.id)
  }
}

// Routine planner handlers
function onRoutineSave(routine: { name: string; exerciseIds: number[] }) {
  if (routinePlannerMode.value === 'edit' && editingRoutine.value) {
    const r = routines.value.find(rt => rt.id === editingRoutine.value!.id)
    if (r) {
      r.name = routine.name
      r.exerciseIds = routine.exerciseIds
    }
  } else {
    routines.value.push({
      id: Date.now(),
      name: routine.name,
      icon: clipboardIcon,
      exerciseIds: routine.exerciseIds,
    })
  }
  routinePlannerMode.value = null
  editingRoutine.value = null
}

function onRoutineCancel() {
  routinePlannerMode.value = null
  editingRoutine.value = null
}

// Planned assignments from the week planner (stores day→routines/exercises mapping)
const plannedWeekAssignments = ref<Record<number, number[]>>({})

// Exercises shown today: expand routines from the planner, fall back to all when unplanned
const todayExercises = computed<Exercise[]>(() => {
  const now = new Date()
  const todayIdx = (now.getDay() + 6) % 7 // 0=Mon .. 6=Sun
  const plannedIds = plannedWeekAssignments.value[todayIdx]
  if (!plannedIds || plannedIds.length === 0) {
    // no plan for today → show all exercises (mock data fallback)
    return exercises.value
  }
  const result: Exercise[] = []
  for (const id of plannedIds) {
    const isRoutine = routines.value.find(r => r.id === id)
    if (isRoutine) {
      // expand routine into its exercises
      for (const exId of isRoutine.exerciseIds) {
        const ex = exercises.value.find(e => e.id === exId)
        if (ex) {
          result.push({ ...ex, id: Date.now() + Math.random() * 10000 + result.length })
        }
      }
    } else {
      const ex = exercises.value.find(e => e.id === id)
      if (ex) {
        result.push(ex)
      }
    }
  }
  return result.length > 0 ? result : exercises.value
})

// ---------- AddExerciseDialog state ----------
const showAddDialog = ref(false)
const dialogExName = ref('')
const dialogExMuscle = ref('Pectoral')
const dialogExType = ref<'fuerza' | 'resistencia'>('fuerza')
const dialogSetCount = ref(3)
const dialogSetReps = ref<number[]>([])

const muscleGroups = ['Pectoral', 'Dorsal', 'Piernas', 'Hombros', 'Cardio', 'Core', 'Bíceps', 'Tríceps', 'Glúteos', 'Abdomen', 'Espalda', 'Gemelo']

function openAddDialog() {
  dialogExName.value = ''
  dialogExMuscle.value = 'Pectoral'
  dialogExType.value = 'fuerza'
  dialogSetCount.value = 3
  dialogSetReps.value = [10, 10, 10]
  showAddDialog.value = true
}

function confirmAddDialog() {
  if (!dialogExName.value.trim()) return
  exercises.value.push({
    id: Date.now() + Math.floor(Math.random() * 10000),
    name: dialogExName.value.trim(),
    icon: gymFillIcon,
    muscleGroup: dialogExMuscle.value,
    type: dialogExType.value,
    sets: dialogSetReps.value.slice(0, dialogSetCount.value).map(v => ({
      plannedReps: Math.max(1, v || 10),
      actualReps: 0,
      confirmed: false,
    })),
  })
  showAddDialog.value = false
}

function cancelAddDialog() {
  showAddDialog.value = false
}

function updateSetCount(delta: number) {
  const newCount = Math.max(1, Math.min(10, dialogSetCount.value + delta))
  while (dialogSetReps.value.length < newCount) {
    dialogSetReps.value.push(10)
  }
  if (dialogSetReps.value.length > newCount) {
    dialogSetReps.value = dialogSetReps.value.slice(0, newCount)
  }
  dialogSetCount.value = newCount
}

function confirmSet(exerciseId: number, setIndex: number): void {
  const ex = exercises.value.find(e => e.id === exerciseId)
  if (!ex || !ex.sets[setIndex]) return
  ex.sets[setIndex].confirmed = !ex.sets[setIndex].confirmed
}

function openExerciseContext(ex: Exercise, event: MouseEvent | TouchEvent) {
  const isOriginal = exercises.value.some(e => e.id === ex.id)
  if (!isOriginal) return // cloned from routine – not in master list
  startPress(event, [
    {
      icon: editIcon,
      label: 'Editar',
      action: () => {
        panelTitle.value = `Editar ${ex.name}`
        editingExerciseId.value = ex.id
        editPanel.value = true
      },
    },
    {
      icon: deleteIcon,
      label: 'Eliminar',
      action: () => { exercises.value = exercises.value.filter(e => e.id !== ex.id) },
    },
  ])
}

// ---------- mediciones corporales (reactivas) ----------
interface BodyMeasurements {
  height: number
  weight: number
  bodyFat: number
  neck: number
  shoulders: number
  chest: number
  waist: number
  hip: number
  arm: number
  thigh: number
  calf: number
}

const bodyMeasurements = ref<BodyMeasurements>({
  height: 175,
  weight: 74.5,
  bodyFat: 15.2,
  neck: 38,
  shoulders: 112,
  chest: 98,
  waist: 80,
  hip: 94,
  arm: 35,
  thigh: 55,
  calf: 36,
})

// ---------- inline editing for body measurements ----------
const editingMeasKey = ref<string | null>(null)
const editingMeasVal = ref('')

function startEditMeas(key: keyof BodyMeasurements) {
  editingMeasKey.value = key
  editingMeasVal.value = String(bodyMeasurements.value[key])
  nextTick(() => {
    const el = document.querySelector('.bl-input') as HTMLInputElement
    if (el) el.focus()
  })
}

function saveEditMeas() {
  if (!editingMeasKey.value) return
  const val = parseFloat(editingMeasVal.value)
  if (!isNaN(val) && val > 0) {
    (bodyMeasurements.value as any)[editingMeasKey.value] = val
  }
  editingMeasKey.value = null
}

// ---------- etiquetas de mediciones (dinámicas) ----------
interface BodyLabel {
  id: number
  key: keyof BodyMeasurements | 'bmi'
  label: string
  value: string
  unit: string
  side: 'left' | 'right' | 'bottom'
  offset: number
}

const bodyLabels = computed<BodyLabel[]>(() => {
  const m = bodyMeasurements.value
  const bmi = m.height ? (m.weight / ((m.height / 100) ** 2)).toFixed(1) : '--'
  return [
    { id: 1, key: 'height', label: 'Altura', value: String(m.height), unit: 'cm', side: 'left', offset: 8 },
    { id: 2, key: 'weight', label: 'Peso', value: String(m.weight), unit: 'kg', side: 'left', offset: 28 },
    { id: 3, key: 'bmi', label: 'IMC', value: bmi, unit: '', side: 'left', offset: 48 },
    { id: 4, key: 'bodyFat', label: 'Grasa', value: String(m.bodyFat), unit: '%', side: 'left', offset: 68 },
    { id: 5, key: 'neck', label: 'Cuello', value: String(m.neck), unit: 'cm', side: 'right', offset: 5 },
    { id: 6, key: 'shoulders', label: 'Hombros', value: String(m.shoulders), unit: 'cm', side: 'right', offset: 22 },
    { id: 7, key: 'chest', label: 'Pecho', value: String(m.chest), unit: 'cm', side: 'right', offset: 40 },
    { id: 8, key: 'waist', label: 'Cintura', value: String(m.waist), unit: 'cm', side: 'right', offset: 56 },
    { id: 9, key: 'hip', label: 'Cadera', value: String(m.hip), unit: 'cm', side: 'bottom', offset: 15 },
    { id: 10, key: 'arm', label: 'Brazo', value: String(m.arm), unit: 'cm', side: 'bottom', offset: 42 },
    { id: 11, key: 'thigh', label: 'Muslo', value: String(m.thigh), unit: 'cm', side: 'bottom', offset: 65 },
    { id: 12, key: 'calf', label: 'Pantorrilla', value: String(m.calf), unit: 'cm', side: 'bottom', offset: 88 },
  ]
})
</script>

<template>
  <RoutinePlanner
    v-if="routinePlannerMode"
    :exercises="exercises.map(e => ({ id: e.id, name: e.name, icon: e.icon }))"
    :existing="routinePlannerMode === 'edit' && editingRoutine ? { id: editingRoutine.id, name: editingRoutine.name, exerciseIds: editingRoutine.exerciseIds } : undefined"
    @save="onRoutineSave"
    @cancel="onRoutineCancel"
  />
  <WeekPlanner
    v-else-if="planningMode"
    :items="plannerItems"
    :title="planningTitle"
    @confirm="onPlanConfirm"
    @cancel="onPlanCancel"
    @edit="onPlanEdit"
    @delete="onPlanDelete"
  />
  <div v-else class="fitness-page">
    <!-- ======================== GRÁFICOS (GenericChart) ======================== -->
    <div class="charts-row">
      <div class="chart-box">
        <span class="chart-title">Fuerza</span>
        <GenericChart
          :series="strengthSeries"
          :view-mode="fitViewMode"
          :yFormat="(v: number) => v + '%'"
          :show-legend="true"
          :chart-height="140"
          :dark-mode="isDark === 'dark'"
          @update:view-mode="fitViewMode = $event"
        />
      </div>

      <div class="chart-box">
        <span class="chart-title">Resistencia</span>
        <GenericChart
          :series="resistanceSeries"
          :view-mode="fitViewMode"
          :yFormat="(v: number) => v + '%'"
          :show-legend="true"
          :chart-height="140"
          :dark-mode="isDark === 'dark'"
          @update:view-mode="fitViewMode = $event"
        />
      </div>
    </div>

    <!-- ======================== SECCIÓN INFERIOR ======================== -->
    <div class="bottom-section">
      <!-- LEFT PANEL: Avatar + etiquetas -->
      <div class="left-panel">
        <div class="body-space">
          <BodyAvatar
            gender="male"
            :weight-kg="bodyMeasurements.weight"
            :height-cm="bodyMeasurements.height"
            :body-fat-percent="bodyMeasurements.bodyFat"
            :chest-cm="bodyMeasurements.chest"
            :waist-cm="bodyMeasurements.waist"
            :thigh-cm="bodyMeasurements.thigh"
          />
          <!-- Etiquetas izquierda -->
          <div class="body-labels-left">
            <div
              v-for="l in bodyLabels.filter(x => x.side === 'left')"
              :key="l.id"
              class="body-label"
              :style="{ top: l.offset + '%' }"
            >
              <span class="bl-name">{{ l.label }}</span>
              <input
                v-if="l.key !== 'bmi' && l.key !== 'bodyFat' && editingMeasKey === l.key"
                v-model="editingMeasVal"
                type="number"
                class="bl-input"
                step="any"
                @blur="saveEditMeas"
                @keydown.enter="saveEditMeas"
                @keydown.escape="editingMeasKey = null"
              />
              <span v-else class="bl-value" @click="l.key !== 'bmi' && l.key !== 'bodyFat' && startEditMeas(l.key as any)">{{ l.value }}{{ l.unit }}</span>
            </div>
          </div>
          <!-- Etiquetas derecha -->
          <div class="body-labels-right">
            <div
              v-for="l in bodyLabels.filter(x => x.side === 'right')"
              :key="l.id"
              class="body-label"
              :style="{ top: l.offset + '%' }"
            >
              <span class="bl-name">{{ l.label }}</span>
              <input
                v-if="l.key !== 'bmi' && l.key !== 'bodyFat' && editingMeasKey === l.key"
                v-model="editingMeasVal"
                type="number"
                class="bl-input"
                step="any"
                @blur="saveEditMeas"
                @keydown.enter="saveEditMeas"
                @keydown.escape="editingMeasKey = null"
              />
              <span v-else class="bl-value" @click="l.key !== 'bmi' && l.key !== 'bodyFat' && startEditMeas(l.key as any)">{{ l.value }}{{ l.unit }}</span>
            </div>
          </div>
          <!-- Etiquetas inferiores -->
          <div class="body-labels-bottom">
            <div
              v-for="l in bodyLabels.filter(x => x.side === 'bottom')"
              :key="l.id"
              class="body-label bl-bottom"
              :style="{ left: l.offset + '%' }"
            >
              <span class="bl-name">{{ l.label }}</span>
              <input
                v-if="l.key !== 'bmi' && l.key !== 'bodyFat' && editingMeasKey === l.key"
                v-model="editingMeasVal"
                type="number"
                class="bl-input"
                step="any"
                @blur="saveEditMeas"
                @keydown.enter="saveEditMeas"
                @keydown.escape="editingMeasKey = null"
              />
              <span v-else class="bl-value" @click="l.key !== 'bmi' && l.key !== 'bodyFat' && startEditMeas(l.key as any)">{{ l.value }}{{ l.unit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Ejercicios de hoy + rutinas -->
      <div class="right-panel">
        <h3 class="today-title">Hoy - Ejercicios</h3>
        <div class="today-list">
          <div
            v-for="ex in todayExercises"
            :key="ex.id"
            class="today-item"
            @pointerdown="openExerciseContext(ex, $event)"
            @pointerup="cancelPress"
            @pointerleave="cancelPress"
          >
            <span class="ex-icon">
              <img v-if="ex.icon.endsWith('.svg')" :src="ex.icon" class="ex-svg-icon" :alt="ex.name" />
              <span v-else>{{ ex.icon }}</span>
            </span>
            <div class="ex-info">
              <span class="ex-name">{{ ex.name }}</span>
              <span class="ex-muscle">{{ ex.muscleGroup }}</span>
            </div>
            <div class="ex-sets">
              <div v-for="(set, si) in ex.sets" :key="si" class="ex-set-row">
                <span class="set-label">{{ si + 1 }}ª</span>
                <div class="ex-value-wrap">
                  <input
                    type="number"
                    class="ex-value-input"
                    :placeholder="String(set.plannedReps)"
                    v-model="set.actualReps"
                    min="0"
                  />
                </div>
                <label class="check-wrap">
                  <input
                    type="checkbox"
                    :checked="set.confirmed"
                    @change="confirmSet(ex.id, si)"
                    class="check-input"
                  />
                  <span class="check-circle" :class="{ checked: set.confirmed }">
                    <svg v-if="set.confirmed" viewBox="0 0 24 24" class="check-svg">
                      <path d="M6 14l3 3 9-9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </label>
              </div>
            </div>
          </div>
          <button class="add-exercise-btn" @click="openAddDialog">
            + Agregar ejercicio
          </button>
          <div v-if="exercises.length === 0" class="today-empty">Sin ejercicios</div>
        </div>
      </div>
    </div>

    <!-- ======================== ADD EXERCISE DIALOG ======================== -->
    <Teleport to="body">
      <div v-if="showAddDialog" class="dialog-overlay" @click.self="cancelAddDialog">
        <div class="add-dialog">
          <h3 class="dialog-title">Nuevo ejercicio</h3>

          <label class="dialog-field">
            <span class="dialog-label">Nombre</span>
            <input v-model="dialogExName" type="text" class="dialog-input" placeholder="Ej: Press banca" />
          </label>

          <label class="dialog-field">
            <span class="dialog-label">Grupo muscular</span>
            <select v-model="dialogExMuscle" class="dialog-select">
              <option v-for="g in muscleGroups" :key="g" :value="g">{{ g }}</option>
            </select>
          </label>

          <label class="dialog-field">
            <span class="dialog-label">Tipo</span>
            <div class="dialog-toggle">
              <button
                :class="{ active: dialogExType === 'fuerza' }"
                @click="dialogExType = 'fuerza'"
              >Fuerza</button>
              <button
                :class="{ active: dialogExType === 'resistencia' }"
                @click="dialogExType = 'resistencia'"
              >Resistencia</button>
            </div>
          </label>

          <label class="dialog-field">
            <span class="dialog-label">Número de series</span>
            <div class="stepper">
              <button class="step-btn" @click="updateSetCount(-1)" :disabled="dialogSetCount <= 1">−</button>
              <span class="step-value">{{ dialogSetCount }}</span>
              <button class="step-btn" @click="updateSetCount(1)" :disabled="dialogSetCount >= 10">+</button>
            </div>
          </label>

          <div class="dialog-field">
            <span class="dialog-label">Repeticiones por serie</span>
            <div class="dialog-sets-reps">
              <div v-for="i in dialogSetCount" :key="i" class="set-rep-row">
                <span class="set-rep-label">{{ i }}ª serie</span>
                <input
                  v-model.number="dialogSetReps[i - 1]"
                  type="number"
                  class="dialog-input rep-input"
                  min="1"
                  placeholder="10"
                />
                <span class="set-rep-unit">rep</span>
              </div>
            </div>
          </div>

          <div class="dialog-actions">
            <button class="dialog-btn cancel" @click="cancelAddDialog">Cancelar</button>
            <button class="dialog-btn confirm" @click="confirmAddDialog" :disabled="!dialogExName.trim()">Añadir</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ======================== MENÚ CONTEXTUAL, FAB, PANEL DESLIZANTE ======================== -->
    <ContextMenu
      :visible="contextVisible ?? false"
      :items="contextItems ?? []"
      :x="contextX ?? 0"
      :y="contextY ?? 0"
      @close="closeContext"
    />

    <FloatingActionButton :actions="fabActions" />

    <SlidePanel :open="editPanel" :title="panelTitle" side="right" @close="editPanel = false; editingExerciseId = null">
      <template v-if="editingExerciseId !== null">
        <div class="edit-form">
          <div v-for="ex in exercises.filter(e => e.id === editingExerciseId)" :key="ex.id" class="edit-fields">
            <label class="dialog-field">
              <span class="dialog-label">Nombre</span>
              <input v-model="ex.name" type="text" class="dialog-input" />
            </label>
            <label class="dialog-field">
              <span class="dialog-label">Grupo muscular</span>
              <select v-model="ex.muscleGroup" class="dialog-select">
                <option v-for="g in muscleGroups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="dialog-field">
              <span class="dialog-label">Tipo</span>
              <div class="dialog-toggle">
                <button :class="{ active: ex.type === 'fuerza' }" @click="ex.type = 'fuerza'">Fuerza</button>
                <button :class="{ active: ex.type === 'resistencia' }" @click="ex.type = 'resistencia'">Resistencia</button>
              </div>
            </label>
            <div class="dialog-field">
              <span class="dialog-label">Series</span>
              <div class="edit-sets">
                <div v-for="(set, si) in ex.sets" :key="si" class="edit-set-row">
                  <span class="set-rep-label">{{ si + 1 }}ª</span>
                  <label class="edit-set-field">
                    <span>Prev.</span>
                    <input v-model.number="set.plannedReps" type="number" class="dialog-input rep-input" min="1" />
                  </label>
                  <label class="edit-set-field">
                    <span>Real</span>
                    <input v-model.number="set.actualReps" type="number" class="dialog-input rep-input" min="0" />
                  </label>
                  <button class="edit-set-del" @click="ex.sets.splice(si, 1)" title="Eliminar serie">&times;</button>
                </div>
              </div>
              <button class="edit-add-set" @click="ex.sets.push({ plannedReps: 10, actualReps: 0, confirmed: false })">+ Añadir serie</button>
            </div>
          </div>
        </div>
      </template>
      <p v-else class="panel-placeholder">Selecciona un ejercicio para editar</p>
    </SlidePanel>
  </div>
</template>

<style scoped>
.fitness-page {
  --fi-accent: #e53935;
  --fi-bg: #f5f5f5;
  --fi-bg-card: #FFFFFF;
  --fi-bg-side: #FAFAFA;
  --fi-text: #1a1a1a;
  --fi-text-sec: #888;
  --fi-border: #e8e8e8;
  --fi-border-light: #f0f0f0;
  --fi-shadow: 0px 2px 4px rgba(0,0,0,0.05), 0px 6px 12px rgba(0,0,0,0.1);
  --fi-shadow-item: 0px 1px 3px rgba(0,0,0,0.04);
  --fi-label-bg: #FFFFFF;

  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--fi-bg);
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

:root.dark .fitness-page {
  --fi-bg: #121212;
  --fi-bg-card: #1E1E1E;
  --fi-bg-side: #1A1A1A;
  --fi-text: #E0E0E0;
  --fi-text-sec: #999;
  --fi-border: #333;
  --fi-border-light: #2a2a2a;
  --fi-shadow: 0px 2px 4px rgba(0,0,0,0.2), 0px 6px 12px rgba(0,0,0,0.3);
  --fi-shadow-item: 0px 1px 3px rgba(0,0,0,0.2);
  --fi-label-bg: #2A2A2A;
}

.charts-row {
  display: flex;
  gap: 12px;
  padding: 16px 16px 10px;
  flex-shrink: 0;
}

.chart-box {
  flex: 1;
  background: var(--fi-bg-card);
  border-radius: 12px;
  padding: 10px;
  box-shadow: var(--fi-shadow);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.chart-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--fi-text);
}

/* ======================== BOTTOM SECTION ======================== */

.bottom-section {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  padding: 0 16px 10px;
  gap: 12px;
}

/* ======================== LEFT PANEL ======================== */

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.body-space {
  flex: 1;
  position: relative;
  margin-right: 200px;
  /*background: var(--fi-bg-card);
  border-radius: 12px;
  box-shadow: var(--fi-shadow);*/
  overflow: hidden;
  min-height: 280px;
}

.body-labels-left {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.body-labels-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.body-labels-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  padding: 0 6px;
}

.body-label {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--fi-label-bg);
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
  z-index: 1;
  pointer-events: none;
  transform: translateY(-50%);
}

.bl-bottom {
  transform: none;
}

.bl-value {
  font-size: 9px;
  font-weight: 500;
  color: var(--fi-text-sec);
  line-height: 1.2;
}

.bl-name {
  font-size: 9px;
  font-weight: 700;
  color: var(--fi-text);
  line-height: 1.2;
}

.bl-input {
  width: 48px;
  padding: 1px 4px;
  border: 1px solid var(--fi-accent);
  border-radius: 4px;
  background: var(--fi-bg);
  color: var(--fi-text);
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  font-family: inherit;
  outline: none;
}

.bl-value {
  cursor: pointer;
  transition: opacity 0.15s;
}

.bl-value:hover {
  opacity: 0.7;
}

/* Labels on left edge */
.body-labels-left .body-label {
  left: 4px;
  align-items: flex-start;
}

/* Labels on right edge */
.body-labels-right .body-label {
  right: 4px;
  align-items: flex-end;
}

/* Labels on bottom edge */
.body-labels-bottom .body-label {
  bottom: 4px;
  align-items: center;
}

/* ======================== RIGHT PANEL ======================== */

.right-panel {
  flex: 1;
  background: var(--fi-bg-side);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  max-width: 27.5%;
}

.today-title {
  margin: 0;
  padding: 12px 12px 8px;
  font-size: 20px;
  font-weight: 700;
  color: var(--fi-text);
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

.today-list::-webkit-scrollbar {
  width: 5px;
}
.today-list::-webkit-scrollbar-track {
  background: var(--fi-border);
  border-radius: 3px;
}
.today-list::-webkit-scrollbar-thumb {
  background: var(--fi-accent);
  border-radius: 3px;
}
.today-list {
  scrollbar-width: thin;
  scrollbar-color: var(--fi-accent) var(--fi-border);
}

.today-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--fi-bg-card);
  border-radius: 8px;
  box-shadow: var(--fi-shadow-item);
}

.ex-icon {
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.ex-svg-icon {
  width: 18px;
  height: 18px;
  display: block;
  color: currentColor;
}

.ex-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--fi-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.ex-muscle {
  font-size: 9px;
  font-weight: 500;
  color: var(--fi-text-sec);
  flex-shrink: 0;
  margin-right: 2px;
}

.routine-item {
  border-left: 3px solid var(--color-primary, #00897B);
  cursor: default;
}

.ex-value-wrap {
  flex-shrink: 0;
}

.ex-value-input {
  width: 46px;
  padding: 3px 4px;
  border: 1px solid var(--fi-border);
  border-radius: 6px;
  background: var(--fi-bg);
  color: var(--fi-text);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.ex-value-input:focus {
  border-color: var(--fi-accent);
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
  border: 2px solid var(--fi-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-sizing: border-box;
}

.check-circle.checked {
  background: var(--fi-accent);
  border-color: var(--fi-accent);
}

.check-svg {
  width: 16px;
  height: 16px;
}

.add-exercise-btn {
  padding: 8px;
  border: 1px dashed var(--fi-border);
  border-radius: 8px;
  background: transparent;
  color: var(--fi-text-sec);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.add-exercise-btn:hover {
  border-color: var(--fi-accent);
  color: var(--fi-accent);
  background: rgba(229, 57, 53, 0.04);
}

.today-empty {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: var(--fi-text-sec);
}

/* ======================== SETS IN TODAY LIST ======================== */

.ex-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.ex-sets {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.ex-set-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.set-label {
  font-size: 9px;
  font-weight: 600;
  color: var(--fi-text-sec);
  min-width: 12px;
}

/* ======================== ADD EXERCISE DIALOG ======================== */

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.add-dialog {
  background: var(--fi-bg-card);
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

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--fi-text);
  margin: 0;
}

.dialog-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dialog-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--fi-text-sec);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dialog-input {
  padding: 8px 10px;
  border: 1px solid var(--fi-border);
  border-radius: 8px;
  background: var(--fi-bg);
  color: var(--fi-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.dialog-input:focus {
  border-color: var(--fi-accent);
}

.dialog-select {
  padding: 8px 10px;
  border: 1px solid var(--fi-border);
  border-radius: 8px;
  background: var(--fi-bg);
  color: var(--fi-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
  appearance: auto;
}

.dialog-select:focus {
  border-color: var(--fi-accent);
}

.dialog-toggle {
  display: flex;
  gap: 4px;
}

.dialog-toggle button {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--fi-border);
  border-radius: 8px;
  background: var(--fi-bg);
  color: var(--fi-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.dialog-toggle button.active {
  background: var(--fi-accent);
  border-color: var(--fi-accent);
  color: #fff;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--fi-border);
  background: var(--fi-bg);
  color: var(--fi-text);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: all 0.15s;
}

.step-btn:hover:not(:disabled) {
  border-color: var(--fi-accent);
  color: var(--fi-accent);
}

.step-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.step-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--fi-text);
  min-width: 24px;
  text-align: center;
}

.dialog-sets-reps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.set-rep-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.set-rep-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--fi-text);
  min-width: 48px;
}

.rep-input {
  width: 64px;
}

.set-rep-unit {
  font-size: 12px;
  color: var(--fi-text-sec);
}

.dialog-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.dialog-btn {
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

.dialog-btn.cancel {
  background: var(--fi-border);
  color: var(--fi-text);
}

.dialog-btn.cancel:hover {
  background: var(--fi-text-sec);
  color: #fff;
}

.dialog-btn.confirm {
  background: var(--fi-accent);
  color: #fff;
}

.dialog-btn.confirm:hover:not(:disabled) {
  opacity: 0.85;
}

.dialog-btn.confirm:disabled {
  opacity: 0.4;
  cursor: default;
}

/* ======================== EDIT FORM (SLIDE PANEL) ======================== */

.edit-form {
  padding: 0 4px 20px;
}

.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-sets {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.edit-set-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-set-field {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--fi-text-sec);
}

.edit-set-field .rep-input {
  width: 48px;
}

.edit-set-del {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--fi-text-sec);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.edit-set-del:hover {
  background: rgba(229,57,53,0.1);
  color: var(--fi-accent);
}

.edit-add-set {
  padding: 6px;
  border: 1px dashed var(--fi-border);
  border-radius: 8px;
  background: transparent;
  color: var(--fi-text-sec);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.edit-add-set:hover {
  border-color: var(--fi-accent);
  color: var(--fi-accent);
}

.panel-placeholder {
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 40px;
}

@media (max-width: 640px) {
  .charts-row {
    flex-direction: column;
    padding: 10px;
    gap: 8px;
  }
  .chart-box {
    padding: 8px;
  }
  .bottom-section {
    flex-direction: column;
    padding: 0 10px 8px;
    gap: 8px;
  }
  .right-panel {
    max-width: 100%;
  }
  .left-panel {
    min-height: 180px;
  }
  .body-space {
    min-height: 160px;
  }
  .today-title {
    font-size: 12px;
    padding: 8px 10px 4px;
  }
  .today-list {
    padding: 0 10px 8px;
  }
  .ex-value-input {
    width: 40px;
    font-size: 11px;
  }
}
</style>