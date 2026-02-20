<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const props = defineProps(['session'])
const emit = defineEmits(['colour-added'])
const loading = ref(true)
const token = ref(null)
const colourAddResponse = ref()
const colourSearchResponse = ref()
const error = ref(null)
const isSubmitting = ref(false)
const isSearching = ref(false)
const getInitialData = () => ({
  colour: '',
  hex: ''
})
const formData = ref(getInitialData());
const searchColour = ref()

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
})

async function submitColour() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  error.value = null
  colourAddResponse.value = null
  
  try {
    const colour = formData.value.colour.toLowerCase().match(/[0-9a-z\s]{0,60}/g)?.[0]?.trim()
    const hex = formData.value.hex.toUpperCase().match(/[0-9A-F]{6}/g)?.[0]?.trim()
    
    if (!colour || !hex) {
      throw new Error('Please provide valid colour name and hex value')
    }
    
    const requestOptions = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token.value,
        },
        body: JSON.stringify({ colour: colour, hex: hex })
    }
    
    const res = await fetch('https://maddeth.com/api/colours', requestOptions)
    
    if (!res.ok) {
      throw new Error(`Failed to add colour: ${res.statusText}`)
    }
    
    const json = await res.json()
    
    if (json && Array.isArray(json) && json.length > 0) {
      colourAddResponse.value = json[0]
    } else {
      colourAddResponse.value = json
    }
    
    formData.value = getInitialData()
    
    // Emit event to notify parent that a colour was added
    emit('colour-added')
  } catch (err) {
    console.error('Error adding colour:', err)
    error.value = err.message || 'Failed to add colour'
  } finally {
    isSubmitting.value = false
  }
}

async function SearchByColour() {
  if (isSearching.value || !searchColour.value?.trim()) return
  
  isSearching.value = true
  error.value = null
  colourSearchResponse.value = null
  
  try {
    const colour = searchColour.value.toLowerCase().match(/[0-9a-z\s]{0,60}/g)?.[0]?.trim()
    
    if (!colour) {
      throw new Error('Please provide a valid colour name to search')
    }
    
    const requestOptions = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token.value,
        },
        body: JSON.stringify({ colour: colour })
    }
    
    const res = await fetch('https://maddeth.com/api/colours/search', requestOptions)
    
    if (!res.ok) {
      throw new Error(`Failed to search colours: ${res.statusText}`)
    }
    
    const json = await res.json()
    
    if (json && Array.isArray(json)) {
      colourSearchResponse.value = json
    } else if (json) {
      colourSearchResponse.value = [json]
    } else {
      colourSearchResponse.value = []
    }
  } catch (err) {
    console.error('Error searching colour:', err)
    error.value = err.message || 'Failed to search for colour'
  } finally {
    isSearching.value = false
  }
}

function upperCaseWord(word) {
  if (!word) return ''
  return word.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}

function getPreviewColour() {
  const hex = formData.value.hex
  if (hex && /^[0-9A-Fa-f]{6}$/.test(hex)) {
    return `#${hex}`
  }
  return '#000000'
}

function clearForm() {
  formData.value = getInitialData()
  colourAddResponse.value = null
  error.value = null
}

function clearSearch() {
  searchColour.value = ''
  colourSearchResponse.value = null
  error.value = null
}
</script>

<template>
  <div class="colours-manager">
    
    <!-- Add New Colour Section -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">🎨 Add New Colour</h2>
        <p class="section-subtitle">Submit a new colour to the database</p>
      </div>
      
      <form ref="colourForm" @submit.prevent="submitColour" class="colour-form">
        <div class="form-row">
          <div class="input-group">
            <label for="colour" class="input-label">Colour Name</label>
            <input 
              type="text" 
              v-model='formData.colour' 
              name='colour_name' 
              placeholder='Enter colour name (e.g., sunset orange)' 
              pattern="[a-zA-Z0-9\s]+"
              maxlength="60" 
              required
              class="text-input"
            >
          </div>
          
          <div class="input-group">
            <label for="hex" class="input-label">Hex Value</label>
            <div class="hex-input-container">
              <span class="hex-prefix">#</span>
              <input 
                type="text" 
                v-model='formData.hex' 
                name='hex_code' 
                placeholder='FF5722' 
                pattern="[0-9a-fA-F]+"
                maxlength="6" 
                minlength="6" 
                required
                class="hex-input"
              >
              <div class="colour-preview" :style="{ backgroundColor: getPreviewColour() }"></div>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="clearForm" class="btn btn-secondary" :disabled="isSubmitting">
            Clear
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner"></span>
            {{ isSubmitting ? 'Adding...' : 'Add Colour' }}
          </button>
        </div>
      </form>
      
      <!-- Success Message -->
      <div v-if="colourAddResponse && !error" class="success-message">
        <p>✅ Colour added successfully!</p>
      </div>
    </div>
    
    <!-- Search Colours Section -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">🔍 Search Colours</h2>
        <p class="section-subtitle">Find existing colours in the database</p>
      </div>
      
      <div class="search-form">
        <div class="search-input-container">
          <input 
            type="text" 
            v-model='searchColour' 
            placeholder='Search for a colour name...'
            class="search-input"
            @keyup.enter="SearchByColour"
          >
          <button @click="SearchByColour" class="btn btn-search" :disabled="isSearching || !searchColour?.trim()">
            <span v-if="isSearching" class="spinner"></span>
            {{ isSearching ? 'Searching...' : '🔍 Search' }}
          </button>
          <button @click="clearSearch" class="btn btn-secondary" v-if="searchColour || colourSearchResponse">
            Clear
          </button>
        </div>
      </div>
      
      <!-- Search Results -->
      <div v-if="colourSearchResponse && colourSearchResponse.length > 0" class="search-results">
        <h3 class="results-title">Search Results ({{ colourSearchResponse.length }} found)</h3>
        <div class="results-grid">
          <div v-for="colour in colourSearchResponse" :key="colour.id" class="result-card">
            <div class="result-colour-swatch" :style="{ backgroundColor: `#${colour.hex_value}` }"></div>
            <div class="result-info">
              <h4 class="result-name">{{ upperCaseWord(colour.colourname) }}</h4>
              <p class="result-hex">#{{ colour.hex_value }}</p>
              <p v-if="colour.username" class="result-author">by {{ colour.username }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Results Found -->
      <div v-else-if="colourSearchResponse !== null && (!colourSearchResponse || colourSearchResponse.length === 0)" class="no-results">
        <h3 class="results-title">No Results Found</h3>
        <p>🤷‍♀️ No colours found matching "{{ searchColour }}".</p>
        <p class="no-results-hint">Try a different search term or check the spelling.</p>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <p>⚠️ {{ error }}</p>
    </div>
    
  </div>
</template>

<style scoped>
.colours-manager {
  width: 100%;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-card {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.section-card:hover {
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.section-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.section-title {
  color: #10b981;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.section-subtitle {
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 0;
}

.colour-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  color: #d1d5db;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.text-input, .search-input {
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.5);
  border-radius: 8px;
  color: #f3f4f6;
  font-size: 1rem;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.text-input:focus, .search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.text-input:valid {
  border-color: rgba(16, 185, 129, 0.5);
}

.text-input:invalid:not(:placeholder-shown) {
  border-color: rgba(239, 68, 68, 0.5);
}

.hex-input-container {
  display: flex;
  align-items: center;
  background: rgba(55, 65, 81, 0.8);
  border: 2px solid rgba(75, 85, 99, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.hex-input-container:focus-within {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.hex-prefix {
  color: #9ca3af;
  font-size: 1rem;
  font-weight: 500;
  padding-left: 1rem;
}

.hex-input {
  background: transparent;
  border: none;
  color: #f3f4f6;
  font-size: 1rem;
  padding: 0.75rem 0.5rem;
  flex: 1;
  text-transform: uppercase;
}

.hex-input:focus {
  outline: none;
}

.colour-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  margin: 4px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: rgba(75, 85, 99, 0.8);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.5);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.8);
  color: #f3f4f6;
}

.btn-search {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-search:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-form {
  margin-bottom: 1.5rem;
}

.search-input-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  flex: 1;
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  text-align: center;
  color: #10b981;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #fca5a5;
}

.search-results {
  margin-top: 1.5rem;
}

.results-title {
  color: #d1d5db;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.result-card {
  background: rgba(55, 65, 81, 0.6);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.result-card:hover {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.result-colour-swatch {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.result-info {
  flex: 1;
}

.result-name {
  color: #f3f4f6;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.result-hex {
  color: #10b981;
  font-family: monospace;
  font-size: 0.9rem;
  margin: 0 0 0.25rem 0;
}

.result-author {
  color: #9ca3af;
  font-size: 0.8rem;
  margin: 0;
}

.no-results {
  text-align: center;
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.2);
  border-radius: 8px;
  padding: 2rem;
  margin-top: 1.5rem;
}

.no-results h3 {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.no-results p {
  color: #9ca3af;
  margin: 0.5rem 0;
}

.no-results-hint {
  font-size: 0.9rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .colours-manager {
    padding: 0.5rem;
  }
  
  .section-card {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .search-input-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions {
    justify-content: stretch;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .section-card {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .hex-input-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .colour-preview {
    width: 100%;
    height: 30px;
    margin: 0.5rem 0 0 0;
  }
}
</style>
