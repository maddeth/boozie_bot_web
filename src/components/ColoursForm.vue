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
const formData = ref({
  colour: '',
  hex: ''
})

onMounted(async () => {
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
  await addColour(formData.value.colour, formData.value.hex, metadata.value.nickname)
}

</script>

<template>
  <div class="send_colour">
    <form @submit="submitColour">
      <label for="colour">Colour Name</label>
      <input type="text" v-model='formData.colour' name='colour_name' placeholder='red' pattern="[a-zA-Z0-9\s]+"
        maxlength="60" required>
      <label for="hex">Hex Value</label>
      <input type="text" v-model='formData.hex' name='hex_code' placeholder='ff0000' pattern="[0-9a-fA-F]+"
        maxlength="6" minlength="6" required>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<style scoped>
input {
  &:valid {
    border: 1px solid green;
  }
  
  &:invalid {
    border: 1px solid red;
  }
}

label,
input {
  display: flex;
  flex-direction: row;
  justify-content: centers;
  text-align: center;
  margin-bottom: 10px;
  display: inline-block;
  font-size: 1.2rem;
  margin: 0 4;
}

.send_colour {
  text-align: center;
}
</style>
