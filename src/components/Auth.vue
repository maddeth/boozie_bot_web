<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase.js'

const loading = ref(false)

const handleLogin = async () => {
  try {
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: 'https://boozie-bot-web.pages.dev',
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <h1>🤖 Boozie Bot</h1>
          <div class="logo-accent"></div>
        </div>
        <p class="welcome-text">Welcome to the stream companion bot</p>
      </div>
      
      <div class="auth-content">
        <div class="auth-description">
          <h2>Sign in with Twitch</h2>
          <p>Connect your Twitch account to access:</p>
          <ul class="feature-list">
            <li>🥚 Egg collection and leaderboards</li>
            <li>🎨 Custom chat colors</li>
            <li>🛡️ Moderator tools (if applicable)</li>
            <li>🔗 API token for integrations</li>
          </ul>
        </div>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <button
            type="submit"
            class="twitch-login-btn"
            :disabled="loading"
          >
            <div class="btn-content">
              <svg class="twitch-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
              <span>{{ loading ? 'Connecting...' : 'Continue with Twitch' }}</span>
            </div>
          </button>
        </form>
        
        <div class="auth-footer">
          <p class="privacy-note">
            🔒 Your Twitch data is used only for authentication and bot features. 
            We never access your private information.
          </p>
        </div>
      </div>
    </div>
    
    <div class="background-pattern">
      <div class="pattern-dot"></div>
      <div class="pattern-dot"></div>
      <div class="pattern-dot"></div>
      <div class="pattern-dot"></div>
      <div class="pattern-dot"></div>
      <div class="pattern-dot"></div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%);
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

.auth-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 480px;
  width: 100%;
  position: relative;
  z-index: 10;
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.auth-header {
  text-align: center;
  padding: 2.5rem 2rem 1.5rem;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-radius: 20px 20px 0 0;
  position: relative;
}

.logo h1 {
  color: #10b981;
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.logo-accent {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 2px;
  margin: 1rem auto 0;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

.welcome-text {
  color: #d1d5db;
  font-size: 1.1rem;
  margin: 1.5rem 0 0;
  opacity: 0.9;
}

.auth-content {
  padding: 2rem;
}

.auth-description {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-description h2 {
  color: #333;
  font-size: 1.6rem;
  margin: 0 0 1rem;
  font-weight: 600;
}

.auth-description p {
  color: #666;
  font-size: 1rem;
  margin: 0 0 1.5rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.feature-list li {
  color: #333;
  font-size: 0.95rem;
  margin: 0.75rem 0;
  padding-left: 0.5rem;
  line-height: 1.4;
}

.auth-form {
  margin: 2rem 0;
}

.twitch-login-btn {
  width: 100%;
  background: linear-gradient(135deg, #9146ff 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(145, 70, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.twitch-login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(145, 70, 255, 0.4);
}

.twitch-login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.twitch-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.twitch-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.auth-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.privacy-note {
  color: #666;
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

/* Background Pattern */
.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.pattern-dot {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.pattern-dot:nth-child(1) {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.pattern-dot:nth-child(2) {
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}

.pattern-dot:nth-child(3) {
  bottom: 30%;
  left: 15%;
  animation-delay: 2s;
}

.pattern-dot:nth-child(4) {
  bottom: 10%;
  right: 20%;
  animation-delay: 3s;
}

.pattern-dot:nth-child(5) {
  top: 50%;
  left: 5%;
  animation-delay: 4s;
}

.pattern-dot:nth-child(6) {
  top: 60%;
  right: 5%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    opacity: 0.9;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-container {
    padding: 1rem;
  }
  
  .auth-card {
    max-width: 100%;
    margin: 0 auto;
  }
  
  .auth-header {
    padding: 2rem 1.5rem 1.5rem;
  }
  
  .logo h1 {
    font-size: 2rem;
  }
  
  .auth-content {
    padding: 1.5rem;
  }
  
  .auth-description h2 {
    font-size: 1.4rem;
  }
  
  .feature-list {
    padding: 1.25rem;
  }
  
  .twitch-login-btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
  
  .pattern-dot {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .auth-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .logo h1 {
    font-size: 1.75rem;
  }
  
  .welcome-text {
    font-size: 1rem;
  }
  
  .auth-content {
    padding: 1.25rem;
  }
  
  .feature-list {
    padding: 1rem;
  }
  
  .feature-list li {
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  .twitch-login-btn {
    padding: 0.75rem 1.25rem;
    font-size: 0.95rem;
  }
  
  .btn-content {
    gap: 0.5rem;
  }
  
  .twitch-icon {
    width: 20px;
    height: 20px;
  }
}
</style>