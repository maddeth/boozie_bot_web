<script setup>
import { ref, onMounted } from 'vue'
import { useUserRole } from '../composables/useUserRole.js'
import Footer from '../components/Footer.vue'

const props = defineProps(['session'])

const { 
  userRole, 
  loading: roleLoading, 
  isModerator,
  isBotModerator,
  isSuperAdmin, 
  loadUserRole, 
  getUserStats, 
  getModerators 
} = useUserRole()

const stats = ref(null)
const moderators = ref([])
const loadingStats = ref(false)
const loadingModerators = ref(false)
const error = ref(null)

// Custom Commands State
const commands = ref([])
const loadingCommands = ref(false)
const showCommandForm = ref(false)
const editingCommand = ref(null)
const commandForm = ref({
  trigger: '',
  response: '',
  cooldown: 0,
  permission: 'everyone',
  trigger_type: 'exact',
  audio_url: '',
  egg_cost: 0
})

// Bot Admins State (for superadmin)
const botAdmins = ref([])
const loadingBotAdmins = ref(false)
const showAddAdminForm = ref(false)
const newAdminUsername = ref('')

// Stats Detail Modal State
const showStatsModal = ref(false)
const modalTitle = ref('')
const modalData = ref([])
const loadingModalData = ref(false)

// Alerts State
const alerts = ref([])
const loadingAlerts = ref(false)
const showAlertForm = ref(false)
const editingAlert = ref(null)
const alertForm = ref({
  event_title: '',
  audio_url: '',
  gif_url: '',
  duration_ms: 5000
})

onMounted(async () => {
  await loadUserRole()
  if (isModerator.value) {
    await loadModeratorData()
  }
})

const loadModeratorData = async () => {
  const promises = [
    loadStats(),
    loadModerators(),
    loadCommands(),
    loadAlerts()
  ]
  
  if (isSuperAdmin.value) {
    promises.push(loadBotAdmins())
  }
  
  await Promise.all(promises)
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

const refreshModeratorStatus = async () => {
  try {
    const response = await fetch('https://maddeth.com/api/user/me/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${props.session.access_token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    await response.json()
    
    // Reload user role to update UI
    await loadUserRole()
    
    // Show success message
    error.value = null
    alert('Moderator status refreshed successfully!')
    
  } catch (err) {
    error.value = `Failed to refresh moderator status: ${err.message}`
  }
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

// Load commands from API
const loadCommands = async () => {
  loadingCommands.value = true
  try {
    const response = await fetch('https://maddeth.com/api/commands/all', {
      headers: {
        'Authorization': `Bearer ${props.session.access_token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    commands.value = data.commands || []
  } catch (err) {
    error.value = `Failed to load commands: ${err.message}`
  } finally {
    loadingCommands.value = false
  }
}

const saveCommand = async () => {
  try {
    if (!commandForm.value.trigger) {
      error.value = 'Command trigger is required'
      return
    }
    
    if (!commandForm.value.response && !commandForm.value.audio_url) {
      error.value = 'Either text response or audio URL is required'
      return
    }

    let response
    if (editingCommand.value) {
      // Update existing command
      response = await fetch(`https://maddeth.com/api/commands/${editingCommand.value.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${props.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commandForm.value)
      })
    } else {
      // Create new command
      response = await fetch('https://maddeth.com/api/commands', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${props.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commandForm.value)
      })
    }

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    // Reload commands list
    await loadCommands()
    resetCommandForm()
  } catch (err) {
    error.value = `Failed to save command: ${err.message}`
  }
}

const editCommand = (command) => {
  editingCommand.value = command
  commandForm.value = { ...command }
  showCommandForm.value = true
}

const deleteCommand = async (commandId) => {
  if (!confirm('Are you sure you want to delete this command?')) return
  
  try {
    const response = await fetch(`https://maddeth.com/api/commands/${commandId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${props.session.access_token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    // Reload commands list
    await loadCommands()
  } catch (err) {
    error.value = `Failed to delete command: ${err.message}`
  }
}

const resetCommandForm = () => {
  showCommandForm.value = false
  editingCommand.value = null
  commandForm.value = {
    trigger: '',
    response: '',
    cooldown: 0,
    permission: 'everyone',
    trigger_type: 'exact',
    audio_url: '',
    egg_cost: 0
  }
}

// Bot Admin Management Functions
const loadBotAdmins = async () => {
  loadingBotAdmins.value = true
  try {
    const response = await fetch('https://maddeth.com/api/user/admins', {
      headers: {
        'Authorization': `Bearer ${props.session.access_token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    botAdmins.value = data.admins || []
  } catch (err) {
    error.value = `Failed to load bot admins: ${err.message}`
  } finally {
    loadingBotAdmins.value = false
  }
}

const updateBotAdmin = async (username, isAdmin) => {
  try {
    const response = await fetch(`https://maddeth.com/api/user/admin/${username}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${props.session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isAdmin })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    await loadBotAdmins()
    error.value = null
  } catch (err) {
    error.value = `Failed to update bot admin: ${err.message}`
  }
}

const addBotAdmin = async () => {
  if (!newAdminUsername.value.trim()) {
    error.value = 'Please enter a username'
    return
  }
  
  await updateBotAdmin(newAdminUsername.value.trim(), true)
  if (!error.value) {
    newAdminUsername.value = ''
    showAddAdminForm.value = false
  }
}

const removeBotAdmin = async (username) => {
  if (!confirm(`Remove bot admin privileges from ${username}?`)) return
  await updateBotAdmin(username, false)
}

// Stats Detail Functions
const showStatDetails = async (statType) => {
  showStatsModal.value = true
  loadingModalData.value = true
  modalData.value = []
  
  try {
    let endpoint = ''
    
    switch (statType) {
      case 'totalUsers':
        modalTitle.value = 'All Users'
        endpoint = '/api/user/stats/users'
        break
      case 'moderators':
        modalTitle.value = 'Moderators'
        endpoint = '/api/user/stats/moderators'
        break
      case 'subscribers':
        modalTitle.value = 'Subscribers'
        endpoint = '/api/user/stats/subscribers'
        break
      case 'registeredUsers':
        modalTitle.value = 'Registered Users (With Supabase Account)'
        endpoint = '/api/user/stats/registered'
        break
      case 'activeWeekly':
        modalTitle.value = 'Active This Week'
        endpoint = '/api/user/stats/active-weekly'
        break
      default:
        throw new Error('Unknown stat type')
    }
    
    const response = await fetch(`https://maddeth.com${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${props.session.access_token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    modalData.value = data.users || []
    
  } catch (err) {
    error.value = `Failed to load ${modalTitle.value.toLowerCase()}: ${err.message}`
    showStatsModal.value = false
  } finally {
    loadingModalData.value = false
  }
}

const closeStatsModal = () => {
  showStatsModal.value = false
  modalTitle.value = ''
  modalData.value = []
}

// Alerts Management Functions
const loadAlerts = async () => {
  loadingAlerts.value = true
  try {
    const response = await fetch('https://maddeth.com/api/alerts', {
      headers: {
        'Authorization': `Bearer ${props.session.access_token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    // Convert object to array for easier display
    alerts.value = Object.entries(data).map(([event_title, config]) => ({
      event_title,
      ...config
    }))
  } catch (err) {
    error.value = `Failed to load alerts: ${err.message}`
  } finally {
    loadingAlerts.value = false
  }
}

const saveAlert = async () => {
  try {
    if (!alertForm.value.event_title || !alertForm.value.audio_url) {
      error.value = 'Event title and audio URL are required'
      return
    }

    let response
    if (editingAlert.value) {
      // Update existing alert
      response = await fetch(`https://maddeth.com/api/alerts/${encodeURIComponent(editingAlert.value.event_title)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${props.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: alertForm.value.audio_url,
          gif_url: alertForm.value.gif_url,
          duration_ms: alertForm.value.duration_ms
        })
      })
    } else {
      // Create new alert
      response = await fetch('https://maddeth.com/api/alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${props.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alertForm.value)
      })
    }

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    // Reload alerts list
    await loadAlerts()
    resetAlertForm()
  } catch (err) {
    error.value = `Failed to save alert: ${err.message}`
  }
}

const editAlert = (alert) => {
  editingAlert.value = alert
  alertForm.value = {
    event_title: alert.event_title,
    audio_url: alert.audio || '',
    gif_url: alert.gifUrl || '',
    duration_ms: alert.duration || 5000
  }
  showAlertForm.value = true
}

const deleteAlert = async (eventTitle) => {
  if (!confirm('Are you sure you want to delete this alert?')) return
  
  try {
    const response = await fetch(`https://maddeth.com/api/alerts/${encodeURIComponent(eventTitle)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${props.session.access_token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    // Reload alerts list
    await loadAlerts()
  } catch (err) {
    error.value = `Failed to delete alert: ${err.message}`
  }
}

const resetAlertForm = () => {
  showAlertForm.value = false
  editingAlert.value = null
  alertForm.value = {
    event_title: '',
    audio_url: '',
    gif_url: '',
    duration_ms: 5000
  }
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
      
      <!-- Moderator Status Not Synced -->
      <div v-if="userRole && !userRole.needsVisit && !isModerator && userRole.username" class="need-sync">
        <h2>🔄 Sync Required</h2>
        <p>If you've recently been made a moderator on Twitch, click the button below to sync your status.</p>
        <button @click="refreshModeratorStatus" class="button">Sync Moderator Status</button>
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
            <div class="stat-card clickable" @click="showStatDetails('totalUsers')">
              <h3>Total Users</h3>
              <div class="stat-number">{{ stats.totalUsers.toLocaleString() }}</div>
              <div class="stat-hint">Click to view</div>
            </div>
            <div class="stat-card clickable" @click="showStatDetails('moderators')">
              <h3>Moderators</h3>
              <div class="stat-number">{{ stats.moderators.toLocaleString() }}</div>
              <div class="stat-hint">Click to view</div>
            </div>
            <div class="stat-card clickable" @click="showStatDetails('subscribers')">
              <h3>Subscribers</h3>
              <div class="stat-number">{{ stats.subscribers.toLocaleString() }}</div>
              <div class="stat-hint">Click to view</div>
            </div>
            <div class="stat-card clickable" @click="showStatDetails('registeredUsers')">
              <h3>Registered Users</h3>
              <div class="stat-number">{{ stats.registeredUsers.toLocaleString() }}</div>
              <div class="stat-hint">Click to view</div>
            </div>
            <div class="stat-card clickable" @click="showStatDetails('activeWeekly')">
              <h3>Active This Week</h3>
              <div class="stat-number">{{ stats.activeWeekly.toLocaleString() }}</div>
              <div class="stat-hint">Click to view</div>
            </div>
          </div>
        </div>

        <!-- Moderators List -->
        <div class="moderators-section">
          <h2>👥 Current Moderators</h2>
          <div v-if="loadingModerators" class="loading">Loading moderators...</div>
          <div v-else-if="moderators.length > 0" class="moderators-list">
            <div v-for="mod in moderators" :key="mod.username" class="moderator-card" :class="{ 'broadcaster': mod.twitchUserId === '30758517' }">
              <div class="mod-info">
                <strong>{{ mod.displayName || mod.username }}</strong>
                <small>@{{ mod.username }}</small>
                <div class="mod-badges">
                  <span v-if="mod.twitchUserId === '30758517'" class="badge broadcaster">📺 BROADCASTER</span>
                  <span v-else class="badge moderator">🛡️ MODERATOR</span>
                </div>
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
   
        <!-- Bot Admin Management (Superadmin Only) -->
        <div v-if="isSuperAdmin" class="bot-admins-section">
          <div class="section-header">
            <h2>👑 Bot Admin Management (Superadmin)</h2>
            <button @click="showAddAdminForm = !showAddAdminForm" class="button">
              {{ showAddAdminForm ? 'Cancel' : 'Add Bot Admin' }}
            </button>
          </div>
          
          <!-- Add Admin Form -->
          <div v-if="showAddAdminForm" class="admin-form">
            <div class="form-group">
              <label for="newAdmin">Username</label>
              <input 
                id="newAdmin"
                v-model="newAdminUsername" 
                type="text" 
                placeholder="Enter Twitch username"
                class="form-input"
                @keyup.enter="addBotAdmin"
              >
            </div>
            <button @click="addBotAdmin" class="button">Grant Bot Admin</button>
          </div>
          
          <!-- Bot Admins List -->
          <div v-if="loadingBotAdmins" class="loading">Loading bot admins...</div>
          <div v-else-if="botAdmins.length > 0" class="admins-list">
            <div v-for="admin in botAdmins" :key="admin.username" class="admin-card">
              <div class="admin-info">
                <strong>{{ admin.display_name || admin.username }}</strong>
                <small>@{{ admin.username }}</small>
                <div class="admin-badges">
                  <span v-if="admin.is_superadmin" class="badge superadmin">SUPERADMIN</span>
                  <span v-if="admin.is_admin" class="badge admin">Bot Admin</span>
                  <span v-if="admin.is_moderator" class="badge moderator">Moderator</span>
                </div>
              </div>
              <div class="admin-actions">
                <button 
                  v-if="!admin.is_superadmin && admin.username !== userRole.username"
                  @click="removeBotAdmin(admin.username)" 
                  class="icon-button delete"
                >
                  Remove Admin
                </button>
              </div>
            </div>
          </div>
          <div v-else class="no-admins">
            <p>No bot admins configured.</p>
          </div>
        </div>

        <!-- Custom Commands -->
        <div v-if="isBotModerator" class="commands-section">
          <div class="section-header">
            <h2>🤖 Custom Commands (Bot Admin)</h2>
            <button @click="showCommandForm = !showCommandForm" class="button">
              {{ showCommandForm ? 'Cancel' : 'Add Command' }}
            </button>
          </div>

          <!-- Command Form -->
          <div v-if="showCommandForm" class="command-form">
            <h3>{{ editingCommand ? 'Edit Command' : 'New Command' }}</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="trigger_type">Trigger Type</label>
                <select id="trigger_type" v-model="commandForm.trigger_type" class="form-input">
                  <option value="exact">Exact Match (!command)</option>
                  <option value="contains">Contains Word</option>
                  <option value="regex">Regular Expression</option>
                </select>
              </div>
              <div class="form-group">
                <label for="trigger">
                  {{ commandForm.trigger_type === 'exact' ? 'Command Trigger' :
                     commandForm.trigger_type === 'contains' ? 'Word/Phrase to Match' :
                     'Regex Pattern' }}
                </label>
                <input 
                  id="trigger"
                  v-model="commandForm.trigger" 
                  type="text" 
                  :placeholder="commandForm.trigger_type === 'exact' ? '!example' :
                               commandForm.trigger_type === 'contains' ? 'poggers' :
                               '^(hi|hello|hey)'"
                  class="form-input"
                >
                <small v-if="commandForm.trigger_type === 'contains'" class="help-text">
                  Triggers when message contains this word/phrase anywhere
                </small>
                <small v-if="commandForm.trigger_type === 'regex'" class="help-text">
                  Advanced: Use regex patterns for complex matching
                </small>
              </div>
            </div>
            <div class="form-group">
              <label for="response">Text Response (Optional)</label>
              <textarea 
                id="response"
                v-model="commandForm.response" 
                placeholder="Command response... Use {user} for username (leave empty for audio-only)"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="audio_url">Audio File URL (Optional)</label>
              <input 
                id="audio_url"
                v-model="commandForm.audio_url" 
                type="url" 
                placeholder="https://example.com/audio.mp3"
                class="form-input"
              >
              <small class="help-text">
                Link to an audio file (MP3, WAV, etc.) to play when command triggers
              </small>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="cooldown">Cooldown (seconds)</label>
                <input 
                  id="cooldown"
                  v-model.number="commandForm.cooldown" 
                  type="number" 
                  min="0"
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label for="egg_cost">Egg Cost (Optional)</label>
                <input 
                  id="egg_cost"
                  v-model.number="commandForm.egg_cost" 
                  type="number" 
                  min="0"
                  placeholder="0"
                  class="form-input"
                >
                <small class="help-text">
                  Users must spend this many eggs to trigger the command (0 = free)
                </small>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="permission">Permission Level</label>
                <select id="permission" v-model="commandForm.permission" class="form-input">
                  <option value="everyone">Everyone</option>
                  <option value="subscriber">Subscribers</option>
                  <option value="vip">VIP</option>
                  <option value="moderator">Moderators</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button @click="saveCommand" class="button">
                {{ editingCommand ? 'Update' : 'Create' }} Command
              </button>
              <button @click="resetCommandForm" class="button secondary">Cancel</button>
            </div>
          </div>

          <!-- Commands List -->
          <div v-if="loadingCommands" class="loading">Loading commands...</div>
          <div v-else-if="commands.length > 0" class="commands-list">
            <div v-for="cmd in commands" :key="cmd.id" class="command-card">
              <div class="command-info">
                <div class="command-trigger">
                  <span v-if="cmd.trigger_type === 'contains'" class="trigger-type">[Contains]</span>
                  <span v-else-if="cmd.trigger_type === 'regex'" class="trigger-type">[Regex]</span>
                  {{ cmd.trigger }}
                </div>
                <div class="command-response">
                  {{ cmd.response || (cmd.audio_url ? '(Audio only)' : '(No response)') }}
                </div>
                <div class="command-meta">
                  <span>💿 {{ cmd.cooldown }}s cooldown</span>
                  <span>🔒 {{ cmd.permission }}</span>
                  <span v-if="cmd.audio_url" title="Has audio file">🔊 Audio</span>
                  <span v-if="cmd.egg_cost > 0" title="Costs eggs to use">🥚 {{ cmd.egg_cost }} eggs</span>
                </div>
              </div>
              <div class="command-actions">
                <button @click="editCommand(cmd)" class="icon-button edit">✏️</button>
                <button @click="deleteCommand(cmd.id)" class="icon-button delete">🗑️</button>
              </div>
            </div>
          </div>
          <div v-else class="no-commands">
            <p>No custom commands yet. Click "Add Command" to create one!</p>
          </div>
        </div>
        
        <!-- Commands View Only (for non-bot-admins) -->
        <div v-if="!isBotModerator" class="commands-section">
          <h2>🤖 Custom Commands</h2>
          <p class="info-message">Bot admin privileges required to manage commands. Current commands:</p>
          
          <div v-if="loadingCommands" class="loading">Loading commands...</div>
          <div v-else-if="commands.length > 0" class="commands-list view-only">
            <div v-for="cmd in commands" :key="cmd.id" class="command-card">
              <div class="command-info">
                <div class="command-trigger">
                  <span v-if="cmd.trigger_type === 'contains'" class="trigger-type">[Contains]</span>
                  <span v-else-if="cmd.trigger_type === 'regex'" class="trigger-type">[Regex]</span>
                  {{ cmd.trigger }}
                </div>
                <div class="command-response">
                  {{ cmd.response || (cmd.audio_url ? '(Audio only)' : '(No response)') }}
                </div>
                <div class="command-meta">
                  <span>💿 {{ cmd.cooldown }}s cooldown</span>
                  <span>🔒 {{ cmd.permission }}</span>
                  <span v-if="cmd.audio_url" title="Has audio file">🔊 Audio</span>
                  <span v-if="cmd.egg_cost > 0" title="Costs eggs to use">🥚 {{ cmd.egg_cost }} eggs</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-commands">
            <p>No custom commands configured yet.</p>
          </div>
        </div>

        <!-- Alerts Management (Superadmin Only) -->
        <div v-if="isSuperAdmin" class="alerts-section">
          <div class="section-header">
            <h2>🔔 Alert Configurations</h2>
            <button @click="showAlertForm = !showAlertForm" class="button">
              {{ showAlertForm ? 'Cancel' : 'Add Alert' }}
            </button>
          </div>

          <!-- Alert Form -->
          <div v-if="showAlertForm" class="alert-form">
            <h3>{{ editingAlert ? 'Edit Alert' : 'New Alert' }}</h3>
            <div class="form-group">
              <label for="eventTitle">Event Title</label>
              <input 
                id="eventTitle"
                v-model="alertForm.event_title" 
                type="text" 
                placeholder="Shadow Colour"
                class="form-input"
                :disabled="editingAlert"
              >
              <small v-if="editingAlert" class="form-hint">Event title cannot be changed</small>
            </div>
            <div class="form-group">
              <label for="audioUrl">Audio URL</label>
              <input 
                id="audioUrl"
                v-model="alertForm.audio_url" 
                type="url" 
                placeholder="https://example.com/sound.mp3"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="gifUrl">GIF URL (optional)</label>
              <input 
                id="gifUrl"
                v-model="alertForm.gif_url" 
                type="url" 
                placeholder="https://media.giphy.com/media/..."
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label for="duration">Duration (milliseconds)</label>
              <input 
                id="duration"
                v-model.number="alertForm.duration_ms" 
                type="number" 
                min="1000"
                max="30000"
                step="1000"
                class="form-input"
              >
              <small class="form-hint">How long to display the GIF (1000 = 1 second)</small>
            </div>
            <div class="form-actions">
              <button @click="saveAlert" class="button">
                {{ editingAlert ? 'Update' : 'Create' }} Alert
              </button>
              <button @click="resetAlertForm" class="button secondary">Cancel</button>
            </div>
          </div>

          <!-- Alerts List -->
          <div v-if="loadingAlerts" class="loading">Loading alerts...</div>
          <div v-else-if="alerts.length > 0" class="alerts-list">
            <div v-for="alert in alerts" :key="alert.event_title" class="alert-card">
              <div class="alert-info">
                <div class="alert-title">{{ alert.event_title }}</div>
                <div class="alert-details">
                  <div class="alert-audio">
                    <span class="label">🔊 Audio:</span>
                    <a :href="alert.audio" target="_blank" class="alert-link">{{ alert.audio.split('/').pop() }}</a>
                  </div>
                  <div v-if="alert.gifUrl" class="alert-gif">
                    <span class="label">🎬 GIF:</span>
                    <a :href="alert.gifUrl" target="_blank" class="alert-link">View GIF</a>
                  </div>
                  <div class="alert-duration">
                    <span class="label">⏱️ Duration:</span>
                    {{ (alert.duration / 1000).toFixed(1) }}s
                  </div>
                </div>
              </div>
              <div class="alert-actions">
                <button @click="editAlert(alert)" class="icon-button edit">✏️</button>
                <button @click="deleteAlert(alert.event_title)" class="icon-button delete">🗑️</button>
              </div>
            </div>
          </div>
          <div v-else class="no-alerts">
            <p>No alerts configured yet. Click "Add Alert" to create one!</p>
          </div>
        </div>

      </div>
    </div>
    
    <!-- Stats Detail Modal -->
    <div v-if="showStatsModal" class="modal-overlay" @click="closeStatsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button @click="closeStatsModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingModalData" class="loading">Loading...</div>
          <div v-else-if="modalData.length > 0" class="users-list">
            <div v-for="user in modalData" :key="user.username" class="user-item">
              <div class="user-info">
                <strong>{{ user.display_name || user.username }}</strong>
                <small>@{{ user.username }}</small>
                <div class="user-badges" v-if="user.is_superadmin || user.is_admin || user.is_moderator || user.is_vip || user.is_subscriber">
                  <span v-if="user.is_superadmin" class="badge superadmin">SUPERADMIN</span>
                  <span v-if="user.is_admin" class="badge admin">Bot Admin</span>
                  <span v-if="user.is_moderator" class="badge moderator">Moderator</span>
                  <span v-if="user.is_vip" class="badge vip">VIP</span>
                  <span v-if="user.is_subscriber" class="badge subscriber">Sub T{{ user.subscription_tier || '1' }}</span>
                </div>
              </div>
              <div class="user-details">
                <div class="user-dates">
                  <span v-if="user.last_seen">Last seen: {{ formatDate(user.last_seen) }}</span>
                  <span v-if="user.created_at">Joined: {{ formatDate(user.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-data">
            <p>No users found for this category.</p>
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

.need-sync {
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  border: 2px solid #a78bfa;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
}

.moderator-content {
  margin-top: 2rem;
}

.action-bar {
  display: flex;
  justify-content: flex-start;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  text-align: center;
  font-size: 1rem;
  line-height: 1.2;
  box-sizing: border-box;
  min-width: fit-content;
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

.stats-section, .moderators-section, .quick-actions, .commands-section, .bot-admins-section, .alerts-section {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #4b5563;
}

.stats-section h2, .moderators-section h2, .quick-actions h2, .commands-section h2, .bot-admins-section h2, .alerts-section h2 {
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
  transition: all 0.2s;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  border-color: rgba(16, 185, 129, 0.4);
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

.stat-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  opacity: 0.8;
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

.mod-badges {
  margin-top: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.broadcaster {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: white;
  border: 1px solid #8b5cf6;
  box-shadow: 0 2px 4px rgba(147, 51, 234, 0.3);
}

.badge.moderator {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: 1px solid #34d399;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.moderator-card.broadcaster {
  border: 2px solid #9333ea;
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%);
}

.moderator-card.broadcaster:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
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

/* Commands Section Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.command-form {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.command-form h3 {
  color: #10b981;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #d1d5db;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background: #1f2937;
  border: 1px solid #4b5563;
  border-radius: 6px;
  color: #f3f4f6;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.commands-list {
  display: grid;
  gap: 1rem;
}

.command-card {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.command-info {
  flex: 1;
}

.command-trigger {
  color: #10b981;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.command-response {
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

.command-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.command-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-button {
  background: none;
  border: 1px solid transparent;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.icon-button.edit {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.icon-button.edit:hover {
  background: rgba(59, 130, 246, 0.2);
}

.icon-button.delete {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.icon-button.delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

.no-commands {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.info-message {
  color: #9ca3af;
  margin-bottom: 1rem;
  font-style: italic;
}

.commands-list.view-only .command-card {
  opacity: 0.9;
}

/* Bot Admin Styles */
.admin-form {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.admin-form .form-group {
  flex: 1;
  margin-bottom: 0;
}

.admins-list {
  display: grid;
  gap: 1rem;
}

.admin-card {
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-info strong {
  color: #a78bfa;
  display: block;
}

.admin-info small {
  color: #9ca3af;
}

.admin-badges {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.badge.superadmin {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge.admin {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.badge.moderator {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.admin-actions .icon-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.no-admins {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-radius: 12px;
  border: 1px solid #4b5563;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #4b5563;
}

.modal-header h3 {
  color: #10b981;
  margin: 0;
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.users-list {
  display: grid;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.user-item {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info strong {
  color: #d1d5db;
  display: block;
}

.user-info small {
  color: #9ca3af;
}

.user-badges {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge.vip {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.badge.subscriber {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.user-details {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
}

.user-dates span {
  display: block;
  margin: 0.2rem 0;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

/* Alerts Section Styles */
.alert-form {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.alert-form h3 {
  color: #10b981;
  margin-bottom: 1rem;
}

.form-hint {
  display: block;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-style: italic;
}

.alerts-list {
  display: grid;
  gap: 1rem;
}

.alert-card {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-info {
  flex: 1;
}

.alert-title {
  color: #ef4444;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.alert-details {
  display: grid;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.alert-details .label {
  color: #9ca3af;
  margin-right: 0.5rem;
}

.alert-link {
  color: #3b82f6;
  text-decoration: none;
}

.alert-link:hover {
  text-decoration: underline;
}

.alert-audio, .alert-gif, .alert-duration {
  color: #d1d5db;
}

.no-alerts {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .command-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .command-actions {
    margin-top: 0.5rem;
  }
}

/* Trigger Type Styles */
.trigger-type {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
}

.help-text {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}
</style>