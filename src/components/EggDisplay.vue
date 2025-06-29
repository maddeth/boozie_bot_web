<template>
  <div class="egg-display">
    <div class="egg-section">
      <h2>🥚 My Eggs</h2>
      
      <!-- Loading state -->
      <div v-if="loading" class="loading">
        <p>Loading your eggs...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchMyEggs" class="retry-btn">Try Again</button>
      </div>
      
      <!-- User eggs display -->
      <div v-else-if="userEggs" class="user-eggs">
        <div class="egg-count">
          <span class="count">{{ userEggs.eggs.toLocaleString() }}</span>
          <span class="label">eggs</span>
        </div>
        <p class="username">{{ userEggs.displayName || userEggs.username }}</p>
        <p v-if="userEggs.lastUpdated" class="last-updated">
          Last updated: {{ formatDate(userEggs.lastUpdated) }}
        </p>
      </div>
      
      <!-- No eggs state -->
      <div v-else class="no-eggs">
        <p>You don't have any eggs yet!</p>
        <p class="help-text">Watch the stream and participate in chat to earn eggs!</p>
      </div>
    </div>
    
    <!-- Leaderboard section -->
    <div class="leaderboard-section">
      <h3>🏆 Top Egg Collectors</h3>
      
      <div v-if="leaderboardLoading" class="loading-small">
        Loading leaderboard...
      </div>
      
      <div v-else-if="leaderboard.length > 0" class="leaderboard">
        <div 
          v-for="(user, index) in leaderboard" 
          :key="user.username"
          class="leaderboard-item"
          :class="{ 'top-three': index < 3 }"
        >
          <span class="rank">{{ user.rank }}</span>
          <span class="username">{{ user.username }}</span>
          <span class="eggs">{{ user.eggs.toLocaleString() }}</span>
        </div>
      </div>
      
      <div v-else class="no-leaderboard">
        <p>No leaderboard data available</p>
      </div>
    </div>
    
    <!-- Statistics section -->
    <div class="stats-section">
      <h3>📊 Egg Statistics</h3>
      
      <div v-if="stats" class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalUsers.toLocaleString() }}</span>
          <span class="stat-label">Users with eggs</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalEggs.toLocaleString() }}</span>
          <span class="stat-label">Total eggs</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.averageEggs }}</span>
          <span class="stat-label">Average eggs</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.maxEggs.toLocaleString() }}</span>
          <span class="stat-label">Highest count</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

export default {
  name: 'EggDisplay',
  setup() {
    const loading = ref(false)
    const leaderboardLoading = ref(false)
    const error = ref(null)
    const userEggs = ref(null)
    const leaderboard = ref([])
    const stats = ref(null)
    
    const API_BASE = 'https://maddeth.com'
    
    const fetchMyEggs = async () => {
      try {
        loading.value = true
        error.value = null
        
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          error.value = 'Please log in to view your eggs'
          return
        }
        
        const response = await fetch(`${API_BASE}/api/eggs/my-eggs`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch eggs')
        }
        
        const data = await response.json()
        userEggs.value = data
        
      } catch (err) {
        console.error('Error fetching user eggs:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }
    
    const fetchLeaderboard = async () => {
      try {
        leaderboardLoading.value = true
        
        const response = await fetch(`${API_BASE}/api/eggs/leaderboard?limit=10`)
        
        if (response.ok) {
          const data = await response.json()
          leaderboard.value = data.leaderboard
        }
        
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      } finally {
        leaderboardLoading.value = false
      }
    }
    
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/eggs/stats`)
        
        if (response.ok) {
          const data = await response.json()
          stats.value = data
        }
        
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }
    
    onMounted(() => {
      fetchMyEggs()
      fetchLeaderboard()
      fetchStats()
    })
    
    return {
      loading,
      leaderboardLoading,
      error,
      userEggs,
      leaderboard,
      stats,
      fetchMyEggs,
      formatDate
    }
  }
}
</script>

<style scoped>
.egg-display {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  gap: 30px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .egg-display {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }
  
  .egg-section {
    grid-column: 1 / -1;
  }
}

.egg-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 30px;
  color: white;
  text-align: center;
}

.egg-section h2 {
  margin: 0 0 20px 0;
  font-size: 2rem;
}

.loading, .error, .no-eggs {
  padding: 20px;
}

.error {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.user-eggs {
  padding: 20px;
}

.egg-count {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.count {
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.label {
  font-size: 1.2rem;
  opacity: 0.9;
}

.username {
  font-size: 1.3rem;
  margin: 10px 0;
  opacity: 0.9;
}

.last-updated {
  font-size: 0.9rem;
  opacity: 0.7;
  margin: 5px 0;
}

.help-text {
  opacity: 0.8;
  font-style: italic;
}

.leaderboard-section, .stats-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.leaderboard-section h3, .stats-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.loading-small {
  text-align: center;
  color: #666;
  font-style: italic;
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leaderboard-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 15px;
  align-items: center;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.leaderboard-item:hover {
  background: #e9ecef;
}

.leaderboard-item.top-three {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  font-weight: bold;
}

.leaderboard-item.top-three:hover {
  background: linear-gradient(135deg, #ffed4e 0%, #ffd700 100%);
}

.rank {
  font-weight: bold;
  text-align: center;
  color: #666;
}

.top-three .rank {
  color: #8b4513;
}

.username {
  font-weight: 500;
  color: #333;
}

.eggs {
  font-weight: bold;
  color: #28a745;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-leaderboard, .no-eggs {
  text-align: center;
  color: #666;
  font-style: italic;
}
</style>