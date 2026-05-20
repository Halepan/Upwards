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

const { lang } = useLanguage()

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
          <svg
            class="logo-u"
            width="36"
            height="36"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              class="logo-u-shape"
              d="M16 16V48C16 56.8366 23.1634 64 32 64H48C56.8366 64 64 56.8366 64 48V16"
              stroke="currentColor"
              stroke-width="7"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
            <path
              class="logo-arrow"
              d="M52 28L64 16L76 28"
              stroke="currentColor"
              stroke-width="7"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
            <line
              x1="64"
              y1="16"
              x2="64"
              y2="46"
              stroke="currentColor"
              stroke-width="7"
              stroke-linecap="round"
            />
          </svg>
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
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.app-name .logo-u {
  color: #00897b; /* modo claro */
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  margin-right: 1px;
}

:root.dark .app-name .logo-u {
  color: #ffd700; /* modo oscuro */
}

.tagline {
  margin: 6px 0 0;
  font-size: 18px;
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