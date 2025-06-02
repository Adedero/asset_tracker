<script setup lang="ts">
import { computed, ref } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { GET_REQUEST_DATA_LIMIT } from "@/utils/constants";
import { InvestmentStatus } from "@/prisma-gen";
import { useDateFormat } from "@vueuse/core";
import { useRouter } from "vue-router";
import tiers from "@/app/data/investment-tier";
import { toTitleCase } from "@/app/utils/helpers";
import { InvestmentsGetApiResponse } from "@/modules/user/investments/investments-get.api";

const page = ref(0);
const LIMIT = GET_REQUEST_DATA_LIMIT;
const skip = computed(() => page.value * LIMIT);

const router = useRouter();

const { user_id } = router.currentRoute.value.query as { user_id: string };

type StatusOptions = "ALL" | InvestmentStatus;
const statusOptions = ref<StatusOptions[]>(["ALL", "OPEN", "CLOSED", "PAUSED", "TERMINATED"]);

const status = ref<StatusOptions>("OPEN");

const tier = ref<string>("ALL");
const tierOptions = ref<Array<string>>(["ALL", ...tiers.map((tier) => tier.toUpperCase())]);

const searchParams = computed(() => {
  const params = new URLSearchParams();
  params.set("take", LIMIT.toString());
  params.set("skip", skip.value.toString());
  params.set("sort", "createdAt,DESC");
  if (user_id) params.set("where", `userId,${user_id}`);
  if (status.value !== "ALL") params.append("where", `investmentStatus,${status.value}`);
  if (tier.value !== "ALL") params.append("where", `investmentTier,${toTitleCase(tier.value)}`);
  return params.toString();
});

const { isLoading, data, error, mutate } = useSWRV<InvestmentsGetApiResponse>(
  () => `/api/admins/me/investments?${searchParams.value}`,
  $fetch
);

const dataLength = computed(() => data.value?.investments.length || 0);

const allLoaded = computed(() => {
  return !!data.value?.investments && data.value.investments.length < LIMIT;
});

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
      <VCard class="py-2">
        <div class="flex flex-col md:flex-row gap-2 justify-between">
          <h1 class="text-lg font-semibold text-primary-500">Investments</h1>

          <div class="flex items-end gap-1 flex-wrap">
            <div class="flex gap-1 flex-col">
              <label class="text-xs text-mute font-semibold">Status</label>
              <Select v-model="status" :options="statusOptions" size="small" class="py-0" />
            </div>

            <div class="flex gap-1 flex-col">
              <label class="text-xs text-mute font-semibold">Tier</label>
              <Select v-model="tier" :options="tierOptions" size="small" class="py-0" />
            </div>
          </div>
        </div>
      </VCard>

      <div class="mt-2 md:h-[calc(100dvh-10rem)]">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" closable />

        <div v-else-if="data" class="h-full w-full">
          <div class="w-full overflow-auto md:max-h-[calc(100dvh-16rem)]">
            <DataTable
              :value="data.investments"
              class="text-sm min-w-[60rem]"
              selectionMode="single"
              dataKey="id"
              :metaKeySelection="false"
              @row-click="
                (event) => {
                  router.push({
                    name: 'admin-investment-item',
                    params: { investment_id: event.data.id }
                  });
                }
              "
            >
              <Column header="S/N" style="min-width: 4rem">
                <template #body="{ index }"> {{ index + 1 + skip }}&rpar; </template>
              </Column>

              <Column field="investmentName" header="Investment" />

              <Column field="investmentTier" header="Tier" />

              <Column header="Status">
                <template #body="{ data }">
                  <Tag
                    class="text-xs font-semibold"
                    :severity="getSeverity(data.investmentStatus)"
                    :value="toTitleCase(data.investmentStatus)"
                  />
                </template>
              </Column>

              <Column field="user.name" header="User" />

              <Column field="amount" header="Amount">
                <template #body="{ data }"> ${{ data.initialDeposit.toLocaleString() }} </template>
              </Column>

              <Column field="duration" header="Duration (days)" />

              <Column field="daysCompleted" header="Days Completed (days)" />

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
