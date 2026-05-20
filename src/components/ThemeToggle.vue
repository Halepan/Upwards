<script setup lang="ts">
/* Botón de cambio de tema oscuro/claro.
   Muestra icono de luna o sol según el tema actual.
   Persiste en localStorage vía useTheme composable. */
import { useTheme } from '../composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    :title="theme === 'dark' ? 'Modo claro' : 'Modo oscuro'"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <!-- TODO: Reemplazar con icono Lucide Sun / Moon -->
    <span class="icon-placeholder icon-theme"></span>
  </button>
</template>

<style scoped>
.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  padding: 0;
}

.theme-toggle:hover {
  box-shadow: var(--shadow-md);
}

.icon-placeholder {
  width: 20px;
  height: 20px;
  background: var(--color-border);
  border-radius: 50%;
}
</style>