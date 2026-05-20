<script setup lang="ts">
/* Indicador de conexión a internet.
   Muestra un punto verde + "Conectado" si hay red,
   o punto gris + "Modo offline" si no. */
import { ref, onMounted, onUnmounted } from 'vue'
import { useLanguage } from '../composables/useLanguage'

const { t } = useLanguage()
const isOnline = ref(navigator.onLine)

function onOnline(): void { isOnline.value = true }
function onOffline(): void { isOnline.value = false }

onMounted(() => {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
})
</script>

<template>
  <div class="connection-indicator" :class="{ offline: !isOnline }">
    <span class="dot" />
    <span class="label">
      {{ isOnline ? t('connection.connected') : t('connection.offline') }}
    </span>
  </div>
</template>

<style scoped>
.connection-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  transition: background 0.3s ease;
}

.offline .dot {
  background: #9e9e9e;
}

.label {
  white-space: nowrap;
}
</style>
