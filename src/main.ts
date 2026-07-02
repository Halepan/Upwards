import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
//import { db } from './lib/db'

//if (import.meta.env.DEV) {
//  ;(window as any).db = db
//}
const app = createApp(App)
app.use(createPinia())
app.mount('#app')

/*if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}*/
