<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import { TransactionsGetApiResponse } from "@/modules/user/transactions/transactions-get.api";
import { dollar, toTitleCase } from "@/app/utils/helpers";
import useSWRV from "swrv";
import { GET_REQUEST_DATA_LIMIT } from "@/utils/constants";
import { TransactionStatus, TransactionType } from "@/prisma-gen";
import { useDateFormat } from "@vueuse/core";

const page = ref(0);
const LIMIT = GET_REQUEST_DATA_LIMIT;
const visible = ref(false);

interface Options {
  type: Array<TransactionType | "ALL">;
  status: Array<TransactionStatus | "ALL">;
}
const options = ref<Options>({
  type: ["ALL", "DEPOSIT", "WITHDRAWAL", "INVESTMENT", "PROFIT"],
  status: ["ALL", "SUCCESSFUL", "PENDING", "FAILED"]
});

const selectedType = ref(options.value.type[0]);
const selectedStatus = ref(options.value.status[0]);

const searchParams = computed(() => {
  const params = new URLSearchParams();
  params.set("take", LIMIT.toString());
  params.set("skip", (page.value * LIMIT).toString());
  params.set("sort", "createdAt,desc");
  if (selectedType.value !== "ALL") {
    params.append("where", `transactionType,${selectedType.value}`);
  }
  if (selectedStatus.value !== "ALL") {
    params.set("where", `transactionStatus,${selectedStatus.value}`);
  }
  return params.toString();
});

watch(selectedStatus, () => (page.value = 0));
watch(selectedType, () => (page.value = 0));

const { isLoading, data, error, mutate } = useSWRV<TransactionsGetApiResponse>(
  () => `/api/users/me/transactions?${searchParams.value}`,
  $fetch
);

const dataLength = computed(() => data.value?.transactions.length || 0);

const allLoaded = computed(() => {
  return !!data.value?.transactions && data.value.transactions.length < LIMIT;
});
</script>

<template>
  <VueLayout name="user">
    <div>
      <div class="v-card !p-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-primary-500 dark:text-primary-400">Transactions</h1>

          <div class="hidden md:flex items-end gap-2 justify-end">
            <div class="grid gap-1">
              <p class="text-sm font-medium text-mute text-right">Type</p>
              <Select v-model="selectedType" size="small" :options="options.type" />
            </div>

            <div class="grid gap-1">
              <p class="text-sm font-medium text-mute text-right">Status</p>
              <Select v-model="selectedStatus" size="small" :options="options.status" />
            </div>

            <Button @click="mutate()" :loading="isLoading" label="Submit" size="small" />
          </div>
          <Button
            @click="visible = true"
            class="md:hidden"
            label="Filters"
            icon="pi pi-filter"
            icon-pos="right"
            size="small"
          />
        </div>

        <VErrorMessage :error should-retry @retry="mutate()" class="mt-2" />

        <Dialog v-model:visible="visible" modal header="Filters" class="w-80">
          <div class="flex flex-col gap-2">
            <div class="grid gap-1">
              <p class="text-sm font-medium text-mute">Type</p>
              <Select v-model="selectedType" size="small" :options="options.type" />
            </div>

            <div class="grid gap-1">
              <p class="text-sm font-medium text-mute">Status</p>
              <Select v-model="selectedStatus" size="small" :options="options.status" />
            </div>

            <div class="grid grid-cols-2 gap-2 mt-2">
              <Button @click="visible = false" size="small" severity="secondary" label="Cancel" />
              <Button @click="mutate()" :loading="isLoading" size="small" label="Submit" />
            </div>
          </div>
        </Dialog>
      </div>

      <div class="mt-2 h-[calc(100dvh-10rem)] md:h-[calc(100dvh-11rem)]">
        <div class="w-full">
          <div class="md:max-h-[calc(100dvh-16rem)] overflow-auto w-full rounded-lg">
            <DataTable
              :loading="isLoading"
              :value="data?.transactions"
              selectionMode="single"
              dataKey="id"
              :metaKeySelection="false"
              stripedRows
              class="text-sm"
              @row-select="
                (event) =>
                  $router.push({
                    name: 'user-transaction-receipt',
                    params: { transaction_id: event.data.id }
                  })
              "
              tableStyle="min-width: 50rem; white-space: nowrap"
            >
              <Column field="transactionType" header="Type">
                <template #body="{ data }">
                  <div
                    class="flex-col-center"
                    :class="
                      data.transactionType === 'DEPOSIT' || data.transactionType === 'PROFIT'
                        ? 'text-green-500'
                        : 'text-red-500'
                    "
                  >
                    <span
                      :class="
                        data.transactionType === 'DEPOSIT' || data.transactionType === 'PROFIT'
                          ? 'pi pi-arrow-circle-down'
                          : 'pi pi-arrow-circle-up'
                      "
                    />
                    <small class="text-center font-medium">
                      {{ toTitleCase(data.transactionType) }}</small
                    >
                  </div>
                </template>
              </Column>

              <Column field="createdAt" header="Date">
                <template #body="{ data }">
                  <p>
                    {{
                      useDateFormat(data.createdAt, "dddd YYYY-MMM-DD, hh:mm:ss A", {
                        locales: "en-US"
                      })
                    }}
                  </p>
                </template>
              </Column>

              <Column field="id" header="Transaction ID"></Column>

              <Column field="amountInUSD" header="Amount (USD)">
                <template #body="{ data }">
                  <p
                    class="font-medium"
                    :class="
                      data.transactionType === 'DEPOSIT' || data.transactionType === 'PROFIT'
                        ? 'text-green-500'
                        : 'text-red-500'
                    "
                  >
                    {{ dollar.format(data.amountInUSD) }}
                  </p>
                </template>
              </Column>

              <Column field="currency" header="Currency">
                <template #body="{ data }">
                  <div class="flex items-center gap-1">
                    <p>{{ data.currency }}</p>
                    <Tag
                      v-if="data.isWireTransfer"
                      size="small"
                      class="text-xs whitespace-nowrap"
                      value="Wire Transfer"
                    />

                    <Tag
                      v-if="data.isGiftCard"
                      size="small"
                      class="text-xs whitespace-nowrap"
                      value="Gift Card"
                    />
                  </div>
                </template>
              </Column>

              <Column field="rate" header="Rate"></Column>

              <Column field="amountInCurrency" header="Amount in Currency"></Column>

              <Column field="status" header="Status">
                <template #body="{ data }">
                  <Tag
                    :severity="
                      data.transactionStatus === 'SUCCESSFUL'
                        ? 'success'
                        : data.transactionStatus === 'PENDING'
                          ? 'warn'
                          : 'danger'
                    "
                    :value="data.transactionStatus.toLowerCase()"
                    class="text-xs"
                  />
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
