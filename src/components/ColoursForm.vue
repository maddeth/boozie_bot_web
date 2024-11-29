<script setup>
import { addColour, getByColourName } from '../colours'
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const props = defineProps(['session'])
const loading = ref(true)
const metadata = ref(null)
const token = ref(null)
const colourAddResponse = ref()
const colourSearchResponse = ref()
const getInitialData = () => ({
  colour: '',
  hex: ''
})
const formData = ref(getInitialData());
const searchColour = ref()
const upperCased = ref()

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
  try {
    const userSession  = await supabase.auth.getSession()
    if (userSession) {
      token.value = userSession.data.session.access_token
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  } finally {
    loading.value = false
  }
})

async function submitColour() {
  const colour = formData.value.colour.toLowerCase().match(/[0-9a-z\s]{0,60}/g)[0].trim()
  const hex = formData.value.hex.toUpperCase().match(/[0-9A-F]{6}/g)[0].trim()
  const requestOptions = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token.value,
      },
      body: JSON.stringify({ colour: colour, hex: hex })
  }
  const response = await fetch('https://maddeth.com/api/colours', requestOptions)
  // console.log(await response.json().response)
  colourAddResponse.value = response.json()

  // colourAddResponse.value = await addColour(colour, hex, metadata.value.nickname)
  formData.value = getInitialData()
}

async function SearchByColour() {
  const colour = searchColour.value.toLowerCase().match(/[0-9a-z\s]{0,60}/g)[0].trim()
  const requestOptions = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token.value,
      },
      body: JSON.stringify({ colour: colour })
  }
  const response = await fetch('https://maddeth.com/api/colours/colourName', requestOptions)
  console.log(response.json())
  colourSearchResponse.value = response.json()
  
}

function upperCaseWord(word) {
  return word.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
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
    <h3 v-if=colourAddResponse>{{ colourAddResponse }}</h3>
    <input type="text" v-model='searchColour'>
    <button @click="SearchByColour">Search for colour</button>
  </div>
  <div>
    <table>
      <tr v-for="colour in colourSearchResponse">
        <td>{{ upperCaseWord(colour.colourname) }}</td>
        <td>{{ colour.hex_value }}</td>
        <td type="color" value="#{{ colour.hex_value }}"></td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
input {
  &:valid {
    border: 2px solid green;
  }
  
  &:invalid {
    border: 2px solid red;
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

table {
  display: flex;
  flex-direction: row;
  justify-content: centers;
  text-align: center;
  margin-bottom: 10px;
  display: inline-block;
  font-size: 1.1rem;
  margin: 0 4;
}
.send_colour {
  text-align: center;
}
</style>
