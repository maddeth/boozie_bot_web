<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const database_count = ref(null)
const database_get_by_id = ref(null)
const props = defineProps(['session'])
const token = ref(null)
const loading = ref(true)
const database_last = ref(null)
const error = ref(null)

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
  return fetch('https://maddeth.com/api/colours/count', requestOptions)
    .then(res => {
      if (!res.ok) {
        const error = new Error(res.statusText)
        error.json = res.json()
        throw error
      }
      return res.json()
    })
    .then(json => {
      if (json !== null && json !== undefined) {
        database_count.value = json.count || json
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
  return fetch('https://maddeth.com/api/colours/1', requestOptions)
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
  <div class="colours-stats">
    <h2 class="section-title">🎨 Colour Database Stats</h2>
    
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading colour data...</p>
    </div>
    
    <div v-else class="stats-grid">
      <!-- Database Count Card -->
      <div v-if="database_count != null" class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3 class="stat-label">Total Colours</h3>
          <p class="stat-value">{{ database_count }}</p>
        </div>
      </div>
      
      <!-- Last Entry Card -->
      <div v-if="database_last != null" class="stat-card highlight-card">
        <div class="stat-icon">✨</div>
        <div class="stat-content">
          <h3 class="stat-label">Latest Colour</h3>
          <div class="colour-preview">
            <div class="colour-swatch" :style="{ backgroundColor: database_last.hex_value }"></div>
            <div class="colour-info">
              <p class="colour-name">{{ database_last.colourname }}</p>
              <p class="colour-hex">{{ database_last.hex_value }}</p>
              <p class="colour-author">by {{ database_last.username }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Addition Card -->
      <div v-if="database_get_by_id != null" class="stat-card">
        <div class="stat-icon">🆕</div>
        <div class="stat-content">
          <h3 class="stat-label">Colour ID #1</h3>
          <div class="colour-preview compact">
            <div class="colour-swatch small" :style="{ backgroundColor: database_get_by_id.hex_value || '#000' }"></div>
            <div class="colour-info">
              <p class="colour-name small">{{ database_get_by_id.colourname || database_get_by_id }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <p>⚠️ Unable to load colour statistics. Please try again later.</p>
    </div>
  </div>
</template>

<style scoped>
.colours-stats {
  margin-bottom: 2rem;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: #10b981;
  margin-bottom: 2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  text-align: center;
  padding: 3rem;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.highlight-card {
  grid-column: span 2;
  background: linear-gradient(135deg, #1f2937 0%, #2d3748 100%);
  border-color: rgba(16, 185, 129, 0.3);
}

.stat-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #9ca3af;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.stat-value {
  color: #f3f4f6;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.colour-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.colour-swatch {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.colour-info {
  flex: 1;
}

.colour-name {
  color: #f3f4f6;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  text-transform: capitalize;
}

.colour-hex {
  color: #10b981;
  font-family: monospace;
  font-size: 1rem;
  margin: 0 0 0.25rem 0;
}

.colour-author {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

.colour-preview.compact {
  gap: 0.75rem;
}

.colour-swatch.small {
  width: 40px;
  height: 40px;
}

.colour-name.small {
  font-size: 1rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #fca5a5;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .highlight-card {
    grid-column: span 1;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .colour-preview {
    flex-direction: column;
    align-items: center;
  }
}</style>
