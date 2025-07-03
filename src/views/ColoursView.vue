<script setup lang="ts">
import Footer from '@/components/Footer.vue';
import ColoursList from '@/components/ColoursList.vue';
import ColoursForm from '@/components/ColoursForm.vue';
import { ref } from 'vue';

const props = defineProps(['session'])
const coloursListRef = ref()

const handleColourAdded = () => {
  // Refresh the latest colour when a new one is added
  if (coloursListRef.value && coloursListRef.value.refreshLatestColour) {
    coloursListRef.value.refreshLatestColour()
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>🎨 Colours</h1>
        <p>Personalize your chat experience with custom colours. Browse existing colours or create your own!</p>
      </div>
      
      <ColoursList ref="coloursListRef" :session="session" />
      <ColoursForm :session="session" @colour-added="handleColourAdded" />
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
</style>
