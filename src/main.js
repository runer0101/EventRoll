import './assets/variables.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import { useBackendWarmup } from './composables/useBackendWarmup'

// Wake-up con retry: Render free tier duerme tras 15 min de inactividad.
// Intenta despertar el servidor con retry logic para mayor robustez.
const { warmup } = useBackendWarmup()
warmup().catch(() => {})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, _instance, info) => {
  console.error(`[Vue Error] ${info}:`, err)
}

app.mount('#app')
