<script setup>
import { supabase } from '../supabase.js'
import { ref, onMounted } from 'vue'

const props = defineProps(['session'])

const loading = ref(true)
const token = ref(null)

onMounted(async () => {
  try {
    const user  = await supabase.auth.getSession()
    if (user) {
      console.log(user)
      token.value = user.data.session.access_token
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <div id="token">
    <h3>This is your Bearer token</h3>
    <p>
      {{ token }}
    </p>
  </div>
</template>

<style scoped>
</style>