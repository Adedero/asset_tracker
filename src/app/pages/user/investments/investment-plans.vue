<script setup lang="ts">
import { $fetch } from "@/app/composables/use-fetch";
import type { InvestmentPlansApiResponse } from "@/modules/user/investment-plans/investment-plans-get.api";
import useSWRV from "swrv";

const { isLoading, data, error, mutate } = useSWRV<InvestmentPlansApiResponse>(
  () => `/api/users/me/investment-plans`,
  $fetch
);
</script>

<template>
  <VueLayout name="user">
    <div class="h-full overflow-y-auto">
      <VNavbar />

      <div class="overflow-y-auto md:h-[calc(100dvh-7.8rem)]">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="w-full h-full flex-center">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div v-else-if="data" class="pt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <VCard v-for="plan in data.plans" :key="plan.id">
            <div class="grid gap-2 relative">
              <div class="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                <img v-if="plan.image" :src="plan.image" class="w-full h-full object-cover" />
              </div>
              <p class="font-semibold text-center">{{ plan.name }}</p>
              <Button
                @click="
                  $router.push({
                    name: 'user-investment-plan-item',
                    params: { investment_plan_id: plan.id }
                  })
                "
                label="Details"
                fluid
              />
            </div>
          </VCard>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
