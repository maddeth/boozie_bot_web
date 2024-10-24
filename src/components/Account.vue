<script setup>
import { supabase } from '../supabase.js'
import { ref, onMounted } from 'vue'

const props = defineProps(['session'])

const loading = ref(true)
const metadata = ref(null) // Make metadata reactive

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
  <div>
    <p v-if="metadata">{{ metadata.nickname }}</p>
  </div>
  <div>
    <p>Logged in</p>
  </div>
  <div>
    <button class="button block" @click="signOut">Sign Out</button>
  </div>
</template>
