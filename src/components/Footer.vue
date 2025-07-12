<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-brand">
            <img src="https://static-cdn.jtvnw.net/jtv_user_pictures/6351700d-d3e6-4c31-ac7f-f6b9b1fb9d75-profile_image-70x70.png" alt="Boozie Bot" class="footer-logo" />
            <span class="footer-title">Boozie Bot</span>
          </div>
          <p class="footer-description">
            Stream companion bot for Twitch with eggs, colours, and community features
          </p>
        </div>
        
        <div class="footer-credit">
          <p>Created and maintained by <a href="https://twitch.tv/maddeth" target="_blank" rel="noopener noreferrer" class="creator-link">Maddeth</a></p>
          <p class="version">Version {{ appVersion }}</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Boozie Bot. All rights reserved.</p>
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
  margin-top: 4rem;
  padding: 2rem 0 1rem;
  color: #d1d5db;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.footer-info {
  flex: 1;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.footer-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #10b981;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
}

.footer-description {
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
  max-width: 400px;
}

.footer-credit {
  text-align: right;
  flex-shrink: 0;
}

.footer-credit p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
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
  font-size: 0.8rem;
}

.footer-bottom {
  padding-top: 1rem;
  border-top: 1px solid #374151;
  text-align: center;
}

.footer-bottom p {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer {
    padding: 1.5rem 0 1rem;
    margin-top: 2rem;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .footer-credit {
    text-align: left;
  }
  
  .footer-brand {
    justify-content: center;
    text-align: center;
  }
  
  .footer-description {
    text-align: center;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 1rem 0;
    margin-top: 1.5rem;
  }
  
  .footer-content {
    gap: 1rem;
  }
  
  .footer-title {
    font-size: 1.25rem;
  }
  
  .footer-logo {
    width: 32px;
    height: 32px;
  }
}
</style>