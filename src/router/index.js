import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import Colours from '../views/ColoursView.vue'
import Token from '../views/TokenView.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/colours', name: 'Colours', component: Colours },
  { path: '/token', name: 'Token', component: Token },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
