import { createRouter, createWebHistory } from 'vue-router'

/**
 * Router dell'applicazione.
 *
 * Due rotte principali:
 * - "/" -> la scena 3D con gli hotspot visibili (nessun overlay)
 * - "/hotspot/:id" -> overlay con i dettagli dell'hotspot selezionato
 *
 * Il parametro dinamico :id corrisponde all'id dell'hotspot
 * (girello, albero, cavalluccio) definito nel composable useHotspots.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue'),
    },
    {
      path: '/hotspot/:id',
      name: 'hotspot-detail',
      component: () => import('./views/HotspotDetailView.vue'),
    },
  ],
})

export default router
