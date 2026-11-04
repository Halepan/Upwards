<script setup lang="ts">
import { ref } from 'vue'

export interface FabAction {
  icon: string
  label: string
  action: () => void
}

const props = defineProps<{
  actions: FabAction[]
}>()

const expanded = ref(false)

function toggle(): void {
  expanded.value = !expanded.value
}

defineExpose({ expanded })
</script>

<template>
  <div class="fab-wrapper">
    <TransitionGroup name="fab-opt" tag="div" class="fab-options" v-show="expanded">
      <button
  v-for="act in actions"
  :key="act.label"
  class="fab-option"
  @click="act.action"
        >
  <img :src="act.icon" class="fab-opt-icon" alt="" />
  <span class="fab-opt-label">{{ act.label }}</span>
      </button>
    </TransitionGroup>

    <button
      class="fab"
      @click="toggle"
      :class="{ expanded }"
    >
      <span class="fab-plus">{{ expanded ? '×' : '+' }}</span>
    </button>
  </div>
</template>

<style scoped>
.fab-wrapper {
  position: fixed;
  bottom: clamp(76px, 12vw, 88px);
  right: clamp(12px, 3vw, 20px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.fab-options {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.fab-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: var(--color-surface, #fff);
  color: var(--color-text, #1a1a1a);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.fab-option:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
}

.fab-opt-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.fab-opt-label {
  font-size: 13px;
}

.fab {
  width: clamp(48px, 8vw, 56px);
  height: clamp(48px, 8vw, 56px);
  border: none;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: clamp(24px, 4vw, 28px);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

.fab.expanded {
  transform: rotate(45deg);
}

.fab-plus {
  transition: transform 0.3s;
  line-height: 1;
}

.fab-opt-enter-active,
.fab-opt-leave-active {
  transition: all 0.25s ease;
}

.fab-opt-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.fab-opt-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.9);
}
</style>
