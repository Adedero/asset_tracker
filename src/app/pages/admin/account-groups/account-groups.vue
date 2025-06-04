<script setup lang="ts">
import { AccountGroupsGetApiResponse } from "@/modules/admin/account-groups/account-groups-get.api";
import { $fetch, useFetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { useConfirm, useToast } from "primevue";
import { ref } from "vue";
import { AccountGroup } from "@/prisma-gen";

const confirm = useConfirm();
const toast = useToast();

const { isLoading, error, data, mutate } = useSWRV<AccountGroupsGetApiResponse>(
  "/api/admins/me/account-groups",
  $fetch
);

const url = ref<string>("");

const {
  error: deleteError,
  data: deleteData,
  execute
} = useFetch(() => `/api/admins/me/account-groups/${url.value}`, { immediate: false })
  .delete()
  .json();

async function deleteAccountGroup(accountGroup: AccountGroup & { isDeleting: boolean }) {
  url.value = accountGroup.id;
  accountGroup.isDeleting = true;
  await execute();
  if (deleteError.value || !deleteData.value) {
    toast.add({ severity: "error", summary: "Error", detail: deleteError.value.message });
    accountGroup.isDeleting = false;
    return;
  }
  await mutate(() =>
    Promise.resolve({
      success: true,
      message: "Account group deleted",
      accountGroups: data.value!.accountGroups.filter((group) => group.id !== accountGroup.id)
    })
  );
  toast.add({
    severity: "success",
    summary: "Success",
    detail: "Account group deleted",
    life: 3000
  });
  accountGroup.isDeleting = false;
}

const confirmDelete = (accountGroup: AccountGroup & { isDeleting: boolean }) => {
  confirm.require({
    header: "Delete account group",
    message: "Are you sure you want to delete this account group?",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Delete",
      severity: "danger"
    },
    accept: () => {
      deleteAccountGroup(accountGroup);
    }
  });
};
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #right>
          <RouterLink :to="{ name: 'admin-account-group-editor' }">
            <Button label="New Group" icon="pi pi-plus" size="small" />
          </RouterLink>
        </template>
      </VNavbar>

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
            <Column header="S/N" style="width: 10%">
              <template #body="{ index }">{{ index + 1 }}&rpar; </template>
            </Column>

            <Column field="name" header="Name" style="min-width: 30%"></Column>

            <Column header="Description" style="max-width: 10rem">
              <template #body="{ data }">
                <p class="truncate">{{ data.description }}</p>
              </template>
            </Column>

            <Column header="Actions">
              <template #body="{ data }">
                <div class="flex gap-4">
                  <RouterLink
                    :to="{
                      name: 'admin-account-group-editor',
                      params: { account_group_id: data.id }
                    }"
                  >
                    <Button label="Edit" size="small" outlined icon="pi pi-pencil" />
                  </RouterLink>
                  <Button
                    :loading="data.isDeleting"
                    @click="confirmDelete(data)"
                    label="Delete"
                    size="small"
                    outlined
                    icon="pi pi-trash"
                    severity="danger"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
