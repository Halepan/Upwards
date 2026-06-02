<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import sunIcon from '../assets/icons/tabler--sun-high-filled.svg'
import moonIcon from '../assets/icons/stash--moon-solid.svg'

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    class="theme-slider"
    :title="isDark ? 'Modo claro' : 'Modo oscuro'"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <img :src="sunIcon" class="slider-icon sun" alt="" />
    <div class="slider-track">
      <div class="slider-thumb" :class="{ dark: isDark }">
        <img :src="isDark ? moonIcon : sunIcon" class="thumb-icon" alt="" />
      </div>
    </div>
    <img :src="moonIcon" class="slider-icon moon" alt="" />
  </button>
</template>

<style scoped>
.theme-slider {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: 50px;
  background: var(--color-surface);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  font-family: inherit;
}

.theme-slider:hover {
  box-shadow: var(--shadow-md);
}

.slider-icon {
  width: 16px;
  height: 16px;
  display: block;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.slider-icon.sun {
  color: #f59e0b;
}

.slider-icon.moon {
  color: #6366f1;
}

.slider-track {
  position: relative;
  width: 32px;
  height: 18px;
  border-radius: 9px;
  background: var(--color-border);
  transition: background 0.3s ease;
}

.slider-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, background 0.3s ease;
  z-index: 1;
}

.slider-thumb.dark {
  transform: translateX(14px);
}

.thumb-icon {
  width: 10px;
  height: 10px;
  display: block;
  color: var(--color-text);
}
</style>
