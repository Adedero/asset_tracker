<script setup lang="ts">
import { UserDashboardApiResponse } from "@/modules/user/pages/dashboard.api";
import { $fetch } from "@/app/composables/use-fetch";
import { dollar } from "@/app/utils/helpers";
import useSWRV from "swrv";

const { isLoading, data, error, mutate } = useSWRV<UserDashboardApiResponse>(
  "/api/users/me/dashboard",
  $fetch
);
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar />
      <div
        class="mt-3 grid md:grid-cols-5 lg:grid-cols-3 gap-3 h-[calc(100dvh-8rem)] overflow-y-auto"
      >
        <div v-if="isLoading" class="md:col-span-5 lg:col-span-3 h-full">
          <VPageLoader v-if="isLoading" />
        </div>

        <div
          v-else-if="error"
          class="md:col-span-5 lg:col-sapn-3 flex items-center justify-center h-full w-full"
        >
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div v-else-if="data" class="contents">
          <div class="md:col-span-5 lg:col-span-3 grid md:grid-cols-3 gap-3">
            <div class="v-card bg-gradient-y">
              <div class="flex items-center gap-1 text-white">
                <span class="pi pi-wallet" />
                <p class="text-sm">Wallet Balance</p>
              </div>
              <div class="mt-4 text-right text-2xl md:text-3xl font-semibold">
                {{ dollar.format(data.overview.walletBalance) }}
              </div>
            </div>

            <div class="v-card">
              <div class="flex items-center gap-1 text-mute">
                <span class="pi pi-briefcase" />
                <p class="text-sm">Open Investments</p>
              </div>
              <div class="mt-4 text-right text-2xl md:text-3xl font-semibold">
                {{ data.overview.activeInvestments }}
              </div>
            </div>

            <div class="v-card">
              <div class="flex items-center gap-1 text-mute">
                <span class="pi pi-money-bill" />
                <p class="text-sm">Total Investments</p>
              </div>
              <div class="mt-4 text-right text-2xl md:text-3xl font-semibold">
                {{ dollar.format(data.overview.totalInvestmentDeposit) }}
              </div>
            </div>

            <div class="v-card">
              <div class="flex items-center gap-1 text-mute">
                <span class="pi pi-replay" />
                <p class="text-sm">Total Investment Returns</p>
              </div>
              <div class="mt-4 text-right text-2xl md:text-3xl font-semibold">
                {{ dollar.format(data.overview.totalReturns) }}
              </div>
            </div>

            <div class="v-card">
              <div class="flex items-center gap-1 text-mute">
                <span class="pi pi-lock" />
                <p class="text-sm">Non-withdrawable Returns</p>
              </div>
              <div class="mt-4 text-right text-2xl md:text-3xl font-semibold">
                {{ dollar.format(data.overview.nonWithdrawableReturns) }}
              </div>
            </div>

            <div class="v-card">
              <div class="grid grid-cols-3 gap-2">
                <RouterLink
                  :to="{ name: 'user-investment-plans' }"
                  class="text-sm font-semibold rounded-xl p-3 bg-primary-500 hover:bg-primary-400 text-white gap-1 flex-col-center transition-colors"
                >
                  <span class="pi pi-arrow-circle-right" />
                  Invest
                </RouterLink>

                <RouterLink
                  :to="{ name: 'user-deposit-currencies' }"
                  class="text-sm font-semibold rounded-xl p-3 bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 gap-1 flex-col-center"
                >
                  <span class="pi pi-arrow-circle-down" />
                  Deposit
                </RouterLink>

                <RouterLink
                  :to="{ name: 'user-withdrawal-initialize' }"
                  class="text-sm font-semibold rounded-xl p-3 bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 gap-1 flex-col-center"
                >
                  <span class="pi pi-arrow-circle-up" />
                  Withdraw
                </RouterLink>
              </div>
            </div>
          </div>

          <div class="md:col-span-5 lg:col-span-3 v-card h-[30rem] md:h-80">
            <p class="text-sm mb-2">Personalized Trading Chart</p>
            <VChart />
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
