<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import { useAuthStore } from '../store/auth_store'
import { useTheme } from '../composables/useTheme'
import emailLight from '../assets/icons/clarity--email-light.svg'
import emailDark from '../assets/icons/clarity--email-dark.svg'
import lockLight from '../assets/icons/material-symbols-light--lock.svg'
import lockDark from '../assets/icons/material-symbols-light--lock-outline.svg'
import eyeOnLight from '../assets/icons/mdi--eye.svg'
import eyeOnDark from '../assets/icons/mdi--eye-outline.svg'
import eyeOffLight from '../assets/icons/mdi--eye-off.svg'
import eyeOffDark from '../assets/icons/mdi--eye-off-outline.svg'

const emit = defineEmits<{ switchToRegister: [] }>()

const { t } = useLanguage()
const { isDark } = useTheme()
const auth = useAuthStore()

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
  <div class="login-panel">
    <h2 class="panel-title">{{ t('auth.login.title') }}</h2>

    <form class="auth-form" @submit.prevent="handleSubmit" novalidate>
      <!-- Email -->
      <div class="field">
        <label for="login-email">{{ t('auth.email.label') }}</label>
        <div class="input-wrapper" :class="{ error: emailError }">
          <img :src="isDark ? emailDark : emailLight" class="input-svg-icon" alt="" />
          <input
            id="login-email"
            v-model="email"
            type="email"
            :placeholder="t('auth.email.placeholder')"
            autocomplete="email"
            @blur="touched.email = true"
          />
        </div>
        <span v-if="emailError" class="field-error">{{ emailError }}</span>
      </div>

      <!-- Contraseña -->
      <div class="field">
        <label for="login-password">{{ t('auth.password.label') }}</label>
        <div class="input-wrapper" :class="{ error: passwordError }">
          <img :src="isDark ? lockDark : lockLight" class="input-svg-icon" alt="" />
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.password.placeholder')"
            autocomplete="current-password"
            @blur="touched.password = true"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            tabindex="-1"
          >
            <img
              :src="showPassword
                ? (isDark ? eyeOffDark : eyeOffLight)
                : (isDark ? eyeOnDark : eyeOnLight)"
              class="eye-svg-icon"
              :alt="showPassword ? 'Ocultar' : 'Mostrar'"
            />
          </button>
        </div>
        <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
      </div>

      <!-- Error global -->
      <Transition name="fade">
        <p v-if="auth.error" class="error-global">{{ t(auth.error) }}</p>
      </Transition>

      <!-- Botón -->
      <button type="submit" class="btn-primary" :disabled="auth.isLoading || !isValid">
        {{ auth.isLoading ? t('auth.loading') : t('auth.login.button') }}
      </button>
    </form>

    <p class="switch-link">
      {{ t('auth.login.noAccount') }}
      <button class="link" @click="onRegisterClick">{{ t('auth.login.registerLink') }}</button>
    </p>
  </div>
</template>

<style scoped>
.login-panel {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  box-sizing: border-box;
}

.panel-title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
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
  color: var(--color-text-secondary);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 50px;
  border: 1px solid var(--color-border);
  background: var(--color-input-bg);
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

.input-svg-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: block;
  opacity: 0.5;
  color: currentColor;
}

.eye-svg-icon {
  width: 20px;
  height: 20px;
  display: block;
  color: currentColor;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: 15px;
  color: var(--color-text);
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: var(--color-text-disabled);
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
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
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease, box-shadow 0.3s ease;
  font-family: inherit;
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 4px 12px var(--color-primary-alpha);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-link {
  margin: 20px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.link {
  background: none;
  border: none;
  color: var(--color-primary);
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