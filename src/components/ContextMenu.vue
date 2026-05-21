<script setup lang="ts">
import { Teleport } from 'vue'
import type { ContextMenuItem } from '../composables/useLongPress'

const props = defineProps<{
  visible: boolean
  items: ContextMenuItem[]
  x: number
  y: number
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="ctx-fade">
      <div v-if="visible" class="ctx-overlay" @click="emit('close')" @contextmenu.prevent>
        <div
          class="ctx-menu"
          :style="{ left: x + 'px', top: y + 'px' }"
          @click.stop
        >
          <button
            v-for="item in items"
            :key="item.label"
            class="ctx-item"
            @click="item.action(); emit('close')"
          >
            <span class="ctx-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.2);
}

.ctx-menu {
  position: absolute;
  min-width: 160px;
  background: var(--color-surface, #fff);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
  padding: 4px;
  overflow: hidden;
  transform: translate(-50%, 8px);
}

.ctx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--color-text, #1a1a1a);
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
  font-family: inherit;
}

.ctx-item:hover {
  background: var(--color-hover, rgba(0,0,0,0.05));
}

.ctx-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.ctx-fade-enter-active,
.ctx-fade-leave-active {
  transition: opacity 0.2s ease;
}
.ctx-fade-enter-from,
.ctx-fade-leave-to {
  opacity: 0;
}
</style>
