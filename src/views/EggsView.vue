<template>
  <div class="page">
    <div class="container">
      <div class="page-header">
        <h1>🥚 Egg System</h1>
        <p>
          Earn eggs by watching the stream and participating in chat! 
          Subscribers get bonus eggs every 15 minutes while the stream is live.
        </p>
      </div>
      
      <EggDisplay :session="session" />
      
      <div class="info-section">
        <h2>How to Earn Eggs</h2>
        <div class="info-grid">
          <div class="info-card">
            <h3>💬 Chat Participation</h3>
            <p>Be active in chat while the stream is live to earn eggs every 15 minutes.</p>
          </div>
          
          <div class="info-card">
            <h3>⭐ Subscription Bonuses</h3>
            <div class="tier-list">
              <div class="tier">
                <span class="tier-name">Viewer:</span>
                <span class="tier-eggs">5 eggs</span>
              </div>
              <div class="tier">
                <span class="tier-name">Tier 1 Sub:</span>
                <span class="tier-eggs">10 eggs</span>
              </div>
              <div class="tier">
                <span class="tier-name">Tier 2 Sub:</span>
                <span class="tier-eggs">15 eggs</span>
              </div>
              <div class="tier">
                <span class="tier-name">Tier 3 Sub:</span>
                <span class="tier-eggs">20 eggs</span>
              </div>
            </div>
          </div>
          
          <div class="info-card">
            <h3>🎮 Special Events</h3>
            <p>Moderators can award bonus eggs for special occasions, games, and community events.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EggDisplay from '../components/EggDisplay.vue'

export default {
  name: 'EggsView',
  props: {
    session: {
      type: Object,
      default: null
    }
  },
  components: {
    EggDisplay
  }
}
</script>

<style scoped>
.page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  padding: 0 1rem;
  max-width: 1400px;
  margin: 0 auto;
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

.page-header p {
  color: #d1d5db;
  margin: 0;
}

.info-section {
  margin-top: 50px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 15px;
}

.info-section h2 {
  text-align: center;
  color: #333;
  margin: 0 0 30px 0;
  font-size: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.info-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.info-card h3 {
  color: #333;
  margin: 0 0 15px 0;
  font-size: 1.3rem;
}

.info-card p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tier {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f1f3f4;
  border-radius: 6px;
  font-size: 0.95rem;
}

.tier-name {
  color: #333;
  font-weight: 500;
}

.tier-eggs {
  color: #28a745;
  font-weight: bold;
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 2.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-section {
    padding: 20px;
  }
}
</style>