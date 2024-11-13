<script setup>
import { coloursRowCount, getLastColour, getSpecificColourById } from '../colours'
import { ref, onMounted } from 'vue'

const database_count = ref()
const database_last = ref()
const database_get_by_id = ref()

onMounted(async () => {
  try {
    const fetch_count = await coloursRowCount()
    if (fetch_count != null) {
      database_count.value = fetch_count[0].count
    }
  } catch (error) {
    console.error('Failed to fetch database count:', error)
  }

  try {
    const fetch_last = await getLastColour()
    if (fetch_last != null) {
      database_last.value = fetch_last[0]
    }
  } catch (error) {
    console.error('Failed to fetch count:', error)
  }

  try {
    const fetch_by_id = await getSpecificColourById(database_count)
    if (fetch_by_id != null) {
      database_get_by_id.value = fetch_by_id
    }
  } catch (error) {
    console.error('Failed to fetch count:', error)
  }
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">You have Succesfully Logged In</h1>
    <h3>There are {{ database_count }} rows in the colours DB</h3>
    <h3>The last entry into the database is {{ database_last }}</h3>
    <h3>The last colour in the database is {{ database_count }}</h3>    
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
