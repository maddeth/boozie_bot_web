<script setup>
import { coloursRowCount, getLastColour, getSpecificColourById, addColour } from '../colours'
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const database_count = ref(null)
const database_last = ref(null)
const database_get_by_id = ref(null)
const props = defineProps(['session'])
const loading = ref(true)
const metadata = ref(null)
const formData =ref({
  colour: '',
  hex: ''
})

onMounted(async () => {
  try {
    const fetch_count = await coloursRowCount()
    if (fetch_count != null) {
      database_count.value = fetch_count[0].count
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
    const fetch_by_id = await getSpecificColourById(database_count.value)
    if (fetch_by_id != null) {
      database_get_by_id.value = fetch_by_id[0].colourname
    }
  } catch (error) {
    console.error('Failed to fetch getSpecificColourById:', error)
  }

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

async function submitColour() {
  console.log(formData.value.colour, formData.value.hex, metadata.value.nickname)
}

</script>

<template>
  <div class="greetings">
    <h3>There are {{ database_count }} rows in the colours DB</h3>
    <h3>The last entry into the database is {{ database_last }}</h3>
    <h3>The last colour in the database is {{ database_get_by_id }}</h3>
  </div>
  <div id="send_colour">
    <form @submit.prevent="submitColour">
      <label for="colour">Colour Name</label>
      <input type="text" v-model='formData.colour' name='colour_name' placeholder='red'>
      <label for="hex">Hex Value</label>
      <input type="text" v-model='formData.hex' name='hex_code' placeholder='ff0000' maxlength="25">
      <button type="submit">Submit</button>
    </form>
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
