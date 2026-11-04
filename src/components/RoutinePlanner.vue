<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RoutinePlannerItem {
  id: number
  name: string
  icon: string
  [key: string]: any
}

const props = defineProps<{
  exercises: RoutinePlannerItem[]
  existing?: { id: number; name: string; exerciseIds: number[] }
}>()

const emit = defineEmits<{
  save: [routine: { name: string; exerciseIds: number[] }]
  cancel: []
}>()

const searchQuery = ref('')
const routineName = ref(props.existing?.name || '')
const exerciseIds = ref<number[]>(props.existing?.exerciseIds || [])
const dragOver = ref(false)

const filteredExercises = computed(() => {
  if (!searchQuery.value) return props.exercises
  const q = searchQuery.value.toLowerCase()
  return props.exercises.filter(e => e.name.toLowerCase().includes(q))
})

function onDragStart(item: RoutinePlannerItem, event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', String(item.id))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  const id = parseInt(event.dataTransfer?.getData('text/plain') || '', 10)
  if (!id) return
  exerciseIds.value.push(id)
}

function removeExercise(idx: number) {
  exerciseIds.value.splice(idx, 1)
}

function getExercise(id: number): RoutinePlannerItem | undefined {
  return props.exercises.find(e => e.id === id)
}

function hasExercises(): boolean {
  return exerciseIds.value.length > 0
}

function save() {
  emit('save', { name: routineName.value, exerciseIds: [...exerciseIds.value] })
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <div class="routine-planner">
    <header class="rp-header">
      <button class="rp-back-btn" @click="cancel">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <input
        v-if="!existing"
        v-model="routineName"
        type="text"
        class="rp-name-input"
        placeholder="Nombre de la rutina"
      />
      <span v-else class="rp-name-static">{{ existing.name }}</span>
      <div class="rp-avatar">
        <svg viewBox="0 0 32 32" width="28" height="28">
          <circle cx="16" cy="10" r="4" fill="var(--color-text-sec, #888)" />
          <path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="none" stroke="var(--color-text-sec, #888)" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </header>

    <div class="rp-body">
      <aside class="rp-items-panel">
        <div class="rp-search-wrap">
          <svg viewBox="0 0 24 24" width="14" height="14" class="rp-search-icon">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M16 16l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="rp-search-input"
            placeholder="Buscar ejercicios..."
          />
        </div>
        <div class="rp-items-list">
          <div
            v-for="ex in filteredExercises"
            :key="ex.id"
            class="rp-item-row"
            draggable="true"
            @dragstart="onDragStart(ex, $event)"
          >
            <span class="rp-item-icon">
              <img v-if="ex.icon.endsWith('.svg')" :src="ex.icon" class="rp-svg-icon" :alt="ex.name" />
              <span v-else>{{ ex.icon }}</span>
            </span>
            <span class="rp-item-name">{{ ex.name }}</span>
          </div>
          <div v-if="filteredExercises.length === 0" class="rp-items-empty">Sin resultados</div>
        </div>
      </aside>

      <div
        class="rp-drop-zone"
        :class="{ 'drag-over': dragOver }"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <div v-if="!hasExercises()" class="rp-drop-hint">
          Arrastra ejercicios aquí
        </div>
        <div v-else class="rp-assigned-list">
          <div
            v-for="(id, idx) in exerciseIds"
            :key="'ex-' + idx + '-' + id"
            class="rp-assigned-chip"
            @click="removeExercise(idx)"
          >
            <span class="rp-chip-icon">
              <img v-if="getExercise(id)?.icon?.endsWith('.svg')" :src="getExercise(id)!.icon" class="rp-svg-icon" :alt="getExercise(id)?.name || ''" />
              <span v-else>{{ getExercise(id)?.icon || '?' }}</span>
            </span>
            <span class="rp-chip-name">{{ getExercise(id)?.name || '?' }}</span>
            <span class="rp-chip-remove">×</span>
          </div>
        </div>
      </div>
    </div>

    <footer class="rp-footer">
      <button class="rp-footer-btn rp-cancel-btn" @click="cancel">Cancelar</button>
      <button class="rp-footer-btn rp-save-btn" @click="save" :disabled="!routineName.trim() || !hasExercises()">
        Guardar rutina
      </button>
    </footer>
  </div>
</template>

<style scoped>
.routine-planner {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--color-bg, #f5f5f5);
  display: flex;
  flex-direction: column;
  color: var(--color-text, #1a1a1a);
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

:root.dark .routine-planner {
  --color-bg: #121212;
  --color-surface: #1E1E1E;
  --color-border: #333;
  --color-text: #E0E0E0;
  --color-text-sec: #999;
  --color-hover: #2a2a2a;
}

.rp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--color-surface, #fff);
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  flex-shrink: 0;
  z-index: 1;
}

.rp-back-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--color-text, #1a1a1a);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rp-back-btn:hover {
  background: var(--color-hover, #f0f0f0);
}

.rp-name-input {
  flex: 1;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  color: var(--color-text, #1a1a1a);
  background: var(--color-bg, #f5f5f5);
  outline: none;
  transition: border-color 0.15s;
}

.rp-name-input:focus {
  border-color: var(--color-primary, #00897B);
}

.rp-name-input::placeholder {
  color: var(--color-text-sec, #888);
  font-weight: 400;
}

.rp-name-static {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text, #1a1a1a);
}

.rp-avatar {
  flex-shrink: 0;
}

.rp-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* ===================== ITEMS PANEL ===================== */

.rp-items-panel {
  width: clamp(180px, 25%, 300px);
  min-width: unset;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border, #e8e8e8);
  background: var(--color-surface, #fff);
}

.rp-search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  flex-shrink: 0;
}

.rp-search-icon {
  color: var(--color-text-sec, #888);
  flex-shrink: 0;
}

.rp-search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text, #1a1a1a);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  padding: 4px 0;
}

.rp-search-input::placeholder {
  color: var(--color-text-sec, #888);
}

.rp-items-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.rp-items-list::-webkit-scrollbar {
  width: 5px;
}
.rp-items-list::-webkit-scrollbar-track {
  background: transparent;
}
.rp-items-list::-webkit-scrollbar-thumb {
  background: var(--color-border, #e8e8e8);
  border-radius: 3px;
}

.rp-item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  cursor: grab;
  user-select: none;
  transition: background 0.12s;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
}

.rp-item-row:active {
  cursor: grabbing;
}

.rp-item-row:hover {
  background: var(--color-hover, #f5f5f5);
}

.rp-item-icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rp-svg-icon {
  width: 18px;
  height: 18px;
  display: block;
  color: currentColor;
}

.rp-item-name {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rp-items-empty {
  text-align: center;
  padding: 24px 0;
  font-size: 13px;
  color: var(--color-text-sec, #888);
}

/* ===================== DROP ZONE ===================== */

.rp-drop-zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 12px;
  border: 2px dashed var(--color-border, #e8e8e8);
  border-radius: 12px;
  background: var(--color-surface, #fff);
  transition: border-color 0.15s, background 0.15s;
  min-height: 200px;
}

.rp-drop-zone.drag-over {
  border-color: var(--color-primary, #00897B);
  background: rgba(0, 137, 123, 0.04);
}

.rp-drop-hint {
  font-size: 14px;
  color: var(--color-text-sec, #bbb);
  text-align: center;
}

.rp-assigned-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
  width: 100%;
}

.rp-assigned-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: var(--color-bg, #f5f5f5);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
}

.rp-assigned-chip:hover {
  background: rgba(229, 57, 53, 0.08);
}

.rp-chip-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.rp-chip-name {
  font-size: 12px;
  font-weight: 500;
}

.rp-chip-remove {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-sec, #888);
  opacity: 0;
  transition: opacity 0.12s;
  margin-left: 2px;
}

.rp-assigned-chip:hover .rp-chip-remove {
  opacity: 1;
}

/* ===================== FOOTER ===================== */

.rp-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-surface, #fff);
  border-top: 1px solid var(--color-border, #e8e8e8);
  flex-shrink: 0;
  gap: 12px;
}

.rp-footer-btn {
  padding: 10px 28px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.rp-cancel-btn {
  background: transparent;
  color: var(--color-text-sec, #888);
  border: 1px solid var(--color-border, #e8e8e8);
}

.rp-cancel-btn:hover {
  background: var(--color-hover, #f0f0f0);
}

.rp-save-btn {
  background: var(--color-primary, #00897B);
  color: #fff;
}

.rp-save-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.rp-save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .rp-body {
    flex-direction: column;
  }
  .rp-items-panel {
    width: 100%;
    max-width: 100%;
    max-height: 30vh;
    border-right: none;
    border-bottom: 1px solid var(--color-border, #e8e8e8);
  }
  .rp-drop-zone {
    margin: 8px;
    padding: 12px;
    min-height: 120px;
  }
  .rp-header {
    padding: 8px 12px;
  }
  .rp-name-input {
    font-size: 13px;
    padding: 6px 10px;
  }
  .rp-footer {
    padding: 8px 12px;
  }
  .rp-footer-btn {
    padding: 8px 16px;
    font-size: 12px;
  }
}
</style>
