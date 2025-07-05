<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import { useUserRole } from '../composables/useUserRole.js'

const { 
  userRole, 
  loading: roleLoading, 
  loadUserRole 
} = useUserRole()

const metadata = ref(null)
const userEggs = ref('Loading...')
const availableColours = ref('Loading...')
const userRank = ref('Loading...')
const session = ref(null)

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

const getRoleText = (user) => {
  if (!user?.roles) return 'Viewer'
  
  const roles = []
  if (user.roles.isModerator) roles.push('Moderator')
  if (user.roles.isAdmin) roles.push('Admin')
  if (user.roles.isVip) roles.push('VIP')
  if (user.roles.isSubscriber) roles.push(`Subscriber (Tier ${user.subscriptionTier})`)
  
  return roles.length > 0 ? roles.join(', ') : 'Viewer'
}

const fetchUserStats = async () => {
  try {
    // Get session
    const { data: { session: userSession } } = await supabase.auth.getSession()
    if (!userSession) return
    
    session.value = userSession
    const token = userSession.access_token
    
    // Fetch user eggs and rank
    try {
      const eggsResponse = await fetch('https://maddeth.com/api/eggs/my-eggs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (eggsResponse.ok) {
        const eggsData = await eggsResponse.json()
        console.log('Eggs response:', eggsData)
        
        // Use the new API response format
        if (eggsData.eggs !== undefined) {
          userEggs.value = eggsData.eggs.toLocaleString()
        } else {
          userEggs.value = '0'
        }
        
        // Set rank from the API response
        if (eggsData.rank) {
          userRank.value = `#${eggsData.rank.toLocaleString()}`
        } else {
          userRank.value = 'Unranked'
        }
      }
    } catch (error) {
      console.error('Failed to fetch eggs:', error)
      userEggs.value = '0'
      userRank.value = 'N/A'
    }
    
    // Fetch egg leaderboard to find user's rank
    try {
      const leaderboardResponse = await fetch('https://maddeth.com/api/eggs/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json()
        console.log('Leaderboard response:', leaderboardData)
        
        // Handle different response formats
        let leaderboard = leaderboardData
        if (leaderboardData.leaderboard) {
          leaderboard = leaderboardData.leaderboard
        } else if (leaderboardData.users) {
          leaderboard = leaderboardData.users
        }
        
        if (Array.isArray(leaderboard) && userRole.value?.username) {
          const userPosition = leaderboard.findIndex(entry => 
            entry.username === userRole.value.username
          )
          userRank.value = userPosition >= 0 ? `#${userPosition + 1}` : 'Unranked'
        } else {
          userRank.value = 'N/A'
        }
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      userRank.value = 'N/A'
    }
    
    // Fetch available colours count
    try {
      const coloursResponse = await fetch('https://maddeth.com/api/colours', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (coloursResponse.ok) {
        const coloursData = await coloursResponse.json()
        // Count the total number of colours
        const colourCount = Object.keys(coloursData).length
        availableColours.value = colourCount.toLocaleString()
      }
    } catch (error) {
      console.error('Failed to fetch colours:', error)
      availableColours.value = 'N/A'
    }
    
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      metadata.value = user.user_metadata
      await loadUserRole()
      await fetchUserStats()
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  }
})
</script>

<template>
  <div class="home-welcome">
    <div class="welcome-header">
      <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/6351700d-d3e6-4c31-ac7f-f6b9b1fb9d75-profile_image-70x70.png" alt="Boozie Bot" class="welcome-logo" />
      <h1>Welcome to Boozie Bot!</h1>
      <p class="welcome-subtitle">Your stream companion for eggs, colours, and more</p>
    </div>
    
    <!-- User Account Info -->
    <div v-if="userRole && metadata" class="account-info-card">
      <h2>👤 Your Account</h2>
      <div class="account-details">
        <div class="account-item">
          <img :src="metadata.avatar_url" :alt="metadata.nickname" class="account-avatar" />
          <div class="account-text">
            <p><strong>Display Name:</strong> {{ userRole.displayName || userRole.username }}</p>
            <p><strong>Username:</strong> @{{ userRole.username }}</p>
            <p><strong>Roles:</strong> {{ getRoleText(userRole) }}</p>
            <p v-if="userRole.moderatorSince"><strong>Moderator Since:</strong> {{ formatDate(userRole.moderatorSince) }}</p>
            <p><strong>Last Seen:</strong> {{ formatDate(userRole.lastSeen) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">🥚</div>
        <h3>Egg Collection</h3>
        <p>Earn eggs by watching the stream and participating in chat. Check your progress and compete on the leaderboard!</p>
        <router-link to="/eggs" class="feature-link">View Eggs →</router-link>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <h3>Custom Colours</h3>
        <p>Personalize your chat experience with custom colours. Browse existing colours or create your own!</p>
        <router-link to="/colours" class="feature-link">Manage Colours →</router-link>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">🔑</div>
        <h3>API Access</h3>
        <p>Get your personal API token to integrate with external tools and applications.</p>
        <router-link to="/token" class="feature-link">Get Token →</router-link>
      </div>
    </div>
    
    <div class="quick-stats">
      <h2>Quick Stats</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">🥚</div>
          <div class="stat-label">Your Eggs</div>
          <div class="stat-value">{{ userEggs }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">🎨</div>
          <div class="stat-label">Available Colours</div>
          <div class="stat-value">{{ availableColours }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">⭐</div>
          <div class="stat-label">Your Rank</div>
          <div class="stat-value">{{ userRank }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.home-welcome {
  width: 100%;
  color: #f3f4f6;
}

.welcome-header {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  margin-bottom: 1.5rem;
}

.welcome-header h1 {
  font-size: 3rem;
  color: #10b981;
  margin: 0 0 1rem 0;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #d1d5db;
  margin: 0;
  opacity: 0.9;
}

.account-info-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.account-info-card h2 {
  color: #10b981;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.account-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.account-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #10b981;
  box-shadow: 0 3px 8px rgba(16, 185, 129, 0.3);
  flex-shrink: 0;
}

.account-text {
  flex: 1;
}

.account-text p {
  color: #d1d5db;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.account-text strong {
  color: #f3f4f6;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.feature-card h3 {
  color: #10b981;
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.feature-card p {
  color: #d1d5db;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.feature-link {
  display: inline-block;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.feature-link:hover {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  transform: translateY(-1px);
}

.quick-stats, .recent-activity {
  margin-bottom: 3rem;
}

.quick-stats h2, .recent-activity h2 {
  color: #10b981;
  font-size: 2rem;
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #d1d5db;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  color: #10b981;
  font-size: 1.5rem;
  font-weight: 600;
}

.activity-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.activity-card p {
  color: #d1d5db;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.activity-card p:last-child {
  margin-bottom: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .home-welcome {
    padding: 1rem;
  }
  
  .welcome-header h1 {
    font-size: 2.5rem;
  }
  
  .welcome-subtitle {
    font-size: 1.1rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-stats h2, .recent-activity h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .welcome-header h1 {
    font-size: 2rem;
  }
  
  .welcome-logo {
    width: 60px;
    height: 60px;
  }
  
  .feature-icon {
    font-size: 2.5rem;
  }
  
  .feature-card h3 {
    font-size: 1.3rem;
  }
}
</style>
