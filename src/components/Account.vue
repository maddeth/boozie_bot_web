<script setup>
import { supabase } from '../supabase.js'
import { ref } from 'vue'

const props = defineProps(['session'])

const loading = ref(true)


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
</script>

<template>
     <div>
      <p>Logged in</p>
     </div>
    <div>
      <button class="button block" @click="signOut">Sign Out</button>
    </div>
</template>