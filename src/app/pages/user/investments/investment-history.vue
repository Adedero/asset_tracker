<script setup lang="ts">
import { InvestmentStatus } from "@/prisma-gen";
import { InvestmentsGetApiResponse } from "@/modules/user/investments/investments-get.api";
import { computed, ref, watch } from "vue";
import { GET_REQUEST_DATA_LIMIT } from "@/utils/constants";
import useSWRV from "swrv";
import { $fetch } from "@/app/composables/use-fetch";
import { dollar, toTitleCase } from "@/app/utils/helpers";
import { useDateFormat } from "@vueuse/core";

const page = ref(0);
const LIMIT = GET_REQUEST_DATA_LIMIT;
const visible = ref(false);

type Status = "ALL" | InvestmentStatus;
const statuses = ref<Status[]>(["ALL", "OPEN", "PAUSED", "CLOSED", "TERMINATED"]);
const selectedStatus = ref(statuses.value[0]);

const searchParams = computed(() => {
  const params = new URLSearchParams();
  params.set("take", LIMIT.toString());
  params.set("skip", (page.value * LIMIT).toString());
  params.set("sort", "createdAt,desc");
  if (selectedStatus.value !== "ALL") {
    params.set("where", `investmentStatus,${selectedStatus.value}`);
  }
  return params.toString();
});

watch(selectedStatus, () => (page.value = 0));

const { isLoading, data, error, mutate } = useSWRV<InvestmentsGetApiResponse>(
  () => `/api/users/me/investments?${searchParams.value}`,
  $fetch
);

const dataLength = computed(() => data.value?.investments.length || 0);

const allLoaded = computed(() => {
  return !!data.value?.investments && data.value.investments.length < LIMIT;
});

const getUpdatedData = () => {
  page.value = 0;
  mutate();
};
</script>

<template>
  <VueLayout name="user">
    <div>
      <div class="v-card p-3">
        <div class="flex-center-between">
          <h1 class="text-lg font-semibold text-primary-500 dark:text-primary-400">
            Investment History
          </h1>

          <div class="hidden md:flex items-end gap-2 justify-end">
            <div class="grid gap-1">
              <p class="text-sm font-medium text-mute text-right">Status</p>
              <Select v-model="selectedStatus" size="small" :options="statuses" />
            </div>

            <Button @click="getUpdatedData" :loading="isLoading" label="Submit" size="small" />
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
              <p class="text-sm font-medium text-mute">Status</p>
              <Select v-model="selectedStatus" size="small" :options="statuses" />
            </div>

            <div class="grid grid-cols-2 gap-2 mt-2">
              <Button @click="visible = false" size="small" severity="secondary" label="Close" />
              <Button
                @click="
                  getUpdatedData;
                  visible = false;
                "
                :loading="isLoading"
                size="small"
                label="Submit"
              />
            </div>
          </div>
        </Dialog>
      </div>

      <div class="mt-2 h-[calc(100dvh-10rem)] md:h-[calc(100dvh-11rem)]">
        <div class="w-full h-full overflow-y-auto rounded-lg">
          <DataTable
            :loading="isLoading"
            :value="data?.investments"
            selectionMode="single"
            dataKey="id"
            :metaKeySelection="false"
            stripedRows
            @row-select="
              (event) =>
                $router.push({
                  name: 'user-investment-item',
                  params: { investment_id: event.data.id }
                })
            "
            tableStyle="min-width: 50rem; white-space: nowrap"
          >
            <Column field="initialDeposit" header="Deposit">
              <template #body="{ data }">
                {{ dollar.format(data.initialDeposit) }}
              </template>
            </Column>

            <Column field="investmentName" header="Name"></Column>

            <Column field="investmentTier" header="Tier"></Column>

            <Column field="initialDeposit" header="Auto-compounded">
              <template #body="{ data }">
                {{ data.autocompounded ? "Yes" : "No" }}
              </template>
            </Column>

            <Column field="expectedReturnRate" header="Rate">
              <template #body="{ data }">
                {{
                  `${!data.autocompounded ? data.expectedReturnRate : data.autocompoundedReturnRate}%`
                }}
              </template>
            </Column>

            <Column header="Expected Return">
              <template #body="{ data }">
                {{ dollar.format(data.expectedTotalReturns) }}
              </template>
            </Column>

            <Column header="Current Return">
              <template #body="{ data }">
                {{ dollar.format(data.currentTotalReturns) }}
              </template>
            </Column>

            <Column field="duration" header="Duration (days)" />

            <Column field="daysCompleted" header="Days Completed" />

            <Column field="createdAt" header="Date">
              <template #body="{ data }">
                <p>
                  {{
                    useDateFormat(data.createdAt, "dddd YYYY-MM-DD, hh:mm:ss A", {
                      locales: "en-US"
                    })
                  }}
                </p>
              </template>
            </Column>

            <Column field="investmentStatus" header="Status">
              <template #body="{ data }">
                <Tag
                  :severity="
                    data.investmentStatus === 'OPEN'
                      ? ''
                      : data.status === 'CLOSED'
                        ? 'success'
                        : 'danger'
                  "
                  :value="toTitleCase(data.investmentStatus)"
                />
              </template>
            </Column>
          </DataTable>

          <VPaginator :allLoaded :length="dataLength" :rows="LIMIT" v-model:page="page" />
        </div>
      </div>
    </div>
  </VueLayout>
</template>
