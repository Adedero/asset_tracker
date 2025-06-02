<script setup lang="ts">
import { APP_NAME } from "@/app/data/constants";

interface Props {
  message?: string;
  sub?: string;
}

const {
  message = "Ready to get started?\nOpen an account today.",
  sub = `And build a better future with ${APP_NAME}`
} = defineProps<Props>();
</script>

<template>
  <div class="flex-col-center w-full text-center gap-3 rounded p-6 bg-gradient-x text-white">
    <header class="font-semibold text-3xl md:text-4xl">
      <p class="whitespace-pre-wrap">{{ message }}</p>
    </header>

    <p>{{ sub }}</p>

    <RouterLink :to="{ name: 'register' }">
      <Button
        label="Get Started"
        class="border-transparent text-primary-500 bg-white hover:bg-slate-100 transition-colors"
      />
    </RouterLink>
  </div>
</template>
