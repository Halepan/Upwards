/*(import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
)*/


import { createApp } from 'vue'
import App from './App.vue'
import { clearAllData } from './boom.ts' // Ajusta la ruta si es necesario

const app = createApp(App)
// ... tus configuraciones (router, pinia, etc.)

app.mount('#app')

// 🔽 EXPONER LA FUNCIÓN EN CONSOLA (SOLO EN DESARROLLO)
if (import.meta.env.DEV) {
  ;(window as any).clearAllData = clearAllData
  console.log('✅ clearAllData disponible en consola. Ejecuta: clearAllData()')

}