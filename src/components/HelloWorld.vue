<script setup>
import { coloursRowCount } from '../colours'
import { ref, onMounted } from 'vue'

const count = ref()

onMounted(async () => {
  try {
    const { fetch_count } = await coloursRowCount()
    if (fetch_count) {
      count.value = fetch_count[0]
    }
    console.log(count, fetch_count)
  } catch (error) {
    console.error('Failed to fetch count:', error)
  }
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">You have Succesfully Logged In</h1>
    <h3 v-if="count !== null">There are {{ count }} rows in the colours DB</h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}
</style>
