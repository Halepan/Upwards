<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguage, type SupportedLang } from '../composables/useLanguage'
import { useTheme } from '../composables/useTheme'
import { themeColors } from '../config/theme.config'
import worldLight from '../assets/icons/subway--world-light.svg'
import worldDark from '../assets/icons/subway--world-dark.svg'

const { lang, setLang, t } = useLanguage()
const { isDark } = useTheme()
const isOpen = ref(false)

// Color primario reactivo desde theme.config.ts
const currentColors = computed(() =>
  isDark.value ? themeColors.dark : themeColors.light
)
const primaryColor = computed(() => currentColors.value.primary)

interface LanguageOption {
  code: string
  enabled: boolean
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'es', enabled: true, flag: '🇪🇸' },
  { code: 'en', enabled: true, flag: '🇬🇧' },
  { code: 'zh', enabled: false, flag: '🇨🇳' },
  { code: 'hi', enabled: false, flag: '🇮🇳' },
  { code: 'ar', enabled: false, flag: '🇸🇦' },
  { code: 'pt', enabled: false, flag: '🇧🇷' },
  { code: 'bn', enabled: false, flag: '🇧🇩' },
  { code: 'ru', enabled: false, flag: '🇷🇺' },
  { code: 'ja', enabled: false, flag: '🇯🇵' },
  { code: 'pa', enabled: false, flag: '🇵🇰' },
]

function select(code: string): void {
  if (!code) return
  setLang(code as SupportedLang)
  isOpen.value = false
}

function toggle(): void {
  isOpen.value = !isOpen.value
}

function close(): void {
  isOpen.value = false
}
</script>

<template>
  <div class="language-selector" @mouseleave="close">
    <button
      class="trigger"
      @click="toggle"
      :aria-label="t('language.label')"
      :style="{
        backgroundColor: primaryColor,
        borderColor: primaryColor,
        color: 'white'
      }"
    >
      <img :src="isDark ? worldDark : worldLight" class="world-icon" alt="" />
      <span class="code">{{ lang.toUpperCase() }}</span>
      <span class="chevron" :class="{ up: isOpen }">▾</span>
    </button>

    <Transition name="fade">
      <ul v-if="isOpen" class="dropdown">
        <li
          v-for="langOpt in languages"
          :key="langOpt.code"
          :class="{ disabled: !langOpt.enabled, active: langOpt.code === lang }"
          @click="langOpt.enabled && select(langOpt.code)"
        >
          <span class="flag">{{ langOpt.flag }}</span>
          {{ t(`lang.${langOpt.code}`) }}
          <span v-if="langOpt.code === lang" class="check">✓</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.language-selector {
  position: relative;
}

.trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid;
  cursor: pointer;
  font-size: 14px;
  box-shadow: var(--shadow-sm);
  transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  font-family: inherit;
}

.trigger:hover {
  box-shadow: var(--shadow-md);
}

.world-icon {
  width: 16px;
  height: 16px;
  display: block;
  /* Al ser SVG, el color se hereda del padre (blanco) */
}

.code {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.chevron {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.chevron.up {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 170px;
  list-style: none;
  padding: 4px;
  margin: 0;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.dropdown li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text);
  transition: background 0.2s ease;
}

.dropdown li:hover:not(.disabled) {
  background: var(--color-hover);
}

.dropdown li.disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.dropdown li.active {
  font-weight: 600;
}

.flag {
  font-size: 16px;
}

.check {
  color: var(--color-primary);
  font-weight: 700;
  margin-left: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>