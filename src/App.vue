<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './store/auth_store'
import { SyncEngine } from './sync'
import { habitStore, financeStore, fitnessStore } from './store' // 👈 Ajusta la ruta
import AuthView from './components/AuthView.vue'
import AppShell from './components/AppShell.vue'
import FinancePage from './components/FinancePage.vue'
import HabitsPage from './components/HabitsPage.vue'
import FitnessPage from './components/FitnessPage.vue'
import type { Section } from './components/AppShell.vue'

const auth = useAuthStore()
const currentSection = ref<Section>('finanzas')
const historyPanelOpen = ref(false)

let syncEngine: SyncEngine | null = null
let syncInterval: ReturnType<typeof setInterval> | null = null

function startSync() {
  if (!auth.currentUser?.id) return

  // 🔥 Crear SyncEngine con el UUID del usuario
  syncEngine = new SyncEngine()

  // 🔥 Inyectar SyncEngine en TODOS los stores
  habitStore.setSyncEngine(syncEngine, 'habits')
  financeStore.setSyncEngine(syncEngine, 'accounts')
  fitnessStore.setSyncEngine(syncEngine, 'exercises')

  // Procesar cola y descargar cambios
  syncEngine.processQueue()
  if (navigator.onLine) {
    syncEngine.pullRemoteChanges()
  }

  // Sincronización periódica
  syncInterval = setInterval(() => {
    if (navigator.onLine && syncEngine) {
      syncEngine.processQueue()
      syncEngine.pullRemoteChanges()
    }
  }, 30000)
}

function onOnline() {
  if (syncEngine) {
    syncEngine.processQueue()
    syncEngine.pullRemoteChanges()
  }
}

watch(() => auth.isAuthenticated, (val) => {
  if (val) startSync()
})

onMounted(() => {
  window.addEventListener('online', onOnline)
  if (auth.isAuthenticated) startSync()
})

onUnmounted(() => {
  window.removeEventListener('online', onOnline)
  if (syncInterval) clearInterval(syncInterval)
})
</script>

<template>
  <AuthView v-if="!auth.isAuthenticated" />
  <AppShell v-else v-model:section="currentSection" :user-name="auth.currentUser?.name ?? ''" @open-history="historyPanelOpen = true">
    <FinancePage v-if="currentSection === 'finanzas'" :history-open="historyPanelOpen" @close-history="historyPanelOpen = false" />
    <HabitsPage v-else-if="currentSection === 'habitos'" />
    <FitnessPage v-else-if="currentSection === 'fitness'" />
  </AppShell>
</template>