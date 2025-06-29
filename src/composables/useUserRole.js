import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'

// Global state for user role
const userRole = ref(null)
const loading = ref(false)
const error = ref(null)

export function useUserRole() {
  const isModerator = computed(() => userRole.value?.roles?.isModerator || false)
  const isAdmin = computed(() => userRole.value?.roles?.isAdmin || false)
  const isBotModerator = computed(() => userRole.value?.roles?.isAdmin || false) // Alias for clarity
  const isSuperAdmin = computed(() => userRole.value?.roles?.isSuperAdmin || false)
  const isSubscriber = computed(() => userRole.value?.roles?.isSubscriber || false)
  
  const loadUserRole = async () => {
    loading.value = true
    error.value = null
    
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('No active session')
      }
      
      const token = session.data.session.access_token
      const response = await fetch('https://maddeth.com/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        userRole.value = await response.json()
      } else if (response.status === 404) {
        // User not found in database - try to link with existing Twitch user
        const user = session.data.session.user
        const twitchUsername = user.user_metadata.name || user.user_metadata.preferred_username
        
        if (twitchUsername) {
          // Try to link the account by calling a special endpoint
          const linkResponse = await fetch('https://maddeth.com/api/user/link', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              twitchUsername: twitchUsername.toLowerCase(),
              supabaseUserId: user.id,
              email: user.email
            })
          })
          
          if (linkResponse.ok) {
            // Account linked successfully, try loading role again
            const retryResponse = await fetch('https://maddeth.com/api/user/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (retryResponse.ok) {
              userRole.value = await retryResponse.json()
              return
            }
          }
        }
        
        // Fallback - user not found in database
        userRole.value = {
          username: twitchUsername || 'Unknown',
          roles: {
            isModerator: false,
            isAdmin: false,
            isVip: false,
            isSubscriber: false
          },
          needsVisit: true
        }
      } else {
        throw new Error(`Failed to load user role: ${response.statusText}`)
      }
    } catch (err) {
      console.error('Error loading user role:', err)
      error.value = err.message
      userRole.value = null
    } finally {
      loading.value = false
    }
  }
  
  const checkModeratorStatus = async () => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return false
      
      const token = session.data.session.access_token
      const response = await fetch('https://maddeth.com/api/user/me/moderator', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.isModerator
      }
      return false
    } catch (err) {
      console.error('Error checking moderator status:', err)
      return false
    }
  }
  
  const getUserStats = async () => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) throw new Error('No session')
      
      const token = session.data.session.access_token
      const response = await fetch('https://maddeth.com/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      console.error('Error fetching user stats:', err)
      throw err
    }
  }
  
  const getModerators = async () => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) throw new Error('No session')
      
      const token = session.data.session.access_token
      const response = await fetch('https://maddeth.com/api/user/moderators', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch moderators: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (err) {
      console.error('Error fetching moderators:', err)
      throw err
    }
  }
  
  return {
    userRole: readonly(userRole),
    loading: readonly(loading),
    error: readonly(error),
    isModerator,
    isAdmin,
    isBotModerator,
    isSuperAdmin,
    isSubscriber,
    loadUserRole,
    checkModeratorStatus,
    getUserStats,
    getModerators
  }
}

function readonly(ref) {
  return computed(() => ref.value)
}