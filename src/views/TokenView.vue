<script setup>
import Footer from '@/components/Footer.vue';
import Token from '@/components/Token.vue';
</script>

<template>
  <div class="page">
    <div class="container">
      <Token />
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
</style>
