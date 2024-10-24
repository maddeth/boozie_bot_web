<script setup>
import { supabase } from '../supabase.js'
import { ref } from 'vue'

const props = defineProps(['session'])

const loading = ref(true)
// const metadata = ref(null)

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

const {
  data: { user },
} = await supabase.auth.getUser()

const metadata = user.user_metadata

</script>

<template>
  <div>
    <p v-if="metadata">{{ metadata }}</p>
  </div>
  <div>
    <p>Logged in</p>
  </div>
  <div>
    <button class="button block" @click="signOut">Sign Out</button>
  </div>
</template>
