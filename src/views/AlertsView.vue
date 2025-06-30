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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  position: relative;
}

.container {
  flex: 1;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
