<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-brand">
            <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/6351700d-d3e6-4c31-ac7f-f6b9b1fb9d75-profile_image-70x70.png" alt="Boozie Bot" class="footer-logo" />
            <span class="footer-title">Boozie Bot</span>
          </div>
          <span class="footer-separator">•</span>
          <p class="footer-description">
            Stream companion bot for Twitch
          </p>
        </div>
        
        <div class="footer-credit">
          <p>Created by <a href="https://twitch.tv/maddeth" target="_blank" rel="noopener noreferrer" class="creator-link">Maddeth</a></p>
          <span class="footer-separator">•</span>
          <p class="version">v{{ appVersion }}</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = new Date().getFullYear()
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-top: 1px solid #374151;
  margin-top: 2rem;
  padding: 1rem 0;
  color: #d1d5db;
  height: 80px;
  display: flex;
  align-items: center;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  width: 100%;
}

.footer-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-logo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #10b981;
}

.footer-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #10b981;
}

.footer-description {
  color: #9ca3af;
  margin: 0;
  line-height: 1.2;
  font-size: 0.85rem;
}

.footer-credit {
  text-align: right;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-credit p {
  margin: 0;
  font-size: 0.85rem;
}

.creator-link {
  color: #10b981;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.creator-link:hover {
  color: #34d399;
  text-decoration: underline;
}

.version {
  color: #6b7280;
  font-size: 0.75rem;
}

.footer-separator {
  color: #4b5563;
  margin: 0 0.5rem;
  font-size: 0.8rem;
}

.footer-bottom {
  display: none;
}

.footer-bottom p {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer {
    height: auto;
    min-height: 80px;
    padding: 1rem 0;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .footer-info {
    justify-content: center;
  }
  
  .footer-credit {
    gap: 0.5rem;
  }
  
  .footer-separator {
    display: none;
  }
  
  .footer-description {
    display: none;
  }
}

@media (max-width: 480px) {
  .footer-title {
    font-size: 1rem;
  }
  
  .footer-logo {
    width: 24px;
    height: 24px;
  }
  
  .footer-credit p {
    font-size: 0.8rem;
  }
}
</style>