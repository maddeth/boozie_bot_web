<script setup>
import { ref, onMounted } from 'vue'
import { useUserRole } from '../composables/useUserRole.js'
import Footer from '../components/Footer.vue'

const { 
  userRole, 
  loading: roleLoading, 
  isModerator, 
  loadUserRole, 
  getUserStats, 
  getModerators 
} = useUserRole()

const stats = ref(null)
const moderators = ref([])
const loadingStats = ref(false)
const loadingModerators = ref(false)
const error = ref(null)

onMounted(async () => {
  await loadUserRole()
  if (isModerator.value) {
    await loadModeratorData()
  }
})

const loadModeratorData = async () => {
  await Promise.all([
    loadStats(),
    loadModerators()
  ])
}

const loadStats = async () => {
  loadingStats.value = true
  try {
    stats.value = await getUserStats()
  } catch (err) {
    error.value = `Failed to load statistics: ${err.message}`
  } finally {
    loadingStats.value = false
  }
}

const loadModerators = async () => {
  loadingModerators.value = true
  try {
    const response = await getModerators()
    moderators.value = response.moderators || []
  } catch (err) {
    error.value = `Failed to load moderators: ${err.message}`
  } finally {
    loadingModerators.value = false
  }
}

const refreshData = async () => {
  error.value = null
  await loadModeratorData()
}

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
</script>

<template>
  <div class="moderator-page">
    <div class="container">
      <div class="page-header">
        <h1>🛡️ Moderator Panel</h1>
        <p>Welcome to the moderator dashboard. Manage bot settings and view channel statistics.</p>
      </div>

      <!-- Loading State -->
      <div v-if="roleLoading" class="loading-container">
        <div class="loading">Loading user information...</div>
      </div>

      <!-- User Info -->
      <div v-else-if="userRole" class="user-info-card">
        <h2>👤 Your Account</h2>
        <div class="user-details">
          <p><strong>Username:</strong> {{ userRole.username }}</p>
          <p><strong>Display Name:</strong> {{ userRole.displayName || userRole.username }}</p>
          <p><strong>Roles:</strong> {{ getRoleText(userRole) }}</p>
          <p v-if="userRole.moderatorSince"><strong>Moderator Since:</strong> {{ formatDate(userRole.moderatorSince) }}</p>
          <p><strong>Last Seen:</strong> {{ formatDate(userRole.lastSeen) }}</p>
        </div>
      </div>

      <!-- Access Denied -->
      <div v-if="userRole && !userRole.needsVisit && !isModerator" class="access-denied">
        <h2>🚫 Access Denied</h2>
        <p>This page is only accessible to channel moderators.</p>
        <p>If you believe this is an error, please contact the streamer.</p>
        <router-link to="/" class="button secondary">Back to Home</router-link>
      </div>

      <!-- Need to Visit Stream -->
      <div v-if="userRole?.needsVisit" class="need-visit">
        <h2>👋 Welcome!</h2>
        <p>You need to visit the Twitch stream chat at least once to complete your profile setup.</p>
        <p>After chatting, refresh this page to see your updated privileges.</p>
        <div class="actions">
          <a href="https://twitch.tv/maddeth" target="_blank" class="button">Visit Stream</a>
          <button @click="loadUserRole" class="button secondary">Refresh</button>
        </div>
      </div>

      <!-- Moderator Content -->
      <div v-if="isModerator" class="moderator-content">
        
        <!-- Action Buttons -->
        <div class="action-bar">
          <button @click="refreshData" class="button" :disabled="loadingStats || loadingModerators">
            {{ (loadingStats || loadingModerators) ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="error-message">
          <p>{{ error }}</p>
          <button @click="error = null" class="close-error">×</button>
        </div>

        <!-- Statistics -->
        <div class="stats-section">
          <h2>📊 Bot Statistics</h2>
          <div v-if="loadingStats" class="loading">Loading statistics...</div>
          <div v-else-if="stats" class="stats-grid">
            <div class="stat-card">
              <h3>Total Users</h3>
              <div class="stat-number">{{ stats.totalUsers.toLocaleString() }}</div>
            </div>
            <div class="stat-card">
              <h3>Moderators</h3>
              <div class="stat-number">{{ stats.moderators.toLocaleString() }}</div>
            </div>
            <div class="stat-card">
              <h3>Subscribers</h3>
              <div class="stat-number">{{ stats.subscribers.toLocaleString() }}</div>
            </div>
            <div class="stat-card">
              <h3>Registered Users</h3>
              <div class="stat-number">{{ stats.registeredUsers.toLocaleString() }}</div>
            </div>
            <div class="stat-card">
              <h3>Active This Week</h3>
              <div class="stat-number">{{ stats.activeWeekly.toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <!-- Moderators List -->
        <div class="moderators-section">
          <h2>👥 Current Moderators</h2>
          <div v-if="loadingModerators" class="loading">Loading moderators...</div>
          <div v-else-if="moderators.length > 0" class="moderators-list">
            <div v-for="mod in moderators" :key="mod.username" class="moderator-card">
              <div class="mod-info">
                <strong>{{ mod.displayName || mod.username }}</strong>
                <small>@{{ mod.username }}</small>
              </div>
              <div class="mod-details">
                <span class="mod-since">Since: {{ formatDate(mod.moderatorSince) }}</span>
                <span class="last-seen">Last seen: {{ formatDate(mod.lastSeen) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-moderators">
            <p>No moderators found in the database.</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>⚡ Quick Actions</h2>
          <div class="actions-grid">
            <router-link to="/colours" class="action-card">
              <h3>🎨 Manage Colors</h3>
              <p>View and manage user color preferences</p>
            </router-link>
            <a href="https://twitch.tv/maddeth" target="_blank" class="action-card">
              <h3>📺 Watch Stream</h3>
              <p>Go to the Twitch channel</p>
            </a>
            <router-link to="/alerts" class="action-card">
              <h3>🔔 View Alerts</h3>
              <p>Check alert configurations</p>
            </router-link>
          </div>
        </div>

      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.moderator-page {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.container {
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

.loading-container, .loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.user-info-card {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #4b5563;
}

.user-info-card h2 {
  color: #10b981;
  margin-bottom: 1rem;
}

.user-details p {
  margin: 0.5rem 0;
  color: #d1d5db;
}

.access-denied, .need-visit {
  background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
}

.need-visit {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  border-color: #3b82f6;
}

.moderator-content {
  margin-top: 2rem;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: all 0.2s;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.button.secondary {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
}

.button.secondary:hover {
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  position: relative;
}

.close-error {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #991b1b;
}

.stats-section, .moderators-section, .quick-actions {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #4b5563;
}

.stats-section h2, .moderators-section h2, .quick-actions h2 {
  color: #10b981;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.stat-card h3 {
  color: #d1d5db;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #10b981;
}

.moderators-list {
  display: grid;
  gap: 1rem;
}

.moderator-card {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mod-info strong {
  color: #10b981;
  display: block;
}

.mod-info small {
  color: #9ca3af;
}

.mod-details {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
}

.mod-details span {
  display: block;
  margin: 0.2rem 0;
}

.no-moderators {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.action-card h3 {
  color: #10b981;
  margin-bottom: 0.5rem;
}

.action-card p {
  color: #d1d5db;
  margin: 0;
}

.actions {
  margin-top: 1rem;
}

.actions .button {
  margin: 0 0.5rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.5rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .moderator-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .mod-details {
    text-align: left;
    margin-top: 0.5rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>