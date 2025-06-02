<script setup lang="ts">
import { $fetch } from "@/app/composables/use-fetch";
import { dollar } from "@/app/utils/helpers";
import { InvestmentInitApiResponse } from "@/modules/user/investments/investments-init.api";
import useSWRV from "swrv";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const investment_plan_slug = route.params.investment_plan_slug.toString();
const investment_plan_tier_name = route.params.investment_plan_tier_name.toString();

const {
  isLoading: initializing,
  data: initData,
  error: errorInitializing,
  mutate: initialize
} = useSWRV<InvestmentInitApiResponse>(
  `/api/users/me/investments/initialize/${investment_plan_slug}`,
  $fetch
);

const selectedTier = computed(() => {
  return initData.value?.plan.tiers?.find((tier) => {
    return tier.name.toLowerCase() === investment_plan_tier_name.toLowerCase();
  });
});
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VPageLoader v-if="initializing" />

      <div v-else-if="errorInitializing" class="w-full flex-center">
        <VErrorMessage :error="errorInitializing" should-retry @retry="initialize" />
      </div>

      <div v-else-if="initData" class="grid gap-2 md:grid-cols-5 lg:grid-cols-3">
        <div class="md:col-span-2 lg:col-span-1">
          <div class="v-card grid">
            <Tag severity="secondary" :value="initData.plan.name" class="dark:bg-slate-800" />
            <div v-if="selectedTier" class="mt-2 flex flex-col gap-2 items-center justify-center">
              <p class="uppercase text-lg text-center font-semibold">
                {{ selectedTier.name }}
              </p>
              <SvgIcon v-if="selectedTier.name.toLowerCase() === 'basic'" name="plant" size="100" />
              <SvgIcon
                v-if="selectedTier.name.toLowerCase() === 'bronze'"
                name="bronze-medal"
                size="100"
              />
              <SvgIcon
                v-if="selectedTier.name.toLowerCase() === 'silver'"
                name="silver-medal"
                size="100"
              />
              <SvgIcon
                v-if="selectedTier.name.toLowerCase() === 'gold'"
                name="gold-medal"
                size="100"
              />
              <SvgIcon
                v-if="selectedTier.name.toLowerCase() === 'platinum'"
                name="platinum"
                size="100"
              />
            </div>
            <Divider />
            <div v-if="selectedTier" class="w-full">
              <div class="grid grid-cols-3 text-sm">
                <p class="col-span-2 flex items-center gap-1 text-mute">
                  <span class="pi pi-money-bill" />
                  Minimum Amount
                </p>
                <p class="text-right font-semibold">
                  {{ dollar.format(selectedTier.minimumDeposit) }}
                </p>
              </div>
              <Divider />
              <div class="grid grid-cols-3 text-sm">
                <p class="col-span-2 flex items-center gap-1 text-mute">
                  <span class="pi pi-calendar" />
                  Term
                </p>
                <p class="text-right font-semibold">{{ selectedTier.duration }} days</p>
              </div>
              <Divider />
              <div class="grid grid-cols-3 text-sm">
                <p class="col-span-2 flex items-center gap-1 text-mute">
                  <span class="pi pi-replay" />
                  Expected Return
                </p>
                <p class="text-right font-semibold">{{ selectedTier.expectedReturnRate }}%</p>
              </div>
              <Divider />
              <p class="text-xs text-mute">
                <span class="pi pi-info-circle float-left mr-1" />
                By proceeding with this investment, you know and acknowledge the
                <RouterLink
                  :to="{ name: 'user-risk-acknowledgment' }"
                  class="text-primary-500 font-semibold hover:underline"
                  >risks of investment</RouterLink
                >
                and agree to our
                <RouterLink
                  target="_blank"
                  :to="{ name: 'terms-of-use' }"
                  class="text-primary-500 font-semibold hover:underline"
                >
                  terms of use
                  <span
                    class="pi pi-external-link"
                    style="font-size: 0.6rem; font-weight: 700"
                  /> </RouterLink
                >.
              </p>
            </div>
          </div>

          <RouterLink :to="{ name: 'user-investment-plans' }">
            <Button
              severity="secondary"
              fluid
              label="Back to investment plans"
              class="mt-4 border-transparent bg-slate-300 dark:bg-slate-700"
            />
          </RouterLink>
        </div>

        <div class="md:col-span-3 lg:col-span-2">
          <div class="v-card">
            <div class="flex gap-3">
              <span
                class="pi pi-wallet bg-blue-400 dark:bg-blue-500/30 rounded-full p-2 text-white"
              />
              <div class="flex-grow flex items-center gap-x-2 justify-between flex-wrap">
                <p class="text-mute text-sm md:text-base">Available Balance</p>
                <p class="text-xl md:text-2xl font-semibold text-green-600">
                  {{ dollar.format(initData.walletBalance) }}
                </p>
              </div>
            </div>

            <Divider />

            <div v-if="selectedTier">
              <InvestmentPurchaseForm
                :investment-name="initData.plan.name"
                :investment-tier="selectedTier"
                :wallet-balance="initData.walletBalance"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
