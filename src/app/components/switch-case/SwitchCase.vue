<script setup lang="ts">
import { provide, ref, watch } from "vue";
interface Props {
  case: string | number | boolean;
}

const props = defineProps<Props>();

const switchCase = ref(props.case);

provide("switch-case", switchCase);

watch(
  () => props.case,
  () => {
    switchCase.value = props.case;
  }
);
</script>

<template>
  <slot></slot>
</template>
