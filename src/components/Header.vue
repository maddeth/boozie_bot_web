<script setup>
import { supabase } from '../supabase.js'
import { ref, onMounted } from 'vue'
import { useUserRole } from '../composables/useUserRole.js'

const props = defineProps(['session'])

const loading = ref(true)
const metadata = ref(null)
const { userRole, isModerator, loadUserRole } = useUserRole()

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
})

</script>

<template>
  <header class="app-header">
    <div class="header-top">
      <div class="header-brand">
        <h1>🤖 Boozie Bot</h1>
      </div>
      
      <div v-if="metadata" class="header-user">
        <div class="user-info">
          <img class="user-avatar" :src="metadata.avatar_url" :alt="metadata.nickname" />
          <span class="user-name">{{ metadata.nickname }}</span>
        </div>
        <button class="sign-out-btn" @click="signOut" :disabled="loading">
          {{ loading ? 'Signing out...' : 'Sign Out' }}
        </button>
      </div>
    </div>
    
    <nav class="header-nav">
      <ul class="nav-list">
        <li><router-link to="/" class="nav-link">🏠 Home</router-link></li>
        <li><router-link to="/colours" class="nav-link">🎨 Colours</router-link></li>
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

.header-brand h1 {
  margin: 0;
  color: #10b981;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 25px;
  border: 1px solid rgba(16, 185, 129, 0.2);
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

.sign-out-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.sign-out-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
}

.sign-out-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
  color: #34d399 !important;
  font-weight: 600;
  border-bottom-color: rgba(52, 211, 153, 0.3);
}

.moderator-link .nav-link:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
  color: #10b981 !important;
  border-bottom-color: #34d399;
  box-shadow: inset 0 0 10px rgba(16, 185, 129, 0.1);
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