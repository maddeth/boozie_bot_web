<script setup>
import { supabase } from '../supabase.js'
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserRole } from '../composables/useUserRole.js'

const props = defineProps(['session'])

const loading = ref(true)
const metadata = ref(null)
const { userRole, isModerator, loadUserRole } = useUserRole()
const showProfileDropdown = ref(false)
const profileButton = ref(null)
const profileDropdown = ref(null)

async function signOut() {
  try {
    loading.value = true
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value
}

const closeDropdown = () => {
  showProfileDropdown.value = false
}

const handleClickOutside = (event) => {
  if (profileButton.value && profileDropdown.value) {
    if (!profileButton.value.contains(event.target) && !profileDropdown.value.contains(event.target)) {
      showProfileDropdown.value = false
    }
  }
}

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      metadata.value = user.user_metadata
      // Load user role to determine if they're a moderator
      await loadUserRole()
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  } finally {
    loading.value = false
  }
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<template>
  <header class="app-header">
    <div class="header-top">
      <div class="header-brand">
        <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/6351700d-d3e6-4c31-ac7f-f6b9b1fb9d75-profile_image-70x70.png" alt="Boozie Bot" class="brand-logo" />
        <h1>Boozie Bot</h1>
      </div>
      
      <div v-if="metadata" class="header-user">
        <div class="user-profile" @click="toggleProfileDropdown" ref="profileButton">
          <img class="user-avatar" :src="metadata.avatar_url" :alt="metadata.nickname" />
          <span class="user-name">{{ metadata.nickname }}</span>
          <svg class="dropdown-arrow" :class="{ 'rotated': showProfileDropdown }" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </div>
        
        <!-- Profile Dropdown -->
        <div v-if="showProfileDropdown" class="profile-dropdown" ref="profileDropdown">
          <router-link to="/" class="dropdown-item" @click="closeDropdown">
            <span class="dropdown-icon">👤</span>
            Your Account
          </router-link>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item sign-out-item" @click="signOut" :disabled="loading">
            <span class="dropdown-icon">🚪</span>
            {{ loading ? 'Signing out...' : 'Sign Out' }}
          </button>
        </div>
      </div>
    </div>
    
    <nav class="header-nav">
      <ul class="nav-list">
        <li><router-link to="/" class="nav-link">🏠 Home</router-link></li>
        <li><router-link to="/colours" class="nav-link">🎨 Colours</router-link></li>
        <li><router-link to="/eggs" class="nav-link">🥚 Eggs</router-link></li>
        <li><router-link to="/token" class="nav-link">🔑 API Token</router-link></li>
        <li v-if="isModerator" class="moderator-link">
          <router-link to="/moderator" class="nav-link">🛡️ Moderator</router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-bottom: 3px solid #10b981;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.1);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #10b981;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
}

.header-brand h1 {
  margin: 0;
  color: #10b981;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-user {
  position: relative;
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 25px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.user-profile:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #10b981;
  object-fit: cover;
}

.user-name {
  color: #f3f4f6;
  font-weight: 500;
  font-size: 0.95rem;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  color: #d1d5db;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border: 1px solid #4b5563;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.dropdown-item.sign-out-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-icon {
  font-size: 1rem;
  width: 1.2rem;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: #4b5563;
  margin: 0.5rem 0;
}

.header-nav {
  background: rgba(0, 0, 0, 0.2);
  padding: 0;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 0;
}

.nav-list li {
  position: relative;
}

.nav-link {
  display: block;
  color: #d1d5db;
  text-decoration: none;
  padding: 1rem 1.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
}

.nav-link:hover {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-bottom-color: rgba(16, 185, 129, 0.3);
}

.nav-link.router-link-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border-bottom-color: #10b981;
}

.moderator-link .nav-link {
  color: #34d399;
  font-weight: 600;
}

.moderator-link .nav-link:hover {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-bottom-color: rgba(16, 185, 129, 0.3);
}

.moderator-link .nav-link.router-link-active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%);
  border-bottom-color: #10b981;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .header-brand h1 {
    font-size: 1.5rem;
  }
  
  .nav-list {
    flex-direction: column;
  }
  
  .nav-link {
    padding: 0.75rem 1rem;
    text-align: center;
  }
  
  .user-info {
    order: -1;
  }
  
  .header-user {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .header-top {
    padding: 0.75rem;
  }
  
  .user-info {
    padding: 0.4rem 0.8rem;
  }
  
  .user-name {
    font-size: 0.85rem;
  }
  
  .sign-out-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .nav-link {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>