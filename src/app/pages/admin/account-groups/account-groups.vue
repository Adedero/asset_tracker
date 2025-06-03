<script setup lang="ts">
import { AccountGroupsPageApiResponse } from "@/modules/admin/account-groups/account-groups-page.api";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";

const { isLoading, error, data, mutate } = useSWRV<AccountGroupsPageApiResponse>(
  "/api/admins/me/pages/account-groups",
  $fetch
);
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar></VNavbar>

      <div class="mt-2">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data" class="w-full md:h-[calc(100dvh-9rem)] overflow-y-auto">
          <DataTable
            :value="data.accountGroups"
            size="small"
            paginator
            :rows="10"
            tableStyle="min-width: 50rem"
          >
            <Column header="S/N">
              <template #body="{ index }">{{ index + 1 }}&rpar; </template>
            </Column>

            <Column field="name" header="Name"></Column>

            <Column header="Actions">
              <template #body="{ data }">
                <div class="flex gap-4">
                  <Button label="Edit" icon="pi pi-pencil" />
                  <Button label="Delete" icon="pi pi-trash" severity="danger" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
