<script setup lang="ts">
import AboutColours from '@/components/AboutColours.vue';
</script>


<template>
  <header>
    <Header />
  </header>
  <main>
    <AboutColours />
  </main>
  <footer>
    <Footer />
  </footer>
</template>


<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
