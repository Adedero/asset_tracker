<script setup lang="ts">
import { useErrorPage } from "@/app/composables/use-error";
import { useRoute } from "vue-router";
import type { InvestmentPlanApiResponse } from "@/modules/user/investment-plans/investment-plans-get.api";
import useSWRV from "swrv";
import { $fetch } from "@/app/composables/use-fetch";
import { dollar } from "@/app/utils/helpers";

const route = useRoute();
const investment_plan_id = route.params.investment_plan_id?.toString();
if (!investment_plan_id) {
  useErrorPage({ status: 404, message: "Investment plan not found" });
}

const { isLoading, data, error, mutate } = useSWRV<InvestmentPlanApiResponse>(
  () => `/api/users/me/investment-plans/${investment_plan_id}`,
  $fetch
);
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <div class="v-card !py-2">
        <p class="font-semibold text-lg text-primary-500 dark:text-primary-400">
          {{ data?.plan?.name ?? "Investment Plan" }}
        </p>
      </div>

      <div class="overflow-y-auto md:h-[calc(100dvh-7.8rem)]">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="w-full h-full flex-center">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div v-else-if="data" class="w-full py-2 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="tier in data.plan.tiers" :key="tier.name" class="v-card">
            <div class="flex flex-col gap-2 items-center justify-center">
              <p class="uppercase text-lg text-center font-semibold">{{ tier.name }}</p>
              <SvgIcon v-if="tier.name.toLowerCase() === 'basic'" name="plant" size="80" />
              <SvgIcon v-if="tier.name.toLowerCase() === 'bronze'" name="bronze-medal" size="80" />
              <SvgIcon v-if="tier.name.toLowerCase() === 'silver'" name="silver-medal" size="80" />
              <SvgIcon v-if="tier.name.toLowerCase() === 'gold'" name="gold-medal" size="80" />
              <SvgIcon v-if="tier.name.toLowerCase() === 'platinum'" name="platinum" size="80" />
            </div>
            <Divider />
            <div class="w-full">
              <div class="grid grid-cols-3 text-sm">
                <p class="col-span-2 flex items-center gap-1 text-mute">
                  <span class="pi pi-money-bill" />
                  Minimum Amount
                </p>
                <p class="text-right font-semibold">{{ dollar.format(tier.minimumDeposit) }}</p>
              </div>
              <Divider />
              <div class="grid grid-cols-3 text-sm">
                <p class="col-span-2 flex items-center gap-1 text-mute">
                  <span class="pi pi-calendar" />
                  Term
                </p>
                <p class="text-right font-semibold">{{ tier.duration }} days</p>
              </div>
              <Divider />
              <div class="grid grid-cols-3 text-sm">
                <p class="col-span-2 flex items-center gap-1 text-mute">
                  <span class="pi pi-replay" />
                  Expected Return
                </p>
                <p class="text-right font-semibold">{{ tier.expectedReturnRate }}%</p>
              </div>
              <Divider />
              <Button
                @click="
                  $router.push({
                    name: 'user-investment-purchase',
                    params: {
                      investment_plan_slug: data.plan.slug,
                      investment_plan_tier_name: tier.name.toLowerCase()
                    }
                  })
                "
                fluid
                size="small"
                icon="pi pi-check"
                label="Invest"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
