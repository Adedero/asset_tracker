<script setup lang="ts">
import { computed, ref } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { GET_REQUEST_DATA_LIMIT } from "@/utils/constants";
import { KycStatus } from "@/prisma-gen";
import { Icon } from "@iconify/vue";
import { AccountsGetApiResponse } from "@/modules/admin/users/accounts-get.api";
import { toTitleCase } from "@/app/utils/helpers";
import { useDateFormat } from "@vueuse/core";

const page = ref(0);
const LIMIT = GET_REQUEST_DATA_LIMIT;
const skip = computed(() => page.value * LIMIT);

const statusOptions = ref<KycStatus[]>(["PENDING", "VERIFIED", "UNVERIFIED"]);
const selectedStatus = ref<KycStatus>("PENDING");

const searchParams = computed(() => {
  const params = new URLSearchParams();
  params.set("take", LIMIT.toString());
  params.set("skip", skip.value.toString());
  params.set("sort", "kycSubmittedAt,desc");
  params.set("where", `kycStatus,${selectedStatus.value}`);
  return params.toString();
});

const { isLoading, data, error, mutate } = useSWRV<AccountsGetApiResponse>(
  () => `/api/admins/me/accounts?${searchParams.value}`,
  $fetch
);

const showAdmins = ref<boolean>(false);
const filteredAccounts = computed(() => {
  if (!data.value?.accounts) return null;
  if (showAdmins.value) return data.value.accounts;
  return data.value.accounts.filter((account) => account.user && account.user.role !== "ADMIN");
});

const dataLength = computed(() => data.value?.accounts.length || 0);

const allLoaded = computed(() => {
  return !!data.value?.accounts && data.value.accounts.length < LIMIT;
});

function getSeverity(status: KycStatus) {
  if (status === "VERIFIED") return "success";
  if (status === "PENDING") return "warn";
  return "danger";
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VCard class="py-2">
        <div class="flex flex-col md:flex-row gap-2 justify-between">
          <div class="flex items-start gap-5 flex-wrap">
            <h1 class="text-lg font-semibold text-primary-500">KYC</h1>

            <div class="translate-y-1 flex gap-1 items-center">
              <Checkbox binary v-model="showAdmins" />
              <label class="text-xs text-mute font-semibold">Show admins</label>
            </div>
          </div>

          <div class="flex items-end gap-1 flex-wrap">
            <div class="flex gap-1 flex-col">
              <label class="text-xs text-mute font-semibold">Status</label>
              <Select v-model="selectedStatus" :options="statusOptions" size="small" class="py-0" />
            </div>
          </div>
        </div>
      </VCard>

      <div class="mt-2 md:h-[calc(100dvh-10rem)]">
        <VPageLoader v-if="isLoading" />
        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="filteredAccounts">
          <div class="h-full w-full">
            <div class="w-full overflow-auto md:max-h-[calc(100dvh-15rem)]">
              <DataTable
                :value="filteredAccounts"
                class="text-sm"
                selectionMode="single"
                dataKey="id"
                :metaKeySelection="false"
                @row-click="
                  (event) =>
                    $router.push({
                      name: 'admin-kyc-review',
                      params: { account_id: event.data.id }
                    })
                "
              >
                <Column header="S/N" style="min-width: 4rem">
                  <template #body="{ index }"> {{ index + 1 + skip }}&rpar; </template>
                </Column>

                <Column>
                  <template #body="{ data }">
                    <div
                      v-if="data.user?.image"
                      class="w-8 aspect-square overflow-hidden rounded-full"
                    >
                      <img
                        :src="data.user.image"
                        :alt="data.user?.name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <Icon
                      v-else
                      icon="ic:baseline-account-circle"
                      style="font-size: 2rem"
                      class="text-primary-500"
                    />
                  </template>
                </Column>

                <Column field="user.name" header="Name">
                  <template #body="{ data }">
                    <p>
                      {{ data.user.name }}
                      <span
                        class="text-xs font-semibold text-red-500"
                        v-show="data.user.role === 'ADMIN'"
                      >
                        admin
                      </span>
                    </p>
                  </template>
                </Column>

                <Column header="KYC Status">
                  <template #body="{ data }">
                    <Tag
                      class="text-xs font-semibold"
                      :severity="getSeverity(data.kycStatus)"
                      :value="toTitleCase(data.kycStatus)"
                    />
                  </template>
                </Column>

                <Column field="kycIdType" header="ID Type" />

                <Column header="Submitted On">
                  <template #body="{ data }">
                    <p v-if="data.kycSubmittedAt">
                      {{
                        useDateFormat(new Date(data.kycSubmittedAt), "ddd, DD MMM, YYYY hh:mm aa")
                      }}
                    </p>
                    <p v-else>Not submitted</p>
                  </template>
                </Column>
              </DataTable>
            </div>

            <VPaginator :allLoaded :length="dataLength" :rows="LIMIT" v-model:page="page" />
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
