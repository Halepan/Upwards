<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme'
import { themeColors } from '../config/theme.config'
import SlidePanel from './SlidePanel.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { isDark } = useTheme()

const currentColors = computed(() =>
  isDark.value ? themeColors.dark : themeColors.light
)

const isOnline = ref(navigator.onLine)

function onOnline() { isOnline.value = true }
function onOffline() { isOnline.value = false }

onMounted(() => {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
})

const username = ref('')
const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

function saveUsername() {}
function saveEmail() {}
function savePassword() {}

const showDeleteConfirm = ref(false)

function confirmDelete() {
  showDeleteConfirm.value = true
}

function executeDelete() {
  showDeleteConfirm.value = false
}

function cancelDelete() {
  showDeleteConfirm.value = false
}
</script>

<template>
  <SlidePanel :open="open" title="Perfil" side="left" @close="emit('close')">
    <div class="profile-form">
      <div class="ff-field">
        <span class="ff-label">Cambiar nombre de usuario</span>
        <div class="online-field">
          <input v-model="username" type="text" class="ff-input" placeholder="Nuevo nombre de usuario" :disabled="!isOnline" />
          <span v-if="!isOnline" class="offline-badge">Sin conexion</span>
        </div>
        <button v-if="isOnline" class="ff-btn save btn-small" @click="saveUsername" :disabled="!username.trim()">Guardar</button>
      </div>

      <div class="ff-field">
        <span class="ff-label">Cambiar correo electronico</span>
        <div class="online-field">
          <input v-model="email" type="email" class="ff-input" placeholder="Nuevo correo electronico" :disabled="!isOnline" />
          <span v-if="!isOnline" class="offline-badge">Sin conexion</span>
        </div>
        <button v-if="isOnline" class="ff-btn save btn-small" @click="saveEmail" :disabled="!email.trim()">Guardar</button>
      </div>

      <div class="ff-field">
        <span class="ff-label">Cambiar contrasena</span>
        <div class="online-field">
          <div class="password-group">
            <input v-model="newPassword" type="password" class="ff-input" placeholder="Nueva contrasena" :disabled="!isOnline" />
            <input v-model="confirmPassword" type="password" class="ff-input" placeholder="Confirmar contrasena" :disabled="!isOnline" />
          </div>
          <span v-if="!isOnline" class="offline-badge">Sin conexion</span>
        </div>
        <button v-if="isOnline" class="ff-btn save btn-small" @click="savePassword" :disabled="!newPassword.trim() || !confirmPassword.trim()">Guardar</button>
      </div>

      <div class="ff-divider"></div>

      <div class="ff-field">
        <span class="ff-label danger-label">Zona de peligro</span>
        <button class="ff-btn delete-btn" @click="confirmDelete">Eliminar cuenta</button>
      </div>

      <Teleport to="body">
        <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="cancelDelete">
          <div class="confirm-dialog" :style="{ backgroundColor: currentColors.surface }">
            <p class="confirm-text">Estas seguro de que deseas eliminar tu cuenta? Esta accion no se puede deshacer.</p>
            <div class="confirm-actions">
              <button class="ff-btn cancel" @click="cancelDelete">Cancelar</button>
              <button class="ff-btn delete-btn confirm-delete" @click="executeDelete">Eliminar</button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </SlidePanel>
</template>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 4px 20px;
}

.ff-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ff-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ff-input {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-input-bg);
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.ff-input:focus {
  border-color: var(--color-primary);
}

.ff-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ff-btn {
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.ff-btn.save {
  background: var(--color-primary);
  color: #fff;
}

.ff-btn.save:hover:not(:disabled) {
  opacity: 0.85;
}

.ff-btn.save:disabled {
  opacity: 0.4;
  cursor: default;
}

.ff-btn.cancel {
  background: var(--color-border);
  color: var(--color-text);
}

.ff-btn.cancel:hover {
  opacity: 0.8;
}

.btn-small {
  padding: 8px 14px;
  align-self: flex-start;
}

.online-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.offline-badge {
  font-size: 11px;
  font-weight: 500;
  color: #e65100;
  padding: 2px 0;
}

.password-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ff-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

.danger-label {
  color: #c62828;
}

:root.dark .danger-label {
  color: #ef5350;
}

.delete-btn {
  background: #c62828;
  color: #fff;
}

.delete-btn:hover {
  opacity: 0.85;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog {
  padding: 24px;
  border-radius: 16px;
  width: 320px;
  max-width: 85vw;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.confirm-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 8px;
}

.confirm-actions .ff-btn {
  flex: 1;
}

.confirm-delete {
  background: #c62828;
  color: #fff;
}
</style>
