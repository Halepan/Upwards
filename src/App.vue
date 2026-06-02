<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from './store/auth_store'
import AuthView from './components/AuthView.vue'
import AppShell from './components/AppShell.vue'
import FinancePage from './components/FinancePage.vue'
import HabitsPage from './components/HabitsPage.vue'
import FitnessPage from './components/FitnessPage.vue'
import type { Section } from './components/AppShell.vue'

const auth = useAuthStore()
const currentSection = ref<Section>('finanzas')
const historyPanelOpen = ref(false)
</script>

<template>
  <AuthView v-if="auth.isAuthenticated" />
  <AppShell v-else v-model:section="currentSection" :user-name="auth.currentUser?.name ?? ''" @open-history="historyPanelOpen = true">
    <FinancePage v-if="currentSection === 'finanzas'" :history-open="historyPanelOpen" @close-history="historyPanelOpen = false" />
    <HabitsPage v-else-if="currentSection === 'habitos'" />
    <FitnessPage v-else-if="currentSection === 'fitness'" />
  </AppShell>
</template>
