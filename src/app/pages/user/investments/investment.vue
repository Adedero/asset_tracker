<script setup lang="ts">
import { computed } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import { InvestmentGetApiResponse } from "@/modules/user/investments/investments-get.api";
import { dollar, toTitleCase } from "@/app/utils/helpers";
import useSWRV from "swrv";
import { useRoute } from "vue-router";
import { useDateFormat } from "@vueuse/core";
import InvestmentTerminator from "@/app/components/user/investment-terminator.vue";
import { Investment } from "@/prisma-gen";
import investment_img from "@/app/assets/img/investment.png";

const route = useRoute();

const investment_id = route.params.investment_id.toString();

const { isLoading, data, error, mutate } = useSWRV<InvestmentGetApiResponse>(
  () => `/api/users/me/investments/${investment_id}`,
  $fetch
);

const investmentHealth = computed(() => {
  return data.value?.investment.investmentStatus !== "OPEN"
    ? 0
    : Math.floor(Math.random() * (100 - 50 + 1)) + 50;
});

const onTerminateInvestment = async (updatedInvestment: Investment) => {
  await mutate(() =>
    Promise.resolve({
      success: true,
      message: "Investment updated successfully.",
      investment: updatedInvestment
    })
  );
};
</script>

<template>
  <VueLayout name="user">
    <div class="h-full w-dvw md:w-full">
      <div
        class="bg-white rounded-xl dark:bg-slate-900 px-4 py-2 shadow-sm flex items-center justify-between"
      >
        <div class="text-lg font-semibold text-primary-500 dark:text-primary-400">
          {{ data?.investment.investmentName ?? "Investment" }}
          <span class="text-sm">({{ data?.investment.investmentTier }})</span>
        </div>

        <Button
          size="small"
          severity="secondary"
          label="Refresh"
          icon="pi pi-replay"
          @click="mutate()"
        />
      </div>

      <div class="mt-2 md:h-[calc(100dvh-8.5rem)] max-w-full">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="w-full h-full flex-center">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div v-else-if="data" class="h-full w-full overflow-y-auto flex flex-col gap-2">
          <div class="grid gap-2 md:grid-cols-3">
            <VCard
              header="Current Return"
              header-class="text-white"
              class="bg-gradient-y text-white"
            >
              <div class="w-full flex flex-col">
                <div class="flex font-semibold flex-wrap break-all">
                  <span class="font-xl">$</span>
                  <span class="text-4xl md:text-5xl font-semibold">
                    {{ data.investment.currentTotalReturns.toLocaleString().split(".")[0] }}
                  </span>
                  <span class="text-lg font-semibold self-end">
                    .{{
                      data.investment.currentTotalReturns.toLocaleString().split(".")[1] ?? "00"
                    }}
                  </span>
                </div>
              </div>
            </VCard>

            <VCard header="Expected Return">
              <div class="w-full flex flex-col">
                <div class="flex font-semibold flex-wrap break-all">
                  <span class="text-mute font-xl">$</span>
                  <span class="text-4xl md:text-5xl font-semibold text-emerald-500">
                    {{ data.investment.expectedTotalReturns.toLocaleString().split(".")[0] }}
                  </span>
                  <span class="text-lg text-mute font-semibold self-end">
                    .{{
                      data.investment.expectedTotalReturns.toLocaleString().split(".")[1] ?? "00"
                    }}
                  </span>
                </div>
              </div>
            </VCard>

            <VCard header="Initial Deposit">
              <div class="w-full flex flex-col">
                <div class="flex font-semibold flex-wrap break-all">
                  <span class="text-mute font-xl">$</span>
                  <span class="text-4xl md:text-5xl font-semibold text-rose-500">
                    {{ data.investment.initialDeposit.toLocaleString().split(".")[0] }}
                  </span>
                  <span class="text-lg text-mute font-semibold self-end">
                    .{{ data.investment.initialDeposit.toLocaleString().split(".")[1] ?? "00" }}
                  </span>
                </div>
              </div>
            </VCard>
          </div>

          <div class="grid gap-2 md:grid-cols-2">
            <div class="grid gap-2">
              <VCard
                v-if="data.investment.investmentStatus === 'OPEN'"
                header="Today's Return"
                class="bg-emerald-500 text-white dark:bg-emerald-500/40"
                header-class="text-white"
              >
                <div class="w-full flex flex-col">
                  <div class="flex font-semibold flex-wrap break-all">
                    <span class="font-xl">$</span>
                    <span class="text-4xl md:text-5xl font-semibold text-white">
                      {{ data.investment.lastProfitAmount?.toLocaleString().split(".")[0] ?? "0" }}
                    </span>
                    <span class="text-lg font-semibold self-end">
                      .{{
                        data.investment.lastProfitAmount?.toLocaleString().split(".")[1] ?? "00"
                      }}
                    </span>
                  </div>
                </div>
              </VCard>

              <VCard
                :header="data.investment.autocompounded ? 'Auto-compounded' : 'Not auto-compounded'"
              >
                <div class="flex flex-col lg:flex-row gap-2 items-center justify-center">
                  <div class="h-40 *:h-full">
                    <AutocompoundIcon />
                  </div>

                  <div v-if="data.investment.investmentStatus !== 'OPEN'">
                    <p v-if="data.investment.autocompounded">
                      Auto-compounding was enabled for this investment. The total returns was
                      transferred to your wallet at the end of the investment.
                    </p>
                    <p v-else>
                      Auto-compounding was not enabled for this investment. Your daily returns were
                      automatically added to your main wallet.
                    </p>
                  </div>

                  <div v-else>
                    <p v-if="data.investment.autocompounded">
                      Auto-compounding is enabled for this investment. The total profit from this
                      investment will only be added to your wallet once the investment has completed
                      or terminated by you.
                      <RouterLink
                        :to="{
                          name: 'user-faq-item',
                          params: { faq_item_slug: 'auto-compounding' }
                        }"
                        target="_blank"
                        class="font-medium text-primary-500 hover:underline"
                      >
                        Learn more
                        <span
                          class="pi pi-external-link"
                          style="font-size: 0.8rem; font-weight: 600"
                        ></span>
                      </RouterLink>
                    </p>

                    <p v-else>
                      Auto-compounding is not enabled for this investment. Your daily returns are
                      automatically added to your main wallet.
                    </p>
                  </div>
                </div>
              </VCard>

              <VCard header="Days Completed">
                <div class="w-full flex flex-col gap-2 items-center justify-center">
                  <DonutChart
                    :percent="
                      Number(
                        ((data.investment.daysCompleted / data.investment.duration) * 100).toFixed(
                          1
                        )
                      )
                    "
                    :size="150"
                    :strokeWidth="16"
                    :custom-text="
                      ((data.investment.daysCompleted / data.investment.duration) * 100).toFixed(
                        1
                      ) + '%'
                    "
                    background-color="var(--color-primary-100)"
                    foreground-color="var(--color-primary-500)"
                  />
                  <p>{{ data.investment.daysCompleted }} / {{ data.investment.duration }} days</p>
                </div>
              </VCard>

              <VCard header="Investment Health">
                <div class="w-full flex flex-col gap-2 items-center justify-center">
                  <DonutChart
                    :percent="investmentHealth"
                    :size="150"
                    :strokeWidth="16"
                    :custom-text="investmentHealth + '%'"
                    :background-color="
                      investmentHealth >= 70 ? 'var(--p-emerald-100)' : 'var(--p-amber-100)'
                    "
                    :foreground-color="
                      investmentHealth >= 70 ? 'var(--p-emerald-500)' : 'var(--p-amber-500)'
                    "
                  />
                  <p v-if="data.investment.investmentStatus !== 'OPEN'">
                    {{ toTitleCase(data.investment.investmentStatus) }}
                  </p>
                  <p v-else>{{ investmentHealth >= 70 ? "Great" : "Thriving" }}</p>
                </div>
              </VCard>
            </div>

            <VCard class="md:overflow-y-auto lg:col-span-1 md:row-span-6" header="Details">
              <div class="w-full h-36">
                <img :src="investment_img" alt="investment" class="w-full h-full object-contain" />
              </div>

              <div class="mt-2 grid gap-2">
                <div
                  class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                >
                  <div class="flex-center-between">
                    <p class="font-semibold">{{ data.investment.investmentName }}</p>
                    <Tag severity="warn" :value="data.investment.investmentTier" />
                  </div>
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                  :class="{
                    '!bg-red-500 dark:!bg-red-500/70 *:!text-white ':
                      data.investment.investmentStatus === 'TERMINATED'
                  }"
                >
                  <header class="text-slate-500 text-sm flex items-center gap-2">
                    <span class="pi pi-info-circle" />
                    Status
                  </header>
                  <p class="text-right font-semibold">
                    {{ toTitleCase(data.investment.investmentStatus) }}
                  </p>
                  <div v-if="data.investment.investmentStatus === 'PAUSED'" class="text-sm mt-2">
                    <p>
                      Reason: <span class="font-medium">{{ data.investment.pausedReason }}</span>
                    </p>
                    <p v-if="data.investment.pausedAt">
                      Paused Date:
                      <span class="font-medium">
                        {{ useDateFormat(data.investment.pausedAt, "MMM DD, YYYY hh:mm AA") }}
                      </span>
                    </p>

                    <p>
                      Your investment was paused for the above reason. Contact
                      <RouterLink
                        class="text-primary-500 font-semibold hover:underline"
                        :to="{ name: 'contact' }"
                      >
                        the admin desk
                      </RouterLink>
                      for more info.
                    </p>
                  </div>

                  <div
                    v-if="data.investment.investmentStatus === 'TERMINATED'"
                    class="text-sm mt-2"
                  >
                    <p>
                      Terminated By:
                      <span class="font-medium">
                        {{ data.investment.terminator === "USER" ? "You" : "Invest Tracker Admin" }}
                      </span>
                    </p>
                    <p>
                      Reason:
                      <span class="font-medium">{{ data.investment.terminationReason }}</span>
                    </p>
                    <p v-if="data.investment.terminatedAt">
                      Termination Date:
                      <span class="font-medium">
                        {{ useDateFormat(data.investment.terminatedAt, "MMM DD, YYYY hh:mm AA") }}
                      </span>
                    </p>
                    <p>
                      Termination Fee:
                      <span class="font-medium">
                        {{ data.investment.terminationFeeApplied ? "Applied" : "Not Applied" }}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                >
                  <header class="text-slate-500 text-sm flex items-center gap-2">
                    <span class="pi pi-money-bill" />
                    Minimun Deposit
                  </header>
                  <p class="text-right font-semibold">
                    {{ dollar.format(data.investment.minimumDeposit) }}
                  </p>
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                >
                  <header class="text-slate-500 text-sm flex items-center gap-2">
                    <span class="pi pi-credit-card" />
                    Amount Invested
                  </header>
                  <p class="text-right font-semibold">
                    {{ dollar.format(data.investment.initialDeposit) }}
                  </p>
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                >
                  <header class="text-slate-500 text-sm flex items-center gap-1">
                    <span class="pi pi-replay" />
                    Expected Returns
                  </header>
                  <p class="text-right font-semibold">
                    {{ dollar.format(data.investment.expectedTotalReturns) }}
                    <span class="text-sm font-medium">|</span>
                    +{{
                      data.investment.autocompounded
                        ? data.investment.autocompoundedReturnRate?.toFixed(1)
                        : data.investment.expectedReturnRate.toFixed(1)
                    }}%
                  </p>
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                >
                  <header class="text-slate-500 text-sm flex items-center gap-1">
                    <span class="pi pi-arrow-circle-down" />
                    Current Returns
                  </header>
                  <p class="text-right font-semibold">
                    {{ dollar.format(data.investment.currentTotalReturns) }}
                  </p>
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                >
                  <header class="text-slate-500 text-sm flex items-center gap-1">
                    <span class="pi pi-clock" />
                    Term
                  </header>
                  <p class="text-right font-semibold">{{ data.investment.duration }} Days</p>
                </div>

                <div
                  class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                >
                  <header class="text-slate-500 text-sm flex items-center gap-1">
                    <span class="pi pi-calendar" />
                    Approximate Duration
                  </header>
                  <p class="text-right font-semibold">
                    {{ useDateFormat(data.investment.createdAt, "MMM DD, YYYY") }}
                    -
                    {{
                      useDateFormat(
                        new Date(
                          new Date(data.investment.createdAt).getTime() +
                            data.investment.duration * 24 * 60 * 60 * 1000
                        ),
                        "MMM DD, YYYY"
                      )
                    }}
                  </p>
                </div>
                <div v-if="data.investment.investmentStatus === 'OPEN'" class="grid gap-2">
                  <Divider />
                  <div
                    class="bg-white dark:bg-slate-800 border dark:border-slate-800 shadow-sm p-2 rounded-xl"
                  >
                    <header class="text-slate-500 text-sm flex items-center gap-1">
                      <span class="pi pi-times-circle" />
                      Termination Fee
                    </header>
                    <p class="text-right font-semibold">
                      {{ dollar.format(data.investment.terminationFee) }}
                    </p>
                  </div>

                  <InvestmentTerminator
                    :investment="data.investment"
                    @terminate="onTerminateInvestment"
                  />
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
