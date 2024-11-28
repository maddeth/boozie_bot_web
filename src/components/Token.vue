<script setup>
import { supabase } from '../supabase.js'
import { ref, onMounted } from 'vue'

const props = defineProps(['session'])

const loading = ref(true)
const token = ref(null)

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getSession()
    if (user) {
      token.value = user.data
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
    <p>
      {{ token }}
    </p>
  </div>
</template>

<style scoped>
</style>