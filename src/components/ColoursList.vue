<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const props = defineProps(['session'])
const token = ref(null)
const loading = ref(true)
const database_last = ref(null)
const error = ref(null)
const loadingStates = ref({
  last: true
})

onMounted(async () => {
  error.value = null
  
  try {
    const userSession = await supabase.auth.getSession()
    if (userSession && userSession.data.session) {
      token.value = userSession.data.session.access_token
      console.log('Token obtained successfully')
    } else {
      throw new Error('No session found')
    }
  } catch (err) {
    console.error('Failed to fetch user session:', err)
    error.value = 'Authentication failed. Please sign in again.'
    loading.value = false
    return
  }
 
  // Fetch latest colour data
  await getLastColour().catch(err => {
    console.error('Failed to fetch last colour:', err)
    error.value = 'Failed to load latest colour'
  })
  
  // Set overall loading to false when all requests complete
  loading.value = Object.values(loadingStates.value).some(state => state)
})

async function getLastColour() {
  loadingStates.value.last = true
  try {
    const requestOptions = {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token.value,
      },
    }
    
    console.log('Fetching last colour...')
    const res = await fetch('https://maddeth.com/api/colours/getLastColour', requestOptions)
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    
    const json = await res.json()
    console.log('Last colour response:', json)
    
    if (json && Array.isArray(json) && json.length > 0) {
      database_last.value = json[0]
    } else if (json && !Array.isArray(json)) {
      database_last.value = json
    } else {
      database_last.value = null
    }
  } catch (err) {
    console.error('Error fetching last colour:', err)
    error.value = 'Failed to load latest colour'
  } finally {
    loadingStates.value.last = false
    updateLoadingState()
  }
}

function updateLoadingState() {
  loading.value = loadingStates.value.last
}

</script>

<template>
  <div class="colours-stats">
    
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading colour data...</p>
    </div>
    
    <div v-else class="stats-grid">
      <!-- Latest Colour Card -->
      <div v-if="database_last != null" class="stat-card highlight-card">
        <div class="stat-icon">✨</div>
        <div class="stat-content">
          <h3 class="stat-label">Latest Colour</h3>
          <div class="colour-preview">
            <div class="colour-swatch" :style="{ backgroundColor: '#' + database_last.hex_value }"></div>
            <div class="colour-info">
              <p class="colour-name">{{ database_last.colourname }}</p>
              <p class="colour-hex">{{ database_last.hex_value }}</p>
              <p class="colour-author">by {{ database_last.username }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error && !loading" class="error-message">
      <p>⚠️ {{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.colours-stats {
  margin-bottom: 2rem;
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
  display: flex;
  justify-content: center;
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
  max-width: 500px;
  width: 100%;
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


.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #fca5a5;
}

@media (max-width: 768px) {
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .colour-preview {
    flex-direction: column;
    align-items: center;
  }
}</style>
