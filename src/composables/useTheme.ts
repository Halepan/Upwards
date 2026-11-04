import { ref, watch } from 'vue'
import { themeColors } from '../config/theme.config'

const isDark = ref(localStorage.getItem('upwards-theme') === 'dark')

function applyTheme(dark: boolean) {
  const colors = dark ? themeColors.dark : themeColors.light
  const root = document.documentElement
  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-primary-alpha', colors.primaryAlpha)
  root.style.setProperty('--color-bg', colors.background)
  root.style.setProperty('--color-surface', colors.surface)
  root.style.setProperty('--color-text', colors.text)
  root.style.setProperty('--color-text-secondary', colors.textSecondary)
  root.style.setProperty('--color-border', colors.border)
  root.style.setProperty('--color-input-bg', colors.inputBg)
  root.style.setProperty('--color-hover', colors.hover)

  // Clase para CSS adicional
  if (dark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Aplicar al iniciar
applyTheme(isDark.value)

// Guardar en localStorage y aplicar al cambiar
watch(isDark, (val) => {
  localStorage.setItem('upwards-theme', val ? 'dark' : 'light')
  applyTheme(val)
})

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}