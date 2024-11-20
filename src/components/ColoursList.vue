<script setup>
import { coloursRowCount, getLastColour, getSpecificColourById } from '../colours'
import { ref, onMounted } from 'vue'

const database_count = ref(null)
const database_last = ref(null)
const database_get_by_id = ref(null)
const props = defineProps(['session'])

onMounted(async () => {
  try {
    const fetch_count = await coloursRowCount()
    if (fetch_count != null) {
      database_count.value = fetch_count
    }
  } catch (error) {
    console.error('Failed to fetch database coloursRowCount:', error)
  }

  try {
    const fetch_last = await getLastColour()
    if (fetch_last != null) {
      database_last.value = fetch_last[0]
    }
  } catch (error) {
    console.error('Failed to fetch getLastColour:', error)
  }

  try {
    const fetch_by_id = await getSpecificColourById(database_last.value.id)
    if (fetch_by_id != null) {
      database_get_by_id.value = fetch_by_id[0].colourname
    }
  } catch (error) {
    console.error('Failed to fetch getSpecificColourById:', error)
  }
})

</script>

<template>
  <div class="greetings">
    <h3>{{ database_count }}</h3>
    <h3>{{ database_last }}</h3>
    <h3>{{ database_get_by_id }}</h3>
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
