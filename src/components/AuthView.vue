<script setup lang="ts">
/* Componente principal de autenticación.
   Contiene el logo, selector de idioma, toggle de tema, indicador de conexión
   y los paneles de login/registro con transición deslizante. */
import { ref } from 'vue'
import ThemeToggle from './ThemeToggle.vue'
import LanguageSelector from './LanguageSelector.vue'
import ConnectionIndicator from './ConnectionIndicator.vue'
import LoginPanel from './LoginPanel.vue'
import RegisterPanel from './RegisterPanel.vue'
import { useLanguage } from '../composables/useLanguage'
import { useTheme } from '../composables/useTheme'
import lightIcon from '../assets/icons/lighticon.svg'
import darkIcon from '../assets/icons/blackicon.svg'

const { lang } = useLanguage()
const { isDark } = useTheme()

const panel = ref<'login' | 'register'>('login')
const transitionDirection = ref<'left' | 'right'>('left')

function switchToRegister(): void {
  transitionDirection.value = 'right'
  panel.value = 'register'
}

function switchToLogin(): void {
  transitionDirection.value = 'left'
  panel.value = 'login'
}
</script>

<template>
  <div class="auth-view" :key="lang">
    <div class="top-bar">
      <ThemeToggle />
      <ConnectionIndicator />
      <LanguageSelector />
    </div>

    <div class="auth-container">
      <div class="auth-header">
        <h1 class="app-name">
          <img
            :src="isDark ? darkIcon : lightIcon"
            alt="U"
            class="logo-u-img"
          />
          PWARDS
        </h1>
        <p class="tagline">Crece cada día</p>
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
  background: var(--color-bg);
  transition: background 0.3s ease;
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
  font-size: 40px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.logo-u-img {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  margin-right: 2px;
  object-fit: contain;
}

.tagline {
  margin: 6px 0 0;
  font-size: 14px;
  font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
  font-weight: 400;
  color: var(--color-text-secondary);
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