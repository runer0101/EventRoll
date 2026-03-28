import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/stores/**/*.js', 'src/composables/**/*.js'],
      thresholds: { lines: 70, functions: 70, branches: 60 },
    },
  },
  // IMPORTANTE: debe coincidir exactamente con el nombre del repositorio en GitHub (case-sensitive)
  base: process.env.NODE_ENV === 'production' ? '/EventRoll/' : '/',

  plugins: [
    vue(),
    vueDevTools(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    strictPort: true, // Falla si el puerto 5173 ya está en uso
    host: true
  },

  // Optimización para producción
  build: {
    // Genera sourcemaps para debugging (opcional, puedes desactivar)
    sourcemap: false,

    // Optimiza el tamaño del bundle usando esbuild (más rápido que terser)
    minify: 'esbuild',

    // exceljs (~940KB) se carga dinámicamente en excelImporter.js — tamaño inevitable
    chunkSizeWarningLimit: 1000,

    // Configuración de chunks para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa Vue en su propio chunk
          'vue-vendor': ['vue']
        }
      }
    }
  }
})
