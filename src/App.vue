<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Auth from './components/Auth.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { supabase } from './supabase'

const session = ref()
const route = useRoute()

// Define public routes that don't require authentication
const publicRoutes = ['Alerts', 'Eggs', 'Spotify']

// Check if current route is public
const isPublicRoute = computed(() => publicRoutes.includes(route.name))

// Routes that render as a full-page overlay (no header, no footer, transparent background)
const overlayRoutes = ['Alerts', 'Spotify']

// Check if we should show the header (hide on overlay pages)
const showHeader = computed(() => !overlayRoutes.includes(route.name))

// Check if we should show the footer (hide on overlay pages)
const showFooter = computed(() => !overlayRoutes.includes(route.name))

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})

// Watch for route changes to update body class
import { watch } from 'vue'
watch(() => route.name, (newRoute) => {
  if (overlayRoutes.includes(newRoute)) {
    document.body.classList.add('alerts-page')
  } else {
    document.body.classList.remove('alerts-page')
  }
}, { immediate: true })
</script>

<template>
  <div class="app">
    <template v-if="session || isPublicRoute">
      <Header v-if="showHeader" :session="session" />
      <main class="main-content" :class="{ 'no-header': !showHeader }">
        <router-view :session="session" />
      </main>
      <Footer v-if="showFooter" />
    </template>
    <Auth v-else />
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 2rem;
  background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%);
  min-height: calc(100vh - 200px);
  overflow-x: hidden;
}

.main-content.no-header {
  padding-top: 0;
  min-height: 100vh;
  background: transparent;
}

/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #111827;
  color: #f3f4f6;
}

body.alerts-page {
  background: transparent;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}
</style>