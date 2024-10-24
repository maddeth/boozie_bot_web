<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase.js'

const loading = ref(false)

const handleLogin = async () => {
  try {
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: 'https://boozie-bot-web.pages.dev',
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="row flex-center flex" @submit.prevent="handleLogin">
    <div class="col-6 form-widget">
      <h1 class="header">Boozie Bot</h1>
      <p class="description">Sign in via Twitch</p>
      <div>
        <input
          type="submit"
          class="button block"
          :value="loading ? 'Loading' : 'Sign In'"
          :disabled="loading"
        />
      </div>
    </div>
  </form>
</template>