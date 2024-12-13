<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const database_count = ref(null)
const database_get_by_id = ref(null)
const props = defineProps(['session'])
const token = ref(null)
const loading = ref(true)
const database_last = ref(null)

onMounted(async () => {
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
 
  try{
    await getLastColour()
  } catch (error){
    console.error('Failed to fetch last db entry', error)
  }

  try{
    await coloursRowCount()
  } catch (error){
    console.error('Failed to fetch database coloursRowCount', error)
  }

  try{
    await getSpecificColourById()
  } catch (error){
    console.error('Failed to fetch getSpecificColourById', error)
  }

})

async function getLastColour() {
  loading.value = true
  const requestOptions = {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + await token.value,
    },
  }
  return fetch('https://maddeth.com/api/colours/getLastColour', requestOptions)
    .then(res => {
      if (!res.ok) {
        const error = new Error(res.statusText)
        error.json = res.json()
        throw error
      }
      return res.json()
    })
    .then(json => {
      if (json && Array.isArray(json) && json.length > 0) {
        database_last.value = json[0]
      } else {
        database_last.value = null
      }
    })
    .catch(err => {
      error.value = err
      if (err.json) {
        return err.json.then(json => {
          error.value.message = json.message
        })
      }
    })
    .then(() => {
      loading.value = false
    })
}

async function coloursRowCount() {
  loading.value = true
  const requestOptions = {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + await token.value,
    },
  }
  return fetch('https://maddeth.com/api/colours/getLastColour', requestOptions)
    .then(res => {
      if (!res.ok) {
        const error = new Error(res.statusText)
        error.json = res.json()
        throw error
      }
      return res.json()
    })
    .then(json => {
      if (json && Array.isArray(json) && json.length > 0) {
        database_count.value = json[0]
      } else {
        database_count.value = null
      }
    })
    .catch(err => {
      error.value = err
      if (err.json) {
        return err.json.then(json => {
          error.value.message = json.message
        })
      }
    })
    .then(() => {
      loading.value = false
    })
}

async function getSpecificColourById() {
  loading.value = true
  const requestOptions = {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + await token.value,
    },
  }
  return fetch('https://maddeth.com/api/colours/getLastColour', requestOptions)
    .then(res => {
      if (!res.ok) {
        const error = new Error(res.statusText)
        error.json = res.json()
        throw error
      }
      return res.json()
    })
    .then(json => {
      if (json && Array.isArray(json) && json.length > 0) {
        database_get_by_id.value = json[0]
      } else {
        database_get_by_id.value = null
      }
    })
    .catch(err => {
      error.value = err
      if (err.json) {
        return err.json.then(json => {
          error.value.message = json.message
        })
      }
    })
    .then(() => {
      loading.value = false
    })
}

</script>

<template>
  <div class="greetings">
    <h3 v-if="database_count != null">Number of rows in the database: {{ database_count }}</h3>
    <h3 v-if="database_last != null">Last entry was by {{ database_last.username }}, was {{ database_last.colourname }} with a hex value of {{ database_last.hex_value }}</h3>
    <h3 v-if="database_get_by_id != null">Last colour added: {{ database_get_by_id }}</h3>
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
