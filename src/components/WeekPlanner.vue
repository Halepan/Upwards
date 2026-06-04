<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import ContextMenu from './ContextMenu.vue'
import { themeIcons } from '../config/theme.config'

const { isDark } = useTheme()

export interface PlannerItem {
  id: number
  name: string
  icon: string
  [key: string]: any
}

const props = defineProps<{
  items: PlannerItem[]
  title: string
}>()

const emit = defineEmits<{
  confirm: [assignments: Record<number, number[]>]
  cancel: []
  edit: [item: PlannerItem]
  delete: [item: PlannerItem]
}>()

const searchQuery = ref('')
const assignments = ref<Record<number, number[]>>({})
const dragOverDay = ref<number | null>(null)

// click vs drag detection
const mouseStart = ref<{ x: number; y: number; item: PlannerItem } | null>(null)

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items
  const q = searchQuery.value.toLowerCase()
  return props.items.filter(i => i.name.toLowerCase().includes(q))
})

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const dayNamesShort = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

function onMouseDown(item: PlannerItem, event: MouseEvent) {
  mouseStart.value = { x: event.clientX, y: event.clientY, item }
}

function onMouseUp(item: PlannerItem, event: MouseEvent) {
  if (!mouseStart.value) return
  const dx = Math.abs(event.clientX - mouseStart.value.x)
  const dy = Math.abs(event.clientY - mouseStart.value.y)
  const wasDrag = dx > 5 || dy > 5
  mouseStart.value = null
  if (!wasDrag) {
    showContext(item, event)
  }
}

function onTouchStart(item: PlannerItem, event: TouchEvent) {
  const t = event.touches[0]
  mouseStart.value = { x: t.clientX, y: t.clientY, item }
}

function onTouchEnd(item: PlannerItem, event: TouchEvent) {
  if (!mouseStart.value) return
  const t = event.changedTouches[0]
  const dx = Math.abs(t.clientX - mouseStart.value.x)
  const dy = Math.abs(t.clientY - mouseStart.value.y)
  const wasDrag = dx > 5 || dy > 5
  mouseStart.value = null
  if (!wasDrag) {
    showContext(item, event as any)
  }
}

function onDragStart(item: PlannerItem, event: DragEvent) {
  mouseStart.value = null
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', String(item.id))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

function onDragOver(dayIndex: number, event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  dragOverDay.value = dayIndex
}

function onDragLeave() {
  dragOverDay.value = null
}

function onDrop(dayIndex: number, event: DragEvent) {
  event.preventDefault()
  dragOverDay.value = null
  const itemId = parseInt(event.dataTransfer?.getData('text/plain') || '', 10)
  if (!itemId) return
  if (!assignments.value[dayIndex]) {
    assignments.value[dayIndex] = []
  }
  assignments.value[dayIndex].push(itemId)
}

function removeFromDay(dayIndex: number, itemIdx: number) {
  if (assignments.value[dayIndex]) {
    assignments.value[dayIndex].splice(itemIdx, 1)
  }
}

function getItem(id: number): PlannerItem | undefined {
  return props.items.find(i => i.id === id)
}

function hasAssignments(): boolean {
  return Object.values(assignments.value).some(arr => arr.length > 0)
}

// Context menu
const contextVisible = ref(false)
const contextItems = ref<{ icon: string; label: string; action: () => void }[]>([])
const contextX = ref(0)
const contextY = ref(0)
const contextItem = ref<PlannerItem | null>(null)

function showContext(item: PlannerItem, event: MouseEvent | TouchEvent) {
  contextItem.value = item
  const pos = 'touches' in event ? event.touches[0] : event
  contextX.value = pos.clientX
  contextY.value = pos.clientY
  contextItems.value = [
    { icon: isDark.value ? themeIcons.check.dark : themeIcons.check.light, label: 'Editar', action: () => { closeContext(); emit('edit', item) } },
    { icon: isDark.value ? themeIcons.delete.dark : themeIcons.delete.light, label: 'Eliminar', action: () => { closeContext(); showConfirm('delete', item) } },
  ]
  contextVisible.value = true
}

function closeContext() {
  contextVisible.value = false
  contextItem.value = null
}

// Confirmation dialog
const confirmState = ref<{
  type: 'confirm' | 'cancel' | 'delete'
  item?: PlannerItem
} | null>(null)

const confirmMessage = computed(() => {
  if (!confirmState.value) return ''
  switch (confirmState.value.type) {
    case 'confirm': return '¿Estás seguro de confirmar la planificación?'
    case 'cancel': return '¿Estás seguro de cancelar? Los cambios no se guardarán.'
    case 'delete':
      return `¿Estás seguro de eliminar "${confirmState.value.item?.name || ''}"?`
    default: return ''
  }
})

function showConfirm(type: 'confirm' | 'cancel' | 'delete', item?: PlannerItem) {
  confirmState.value = { type, item }
}

function executeConfirm() {
  if (!confirmState.value) return
  const { type, item } = confirmState.value
  confirmState.value = null
  if (type === 'confirm') {
    emit('confirm', assignments.value)
  } else if (type === 'cancel') {
    emit('cancel')
  } else if (type === 'delete' && item) {
    emit('delete', item)
  }
}

function cancelConfirm() {
  confirmState.value = null
}

function repeatLastWeek() {
  // Placeholder: copies assignments from last week
}
</script>

<template>
  <div class="week-planner">
    <header class="planner-header">
      <button class="back-btn" @click="showConfirm('cancel')">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <span class="planner-title">{{ title }}</span>
      <div class="avatar-corner">
        <svg viewBox="0 0 32 32" width="28" height="28" class="avatar-icon">
          <circle cx="16" cy="10" r="4" fill="var(--color-text-sec, #888)" />
          <path d="M6 28c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="none" stroke="var(--color-text-sec, #888)" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
    </header>

    <div class="planner-body">
      <aside class="items-panel">
        <div class="search-wrap">
          <svg viewBox="0 0 24 24" class="search-icon" width="14" height="14">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M16 16l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Buscar..."
          />
        </div>
        <div class="items-list">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="item-row"
            draggable="true"
            @dragstart="onDragStart(item, $event)"
            @mousedown="onMouseDown(item, $event)"
            @mouseup="onMouseUp(item, $event)"
            @touchstart="onTouchStart(item, $event)"
            @touchend="onTouchEnd(item, $event)"
          >
            <span class="item-icon">
              <img v-if="item.icon.endsWith('.svg')" :src="item.icon" class="planner-svg-icon" :alt="item.name" />
              <span v-else>{{ item.icon }}</span>
            </span>
            <span class="item-name">{{ item.name }}</span>
          </div>
          <div v-if="filteredItems.length === 0" class="items-empty">Sin resultados</div>
        </div>
      </aside>

      <div class="week-grid">
        <button class="repeat-btn" @click="repeatLastWeek" title="Repetir semana anterior">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M17 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M3 11v-1a4 4 0 014-4h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7 22l-4-4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M21 13v1a4 4 0 01-4 4H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Repetir semana anterior
        </button>
        <div
          v-for="(_, di) in dayNames"
          :key="di"
          class="day-column"
          :class="{ 'drag-over': dragOverDay === di }"
          @dragover="onDragOver(di, $event)"
          @dragleave="onDragLeave"
          @drop="onDrop(di, $event)"
        >
          <div class="day-header">
            <span class="day-label">{{ dayNamesShort[di] }}</span>
          </div>
          <div class="day-items">
            <div
              v-for="(itemId, idx) in (assignments[di] || [])"
              :key="'d' + di + 'i' + idx + '-' + itemId"
              class="day-item-chip"
              @click="removeFromDay(di, idx)"
              :title="'Quitar ' + (getItem(itemId)?.name || '')"
            >
              <span class="chip-icon">
                <img v-if="getItem(itemId)?.icon?.endsWith('.svg')" :src="getItem(itemId)!.icon" class="planner-svg-icon" :alt="getItem(itemId)?.name || ''" />
                <span v-else>{{ getItem(itemId)?.icon || '?' }}</span>
              </span>
              <span class="chip-name">{{ getItem(itemId)?.name || '?' }}</span>
              <span class="chip-remove">×</span>
            </div>
            <div v-if="!assignments[di] || assignments[di].length === 0" class="day-empty">
              Soltar aquí
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="planner-footer">
      <button class="footer-btn cancel-btn" @click="showConfirm('cancel')">Cancelar</button>
      <button class="footer-btn confirm-btn" @click="showConfirm('confirm')" :disabled="!hasAssignments()">
        Confirmar
      </button>
    </footer>

    <ContextMenu
      :visible="contextVisible"
      :items="contextItems"
      :x="contextX"
      :y="contextY"
      @close="closeContext"
    />

    <Transition name="confirm-fade">
      <div v-if="confirmState" class="confirm-overlay" @click.self="cancelConfirm">
        <div class="confirm-dialog">
          <p class="confirm-msg">{{ confirmMessage }}</p>
          <div class="confirm-actions">
            <button class="confirm-btn-no" @click="cancelConfirm">No</button>
            <button class="confirm-btn-yes" @click="executeConfirm">Sí</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.week-planner {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--color-bg, #f5f5f5);
  display: flex;
  flex-direction: column;
  color: var(--color-text, #1a1a1a);
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

:root.dark .week-planner {
  --color-bg: #121212;
  --color-surface: #1E1E1E;
  --color-border: #333;
  --color-text: #E0E0E0;
  --color-text-sec: #999;
  --color-hover: #2a2a2a;
}

.planner-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--color-surface, #fff);
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  flex-shrink: 0;
  z-index: 1;
}

.back-btn {
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: var(--color-text, #1a1a1a);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.back-btn:hover {
  background: var(--color-hover, #f0f0f0);
}

.planner-title {
  font-size: 16px;
  font-weight: 700;
  flex: 1;
}

.avatar-corner {
  flex-shrink: 0;
}

.planner-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* ===================== ITEMS PANEL (25%) ===================== */

.items-panel {
  width: 25%;
  min-width: 200px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border, #e8e8e8);
  background: var(--color-surface, #fff);
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  flex-shrink: 0;
}

.search-icon {
  color: var(--color-text-sec, #888);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--color-text, #1a1a1a);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  padding: 4px 0;
}

.search-input::placeholder {
  color: var(--color-text-sec, #888);
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.items-list::-webkit-scrollbar {
  width: 5px;
}
.items-list::-webkit-scrollbar-track {
  background: transparent;
}
.items-list::-webkit-scrollbar-thumb {
  background: var(--color-border, #e8e8e8);
  border-radius: 3px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  cursor: grab;
  user-select: none;
  transition: background 0.12s;
  border-bottom: 1px solid transparent;
}

.item-row:active {
  cursor: grabbing;
}

.item-row:hover {
  background: var(--color-hover, #f5f5f5);
}

.item-row:not(:last-child) {
  border-bottom-color: var(--color-border, #f0f0f0);
}

.item-icon {
  font-size: 16px;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.planner-svg-icon {
  width: 18px;
  height: 18px;
  display: block;
  color: currentColor;
}

.item-name {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.items-empty {
  text-align: center;
  padding: 24px 0;
  font-size: 13px;
  color: var(--color-text-sec, #888);
}

/* ===================== WEEK GRID ===================== */

.week-grid {
  flex: 1;
  display: flex;
  overflow-x: auto;
  padding: 8px 8px 8px 0;
  gap: 6px;
  position: relative;
}

.repeat-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 8px;
  background: var(--color-surface, #fff);
  color: var(--color-text-sec, #888);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: all 0.15s;
}

.repeat-btn:hover {
  border-color: var(--color-primary, #00897B);
  color: var(--color-primary, #00897B);
}

.day-column {
  flex: 1;
  min-width: 90px;
  background: var(--color-surface, #fff);
  border-radius: 8px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.15s, background 0.15s;
}

.day-column.drag-over {
  border-color: var(--color-primary, #00897B);
  background: rgba(0, 137, 123, 0.04);
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
  flex-shrink: 0;
}

.day-label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-sec, #888);
  letter-spacing: 2px;
  white-space: nowrap;
}

.day-items {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-items::-webkit-scrollbar {
  width: 3px;
}
.day-items::-webkit-scrollbar-thumb {
  background: var(--color-border, #e8e8e8);
  border-radius: 2px;
}

.day-item-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 6px;
  background: var(--color-bg, #f5f5f5);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
}

.day-item-chip:hover {
  background: rgba(229, 57, 53, 0.08);
}

.chip-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.chip-name {
  font-size: 10px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.chip-remove {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-sec, #888);
  opacity: 0;
  transition: opacity 0.12s;
  flex-shrink: 0;
}

.day-item-chip:hover .chip-remove {
  opacity: 1;
}

.day-empty {
  font-size: 10px;
  color: var(--color-text-sec, #bbb);
  text-align: center;
  padding: 12px 0;
  border: 1px dashed var(--color-border, #e8e8e8);
  border-radius: 6px;
}

/* ===================== FOOTER ===================== */

.planner-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-surface, #fff);
  border-top: 1px solid var(--color-border, #e8e8e8);
  flex-shrink: 0;
  gap: 12px;
}

.footer-btn {
  padding: 10px 28px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.cancel-btn {
  background: transparent;
  color: var(--color-text-sec, #888);
  border: 1px solid var(--color-border, #e8e8e8);
}

.cancel-btn:hover {
  background: var(--color-hover, #f0f0f0);
}

.confirm-btn {
  background: var(--color-primary, #00897B);
  color: #fff;
}

.confirm-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.confirm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===================== CONFIRMATION DIALOG ===================== */

.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog {
  background: var(--color-surface, #fff);
  border-radius: 12px;
  padding: 24px 28px;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.confirm-msg {
  margin: 0 0 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text, #1a1a1a);
  text-align: center;
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-btn-no,
.confirm-btn-yes {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.confirm-btn-no {
  background: transparent;
  color: var(--color-text-sec, #888);
  border: 1px solid var(--color-border, #e8e8e8);
}

.confirm-btn-no:hover {
  background: var(--color-hover, #f0f0f0);
}

.confirm-btn-yes {
  background: var(--color-primary, #00897B);
  color: #fff;
}

.confirm-btn-yes:hover {
  opacity: 0.9;
}

.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s;
}
.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}
</style>
