<script setup>
import { supabase } from '../supabase.js'
import { ref, onMounted } from 'vue'

const props = defineProps(['session'])

const loading = ref(true)
const metadata = ref(null)

async function signOut() {
  try {
    loading.value = true
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      metadata.value = user.user_metadata
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <div id="headerAll">
    <div id="headerAvatar">
      <img v-if="metadata" height="40" width="40" v-bind:src="metadata.avatar_url"/>
    </div>
    <div id="headerName">
      <p v-if="metadata">{{ metadata.nickname }}</p>
    </div>
    <div id="headerSignOut">
      <button v-if="metadata" class="button block" @click="signOut">Sign Out</button>
    </div>
  </div>
  <nav class="header-nav">
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/colours">Colours</router-link></li>
    </ul>
  </nav>
</template>

<style scoped>
.header-nav {
  background-color: #333;
  padding: 1rem;
}
.header-nav ul {
  list-style: none;
  display: flex;
  gap: 1rem;
}
.header-nav li {
  display: inline;
}
.header-nav a {
  color: #fff;
  text-decoration: none;
}
.header-nav a:hover {
  text-decoration: underline;
}
</style>