<script setup>
import Footer from '@/components/Footer.vue';
import LoggedIn from '@/components/LoggedIn.vue';
</script>

<template>
  <div class="page">
    <div class="container">
      <LoggedIn />
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
  max-width: 1200px;
  margin: 0 auto;
}
</style>
