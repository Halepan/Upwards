<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useLanguage } from '../composables/useLanguage'

export type Section = 'finanzas' | 'habitos' | 'fitness'

const props = defineProps<{
  section: Section
  userName: string
}>()

const emit = defineEmits<{
  'update:section': [value: Section]
  'open-history': []
}>()

const { toggle: toggleTheme, isDark } = useTheme()
const { t } = useLanguage()

const menuOpen = ref(false)

const sectionTitle: Record<Section, string> = {
  finanzas: 'Finanzas',
  habitos: 'Hábitos',
  fitness: 'Fitness',
}

const tabs: { key: Section; icon: string; label: string }[] = [
  { key: 'finanzas', icon: '💰', label: 'Finanzas' },
  { key: 'habitos', icon: '✅', label: 'Hábitos' },
  { key: 'fitness', icon: '💪', label: 'Fitness' },
]

function initial(name: string): string {
  return name.charAt(0).toUpperCase()
}

function toggleMenu(): void {
  menuOpen.value = !menuOpen.value
}

function closeMenu(): void {
  menuOpen.value = false
}
</script>

<template>
  <div class="shell">
    <header class="top-bar">
      <div class="top-left">
        <button v-if="section === 'finanzas'" class="history-btn" @click="emit('open-history')">
          🕐
        </button>
        <span class="section-title">{{ sectionTitle[section] }}</span>
      </div>
      <div class="top-right">
        <div class="avatar-wrapper">
          <button class="avatar" @click="toggleMenu">{{ initial(userName) }}</button>
          <Transition name="menu-fade">
            <div v-if="menuOpen" class="avatar-menu" @click.stop>
              <div class="menu-header">
                <span class="menu-user-name">{{ userName }}</span>
                <button class="menu-close" @click="closeMenu">✕</button>
              </div>
              <div class="menu-body">
                <button class="menu-item" @click="closeMenu">Perfil</button>
                <button class="menu-item" @click="closeMenu">Configuración</button>
              </div>
              <div class="menu-footer">
                <button class="theme-toggle-inline" @click="toggleTheme">
                  <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
                  <span>{{ isDark ? 'Modo claro' : 'Modo oscuro' }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <main class="shell-content" @click="closeMenu">
      <slot />
    </main>

    <nav class="bottom-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="nav-tab"
        :class="{ active: section === tab.key }"
        @click="emit('update:section', tab.key)"
      >
        <span class="nav-icon">{{ tab.icon }}</span>
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 50;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  color: var(--color-text-secondary);
  transition: color 0.2s;
  font-family: inherit;
}

.history-btn:hover {
  color: var(--color-primary);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.top-right {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: opacity 0.2s;
}

.avatar:hover {
  opacity: 0.85;
}

.avatar-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: var(--color-surface);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: 100;
  overflow: hidden;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.menu-user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
}

.menu-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 2px;
  font-family: inherit;
  line-height: 1;
}

.menu-body {
  padding: 4px 0;
}

.menu-item {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.menu-item:hover {
  background: var(--color-hover);
}

.menu-footer {
  border-top: 1px solid var(--color-border);
  padding: 8px 12px;
}

.theme-toggle-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: var(--border-radius-sm);
  background: var(--color-hover);
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.theme-toggle-inline:hover {
  opacity: 0.85;
}

.theme-icon {
  font-size: 16px;
}

.shell-content {
  flex: 1;
  padding-top: 56px;
  padding-bottom: 72px;
  overflow-y: auto;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  z-index: 50;
}

.nav-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: inherit;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px;
}

.nav-tab.active {
  color: var(--color-primary);
}

.nav-icon {
  font-size: 22px;
  line-height: 1;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

@media (max-width: 480px) {
  .section-title {
    font-size: 17px;
  }
  .avatar-menu {
    width: 200px;
    right: -8px;
  }
  .nav-icon {
    font-size: 20px;
  }
  .nav-label {
    font-size: 10px;
  }
}
</style>
