import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/app',
    component: () => import('../views/AppShell.vue'),
    meta: { requiresAuth: true },
    redirect: '/app/invitados',
    children: [
      {
        path: 'invitados',
        name: 'invitados',
        component: () => import('../views/InvitadosView.vue'),
      },
      {
        path: 'estadisticas',
        name: 'estadisticas',
        component: () => import('../views/EstadisticasView.vue'),
      },
      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('../views/ConfiguracionView.vue'),
      },
      {
        path: 'actividad',
        name: 'actividad',
        component: () => import('../views/ActividadView.vue'),
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('../views/UsuariosView.vue'),
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

let sessionInitialized = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!sessionInitialized) {
    sessionInitialized = true
    await auth.initSession()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'home' }
  }

  if ((to.name === 'home' || to.name === 'login') && auth.isAuthenticated) {
    return { path: '/app/invitados' }
  }
})

export default router
