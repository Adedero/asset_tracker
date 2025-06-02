<script setup lang="ts">
import { useAttrs } from "vue";

interface Props {
  error?: any;
  closable?: boolean;
  life?: number;
  size?: "small" | "large";
  shouldRetry?: boolean;
}

const { error, closable = true, life, size = "small", shouldRetry = false } = defineProps<Props>();

const emit = defineEmits(["retry"]);

const attrs = useAttrs();
</script>

<template>
  <Message
    v-if="error"
    :closable="closable"
    :life="life"
    :size="size"
    severity="error"
    v-bind="attrs"
    class="*:block"
  >
    <template #container="{ closeCallback }">
      <div class="py-3 px-2.5">
        <div class="flex items-start gap-2 text-sm font-medium">
          <span class="pi pi-info-circle block shrink-0 translate-y-0.5"></span>
          <p class="flex-grow">
            {{ error.data?.statusMessage || error.statusMessage || error.message || error }}
          </p>
          <Button
            size="small"
            icon="pi pi-times"
            text
            severity="danger"
            rounded
            class="ml-1 shrink-0 hover:bg-red-100"
            @click="closeCallback"
          />
        </div>

        <div v-if="shouldRetry" class="mt-2 flex items-center justify-end w-full">
          <Button
            size="small"
            label="Retry"
            icon-pos="right"
            icon="pi pi-refresh"
            severity="danger"
            @click="$emit('retry')"
          />
        </div>
      </div>
    </template>
  </Message>
</template>
