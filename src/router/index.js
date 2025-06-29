import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import Colours from '../views/ColoursView.vue'
import Token from '../views/TokenView.vue'
import Alerts from '../views/AlertsView.vue'
import Moderator from '../views/ModeratorView.vue'
import Eggs from '../views/EggsView.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/colours', name: 'Colours', component: Colours },
  { path: '/token', name: 'Token', component: Token },
  { path: '/alerts', name: 'Alerts', component: Alerts },
  { path: '/moderator', name: 'Moderator', component: Moderator },
  { path: '/eggs', name: 'Eggs', component: Eggs },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
