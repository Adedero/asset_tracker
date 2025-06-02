<script setup lang="ts">
import { WalletApiResponse } from "#src/modules/user/pages/wallet.api";
import { $fetch } from "@/app/composables/use-fetch";
import { toTitleCase } from "@/app/utils/helpers";
import useSWRV from "swrv";
import { useDateFormat } from "@vueuse/core";

const { isLoading, data, error, mutate } = useSWRV<WalletApiResponse>(
  "/api/users/me/wallet",
  $fetch
);
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar>
        <template #right>
          <div class="flex items-center gap-2">
            <Button
              @click="$router.push({ name: 'user-deposit-currencies' })"
              size="small"
              label="Deposit"
              icon="pi pi-wallet"
            />
            <Button
              @click="$router.push({ name: 'user-withdrawal-initialize' })"
              size="small"
              label="Withdraw"
              icon="pi pi-money-bill"
              severity="secondary"
            />
          </div>
        </template>
      </VNavbar>

      <div class="mt-2 overflow-y-auto md:h-[calc(100dvh-8.5rem)]">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="flex items-center justify-center w-full h-full">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div v-else-if="data" class="w-full h-full grid gap-2 md:grid-rows-6 md:grid-cols-7">
          <VCard
            class="md:col-span-4 md:row-span-2 bg-gradient-y text-white"
            header="Available Balance"
            header-class="text-white"
          >
            <div class="flex justify-end mb-2">
              <span class="pi pi-dollar bg-white text-primary-500 p-2 rounded-full aspect-square" />
            </div>
            <div class="flex flex-col items-end justify-end">
              <p class="text-right text-2xl md:text-5xl font-semibold">
                {{ data.walletBalance.toLocaleString().split(".")[0] }}
              </p>
              <p class="text-xl">
                .{{ data.walletBalance.toLocaleString().split(".")[1] ?? "00" }}
              </p>
            </div>
          </VCard>

          <VCard class="md:col-span-3 md:row-span-6" header="Recent Transactions">
            <template #header>
              <div class="flex gap-1 justify-between">
                <h3 class="font-semibold text-mute">Recent Transactions</h3>
                <Button
                  @click="$router.push({ name: 'user-transactions' })"
                  size="small"
                  label="See all"
                  severity="secondary"
                  class="dark:bg-slate-700 dark:hover:bg-slate-800 dark:border-transparent"
                />
              </div>
            </template>

            <div
              class="py-2 h-[calc(100%-2rem)] overflow-y-auto flex flex-col gap-2 *:flex-shrink-0"
            >
              <RouterLink
                v-for="t in data.transactions"
                :key="t.id"
                :to="{ name: 'user-transaction-receipt', params: { transaction_id: t.id } }"
                class="v-card !p-2 border transition-all hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-white/30 dark:bg-slate-800"
              >
                <div class="flex items-center gap-1">
                  <span
                    :class="{
                      'pi pi-arrow-circle-down text-emerald-500':
                        t.transactionType === 'DEPOSIT' || t.transactionType === 'PROFIT',
                      'pi pi-arrow-circle-up text-red-500':
                        t.transactionType === 'WITHDRAWAL' || t.transactionType === 'INVESTMENT'
                    }"
                  />

                  <p class="text-mute font-semibold">
                    {{
                      t.isWireTransfer ? "Wire Transfer" : t.isGiftCard ? "Gift Card" : t.currency
                    }}
                    {{ toTitleCase(t.transactionType) }}
                  </p>

                  <Tag
                    :severity="
                      t.transactionStatus === 'FAILED'
                        ? 'danger'
                        : t.transactionStatus === 'PENDING'
                          ? 'warn'
                          : 'success'
                    "
                    :value="t.transactionStatus.toLowerCase()"
                    class="ml-auto text-[0.7rem] px-1 py-0.5"
                  />
                </div>
                <div class="flex items-baseline gap-1 justify-between">
                  <small class="text-mute">
                    {{
                      useDateFormat(t.createdAt, "MMM DD, YYYY hh:mm:ss A", { locales: "en-US" })
                    }}
                  </small>
                  <p class="text-right text-xl font-semibold">
                    <span>${{ t.amountInUSD.toLocaleString().split(".")[0] }}</span>
                    <span class="text-base text-mute"
                      >.{{ t.amountInUSD.toLocaleString().split(".")[1] || "00" }}</span
                    >
                  </p>
                </div>
              </RouterLink>
            </div>
          </VCard>

          <VCard class="md:col-span-4 md:row-span-4" header="Trends">
            <small class="font-medium">Last 20 transactions</small>
            <div class="w-full overflow-y-auto md:h-[calc(100%-4rem)]">
              <DepositWithdrawalChart :transactions="data.transactions" />
            </div>
          </VCard>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
