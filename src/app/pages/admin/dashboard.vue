<script setup lang="ts">
import { shallowRef, computed } from "vue";
import { AdminDashboardApiResponse } from "@/modules/admin/pages/dashboard.api";
import { $fetch } from "@/app/composables/use-fetch";
import { toTitleCase } from "@/app/utils/helpers";
import useSWRV from "swrv";
import { useNow, useDateFormat } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { InvestmentStatus, TransactionStatus, TransactionType } from "@/prisma-gen";

const { isLoading, data, error, mutate } = useSWRV<AdminDashboardApiResponse>(
  "/api/admins/me/dashboard",
  $fetch
);

const formatter = shallowRef("ddd, MMMM DD, YYYY h:mm:ss AA");
const formatted = useDateFormat(useNow(), formatter);

const parts = computed(() => formatted.value.split(" "));
const date = computed(() => {
  const p = parts.value;
  return `${p[0]} ${p[1]} ${p[2]} ${p[3]}`;
});
const time = computed(() => {
  const p = parts.value;
  return `${p[4]} ${p[5]}`;
});

function getTypeData(type: TransactionType) {
  if (type === "DEPOSIT")
    return { icon: "ic:baseline-arrow-circle-down", color: "text-primary-500" };
  if (type === "WITHDRAWAL") return { icon: "ic:baseline-arrow-circle-up", color: "text-red-500" };
  if (type === "INVESTMENT") return { icon: "ic:baseline-spa", color: "text-green-500" };
  return { icon: "ic:baseline-payments", color: "text-green-500" };
}

function getSeverity(status: TransactionStatus) {
  if (status === "SUCCESSFUL") return "success";
  if (status === "PENDING") return "warn";
  return "danger";
}

function getInvestmentSeverity(status: InvestmentStatus) {
  if (status === "OPEN") return "success";
  if (status === "CLOSED") return "info";
  return "danger";
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar />

      <div class="mt-2">
        <VPageLoader v-if="isLoading" />
        <VErrorMessage v-else-if="error" :error request="GET" @retry="mutate()" />

        <div v-else-if="data" class="md:h-[calc(100dvh-8.5rem)] md:overflow-y-auto">
          <div class="grid gap-2 md:grid-cols-3">
            <RouterLink :to="{ name: 'admin-users' }">
              <VCard header="Users">
                <div class="text-2xl font-semibold text-right">
                  {{ data.overview.usersCount }}
                </div>
              </VCard>
            </RouterLink>

            <RouterLink :to="{ name: 'admin-users' }">
              <VCard header="Admins">
                <div class="text-2xl font-semibold text-right">
                  {{ data.overview.adminsCount }}
                </div>
              </VCard>
            </RouterLink>

            <RouterLink :to="{ name: 'admin-investments' }">
              <VCard header="Open Investments">
                <div class="text-2xl font-semibold text-right">
                  {{ data.overview.openInvestmentsCount }}
                </div>
              </VCard>
            </RouterLink>

            <RouterLink :to="{ name: 'admin-currencies' }">
              <VCard header="Currencies">
                <div class="text-2xl font-semibold text-right">
                  {{ data.overview.currenciesCount }}
                </div>
              </VCard>
            </RouterLink>

            <RouterLink :to="{ name: 'admin-investment-plans' }">
              <VCard header="Investment Plans">
                <div class="text-2xl font-semibold text-right">
                  {{ data.overview.investmentPlansCount }}
                </div>
              </VCard>
            </RouterLink>

            <VCard :header="date">
              <div class="text-2xl font-semibold text-right">
                {{ time }}
              </div>
            </VCard>
          </div>

          <VCard header="Recent Investments" class="mt-2">
            <div class="w-full overflow-auto">
              <DataTable
                :value="data.overview.recentInvestments"
                selectionMode="single"
                dataKey="id"
                @row-select="
                  (event) =>
                    $router.push({
                      name: 'admin-investment-item',
                      params: { investment_id: event.data.id }
                    })
                "
                class="text-sm min-w-[70rem]"
              >
                <Column field="investmentName" header="Investment" />

                <Column field="investmentTier" header="Tier" />

                <Column header="Status">
                  <template #body="{ data }">
                    <Tag
                      class="text-xs font-semibold"
                      :severity="getInvestmentSeverity(data.investmentStatus)"
                      :value="toTitleCase(data.investmentStatus)"
                    />
                  </template>
                </Column>

                <Column field="user.name" header="User" />

                <Column field="amount" header="Amount">
                  <template #body="{ data }">
                    ${{ data.initialDeposit.toLocaleString() }}
                  </template>
                </Column>

                <Column field="duration" header="Duration (days)" />

                <Column field="daysCompleted" header="Days Completed (days)" />

                <Column header="Created On">
                  <template #body="{ data }">
                    {{ useDateFormat(new Date(data.createdAt), "MMM DD, YYYY") }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </VCard>

          <VCard header="Recent Transactions" class="mt-2">
            <div class="w-full overflow-auto">
              <DataTable
                :value="data.overview.recentTransactions"
                selectionMode="single"
                dataKey="id"
                @row-select="
                  (event) =>
                    $router.push({
                      name: 'admin-transaction-item',
                      params: { transaction_id: event.data.id }
                    })
                "
                class="text-sm min-w-[40rem]"
              >
                <Column header="Type">
                  <template #body="{ data }">
                    <div
                      :class="['flex items-center gap-1', getTypeData(data.transactionType).color]"
                    >
                      <Icon
                        style="font-size: 20px"
                        :icon="getTypeData(data.transactionType).icon"
                      />
                      <p class="text-sm font-medium">{{ toTitleCase(data.transactionType) }}</p>
                    </div>
                  </template>
                </Column>

                <Column field="user.name" header="User" />

                <Column field="amount" header="Amount">
                  <template #body="{ data }"> ${{ data.amountInUSD.toLocaleString() }} </template>
                </Column>

                <Column header="Medium">
                  <template #body="{ data }">
                    {{
                      data.isWireTransfer
                        ? "Wire transfer"
                        : data.isGiftCard
                          ? "Gift card"
                          : "Crypto"
                    }}
                  </template>
                </Column>

                <Column header="Status">
                  <template #body="{ data }">
                    <Tag
                      class="text-xs font-semibold"
                      :severity="getSeverity(data.transactionStatus)"
                      :value="toTitleCase(data.transactionStatus)"
                    />
                  </template>
                </Column>
                <Column header="Created On">
                  <template #body="{ data }">
                    {{ useDateFormat(new Date(data.createdAt), "MMM DD, YYYY") }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </VCard>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
