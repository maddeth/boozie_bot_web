import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Colours from '../views/ColoursView.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/colours', name: 'Colours', component: Colours },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
