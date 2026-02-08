<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import type { GetAllTiersApi } from "@/modules/admin/tiers/get-all-tiers.api";
import { computed, watch } from "vue";
import { MultiSelect, Select } from "primevue";
import { UserTier } from "@/prisma-gen";

const { tierId = null, multiple = false } = defineProps<{
  tierId?: string | null;
  multiple?: boolean;
}>();

const modelValue = defineModel<UserTier | UserTier[] | null | undefined>();

const {
  isFetching,
  error,
  data,
  execute: getTiers
} = useFetch(() => "/api/admins/me/tiers")
  .get()
  .json<GetAllTiersApi>();

const options = computed(() => data.value?.tiers ?? []);

watch([() => tierId, options], ([newTierId, newOptions]) => {
  if (newTierId) {
    const selectedTier = newOptions.find((tier) => tier.id === newTierId);
    modelValue.value = selectedTier || null;
  }
});

const component = computed(() => (multiple ? MultiSelect : Select));
</script>

<template>
  <template v-if="!error">
    <Component
      :is="component"
      v-model="modelValue"
      v-bind="$attrs"
      :options="options"
      :loading="isFetching"
      optionLabel="name"
    />
  </template>

  <template v-else>
    <Message severity="error" size="small">
      <div class="">
        <p>Failed to fetch user tiers: {{ error?.message }}</p>
        <Button label="Retry" size="small" severity="danger" @click="getTiers()" />
      </div>
    </Message>
  </template>
</template>
