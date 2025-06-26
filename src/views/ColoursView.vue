<script setup lang="ts">
import Footer from '@/components/Footer.vue';
import ColoursList from '@/components/ColoursList.vue';
import ColoursForm from '@/components/ColoursForm.vue';

const props = defineProps(['session'])
</script>

<template>
  <div class="page">
    <div class="container">
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
</style>
