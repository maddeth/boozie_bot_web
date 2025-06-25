<script setup>
import Alerts from '@/components/Alerts.vue';
</script>

<template>
  <div class="page">
    <div class="container">
      <Alerts />
    </div>
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
