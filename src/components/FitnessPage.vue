<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import ContextMenu from './ContextMenu.vue'
import FloatingActionButton from './FloatingActionButton.vue'
import SlidePanel from './SlidePanel.vue'
import type { FabAction } from './FloatingActionButton.vue'

interface Exercise {
  id: number
  name: string
  icon: string
  muscleGroup: string
  type: 'fuerza' | 'resistencia'
  plannedValue: number
  actualValue: number
  confirmed: boolean
}

const exercises = ref<Exercise[]>([
  { id: 1, name: 'Press banca', icon: '🏋️', muscleGroup: 'Pectoral', type: 'fuerza', plannedValue: 60, actualValue: 60, confirmed: true },
  { id: 2, name: 'Remo', icon: '🏋️', muscleGroup: 'Dorsal', type: 'fuerza', plannedValue: 50, actualValue: 45, confirmed: false },
  { id: 3, name: 'Sentadilla', icon: '🦵', muscleGroup: 'Piernas', type: 'fuerza', plannedValue: 80, actualValue: 80, confirmed: true },
  { id: 4, name: 'Press militar', icon: '🏋️', muscleGroup: 'Hombros', type: 'fuerza', plannedValue: 35, actualValue: 30, confirmed: false },
  { id: 5, name: 'Cardio HIIT', icon: '🏃', muscleGroup: 'Cardio', type: 'resistencia', plannedValue: 20, actualValue: 20, confirmed: true },
  { id: 6, name: 'Plancha', icon: '🧘', muscleGroup: 'Core', type: 'resistencia', plannedValue: 3, actualValue: 2.5, confirmed: false },
  { id: 7, name: 'Curl bíceps', icon: '💪', muscleGroup: 'Bíceps', type: 'resistencia', plannedValue: 15, actualValue: 15, confirmed: true },
  { id: 8, name: 'Fondos', icon: '💪', muscleGroup: 'Tríceps', type: 'resistencia', plannedValue: 12, actualValue: 10, confirmed: false },
])

function seedRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return s / 0x7fffffff
  }
}

interface ChartPoint {
  label: string
  values: Record<string, number>
}

const { isDark } = useTheme()

const warmGroups = ['Pectoral', 'Dorsal', 'Piernas', 'Hombros']
const coolGroups = ['Cardio', 'Core', 'Bíceps', 'Tríceps']

const warmPalette = ['#e53935', '#fb8c00', '#ff5252', '#ff6d00']
const coolPalette = ['#1e88e5', '#43a047', '#00acc1', '#7b1fa2']

const warmColors = computed(() => isDark.value ? coolPalette : warmPalette)
const coolColors = computed(() => isDark.value ? warmPalette : coolPalette)

const weekLabels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12']

const warmData = computed(() => {
  return weekLabels.map((label, wi) => {
    const values: Record<string, number> = {}
    warmGroups.forEach((g, gi) => {
      const rand = seedRand(42 + gi * 10 + wi)
      const base = [70, 55, 85, 40][gi]
      values[g] = Math.round(base + rand() * 30 - 5 + wi * 1.5)
    })
    return { label, values }
  })
})

const coolData = computed(() => {
  return weekLabels.map((label, wi) => {
    const values: Record<string, number> = {}
    coolGroups.forEach((g, gi) => {
      const rand = seedRand(100 + gi * 10 + wi)
      const base = [25, 8, 18, 15][gi]
      values[g] = Math.round(base + rand() * 10 - 3 + wi * 0.8)
    })
    return { label, values }
  })
})

function chartMax(data: ChartPoint[], groups: string[]): number {
  let mx = 0
  for (const pt of data) {
    for (const g of groups) {
      if (pt.values[g] > mx) mx = pt.values[g]
    }
  }
  return Math.ceil(mx / 10) * 10 || 50
}

const CHART_H = 140
const CHART_PAD = { top: 16, right: 8, bottom: 20, left: 32 }

function chartWidth(dataLen: number): number {
  return Math.max(200, dataLen * 28)
}

function xPos(i: number, w: number, len: number): number {
  return CHART_PAD.left + (i / Math.max(1, len - 1)) * (w - CHART_PAD.left - CHART_PAD.right)
}

function yPos(v: number, max: number): number {
  return CHART_PAD.top + (CHART_H - CHART_PAD.top - CHART_PAD.bottom) - (v / max) * (CHART_H - CHART_PAD.top - CHART_PAD.bottom)
}

const editPanel = ref(false)
const panelTitle = ref('')
const addValue = ref<Record<number, string>>({})

const fabActions: FabAction[] = [
  { icon: '🏋️', label: 'Nuevo ejercicio', action: () => { panelTitle.value = 'Nuevo ejercicio'; editPanel.value = true } },
  { icon: '📋', label: 'Nueva rutina', action: () => { panelTitle.value = 'Nueva rutina'; editPanel.value = true } },
  { icon: '✏️', label: 'Editar rutina', action: () => { panelTitle.value = 'Editar rutina'; editPanel.value = true } },
  { icon: '📅', label: 'Planificación semanal', action: () => { panelTitle.value = 'Planificación semanal'; editPanel.value = true } },
  { icon: '📝', label: 'Editar planificación semanal', action: () => { panelTitle.value = 'Editar planificación'; editPanel.value = true } },
]

function confirmExercise(id: number): void {
  const ex = exercises.value.find(e => e.id === id)
  if (!ex) return
  ex.confirmed = !ex.confirmed
  if (ex.confirmed) {
    const val = addValue.value[id]
    if (val !== undefined && val !== '') {
      ex.actualValue = parseFloat(val) || ex.actualValue
    }
  }
}

function addExercise(): void {
  exercises.value.push({
    id: Date.now(),
    name: 'Nuevo ejercicio',
    icon: '🏋️',
    muscleGroup: 'General',
    type: 'fuerza',
    plannedValue: 10,
    actualValue: 0,
    confirmed: false,
  })
}

interface BodyLabel {
  id: number
  label: string
  value: string
  side: 'left' | 'right' | 'bottom'
  offset: number
}

const bodyLabels = ref<BodyLabel[]>([
  { id: 1, label: 'Altura', value: '175 cm', side: 'left', offset: 8 },
  { id: 2, label: 'Peso', value: '72 kg', side: 'left', offset: 28 },
  { id: 3, label: 'IMC', value: '23.5', side: 'left', offset: 48 },
  { id: 4, label: 'Grasa', value: '15%', side: 'left', offset: 68 },
  { id: 5, label: 'Cuello', value: '38 cm', side: 'right', offset: 5 },
  { id: 6, label: 'Hombros', value: '112 cm', side: 'right', offset: 22 },
  { id: 7, label: 'Pecho', value: '98 cm', side: 'right', offset: 40 },
  { id: 8, label: 'Cintura', value: '80 cm', side: 'right', offset: 56 },
  { id: 9, label: 'Cadera', value: '94 cm', side: 'bottom', offset: 15 },
  { id: 10, label: 'Brazo', value: '35 cm', side: 'bottom', offset: 42 },
  { id: 11, label: 'Muslo', value: '52 cm', side: 'bottom', offset: 65 },
  { id: 12, label: 'Pantorrilla', value: '36 cm', side: 'bottom', offset: 88 },
])
</script>

<template>
  <div class="fitness-page">
    <div class="charts-row">
      <div class="chart-box">
        <span class="chart-title">Fuerza</span>
        <div class="chart-scroll-wrap">
          <svg :viewBox="`0 0 ${chartWidth(warmData.length)} ${CHART_H}`" class="chart-svg" :style="{ width: chartWidth(warmData.length) + 'px' }">
            <template v-for="(group, gi) in warmGroups" :key="group">
              <polyline
                :points="warmData.map((d, i) => `${xPos(i, chartWidth(warmData.length), warmData.length)},${yPos(d.values[group], chartMax(warmData, warmGroups))}`).join(' ')"
                :stroke="warmColors[gi]"
                stroke-width="1.5"
                fill="none"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <template v-for="(d, i) in warmData" :key="i">
                <circle
                  :cx="xPos(i, chartWidth(warmData.length), warmData.length)"
                  :cy="yPos(d.values[group], chartMax(warmData, warmGroups))"
                  :fill="warmColors[gi]"
                  r="2"
                  stroke="var(--fi-dot-stroke, #fff)"
                  stroke-width="1"
                />
              </template>
            </template>
            <text
              v-for="(d, i) in warmData"
              :key="'xl-'+i"
              :x="xPos(i, chartWidth(warmData.length), warmData.length)"
              :y="CHART_H - 4"
              fill="var(--fi-text-sec)"
              font-size="6"
              text-anchor="middle"
            >{{ d.label }}</text>
          </svg>
        </div>
        <div class="chart-legend">
          <span v-for="(group, gi) in warmGroups" :key="group" class="legend-chip">
            <span class="legend-dot" :style="{ background: warmColors[gi] }" />
            {{ group }}
          </span>
        </div>
      </div>

      <div class="chart-box">
        <span class="chart-title">Resistencia</span>
        <div class="chart-scroll-wrap">
          <svg :viewBox="`0 0 ${chartWidth(coolData.length)} ${CHART_H}`" class="chart-svg" :style="{ width: chartWidth(coolData.length) + 'px' }">
            <template v-for="(group, gi) in coolGroups" :key="group">
              <polyline
                :points="coolData.map((d, i) => `${xPos(i, chartWidth(coolData.length), coolData.length)},${yPos(d.values[group], chartMax(coolData, coolGroups))}`).join(' ')"
                :stroke="coolColors[gi]"
                stroke-width="1.5"
                fill="none"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <template v-for="(d, i) in coolData" :key="i">
                <circle
                  :cx="xPos(i, chartWidth(coolData.length), coolData.length)"
                  :cy="yPos(d.values[group], chartMax(coolData, coolGroups))"
                  :fill="coolColors[gi]"
                  r="2"
                  stroke="var(--fi-dot-stroke, #fff)"
                  stroke-width="1"
                />
              </template>
            </template>
            <text
              v-for="(d, i) in coolData"
              :key="'xl-'+i"
              :x="xPos(i, chartWidth(coolData.length), coolData.length)"
              :y="CHART_H - 4"
              fill="var(--fi-text-sec)"
              font-size="6"
              text-anchor="middle"
            >{{ d.label }}</text>
          </svg>
        </div>
        <div class="chart-legend">
          <span v-for="(group, gi) in coolGroups" :key="group" class="legend-chip">
            <span class="legend-dot" :style="{ background: coolColors[gi] }" />
            {{ group }}
          </span>
        </div>
      </div>
    </div>

    <div class="bottom-section">
      <div class="left-panel">
        <div class="body-space">
          <div class="body-labels-left">
            <div
              v-for="l in bodyLabels.filter(x => x.side === 'left')"
              :key="l.id"
              class="body-label"
              :style="{ top: l.offset + '%' }"
            >
              <span class="bl-value">{{ l.value }}</span>
              <span class="bl-name">{{ l.label }}</span>
            </div>
          </div>
          <div class="body-labels-right">
            <div
              v-for="l in bodyLabels.filter(x => x.side === 'right')"
              :key="l.id"
              class="body-label"
              :style="{ top: l.offset + '%' }"
            >
              <span class="bl-value">{{ l.value }}</span>
              <span class="bl-name">{{ l.label }}</span>
            </div>
          </div>
          <div class="body-labels-bottom">
            <div
              v-for="l in bodyLabels.filter(x => x.side === 'bottom')"
              :key="l.id"
              class="body-label bl-bottom"
              :style="{ left: l.offset + '%' }"
            >
              <span class="bl-value">{{ l.value }}</span>
              <span class="bl-name">{{ l.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <h3 class="today-title">Hoy - Ejercicios</h3>
        <div class="today-list">
          <div v-for="ex in exercises" :key="ex.id" class="today-item">
            <span class="ex-icon">{{ ex.icon }}</span>
            <span class="ex-name">{{ ex.name }}</span>
            <span class="ex-muscle">{{ ex.muscleGroup }}</span>
            <div class="ex-value-wrap">
              <input
                type="number"
                class="ex-value-input"
                :placeholder="String(ex.plannedValue)"
                :value="addValue[ex.id] ?? ex.actualValue"
                @input="addValue[ex.id] = ($event.target as HTMLInputElement).value"
              />
            </div>
            <label class="check-wrap">
              <input
                type="checkbox"
                :checked="ex.confirmed"
                @change="confirmExercise(ex.id)"
                class="check-input"
              />
              <span class="check-circle" :class="{ checked: ex.confirmed }">
                <svg v-if="ex.confirmed" viewBox="0 0 24 24" class="check-svg">
                  <path d="M6 14l3 3 9-9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </label>
          </div>
          <button class="add-exercise-btn" @click="addExercise">
            + Agregar ejercicio
          </button>
          <div v-if="exercises.length === 0" class="today-empty">Sin ejercicios</div>
        </div>
      </div>
    </div>

    <ContextMenu
      :visible="contextVisible ?? false"
      :items="contextItems ?? []"
      :x="contextX ?? 0"
      :y="contextY ?? 0"
      @close="closeContext"
    />

    <FloatingActionButton :actions="fabActions" />

    <SlidePanel :open="editPanel" :title="panelTitle" side="right" @close="editPanel = false">
      <p class="panel-placeholder">Contenido del formulario</p>
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
  --fi-dot-stroke: #fff;
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
  --fi-dot-stroke: #333;
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

.chart-scroll-wrap {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.chart-scroll-wrap::-webkit-scrollbar {
  height: 3px;
}
.chart-scroll-wrap::-webkit-scrollbar-track {
  background: var(--fi-border);
  border-radius: 2px;
}
.chart-scroll-wrap::-webkit-scrollbar-thumb {
  background: var(--fi-text-sec);
  border-radius: 2px;
}

.chart-svg {
  height: 140px;
  display: block;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.legend-chip {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 8px;
  color: var(--fi-text-sec);
  white-space: nowrap;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
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
  font-size: 10px;
  font-weight: 700;
  color: var(--fi-text);
  line-height: 1.2;
}

.bl-name {
  font-size: 7px;
  font-weight: 500;
  color: var(--fi-text-sec);
  line-height: 1.2;
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
  max-height: 33.33%;
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
  max-height: 200px;
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
    max-height: 200px;
    padding: 0 10px 8px;
  }
  .ex-value-input {
    width: 40px;
    font-size: 11px;
  }
}
</style>
