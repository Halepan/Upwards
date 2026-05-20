import { ref, watch } from 'vue'

const THEME_STORAGE_KEY = 'upwards-theme'

type Theme = 'light' | 'dark'

const currentTheme = ref<Theme>(
  (localStorage.getItem(THEME_STORAGE_KEY) as Theme) ?? 'light'
)

/* Aplica las clases CSS al root y persiste en localStorage. */
function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

applyTheme(currentTheme.value)

watch(currentTheme, applyTheme)

export function useTheme() {
  function toggle(): void {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme: currentTheme,
    isDark: currentTheme,
    toggle,
  }
}
