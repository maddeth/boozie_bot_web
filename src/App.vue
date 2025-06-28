<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Auth from './components/Auth.vue'
import Header from './components/Header.vue'
import { supabase } from './supabase'

const session = ref()
const route = useRoute()

// Check if we should show the header (hide on alerts page)
const showHeader = computed(() => route.name !== 'Alerts')

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
})
</script>

<template>
  <div class="app">
    <template v-if="session">
      <Header v-if="showHeader" :session="session" />
      <main class="main-content" :class="{ 'no-header': !showHeader }">
        <router-view :session="session" />
      </main>
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
}

.main-content.no-header {
  padding-top: 0;
  min-height: 100vh;
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>