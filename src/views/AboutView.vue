<script setup lang="ts">
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
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
