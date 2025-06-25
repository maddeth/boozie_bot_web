import { ref, computed } from 'vue'
import { supabase } from '../supabase.js'

// Global state for user role
const userRole = ref(null)
const loading = ref(false)
const error = ref(null)

export function useUserRole() {
  const isModerator = computed(() => userRole.value?.roles?.isModerator || false)
  const isAdmin = computed(() => userRole.value?.roles?.isAdmin || false)
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
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        userRole.value = await response.json()
      } else if (response.status === 404) {
        // User not found in database - they need to visit stream first
        userRole.value = {
          username: session.data.session.user.user_metadata.name || 'Unknown',
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
      const response = await fetch('/api/user/me/moderator', {
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
      const response = await fetch('/api/user/stats', {
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
      const response = await fetch('/api/user/moderators', {
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