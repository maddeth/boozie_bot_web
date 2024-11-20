<script setup lang="ts">
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import ColoursList from '@/components/ColoursList.vue';
import ColoursForm from '@/components/ColoursForm.vue';
</script>

<template>
  <header>
    <Header />
  </header>
  <main>
    <ColoursList />
    <ColoursForm />
  </main>
  <footer>
    <Footer />
  </footer>
</template>
