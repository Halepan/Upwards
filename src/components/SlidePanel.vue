<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
  side?: 'left' | 'right'
}>()

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const animating = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    visible.value = true
    requestAnimationFrame(() => { animating.value = true })
  } else {
    animating.value = false
    setTimeout(() => { visible.value = false }, 300)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="panel-overlay">
      <div v-if="visible && animating" class="panel-overlay" @click="emit('close')" />
    </Transition>

    <div
      v-if="visible"
      class="slide-panel"
      :class="[side ?? 'left', { open: animating }]"
    >
      <div class="panel-header">
        <button class="panel-close" @click="emit('close')">×</button>
        <h3 class="panel-title">{{ title }}</h3>
      </div>
      <div class="panel-body">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.3);
}

.slide-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 201;
  width: 85%;
  max-width: 360px;
  background: var(--color-surface, #fff);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

@media (max-width: 480px) {
  .slide-panel {
    width: 100%;
    max-width: 100%;
  }
}

.slide-panel.left {
  left: 0;
  transform: translateX(-100%);
}

.slide-panel.right {
  right: 0;
  transform: translateX(100%);
}

.slide-panel.open {
  transform: translateX(0);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
}

.panel-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-secondary, #666);
  padding: 4px;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text, #1a1a1a);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.panel-overlay-enter-active,
.panel-overlay-leave-active {
  transition: opacity 0.3s;
}
.panel-overlay-enter-from,
.panel-overlay-leave-to {
  opacity: 0;
}
</style>
