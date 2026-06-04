<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { themeIcons, themeColors } from '../config/theme.config'

const { isDark, toggle } = useTheme()

const currentColors = computed(() =>
  isDark.value ? themeColors.dark : themeColors.light
)
const primaryColor = computed(() => currentColors.value.primary)
const surfaceColor = computed(() => currentColors.value.surface)
</script>

<template>
  <button
    class="theme-slider"
    :title="isDark ? 'Modo claro' : 'Modo oscuro'"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    @click="toggle"
    type="button"
  >
    <div class="slider-track" :style="{ backgroundColor: surfaceColor }">
      <img
        :src="isDark ? themeIcons.sun.dark : themeIcons.sun.light"
        class="track-icon left-icon"
        alt="Sol"
      />
      <img
        :src="isDark ? themeIcons.moon.dark : themeIcons.moon.light"
        class="track-icon right-icon"
        alt="Luna"
      />
      <div
        class="slider-thumb"
        :style="{
          backgroundColor: primaryColor,
          transform: isDark ? 'translateX(36px)' : 'translateX(0)'
        }"
      >
        <img
          :src="isDark ? themeIcons.moon.dark : themeIcons.sun.light"
          class="thumb-icon"
          alt=""
        />
      </div>
    </div>
  </button>
</template>

<style scoped>
.theme-slider {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.slider-track {
  position: relative;
  width: clamp(60px, 10vw, 72px);
  height: clamp(30px, 5vw, 36px);
  border-radius: 18px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  transition: background-color 0.3s ease;
}

.track-icon {
  width: clamp(18px, 3vw, 20px);
  height: clamp(18px, 3vw, 20px);
  display: block;
  opacity: 0.8;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  z-index: 1;
}

.slider-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: clamp(26px, 4vw, 30px);
  height: clamp(26px, 4vw, 30px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease, background-color 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.thumb-icon {
  width: clamp(16px, 2.5vw, 18px);
  height: clamp(16px, 2.5vw, 18px);
  display: block;
}
</style>