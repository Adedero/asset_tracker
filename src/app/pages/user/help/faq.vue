<script setup lang="ts">
import { FaqGetApiResponse } from "@/modules/user/faq/faq-get.api";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";

const { isLoading, data, error, mutate } = useSWRV<FaqGetApiResponse>(
  () => "/api/users/me/faq",
  $fetch
);
</script>

<template>
  <VueLayout name="user">
    <VNavbar>
      <template #left>
        <h1 class="text-lg font-semibold text-primary-500 dark:text-primary-400">
          Frequently Asked Questions
        </h1>
      </template>

      <template #right>
        <RouterLink :to="{ name: 'user-help-center' }">
          <Button severity="secondary" label="Help Center" size="small" icon="pi pi-arrow-left" />
        </RouterLink>
      </template>
    </VNavbar>

    <div class="md:h-[calc(100dvh-8.5rem)]">
      <VPageLoader v-if="isLoading" />

      <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

      <div
        v-else-if="data"
        class="mt-2 py-2 flex gap-2 *:flex-shrink-0 md:h-[calc(100dvh-9rem)] overflow-y-auto justify-center"
      >
        <div class="w-full h-fit max-w-[32rem] grid gap-4">
          <RouterLink
            v-for="(f, i) in data.faq"
            :key="f.id"
            :to="{ name: 'user-faq-item', params: { faq_item_slug: f.slug } }"
          >
            <VCard :header="`${i + 1}) ${f.title}`" class="w-full max-w-[32rem] hover:bg-slate-50">
              <p class="line-clamp-1">
                {{ f.description }}
              </p>
            </VCard>
          </RouterLink>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
