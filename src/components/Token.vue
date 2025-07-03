<script setup>
import { supabase } from '../supabase.js'
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps(['session'])

const loading = ref(true)
const token = ref(null)
const expirationTime = ref(null)
const currentTime = ref(Date.now())
const copySuccess = ref(false)
const refreshing = ref(false)
const error = ref(null)
let countdownInterval = null

// Decode JWT token to get expiration time
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

// Calculate time remaining until expiration
const timeRemaining = computed(() => {
  if (!expirationTime.value) return null
  
  const remaining = expirationTime.value - currentTime.value
  if (remaining <= 0) return null
  
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
  
  return { hours, minutes, seconds, total: remaining }
})

// Check if token is expired or about to expire
const tokenStatus = computed(() => {
  if (!timeRemaining.value) return 'expired'
  if (timeRemaining.value.total < 5 * 60 * 1000) return 'expiring' // Less than 5 minutes
  return 'valid'
})

// Format token for display (truncated with ellipsis)
const displayToken = computed(() => {
  if (!token.value) return ''
  const start = token.value.substring(0, 20)
  const end = token.value.substring(token.value.length - 20)
  return `${start}...${end}`
})

async function loadToken() {
  try {
    loading.value = true
    error.value = null
    
    const user = await supabase.auth.getSession()
    if (user && user.data.session) {
      token.value = user.data.session.access_token
      
      // Decode token to get expiration
      const decoded = decodeJWT(token.value)
      if (decoded && decoded.exp) {
        expirationTime.value = decoded.exp * 1000 // Convert to milliseconds
      }
    } else {
      throw new Error('No session found')
    }
  } catch (err) {
    console.error('Failed to fetch token:', err)
    error.value = 'Failed to load token. Please try refreshing the page.'
  } finally {
    loading.value = false
  }
}

async function refreshToken() {
  try {
    refreshing.value = true
    error.value = null
    
    const { data, error: refreshError } = await supabase.auth.refreshSession()
    
    if (refreshError) throw refreshError
    
    if (data.session) {
      token.value = data.session.access_token
      
      // Decode new token to get expiration
      const decoded = decodeJWT(token.value)
      if (decoded && decoded.exp) {
        expirationTime.value = decoded.exp * 1000
      }
    }
  } catch (err) {
    console.error('Failed to refresh token:', err)
    error.value = 'Failed to refresh token. Please try signing out and back in.'
  } finally {
    refreshing.value = false
  }
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(token.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = token.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval)
  
  countdownInterval = setInterval(() => {
    currentTime.value = Date.now()
    
    // Auto-refresh if token is about to expire (30 seconds)
    if (timeRemaining.value && timeRemaining.value.total < 30 * 1000 && timeRemaining.value.total > 0) {
      refreshToken()
    }
  }, 1000)
}

onMounted(async () => {
  await loadToken()
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})

</script>

<template>
  <div class="token-manager">
    <!-- Page Header -->
    <div class="page-header">
      <h1>🔑 API Token</h1>
      <p>Get your personal API token to authenticate with external tools and applications.</p>
    </div>
    
    <div class="section-card">
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading token...</p>
      </div>
      
      <!-- Token Display -->
      <div v-else-if="token" class="token-container">
        <!-- Token Status -->
        <div class="token-status" :class="tokenStatus">
          <div class="status-indicator">
            <span v-if="tokenStatus === 'valid'" class="status-icon">✅</span>
            <span v-else-if="tokenStatus === 'expiring'" class="status-icon">⚠️</span>
            <span v-else class="status-icon">❌</span>
            
            <div class="status-text">
              <span v-if="tokenStatus === 'valid'" class="status-label">Token Active</span>
              <span v-else-if="tokenStatus === 'expiring'" class="status-label">Expiring Soon</span>
              <span v-else class="status-label">Token Expired</span>
              
              <div v-if="timeRemaining" class="countdown">
                Expires in: 
                <span class="time-part" v-if="timeRemaining.hours > 0">{{ timeRemaining.hours }}h</span>
                <span class="time-part">{{ timeRemaining.minutes }}m</span>
                <span class="time-part">{{ timeRemaining.seconds }}s</span>
              </div>
              <div v-else class="countdown expired">
                Token has expired
              </div>
            </div>
          </div>
        </div>
        
        <!-- Token Value -->
        <div class="token-display">
          <div class="token-preview">
            <code class="token-text">{{ displayToken }}</code>
            <span class="token-length">({{ token.length }} characters)</span>
          </div>
          
          <!-- Action Buttons -->
          <div class="token-actions">
            <button @click="copyToClipboard" class="btn btn-copy" :disabled="copySuccess">
              <span v-if="copySuccess" class="success-icon">✅</span>
              <span v-else>📋</span>
              {{ copySuccess ? 'Copied!' : 'Copy Token' }}
            </button>
            
            <button @click="refreshToken" class="btn btn-refresh" :disabled="refreshing">
              <span v-if="refreshing" class="spinner small"></span>
              <span v-else>🔄</span>
              {{ refreshing ? 'Refreshing...' : 'Refresh Token' }}
            </button>
          </div>
        </div>
        
        <!-- Full Token (Hidden by default) -->
        <details class="token-details">
          <summary class="details-toggle">Show Full Token</summary>
          <div class="full-token">
            <code class="full-token-text">{{ token }}</code>
          </div>
        </details>
      </div>
      
      <!-- Error State -->
      <div v-if="error" class="error-message">
        <p>⚠️ {{ error }}</p>
        <button @click="loadToken" class="btn btn-secondary">Retry</button>
      </div>
      
      <!-- Token Usage Info -->
      <div class="token-info">
        <h3 class="info-title">💡 How to Use Your Token</h3>
        <div class="usage-examples">
          <div class="example">
            <h4>JavaScript Fetch</h4>
            <code class="code-block">
fetch('https://maddeth.com/api/colours', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
            </code>
          </div>
          
          <div class="example">
            <h4>cURL Command</h4>
            <code class="code-block">
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     https://maddeth.com/api/colours
            </code>
          </div>
        </div>
        
        <div class="security-notice">
          <p><strong>🔐 Security Notice:</strong> Keep your token secure and never share it publicly. Tokens expire automatically for security.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.token-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #10b981;
}

.page-header p {
  color: #d1d5db;
  margin: 0;
}

.section-card {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}


.loading-container {
  text-align: center;
  padding: 3rem;
  color: #d1d5db;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.token-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.token-status {
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid;
}

.token-status.valid {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.token-status.expiring {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.token-status.expired {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-icon {
  font-size: 1.5rem;
}

.status-text {
  flex: 1;
}

.status-label {
  font-weight: 600;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.25rem;
}

.token-status.valid .status-label {
  color: #10b981;
}

.token-status.expiring .status-label {
  color: #f59e0b;
}

.token-status.expired .status-label {
  color: #ef4444;
}

.countdown {
  font-family: monospace;
  font-size: 1rem;
  color: #d1d5db;
}

.countdown.expired {
  color: #ef4444;
  font-weight: 600;
}

.time-part {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin: 0 0.1rem;
}

.token-display {
  background: rgba(55, 65, 81, 0.6);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 8px;
  padding: 1.5rem;
}

.token-preview {
  margin-bottom: 1rem;
}

.token-text {
  background: rgba(0, 0, 0, 0.3);
  color: #10b981;
  font-family: monospace;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  display: block;
  word-break: break-all;
  margin-bottom: 0.5rem;
}

.token-length {
  color: #9ca3af;
  font-size: 0.8rem;
}

.token-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

.btn-copy {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-copy:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.btn-refresh {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.btn-refresh:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
}

.btn-secondary {
  background: rgba(75, 85, 99, 0.8);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.5);
}

.success-icon {
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.token-details {
  margin-top: 1rem;
}

.details-toggle {
  color: #10b981;
  cursor: pointer;
  font-weight: 500;
  padding: 0.5rem 0;
  user-select: none;
}

.details-toggle:hover {
  color: #059669;
}

.full-token {
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 1rem;
}

.full-token-text {
  color: #10b981;
  font-family: monospace;
  font-size: 0.8rem;
  word-break: break-all;
  line-height: 1.4;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  color: #fca5a5;
}

.token-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(75, 85, 99, 0.5);
}

.info-title {
  color: #d1d5db;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.usage-examples {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.example {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  overflow: hidden;
  min-width: 0;
}

.example h4 {
  color: #10b981;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.code-block {
  background: rgba(0, 0, 0, 0.4);
  color: #d1d5db;
  font-family: monospace;
  font-size: 0.8rem;
  padding: 1rem;
  border-radius: 6px;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  line-height: 1.4;
  max-width: 100%;
  box-sizing: border-box;
}

.security-notice {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  padding: 1rem;
  color: #fbbf24;
}

@media (max-width: 768px) {
  .token-manager {
    padding: 0.5rem;
  }
  
  .section-card {
    padding: 1.5rem;
  }
  
  .token-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
  
  .status-indicator {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .usage-examples {
    grid-template-columns: 1fr;
  }
}
</style>