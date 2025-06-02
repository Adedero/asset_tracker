<script setup lang="ts">
import { computed, ref } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { GET_REQUEST_DATA_LIMIT } from "@/utils/constants";
import { TransactionStatus, TransactionType } from "@/prisma-gen";
import { useDateFormat } from "@vueuse/core";
import { useRouter } from "vue-router";
import { toTitleCase } from "@/app/utils/helpers";
import { TransactionsGetApiResponse } from "@/modules/admin/transactions/transactions-get.api";
import { Icon } from "@iconify/vue";

const page = ref(0);
const LIMIT = GET_REQUEST_DATA_LIMIT;
const skip = computed(() => page.value * LIMIT);

const router = useRouter();

const { user_id } = router.currentRoute.value.query as { user_id: string };

type TransactionStatusOptions = "ALL" | TransactionStatus;
const statusOptions = ref<TransactionStatusOptions[]>(["ALL", "PENDING", "SUCCESSFUL", "FAILED"]);
const status = ref<TransactionStatusOptions>("PENDING");

type TransactionTypeOptions = "ALL" | TransactionType;
const typeOptions = ref<TransactionTypeOptions[]>([
  "ALL",
  "DEPOSIT",
  "WITHDRAWAL",
  "INVESTMENT",
  "PROFIT"
]);
const type = ref<TransactionTypeOptions>("ALL");

const searchParams = computed(() => {
  const params = new URLSearchParams();
  params.set("take", LIMIT.toString());
  params.set("skip", skip.value.toString());
  params.set("sort", "createdAt,DESC");
  if (user_id) params.set("where", `userId,${user_id}`);
  if (status.value !== "ALL") params.append("where", `transactionStatus,${status.value}`);
  if (type.value !== "ALL") params.append("where", `transactionType,${type.value}`);
  return params.toString();
});

const { isLoading, data, error, mutate } = useSWRV<TransactionsGetApiResponse>(
  () => `/api/admins/me/transactions?${searchParams.value}`,
  $fetch
);

const dataLength = computed(() => data.value?.transactions.length || 0);

const allLoaded = computed(() => {
  return !!data.value?.transactions && data.value.transactions.length < LIMIT;
});

function getTypeData(type: TransactionType) {
  if (type === "DEPOSIT") return { icon: "arrow-circle-down", color: "text-primary-500" };
  if (type === "WITHDRAWAL") return { icon: "arrow-circle-up", color: "text-red-500" };
  if (type === "INVESTMENT") return { icon: "spa", color: "text-green-500" };
  return { icon: "payments", color: "text-green-500" };
}

function getSeverity(status: TransactionStatus) {
  if (status === "SUCCESSFUL") return "success";
  if (status === "PENDING") return "warn";
  return "danger";
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VCard class="py-2">
        <div class="flex flex-col md:flex-row gap-2 justify-between">
          <h1 class="text-lg font-semibold text-primary-500">Transactions</h1>

          <div class="flex items-end gap-1 flex-wrap">
            <div class="flex gap-1 flex-col">
              <label class="text-xs text-mute font-semibold">Status</label>
              <Select v-model="status" :options="statusOptions" size="small" class="py-0" />
            </div>

            <div class="flex gap-1 flex-col">
              <label class="text-xs text-mute font-semibold">Type</label>
              <Select v-model="type" :options="typeOptions" size="small" class="py-0" />
            </div>
          </div>
        </div>
      </VCard>

      <div class="mt-2 md:h-[calc(100dvh-11rem)]">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data" class="w-full">
          <div class="w-full overflow-auto md:max-h-[calc(100dvh-15.5rem)]">
            <DataTable
              :value="data.transactions"
              class="text-sm min-w-[40rem]"
              selectionMode="single"
              dataKey="id"
              :metaKeySelection="false"
              @row-click="
                (event) =>
                  router.push({
                    name: 'admin-transaction-item',
                    params: { transaction_id: event.data.id }
                  })
              "
            >
              <Column header="S/N">
                <template #body="{ index }"> {{ index + 1 + skip }}&rpar; </template>
              </Column>

              <Column header="Type">
                <template #body="{ data }">
                  <div
                    :class="['flex items-center gap-1', getTypeData(data.transactionType).color]"
                  >
                    <Icon
                      style="font-size: 20px"
                      :icon="`ic:baseline-${getTypeData(data.transactionType).icon}`"
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
                  <p v-if="data.isWireTransfer">Wire Transfer</p>
                  <p v-else-if="data.isGiftCard">Gift Card</p>
                  <p v-else>{{ data.currency }}</p>
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
                  {{ useDateFormat(new Date(data.createdAt), "ddd, DD MMM, YYYY hh:mm aa") }}
                </template>
              </Column>
            </DataTable>
          </div>

          <VPaginator :allLoaded :length="dataLength" :rows="LIMIT" v-model:page="page" />
        </div>
      </div>
    </div>
  </VueLayout>
</template>
