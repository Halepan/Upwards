<script setup lang="ts">
import { ref, computed } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import LanguageSelector from './LanguageSelector.vue'
import ConnectionIndicator from './ConnectionIndicator.vue'
import LoginPanel from './LoginPanel.vue'
import RegisterPanel from './RegisterPanel.vue'
import { useLanguage } from '../composables/useLanguage'
import { useTheme } from '../composables/useTheme'
import { themeIcons, themeColors } from '../config/theme.config'

const { lang } = useLanguage()
const { isDark } = useTheme()

const currentColors = computed(() =>
  isDark.value ? themeColors.dark : themeColors.light
)

const panel = ref<'login' | 'register'>('login')
const transitionDirection = ref<'left' | 'right'>('left')

function switchToRegister() {
  transitionDirection.value = 'right'
  panel.value = 'register'
}

function switchToLogin() {
  transitionDirection.value = 'left'
  panel.value = 'login'
}
</script>

<template>
  <div
    class="auth-view"
    :key="lang"
    :style="{
      backgroundColor: currentColors.background,
      color: currentColors.text
    }"
  >
    <div class="top-bar">
      <ThemeToggle />
      <ConnectionIndicator />
      <LanguageSelector />
    </div>

    <div class="auth-container">
      <div class="auth-header">
        <h1 class="app-name">
          <img
            :src="isDark ? themeIcons.logo.dark : themeIcons.logo.light"
            alt="U"
            class="logo-u-img"
          />
          PWARDS
        </h1>
        <p class="tagline" :style="{ color: currentColors.textSecondary }">
          Crece cada día
        </p>
      </div>

      <div class="panel-stage">
        <Transition :name="`slide-${transitionDirection}`" mode="out-in">
          <LoginPanel
            v-if="panel === 'login'"
            :key="'login'"
            @switch-to-register="switchToRegister"
          />
          <RegisterPanel
            v-else
            :key="'register'"
            @switch-to-login="switchToLogin"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 0.3s, color 0.3s;
  position: relative;
}

.top-bar {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 100;
}

.top-bar > :first-child {
  margin-right: auto;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 420px;
  padding: 24px 16px;
  box-sizing: border-box;
}

.auth-header {
  text-align: center;
}

.app-name {
  margin: 0;
  font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 39px;
  font-weight: 700;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

/* Logo ajustado: 3 píxeles más ancho, más pegado al texto */
.logo-u-img {
  width: 60px;                /* antes 52px, ahora 55px (+3px) */
  height: 60px;
  flex-shrink: 0;
  margin-right: -20px;        /* mayor solapamiento para eliminar espacio */
  object-fit: contain;
  transform: translateX(-6px); /* ajuste fino adicional */
}

.tagline {
  margin: 6px 0 0;
  font-size: 14px;
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  font-weight: 400;
  opacity: 0.8;
  letter-spacing: 2.5px;
  transform: scaleX(1.05);
  transform-origin: center;
}

.panel-stage {
  width: 100%;
  overflow: hidden;
  
}

/* Transiciones deslizantes */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.35s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>