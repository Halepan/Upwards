<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useLanguage } from '../composables/useLanguage'
import { themeIcons, themeColors } from '../config/theme.config'
import ProfilePanel from './ProfilePanel.vue'
import SettingsPanel from './SettingsPanel.vue'
import { useAuthStore } from '../store/auth_store'

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
useLanguage()

// Colores reactivos desde theme.config.ts
const currentColors = computed(() =>
  isDark.value ? themeColors.dark : themeColors.light
)
const primaryColor = computed(() => currentColors.value.primary)
const surfaceColor = computed(() => currentColors.value.surface)
const textColor = computed(() => currentColors.value.text)
const textSecondaryColor = computed(() => currentColors.value.textSecondary)
const borderColor = computed(() => currentColors.value.border)

const menuOpen = ref(false)
const profileOpen = ref(false)
const settingsOpen = ref(false)

const sectionTitle: Record<Section, string> = {
  finanzas: 'Finanzas',
  habitos: 'Hábitos',
  fitness: 'Fitness',
}

const tabs: { key: Section; icon: { light: string; dark: string }; label: string }[] = [
  { key: 'finanzas', icon: themeIcons.wallet, label: 'Finanzas' },
  { key: 'habitos', icon: themeIcons.check, label: 'Hábitos' },
  { key: 'fitness', icon: themeIcons.gym, label: 'Fitness' },
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

function handleLogout(): void {
  closeMenu()
  useAuthStore().logout()
}
</script>

<template>
  <div
    class="shell"
    :style="{ backgroundColor: currentColors.background }"
  >
    <header
      class="top-bar"
      :style="{
        backgroundColor: surfaceColor,
        borderBottomColor: borderColor
      }"
    >
      <div class="top-left">
        <button
          v-if="section === 'finanzas'"
          class="history-btn"
          :class="{ 'history-btn-dark': isDark }"
          @click="emit('open-history')"
          :style="{ color: textSecondaryColor }"
        >
          <!-- Icono de historial (left-bar) -->
          <img
            :src="isDark ? themeIcons.leftBar.dark : themeIcons.leftBar.light"
            class="nav-svg-icon"
            alt="history"
          />
        </button>
        <span class="section-title" :style="{ color: textColor }">
          {{ sectionTitle[section] }}
        </span>
      </div>
      <div class="top-right">
        <div class="avatar-wrapper">
          <button
            class="avatar"
            @click="toggleMenu"
            :style="{ backgroundColor: primaryColor }"
          >
            {{ initial(userName) }}
          </button>
          <Transition name="menu-fade">
            <div
              v-if="menuOpen"
              class="avatar-menu"
              @click.stop
              :style="{
                backgroundColor: surfaceColor,
                borderColor: borderColor
              }"
            >
              <div class="menu-header" :style="{ borderBottomColor: borderColor }">
                <span class="menu-user-name" :style="{ color: textColor }">
                  {{ userName }}
                </span>
                <button
                  class="menu-close"
                  @click="closeMenu"
                  :style="{ color: textSecondaryColor }"
                >
                  ×
                </button>
              </div>
              <div class="menu-body">
                <button
                  class="menu-item"
                  @click="closeMenu(); profileOpen = true"
                  :style="{ color: textColor }"
                >
                  Perfil
                </button>
                <button
                  class="menu-item"
                  @click="closeMenu(); settingsOpen = true"
                  :style="{ color: textColor }"
                >
                  Configuración
                </button>
                <button
                  class="menu-item logout-item"
                  @click="handleLogout"
                  :style="{ color: '#c62828' }"
                >
                  Cerrar sesión
                </button>
              </div>
              <div class="menu-footer" :style="{ borderTopColor: borderColor }">
                <button
                  class="theme-toggle-inline"
                  @click="toggleTheme"
                  :style="{
                    backgroundColor: primaryColor,
                    color: 'white'
                  }"
                >
                  <img
                    :src="isDark ? themeIcons.sun.dark : themeIcons.moon.light"
                    class="theme-svg-icon"
                    alt="theme"
                  />
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

    <ProfilePanel :open="profileOpen" @close="profileOpen = false" />
    <SettingsPanel :open="settingsOpen" @close="settingsOpen = false" />

    <nav
      class="bottom-nav"
      :style="{
        backgroundColor: surfaceColor,
        borderTopColor: borderColor
      }"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="nav-tab"
        :class="{ active: section === tab.key }"
        @click="emit('update:section', tab.key)"
        :style="{
          backgroundColor: section === tab.key ? primaryColor : 'transparent',
          borderRadius: '8px',
          margin: '4px',
          padding: section === tab.key ? '4px 12px' : '4px'
        }"
      >
        <img
          :src="isDark ? tab.icon.dark : tab.icon.light"
          class="nav-svg-icon"
          :alt="tab.label"
          :style="{
            color: section === tab.key ? 'white' : textSecondaryColor
          }"
        />
        <span
          class="nav-label"
          :style="{
            color: section === tab.key ? 'white' : textSecondaryColor
          }"
        >
          {{ tab.label }}
        </span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  transition: background 0.3s;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: clamp(48px, 7vw, 56px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(8px, 2vw, 16px);
  border-bottom: 1px solid;
  z-index: 50;
  transition: background 0.3s, border-color 0.3s;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  font-family: inherit;
}

.history-btn .nav-svg-icon {
  width: 22px;
  height: 22px;
}

.history-btn-dark {
  background: var(--color-primary, #FFD700);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
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
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  border: 1px solid;
  z-index: 100;
  overflow: hidden;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid;
}

.menu-user-name {
  font-weight: 600;
  font-size: 14px;
}

.menu-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
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
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.menu-item:hover {
  background: var(--color-hover);
}

.menu-footer {
  border-top: 1px solid;
  padding: 8px 12px;
}

.logout-item {
  border-top: 1px solid var(--color-border);
  margin-top: 4px;
}

.theme-toggle-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s;
}

.theme-toggle-inline:hover {
  opacity: 0.85;
}

.shell-content {
  flex: 1;
  padding-top: clamp(48px, 7vw, 56px);
  padding-bottom: clamp(60px, 10vw, 72px);
  overflow-y: auto;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: clamp(56px, 8vw, 64px);
  display: flex;
  border-top: 1px solid;
  z-index: 50;
  transition: background 0.3s, border-color 0.3s;
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
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-radius 0.2s;
  padding: 4px;
}

.nav-svg-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.theme-svg-icon {
  width: 16px;
  height: 16px;
  display: block;
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
    font-size: clamp(16px, 4vw, 17px);
  }
  .avatar-menu {
    width: min(200px, 85vw);
    right: -8px;
  }
  .nav-svg-icon {
    width: clamp(18px, 4vw, 20px);
    height: clamp(18px, 4vw, 20px);
  }
  .nav-label {
    font-size: clamp(9px, 2.5vw, 10px);
  }
}
</style>