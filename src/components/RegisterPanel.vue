<script setup lang="ts">
/* Panel de registro de usuario.
   Valida nombre único contra Dexie local y Supabase remoto.
   Contiene campos de nombre, email, contraseña, confirmar contraseña y botón de registro. */
import { ref, computed } from 'vue'
import { useLanguage } from '../composables/useLanguage'
import { useAuthStore } from '../store/auth_store'
import { UserRepository } from '../repository/user_repository'
import { db } from '../lib/db'

const emit = defineEmits<{ switchToLogin: [] }>()

const { t } = useLanguage()
const auth = useAuthStore()
const userRepo = new UserRepository(db.users)

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const touched = ref({ username: false, email: false, password: false, confirmPassword: false })
const checkingUsername = ref(false)

const usernameError = computed(() => {
  if (!touched.value.username || !username.value) return ''
  return username.value.length >= 2 ? '' : t('auth.required')
})

const emailError = computed(() => {
  if (!touched.value.email || !email.value) return ''
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.value) ? '' : t('auth.email.invalid')
})

const passwordError = computed(() => {
  if (!touched.value.password || !password.value) return ''
  return password.value.length >= 6 ? '' : t('auth.password.minLength')
})

const confirmPasswordError = computed(() => {
  if (!touched.value.confirmPassword || !confirmPassword.value) return ''
  return confirmPassword.value === password.value ? '' : t('auth.password.mismatch')
})

const isValid = computed(
  () => !usernameError.value && !emailError.value && !passwordError.value && !confirmPasswordError.value
    && username.value && email.value && password.value && confirmPassword.value
)

async function validateUsername(): Promise<void> {
  touched.value.username = true
  if (!username.value || username.value.length < 2) return

  checkingUsername.value = true
  const exists = await userRepo.nameExists(username.value)
  checkingUsername.value = false

  if (exists) {
    auth.error = 'auth.username.taken'
  }
}

async function handleSubmit(): Promise<void> {
  touched.value.username = true
  touched.value.email = true
  touched.value.password = true
  touched.value.confirmPassword = true
  if (!isValid.value) return

  await auth.register(username.value, email.value, password.value)
}

function onBackToLogin(): void {
  auth.clearError()
  emit('switchToLogin')
}
</script>

<template>
  <div class="register-panel">
    <h2 class="panel-title">{{ t('auth.register.title') }}</h2>

    <form class="auth-form" @submit.prevent="handleSubmit" novalidate>
      <!-- Nombre de usuario -->
      <div class="field">
        <label for="reg-username">{{ t('auth.username.label') }}</label>
        <div class="input-wrapper" :class="{ error: usernameError || auth.error === 'auth.username.taken' }">
          <!-- TODO: Reemplazar con icono Lucide User -->
          <span class="input-icon icon-placeholder icon-user"></span>
          <input
            id="reg-username"
            v-model="username"
            type="text"
            :placeholder="t('auth.username.placeholder')"
            autocomplete="username"
            @blur="validateUsername()"
          />
          <span v-if="checkingUsername" class="input-spinner" />
        </div>
        <span v-if="usernameError && auth.error !== 'auth.username.taken'" class="field-error">
          {{ usernameError }}
        </span>
        <span v-if="auth.error === 'auth.username.taken'" class="field-error">
          {{ t('auth.username.taken') }}
        </span>
      </div>

      <!-- Email -->
      <div class="field">
        <label for="reg-email">{{ t('auth.email.label') }}</label>
        <div class="input-wrapper" :class="{ error: emailError }">
          <!-- TODO: Reemplazar con icono Lucide Mail -->
          <span class="input-icon icon-placeholder icon-mail"></span>
          <input
            id="reg-email"
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
        <label for="reg-password">{{ t('auth.password.label') }}</label>
        <div class="input-wrapper" :class="{ error: passwordError }">
          <!-- TODO: Reemplazar con icono Lucide Lock -->
          <span class="input-icon icon-placeholder icon-lock"></span>
          <input
            id="reg-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.password.placeholder')"
            autocomplete="new-password"
            @blur="touched.password = true"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            tabindex="-1"
          >
            <!-- TODO: Reemplazar con icono Lucide Eye / EyeOff -->
            <span class="icon-placeholder icon-eye"></span>
          </button>
        </div>
        <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
      </div>

      <!-- Confirmar contraseña -->
      <div class="field">
        <label for="reg-confirm-password">{{ t('auth.password.confirmLabel') }}</label>
        <div class="input-wrapper" :class="{ error: confirmPasswordError }">
          <!-- TODO: Reemplazar con icono Lucide Lock -->
          <span class="input-icon icon-placeholder icon-lock"></span>
          <input
            id="reg-confirm-password"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :placeholder="t('auth.password.confirmPlaceholder')"
            autocomplete="off"
            @blur="touched.confirmPassword = true"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            tabindex="-1"
          >
            <!-- TODO: Reemplazar con icono Lucide Eye / EyeOff -->
            <span class="icon-placeholder icon-eye"></span>
          </button>
        </div>
        <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
      </div>

      <!-- Error global -->
      <Transition name="fade">
        <p v-if="auth.error && auth.error !== 'auth.username.taken'" class="error-global">
          {{ t(auth.error) }}
        </p>
      </Transition>

      <!-- Botón -->
      <button type="submit" class="btn-primary" :disabled="auth.isLoading || !isValid || checkingUsername">
        {{ auth.isLoading ? t('auth.loading') : t('auth.register.button') }}
      </button>
    </form>

    <p class="switch-link">
      {{ t('auth.register.hasAccount') }}
      <button class="link" @click="onBackToLogin">{{ t('auth.register.loginLink') }}</button>
    </p>
  </div>
</template>

<style scoped>
/* ... exactamente el mismo CSS que en el LoginPanel (bordes ovalados, placeholders, etc.) ... */
.register-panel {
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

.input-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  background: var(--color-border);
  border-radius: 50%;
  opacity: 0.5;
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

.input-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.toggle-password .icon-placeholder {
  width: 20px;
  height: 20px;
  background: var(--color-border);
  border-radius: 50%;
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