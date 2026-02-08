<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import { computed, watch } from "vue";
import { AccountGroup } from "@/prisma-gen";
import type { AccountGroupsGetApiResponse } from "@/modules/admin/account-groups/account-groups-get.api";

const { accountGroupId = null } = defineProps<{ accountGroupId?: string | null }>();

const modelValue = defineModel<AccountGroup | null | undefined>();

const {
  isFetching,
  data,
  error,
  execute: getGroups
} = useFetch("/api/admins/me/account-groups").get().json<AccountGroupsGetApiResponse>();

const options = computed(() => data.value?.accountGroups ?? []);

watch([() => accountGroupId, options], ([newId, newOptions]) => {
  if (newId && newOptions) {
    modelValue.value = newOptions.find((group) => group.id === newId);
  }
});
</script>

<template>
  <template v-if="!error">
    <Select
      v-model="modelValue"
      v-bind="$attrs"
      :options="options"
      :loading="isFetching"
      option-label="name"
    />
  </template>

  <template v-else>
    <Message severity="error" size="small">
      <div class="">
        <p>Failed to fetch user tiers: {{ error?.message }}</p>
        <Button label="Retry" size="small" severity="danger" @click="getGroups()" />
      </div>
    </Message>
  </template>
</template>
