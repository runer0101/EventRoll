import { ref } from 'vue'
import { resolveApiBaseUrl, resolveHealthUrl } from '../utils/apiUrl'

/**
 * Composable para warm-up del backend con retry logic
 * Útil para Render free tier que duerme tras inactividad
 */
export function useBackendWarmup() {
  const isWarmingUp = ref(false)
  const warmupStatus = ref('idle') // idle, warming, ready, error
  const retryCount = ref(0)
  const maxRetries = 3
  const retryDelay = 2000 // 2 segundos

  async function warmup() {
    if (isWarmingUp.value) return
    
    isWarmingUp.value = true
    warmupStatus.value = 'warming'
    retryCount.value = 0

    const API_URL = resolveApiBaseUrl(import.meta.env.VITE_API_URL)
    const healthUrl = resolveHealthUrl(API_URL)

    while (retryCount.value < maxRetries) {
      try {
        const response = await fetch(healthUrl, { 
          mode: 'cors', 
          credentials: 'omit',
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })
        
        if (response.ok) {
          warmupStatus.value = 'ready'
          isWarmingUp.value = false
          return true
        }
      } catch {
        // Retry on network error or timeout
      }
      
      retryCount.value++
      
      if (retryCount.value < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }

    warmupStatus.value = 'error'
    isWarmingUp.value = false
    return false
  }

  return {
    isWarmingUp,
    warmupStatus,
    retryCount,
    warmup,
  }
}
