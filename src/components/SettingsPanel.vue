<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useLanguage, type SupportedLang } from '../composables/useLanguage'
import { themeColors } from '../config/theme.config'
import SlidePanel from './SlidePanel.vue'
import { useAuthStore } from '../store/auth_store'
import { storeToRefs } from 'pinia'
import { db } from '../lib/db'
import { supabase } from '../lib/supabase'
import { UserRepository } from '../repository/user_repository'

const auth = useAuthStore()
const { currentUser } = storeToRefs(auth)
const userRepo = new UserRepository(db.users)

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { isDark, toggle } = useTheme()
const { lang, setLang } = useLanguage()

const currentColors = computed(() =>
  isDark.value ? themeColors.dark : themeColors.light
)
const primaryColor = computed(() => currentColors.value.primary)
const surfaceColor = computed(() => currentColors.value.surface)

type TabKey = 'general' | 'apariencia' | 'acerca-de'

const activeTab = ref<TabKey>('general')

const tabs: { key: TabKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'apariencia', label: 'Apariencia' },
  { key: 'acerca-de', label: 'Acerca de' },
]

const showDeleteConfirm = ref(false)

function confirmDelete() {
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!currentUser.value) return
  const userId = currentUser.value.id
  if (navigator.onLine) {
    const { error } = await supabase.auth.admin.deleteUser(currentUser.value.email || '')
    if (error) console.warn('[Settings] Failed to delete remote user:', error.message)
  }
  await userRepo.delete(userId!)
  auth.logout()
  showDeleteConfirm.value = false
}

function cancelDelete() {
  showDeleteConfirm.value = false
}
</script>

<template>
  <SlidePanel :open="open" title="Configuracion" side="left" @close="emit('close')">
    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="settings-body">
      <div v-if="activeTab === 'general'" class="settings-section">
        <div class="ff-field">
          <span class="ff-label">Idioma</span>
          <select :value="lang" class="ff-select" @change="setLang(($event.target as HTMLSelectElement).value as SupportedLang)">
            <option value="es">Espanol</option>
            <option value="en">English</option>
          </select>
        </div>

        <div class="ff-divider"></div>

        <div class="ff-field">
          <span class="ff-label danger-label">Zona de peligro</span>
          <button class="ff-btn delete-btn" @click="confirmDelete">Eliminar cuenta</button>
        </div>
      </div>

      <div v-if="activeTab === 'apariencia'" class="settings-section">
        <div class="ff-field">
          <span class="ff-label">Modo oscuro</span>
          <div class="theme-row">
            <span class="theme-label">{{ isDark ? 'Oscuro' : 'Claro' }}</span>
            <button
              class="theme-slider"
              @click="toggle"
              type="button"
              :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              <div class="slider-track" :style="{ backgroundColor: surfaceColor }">
                <div
                  class="slider-thumb"
                  :style="{
                    backgroundColor: primaryColor,
                    transform: isDark ? 'translateX(24px)' : 'translateX(0)'
                  }"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'acerca-de'" class="settings-section">
        <div class="about-card">
          <div class="about-row">
            <span class="about-key">App</span>
            <span class="about-value">Upwards</span>
          </div>
          <div class="about-row">
            <span class="about-key">Version</span>
            <span class="about-value">1.0.0</span>
          </div>
          <div class="about-row">
            <span class="about-key">Descripcion</span>
            <span class="about-value">Aplicacion de seguimiento de finanzas, habitos y fitness para el crecimiento personal.</span>
          </div>
          <div class="about-row">
            <span class="about-key">Contacto</span>
            <span class="about-value">alejandrohenry62@gmail.com</span>
          </div>
          <div class="about-row">
            <span class="about-key">Telefono</span>
            <span class="about-value">+5355280986</span>
          </div>
        </div>
      </div>
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
  </SlidePanel>
</template>

<style scoped>
.settings-tabs {
  display: flex;
  gap: 4px;
  padding: 0 4px 12px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
}

.tab-btn {
  flex: 1;
  padding: 8px 4px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  text-align: center;
}

.tab-btn.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.settings-body {
  padding: 0 4px 20px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.ff-select {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-input-bg);
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.ff-select:focus {
  border-color: var(--color-primary);
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

.ff-btn.cancel {
  background: var(--color-border);
  color: var(--color-text);
}

.ff-btn.cancel:hover {
  opacity: 0.8;
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

.ff-divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 0;
}

.theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.theme-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.theme-slider {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.slider-track {
  position: relative;
  width: 52px;
  height: 28px;
  border-radius: 14px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
}

.slider-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: transform 0.3s ease, background-color 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.about-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--color-hover);
  border-radius: 12px;
  overflow: hidden;
}

.about-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.about-row:last-child {
  border-bottom: none;
}

.about-key {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
  min-width: 80px;
}

.about-value {
  font-size: 13px;
  color: var(--color-text);
  text-align: right;
  word-break: break-word;
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
