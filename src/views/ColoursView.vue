<script setup lang="ts">
import Footer from '@/components/Footer.vue';
import ColoursList from '@/components/ColoursList.vue';
import ColoursForm from '@/components/ColoursForm.vue';

const props = defineProps(['session'])
</script>

<template>
  <div class="page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>🎨 Colours</h1>
        <p>Personalize your chat experience with custom colours. Browse existing colours or create your own!</p>
      </div>
      
      <ColoursList :session="session" />
      <ColoursForm :session="session" />
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #10b981;
  text-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

.page-header p {
  color: #d1d5db;
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}
</style>
