<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import { useAuthStore } from '../store/auth_store'
import { useTheme } from '../composables/useTheme'
import { themeIcons, themeColors } from '../config/theme.config'

const emit = defineEmits<{ switchToRegister: [] }>()

const { t } = useLanguage()
const { isDark } = useTheme()
const auth = useAuthStore()

// Colores reactivos desde theme.config.ts
const currentColors = computed(() =>
  isDark.value ? themeColors.dark : themeColors.light
)
const primaryColor = computed(() => currentColors.value.primary)
const surfaceColor = computed(() => currentColors.value.surface)
const textColor = computed(() => currentColors.value.text)
const textSecondaryColor = computed(() => currentColors.value.textSecondary)
const borderColor = computed(() => currentColors.value.border)
const inputBgColor = computed(() => currentColors.value.inputBg)

// Sombra NEGRA intensa (visible en cualquier fondo)
const panelShadow = computed(() =>
  isDark.value
    ? '0 12px 40px rgba(0, 0, 0, 0.6)'   // modo oscuro: más opacidad
    : '0 12px 40px rgba(0, 0, 0, 0.25)'  // modo claro: sombra negra marcada
)

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const touched = ref({ email: false, password: false })

const emailError = computed(() => {
  if (!touched.value.email || !email.value) return ''
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.value) ? '' : t('auth.email.invalid')
})

const passwordError = computed(() => {
  if (!touched.value.password || !password.value) return ''
  return password.value.length >= 6 ? '' : t('auth.password.minLength')
})

const isValid = computed(() => !emailError.value && !passwordError.value && email.value && password.value)

async function handleSubmit(): Promise<void> {
  touched.value.email = true
  touched.value.password = true
  if (!isValid.value) return

  auth.clearError()
  await auth.login(email.value, password.value)
}

function onRegisterClick(): void {
  auth.clearError()
  emit('switchToRegister')
}
</script>

<template>
  <div
    class="login-panel"
    :style="{
      backgroundColor: surfaceColor,
      color: textColor,
      boxShadow: panelShadow
    }"
  >
    <h2 class="panel-title" :style="{ color: textColor }">
      {{ t('auth.login.title') }}
    </h2>

    <form class="auth-form" @submit.prevent="handleSubmit" novalidate>
      <!-- Email -->
      <div class="field">
        <label for="login-email" :style="{ color: textSecondaryColor }">
          {{ t('auth.email.label') }}
        </label>
        <div class="input-wrapper" :class="{ error: emailError }" :style="{ borderColor: borderColor, backgroundColor: inputBgColor }">
          <span class="icon-circle" :style="{ backgroundColor: isDark ? primaryColor : 'transparent' }">
            <img :src="isDark ? themeIcons.email.dark : themeIcons.email.light" class="input-svg-icon" alt="" />
          </span>
          <input
            id="login-email"
            v-model="email"
            type="email"
            :placeholder="t('auth.email.placeholder')"
            autocomplete="email"
            @blur="touched.email = true"
            :style="{ color: textColor }"
          />
        </div>
        <span v-if="emailError" class="field-error">{{ emailError }}</span>
      </div>

      <!-- Contraseña -->
      <div class="field">
        <label for="login-password" :style="{ color: textSecondaryColor }">
          {{ t('auth.password.label') }}
        </label>
        <div class="input-wrapper" :class="{ error: passwordError }" :style="{ borderColor: borderColor, backgroundColor: inputBgColor }">
          <span class="icon-circle" :style="{ backgroundColor: isDark ? primaryColor : 'transparent' }">
            <img :src="isDark ? themeIcons.lock.dark : themeIcons.lock.light" class="input-svg-icon" alt="" />
          </span>
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.password.placeholder')"
            autocomplete="current-password"
            @blur="touched.password = true"
            :style="{ color: textColor }"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            tabindex="-1"
          >
            <span class="icon-circle" :style="{ backgroundColor: isDark ? primaryColor : 'transparent' }">
              <img
                :src="showPassword
                  ? (isDark ? themeIcons.eyeOff.dark : themeIcons.eyeOff.light)
                  : (isDark ? themeIcons.eyeOn.dark : themeIcons.eyeOn.light)"
                class="eye-svg-icon"
                :alt="showPassword ? 'Ocultar' : 'Mostrar'"
              />
            </span>
          </button>
        </div>
        <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
      </div>

      <!-- Error global -->
      <Transition name="fade">
        <p v-if="auth.error" class="error-global">{{ t(auth.error) }}</p>
      </Transition>

      <!-- Botón -->
      <button type="submit" class="btn-primary" :disabled="auth.isLoading || !isValid" :style="{ backgroundColor: primaryColor }">
        {{ auth.isLoading ? t('auth.loading') : t('auth.login.button') }}
      </button>
    </form>

    <p class="switch-link" :style="{ color: textSecondaryColor }">
      {{ t('auth.login.noAccount') }}
      <button class="link" @click="onRegisterClick" :style="{ color: primaryColor }">
        {{ t('auth.login.registerLink') }}
      </button>
    </p>
  </div>
</template>

<style scoped>
.login-panel {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  border-radius: 16px;
  box-sizing: border-box;
  transition: background 0.3s, color 0.3s, box-shadow 0.3s;
}

.panel-title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 50px;
  border: 1px solid;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.input-wrapper.error {
  border-color: #e53935;
}

.input-wrapper.error:focus-within {
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.2);
}

/* Círculo de fondo para iconos (amarillo en modo oscuro, transparente en claro) */
.icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.3s ease;
}

.input-svg-icon,
.eye-svg-icon {
  width: 18px;
  height: 18px;
  display: block;
  opacity: 0.8;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: 15px;
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: var(--color-text-disabled);
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.toggle-password:hover {
  opacity: 1;
}

.field-error {
  font-size: 12px;
  color: #e53935;
  min-height: 16px;
}

.error-global {
  font-size: 13px;
  color: #e53935;
  text-align: center;
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(229, 57, 53, 0.08);
}

.btn-primary {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  font-family: inherit;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-link {
  margin: 20px 0 0;
  text-align: center;
  font-size: 14px;
}

.link {
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
}

.link:hover {
  opacity: 0.8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>