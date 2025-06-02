<script setup lang="ts">
import { computed } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import { InvestmentsGetApiResponse } from "@/modules/user/investments/investments-get.api";
import { dollar } from "@/app/utils/helpers";
import useSWRV from "swrv";

const searchParams = computed(() => {
  const params = new URLSearchParams();
  params.set("where", "investmentStatus,OPEN");
  params.set("sort", "createdAt;desc");
  return params.toString();
});

const { isLoading, data, error, mutate } = useSWRV<InvestmentsGetApiResponse>(
  () => `/api/users/me/investments?${searchParams.value}`,
  $fetch
);

const totalProfits = computed(() => {
  return data.value?.investments.reduce((acc, inv) => acc + inv.currentTotalReturns, 0) || 0;
});
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar>
        <template #right>
          <div class="flex items-center gap-2">
            <Button
              @click="$router.push({ name: 'user-investment-plans' })"
              size="small"
              label="Invest"
              icon="pi pi-credit-card"
            />
            <Button
              @click="$router.push({ name: 'user-investment-history' })"
              size="small"
              label="History"
              icon="pi pi-history"
              severity="secondary"
              class="dark:bg-slate-700 dark:hover:bg-slate-800 dark:border-transparent"
            />
          </div>
        </template>
      </VNavbar>

      <VPageLoader v-if="isLoading" />

      <div v-else-if="error" class="w-full h-80 flex-center">
        <VErrorMessage :error should-retry @retry="mutate()" />
      </div>

      <div v-else-if="data" class="contents">
        <div class="mt-2 grid md:grid-cols-4 lg:grid-cols-4 gap-2">
          <VCard
            header="Open Investments"
            header-class="text-sm lg:text-base text-white"
            class="bg-gradient-x"
          >
            <div class="mt-4 text-right text-2xl md:text-4xl font-semibold">
              {{ data.investments.length }}
            </div>
          </VCard>

          <VCard
            header="Total Returns"
            class="bg-emerald-500 dark:bg-emerald-500/40"
            header-class="text-sm lg:text-base text-white"
          >
            <div class="mt-4 text-right text-2xl md:text-4xl font-semibold text-white">
              {{ dollar.format(totalProfits) }}
            </div>
          </VCard>

          <VCard header="Auto-compounded" header-class="text-sm lg:text-base">
            <div class="mt-4 text-right text-2xl md:text-4xl font-semibold">
              {{ data.investments.filter((i) => i.autocompounded).length }}
            </div>
          </VCard>

          <VCard header="Non Auto-compounded" header-class="text-sm lg:text-base">
            <div class="mt-4 text-right text-2xl md:text-4xl font-semibold">
              {{ data.investments.filter((i) => !i.autocompounded).length }}
            </div>
          </VCard>
        </div>

        <VCard header="Active Investments" class="mt-2 md:h-[calc(100dvh-18em)]">
          <div class="overflow-y-auto md:h-[calc(100%-3rem)]">
            <div v-if="data.investments.length > 0" class="grid md:grid-cols-2 gap-2">
              <RouterLink
                v-for="i in data.investments"
                :key="i.id"
                :to="{ name: 'user-investment-item', params: { investment_id: i.id } }"
              >
                <div class="v-card border border-slate-400 dark:border-slate-600">
                  <p class="font-semibold text-lg">{{ i.investmentName }}</p>
                  <div class="flex justify-between gap-1 flex-wrap">
                    <div class="mt-1 flex items-center gap-3">
                      <Tag severity="warn" icon="pi pi-star" :value="i.investmentTier" />
                      <Tag
                        severity="secondary"
                        icon="pi pi-calendar-clock"
                        :value="i.duration + ' days'"
                        class="dark:bg-slate-800"
                      />
                    </div>

                    <div class="flex flex-col justify-center text-right">
                      <p class="text-lg md:text-xl font-semibold">
                        {{ dollar.format(i.initialDeposit) }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <Tag
                      severity="secondary"
                      icon="pi pi-replay"
                      :value="`Expected: ${dollar.format(i.expectedTotalReturns)}`"
                    />
                    <Tag
                      severity="success"
                      icon="pi pi-arrow-circle-down"
                      :value="`Current: ${dollar.format(i.currentTotalReturns)}`"
                    />
                  </div>
                </div>
              </RouterLink>
            </div>

            <div v-else class="h-full w-full flex-col-center gap-2">
              <VEmptyIcon size="250" />
              <p class="text-mute">No active investments</p>
            </div>
          </div>
        </VCard>
      </div>
    </div>
  </VueLayout>
</template>
