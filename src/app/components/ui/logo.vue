<script setup lang="ts">
import logo from "@/app/assets/img/logo.png";

interface Props {
  size?: string | number;
}

const { size = "28" } = defineProps<Props>();
</script>

<template>
  <img :src="logo" alt="Logo" :width="size" :height="size" />
</template>
