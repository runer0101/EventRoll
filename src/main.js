import './assets/variables.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import { resolveApiBaseUrl, resolveHealthUrl } from './utils/apiUrl'

// Wake-up silencioso: Render free tier duerme tras 15 min de inactividad.
// Lanzar un ping al /health para despertar el servidor mientras carga la SPA.
const API_URL = resolveApiBaseUrl(import.meta.env.VITE_API_URL)
const healthUrl = resolveHealthUrl(API_URL)
fetch(healthUrl, { mode: 'cors', credentials: 'omit' }).catch(() => {})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, _instance, info) => {
  console.error(`[Vue Error] ${info}:`, err)
}

app.mount('#app')
