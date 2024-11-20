<script setup>
import { addColour } from '../colours'
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const props = defineProps(['session'])
const loading = ref(true)
const metadata = ref(null)
const formData = ref({
  colour: '',
  hex: ''
})
const response = ref()

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
  response.value = await addColour(formData.value.colour, formData.value.hex, metadata.value.nickname)
  this.$refs.colourForm.reset()
}

</script>

<template>
  <div class="send_colour">
    <form ref="colourForm" @submit.prevent="submitColour">
      <label for="colour">Colour Name</label>
      <input type="text" v-model='formData.colour' name='colour_name' placeholder='red' pattern="[a-zA-Z0-9\s]+"
        maxlength="60" required>
      <label for="hex">Hex Value</label>
      <input type="text" v-model='formData.hex' name='hex_code' placeholder='ff0000' pattern="[0-9a-fA-F]+"
        maxlength="6" minlength="6" required>
      <button type="submit">Submit</button>
    </form>
    <h3 v-if=response>{{ response }}</h3>
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
