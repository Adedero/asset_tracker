<script setup lang="ts">
import { computed } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import type { Investment, InvestmentStatus } from "@/prisma-gen";
import { useDateFormat } from "@vueuse/core";
import { useRouter } from "vue-router";
import { toTitleCase } from "@/app/utils/helpers";
import type { InvestmentGetApiResponse } from "@/modules/admin/investments/investments-get.api";
import { Icon } from "@iconify/vue";

const router = useRouter();

const { investment_id } = router.currentRoute.value.params;

const { isLoading, data, error, mutate } = useSWRV<InvestmentGetApiResponse>(
  () => `/api/admins/me/investments/${investment_id}`,
  $fetch
);

const currentPercentageReturns = computed(() => {
  if (!data.value) return 0;

  return parseFloat(
    (
      (data.value.investment.currentTotalReturns / data.value.investment.initialDeposit) *
      100
    ).toFixed(2)
  );
});

const handleUpdate = async (inv: Investment) => {
  if (!data.value) return;
  await mutate(() =>
    Promise.resolve({
      success: true,
      message: "Investment updated successfully",
      investment: {
        ...data.value!.investment,
        ...inv
      }
    })
  );
};

function getSeverity(status: InvestmentStatus) {
  if (status === "OPEN") return "success";
  if (status === "CLOSED") return "info";
  if (status === "PAUSED") return "warn";
  return "danger";
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VCard class="p-2">
        <div class="text-lg font-semibold text-primary-500">
          <span>Investment </span>
          <span class="text-sm">ID: {{ data?.investment?.id }}</span>
        </div>
      </VCard>

      <div class="mt-2">
        <VPageLoader v-if="isLoading" />
        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data">
          <div class="md:h-[calc(100dvh-8.5rem)] grid md:grid-cols-3 gap-2">
            <div class="md:h-full md:overflow-y-auto md:col-span-2">
              <div class="grid gap-2 md:grid-cols-3">
                <VCard header="Deposit">
                  <div class="text-xl font-semibold">
                    <span>
                      ${{ data.investment.initialDeposit.toLocaleString().split(".")[0] }}.</span
                    >
                    <span class="text-sm">
                      {{ data.investment.initialDeposit.toLocaleString().split(".")[1] ?? "00" }}
                    </span>
                  </div>
                  <p class="text-xs font-medium text-mute">Initial deposit amount</p>
                </VCard>

                <VCard header="Current Total Returns">
                  <div class="text-xl font-semibold">
                    <span>
                      ${{ data.investment.currentTotalReturns.toLocaleString().split(".")[0] }}.
                    </span>
                    <span class="text-sm">
                      {{
                        data.investment.currentTotalReturns.toLocaleString().split(".")[1] ?? "00"
                      }}
                    </span>
                  </div>
                  <p class="text-xs font-medium text-mute">
                    {{ currentPercentageReturns }}% of initial deposit
                  </p>
                </VCard>

                <VCard header="Last Return">
                  <div class="text-xl font-semibold">
                    <span>
                      ${{
                        data.investment.lastProfitAmount?.toLocaleString().split(".")[0] ?? "0"
                      }}.</span
                    >
                    <span class="text-sm">
                      {{ data.investment.lastProfitAmount?.toLocaleString().split(".")[1] ?? "00" }}
                    </span>
                  </div>
                  <p class="text-xs font-medium text-mute">
                    <span v-if="data.investment.lastProfitDistributedAt">
                      {{
                        useDateFormat(
                          new Date(data.investment.lastProfitDistributedAt),
                          "ddd, DD MMM, YYYY hh:mm aa"
                        )
                      }}
                    </span>
                    <span v-else>No profit distributed yet</span>
                  </p>
                </VCard>

                <VCard header="Status">
                  <Tag
                    class="font-semibold"
                    :severity="getSeverity(data.investment.investmentStatus)"
                    :value="toTitleCase(data.investment.investmentStatus)"
                  />
                </VCard>

                <VCard header="Days Completed">
                  <div class="text-xl font-semibold">
                    <span>{{ data.investment.daysCompleted }}</span>
                    <span class="text-sm"> Days </span>
                  </div>
                </VCard>

                <VCard header="Auto-compounding">
                  <Tag
                    class="font-semibold"
                    :severity="data.investment.autocompounded ? 'success' : 'warn'"
                    :value="data.investment.autocompounded ? 'Enabled' : 'Disabled'"
                  />
                </VCard>
              </div>

              <VCard header="Daily Returns" class="mt-2">
                <Message size="small" class="text-sm" icon="pi pi-info-circle">
                  <p v-if="data.investment.autocompounded">
                    The daily returns from this investment
                    {{ data.investment.investmentStatus === "OPEN" ? "are" : "were" }}
                    withheld and
                    {{ data.investment.investmentStatus === "OPEN" ? "will be" : "were" }}
                    added to the client's wallet balance when the investment is closed or
                    terminated.
                  </p>

                  <p v-else>
                    The returns from this investment
                    {{ data.investment.investmentStatus === "OPEN" ? "are" : "were" }}
                    added to the client's wallet balance on a daily basis until the investment was
                    closed or terminated.
                  </p>
                </Message>
              </VCard>

              <VCard header="Details" class="mt-2">
                <div class="grid gap-2">
                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-dollar text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Expected Total Returns</p>
                    </div>
                    <p class="text-right font-semibold">
                      ${{ data.investment.expectedTotalReturns.toLocaleString() }}
                    </p>
                  </div>

                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-dollar text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Current Total Returns</p>
                    </div>
                    <p class="text-right font-semibold">
                      ${{ data.investment.currentTotalReturns.toLocaleString() }}
                    </p>
                  </div>

                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-calendar text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Created Date</p>
                    </div>
                    <p class="text-right font-semibold">
                      {{
                        useDateFormat(
                          new Date(data.investment.createdAt),
                          "ddd, DD MMM, YYYY hh:mm aa"
                        )
                      }}
                    </p>
                  </div>

                  <div
                    v-if="data.investment.investmentStatus === 'CLOSED' && data.investment.closedAt"
                    class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800"
                  >
                    <div class="flex items-center">
                      <span
                        class="pi pi-dollar text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Closed Date</p>
                    </div>
                    <p class="text-right font-semibold">
                      {{
                        useDateFormat(
                          new Date(data.investment.closedAt),
                          "ddd, DD MMM, YYYY hh:mm aa"
                        )
                      }}
                    </p>
                  </div>

                  <div v-if="data.investment.investmentStatus === 'TERMINATED'" class="contents">
                    <div
                      v-if="data.investment.terminatedAt"
                      class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800"
                    >
                      <div class="flex items-center">
                        <span
                          class="pi pi-calendar text-mute p-1 rounded-full"
                          style="font-size: 12px"
                        />
                        <p class="text-mute text-sm font-semibold">Terminated Date</p>
                      </div>
                      <p class="text-right font-semibold">
                        {{
                          useDateFormat(
                            new Date(data.investment.terminatedAt),
                            "ddd, DD MMM, YYYY hh:mm aa"
                          )
                        }}
                      </p>
                    </div>

                    <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                      <div class="flex items-center">
                        <span
                          class="pi pi-info-circle text-mute p-1 rounded-full"
                          style="font-size: 12px"
                        />
                        <p class="text-mute text-sm font-semibold">Terminated Fee</p>
                      </div>
                      <p class="text-right font-semibold">
                        {{ data.investment.terminationFeeApplied ? "Applied" : "Not applied" }}
                      </p>
                    </div>

                    <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                      <div class="flex items-center">
                        <span
                          class="pi pi-info-circle text-mute p-1 rounded-full"
                          style="font-size: 12px"
                        />
                        <p class="text-mute text-sm font-semibold">Terminated By</p>
                      </div>
                      <p class="text-right font-semibold">
                        {{
                          toTitleCase(data.investment.terminator || "") || "No terminator indicated"
                        }}
                      </p>
                    </div>

                    <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                      <div class="flex items-center">
                        <span
                          class="pi pi-info-circle text-mute p-1 rounded-full"
                          style="font-size: 12px"
                        />
                        <p class="text-mute text-sm font-semibold">Termination Reason</p>
                      </div>
                      <p class="text-right font-semibold">
                        {{ data.investment.terminationReason || "No reason provided" }}
                      </p>
                    </div>
                  </div>
                </div>
              </VCard>
            </div>

            <div class="md:h-full md:overflow-y-auto">
              <VCard v-if="data.investment.user" header="User">
                <div class="flex flex-col items-center justify-center gap-2 text-center">
                  <div
                    class="w-32 aspect-square rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800"
                  >
                    <img
                      v-if="data.investment.user.image"
                      :src="data.investment.user.image"
                      class="w-full h-full object-cover"
                    />
                    <Icon
                      icon="ic:baseline-account-circle"
                      style="font-size: 8rem"
                      class="text-primary-500"
                    />
                  </div>

                  <div>
                    <p class="font-semibold md:text-lg">{{ data.investment.user.name }}</p>
                    <p class="text-sm text-mute">{{ data.investment.user.email }}</p>
                  </div>

                  <Button
                    @click="
                      router.push({
                        name: 'admin-user-item',
                        params: { user_id: data.investment.userId }
                      })
                    "
                    label="Profile"
                    icon="pi pi-user"
                    outlined
                  />
                </div>
              </VCard>

              <VCard header="Investment Plan Details" class="mt-2 grid gap-2">
                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-info-circle text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Investment Name</p>
                  </div>
                  <p class="text-right font-semibold">
                    {{ data.investment.investmentName }}
                  </p>
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-sitemap text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Investment Tier</p>
                  </div>
                  <p class="text-right font-semibold">
                    {{ data.investment.investmentTier }}
                  </p>
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-money-bill text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Minimum Deposit</p>
                  </div>
                  <p class="text-right font-semibold">
                    ${{ data.investment.minimumDeposit.toLocaleString() }}
                  </p>
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-percentage text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Expected Return Rate</p>
                  </div>
                  <p class="text-xs text-mute font-medium">Non auto-compounded</p>
                  <p class="text-right font-semibold">{{ data.investment.expectedReturnRate }}%</p>
                </div>

                <div
                  v-if="data.investment.autocompoundedReturnRate"
                  class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800"
                >
                  <div class="flex items-center">
                    <span
                      class="pi pi-percentage text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Expected Return Rate</p>
                  </div>
                  <p class="text-xs text-primary-500 font-medium">Auto-compounded</p>
                  <p class="text-right font-semibold">
                    {{ data.investment.autocompoundedReturnRate }}%
                  </p>
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-calendar-clock text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Duration</p>
                  </div>
                  <p class="text-right font-semibold">{{ data.investment.duration }} days</p>
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span class="pi pi-dollar text-mute p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-mute text-sm font-semibold">Termination Fee</p>
                  </div>
                  <p class="text-right font-semibold">
                    ${{ data.investment.terminationFee.toLocaleString() }}
                  </p>
                </div>
              </VCard>

              <VCard header="Actions" class="mt-2 grid gap-2">
                <div
                  v-if="
                    data.investment.investmentStatus === 'OPEN' ||
                    data.investment.investmentStatus === 'PAUSED'
                  "
                  class="grid gap-3"
                >
                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        :class="
                          data.investment.investmentStatus === 'OPEN'
                            ? 'pause-circle'
                            : 'play-circle'
                        "
                        style="font-size: 12px"
                        class="text-mute p-1 rounded-full"
                      />
                      <p class="text-mute text-sm font-semibold">
                        {{ data.investment.investmentStatus === "OPEN" ? "Pause" : "Resume" }}
                        Investment
                      </p>
                    </div>
                    <div v-if="data.investment.investmentStatus === 'OPEN'" class="my-1">
                      <Message size="small" severity="warn">
                        <p class="text-xs">You must provide a reason for the pause.</p>
                      </Message>
                    </div>
                    <InvestmentPauseToggler
                      @toggle="handleUpdate"
                      :investment="data.investment"
                      class="mt-2"
                    />
                    <div v-if="data.investment.investmentStatus === 'PAUSED'" class="mt-2">
                      <Message size="small">
                        <p class="text-xs">Reason for pause: {{ data.investment.pausedReason }}</p>
                      </Message>
                    </div>
                  </div>

                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-times-circle text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Terminate Investment</p>
                    </div>
                    <div class="my-1">
                      <Message size="small" severity="error">
                        <p class="text-xs">You must provide a reason for the termination.</p>
                      </Message>
                    </div>
                    <InvestmentTerminatorAdmin
                      @terminate="handleUpdate"
                      :investment="data.investment"
                      class="mt-2"
                    />
                  </div>
                </div>

                <div v-else class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-times-circle text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">No Actions</p>
                  </div>
                  <p class="mt-2 text-sm text-primary-500 font-medium">
                    There are no actions to perform on this investment.
                  </p>
                </div>
              </VCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
