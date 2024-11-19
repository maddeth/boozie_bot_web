<script setup lang="ts">
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import Colours from '@/components/Colours.vue';
import ColoursForm from '@/components/ColoursForm.vue';
</script>

<template>
  <header>
    <Header />
  </header>
  <main>
    <Colours />
    <ColoursForm />
  </main>
  <footer>
    <Footer />
  </footer>
</template>
