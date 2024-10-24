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

// const {
//   data: { user },
// } = await supabase.auth.getUser()

// const name = user.user_metadata.nickname
// const avatar = user.user_metadata.avatar_url

// console.log(name, avatar)

</script>

<template>
  <!-- <div>
    <p>{{ name }}</p>
    <img>{{ avatar }}</img>
  </div> -->
  <div>
    <p>Logged in</p>
  </div>
  <div>
    <button class="button block" @click="signOut">Sign Out</button>
  </div>
</template>
