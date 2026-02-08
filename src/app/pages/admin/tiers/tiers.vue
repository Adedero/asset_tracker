<script setup lang="ts">
import { $fetch, useFetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { useConfirm, useToast } from "primevue";
import { ref } from "vue";
import { TierCreateApiResponse } from "@/modules/admin/tiers/tiers-post.api";
import { useDateFormat } from "@vueuse/core";
import type { UserTier } from "@/prisma-gen";
import type { DeleteTierByIdApi } from "@/modules/admin/tiers/delete-tier-by-id.api";
import type { GetAllTiersApi } from "@/modules/admin/tiers/get-all-tiers.api";
import { TierUpdateApiResponse } from "@/modules/admin/tiers/update-tier.api";

const confirm = useConfirm();
const toast = useToast();

const {
  isLoading,
  error,
  data,
  mutate: updateTiers
} = useSWRV<GetAllTiersApi>("/api/admins/me/tiers", $fetch);

// Creating a new tier
const visible = ref(false);
const selectedTier = ref<UserTier | null>(null);

function initTierCreate() {
  visible.value = true;
  selectedTier.value = null;
}
const onCreateTier = (payload: TierCreateApiResponse) => {
  const { tier } = payload;
  updateTiers(() =>
    Promise.resolve({
      success: true,
      message: "Tier created",
      tiers: [tier, ...data.value!.tiers]
    })
  );
};

// Editing a tier
function selectTier(tier: UserTier) {
  selectedTier.value = tier;
  visible.value = true;
}
function onUpdateTier(payload: TierUpdateApiResponse) {
  const { tier } = payload;
  updateTiers(() =>
    Promise.resolve({
      success: true,
      message: "Tier updated",
      tiers: data.value!.tiers.map((t) => (t.id === tier.id ? tier : t))
    })
  );
}

// Deleting a tier
const tierId = ref<string>("");
const {
  data: deleteData,
  error: deleteError,
  execute: executeDeleteTier
} = useFetch(() => `/api/admins/me/tiers/${tierId.value}`, {
  immediate: false
})
  .delete()
  .json<DeleteTierByIdApi>();

async function deleteTier(tier: UserTier & { isDeleting: boolean }) {
  tierId.value = tier.id;
  tier.isDeleting = true;

  await executeDeleteTier().finally(() => {
    tier.isDeleting = false;
  });

  if (deleteError.value || !deleteData.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: deleteError.value.message
    });
    return;
  }

  await updateTiers(() =>
    Promise.resolve({
      success: true,
      message: "Account group deleted",
      tiers: data.value!.tiers.filter((t) => t.id !== tier.id)
    })
  );

  toast.add({
    severity: "success",
    summary: "Success",
    detail: "Tier deleted",
    life: 3000
  });

  tier.isDeleting = false;
}

const confirmDelete = (tier: UserTier & { isDeleting: boolean }) => {
  confirm.require({
    header: "Delete tier",
    message: "Are you sure you want to delete this tier?",
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
      deleteTier(tier);
    }
  });
};
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #right>
          <Button
            label="New Tier"
            icon="pi pi-plus"
            size="small"
            @click="initTierCreate"
          />
        </template>
      </VNavbar>

      <div class="mt-2">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage
          v-else-if="error"
          :error
          should-retry
          @retry="updateTiers()"
        />

        <div
          v-else-if="data"
          class="w-full md:h-[calc(100dvh-9rem)] overflow-y-auto"
        >
          <DataTable
            :value="data.tiers"
            size="small"
            paginator
            :rows="10"
            tableStyle="min-width: 50rem"
          >
            <Column header="S/N" style="width: 10%">
              <template #body="{ index }">{{ index + 1 }}&rpar; </template>
            </Column>

            <Column field="name" header="Name" style="min-width: 30%" />
            <Column header="Description" style="max-width: 10rem">
              <template #body="{ data }">
                <p class="truncate">{{ data.description }}</p>
              </template>
            </Column>
            <Column header="Created">
              <template #body="{ data }">
                {{ useDateFormat(data.createdAt, "MMM DD, YYYY") }}
              </template>
            </Column>
            <Column header="Actions">
              <template #body="{ data }">
                <div class="flex gap-4">
                  <Button
                    label="Edit"
                    size="small"
                    outlined
                    icon="pi pi-pencil"
                    @click="selectTier(data)"
                  />
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

    <TierManagerDialog
      v-model:visible="visible"
      :tier="selectedTier"
      @create="onCreateTier"
      @update="onUpdateTier"
    />
  </VueLayout>
</template>
