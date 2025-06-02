<script setup lang="ts">
import { FaqItemGetApiResponse } from "@/modules/user/faq/faq-get.api";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { useRoute } from "vue-router";

const route = useRoute();
const { faq_item_slug } = route.params;

const { isLoading, data, error, mutate } = useSWRV<FaqItemGetApiResponse>(
  () => `/api/users/me/faq/${faq_item_slug}`,
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
        <RouterLink :to="{ name: 'user-faq' }">
          <Button severity="secondary" label="FAQs" size="small" icon="pi pi-arrow-left" />
        </RouterLink>
      </template>
    </VNavbar>

    <div class="md:h-[calc(100dvh-8.5rem)]">
      <VPageLoader v-if="isLoading" />

      <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

      <div v-else-if="data">
        <div
          class="mt-2 py-2 flex gap-2 *:flex-shrink-0 md:h-[calc(100dvh-9rem)] overflow-y-auto justify-center"
        >
          <div class="w-full h-fit max-w-[32rem] grid gap-4 bg-slate-200 p-4 rounded-lg">
            <div class="v-card !p-3">
              <h1 class="text-lg text-center font-semibold text-primary-500 dark:text-primary-400">
                {{ data.faq.title }}
              </h1>
            </div>

            <p class="whitespace-pre-wrap">{{ data.faq.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
