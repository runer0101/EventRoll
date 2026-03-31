import './assets/variables.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'

// Wake-up silencioso: Render free tier duerme tras 15 min de inactividad.
// Lanzar un ping al /health para despertar el servidor mientras carga la SPA.
const API_URL = import.meta.env.VITE_API_URL
if (API_URL) {
  const healthUrl = API_URL.replace(/\/api\/?$/, '/health')
  fetch(healthUrl, { mode: 'cors', credentials: 'omit' }).catch(() => {})
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, _instance, info) => {
  console.error(`[Vue Error] ${info}:`, err)
}

app.mount('#app')
