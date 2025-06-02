<script setup lang="ts">
import { useHead } from "@unhead/vue";

useHead({
  title: "404 Not Found"
});
</script>

<template>
  <VueLayout name="main">
    <main class="h-[75dvh] flex-col-center gap-4">
      <p class="text-6xl font-semibold">500</p>
      <h2 class="text-2xl font-semibold">Page Not Found</h2>
      <p class="mt-2 text-mute">Sorry, the page you are looking for does not exist.</p>
    </main>
  </VueLayout>
</template>
