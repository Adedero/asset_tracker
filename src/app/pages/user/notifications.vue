<script setup lang="ts">
import { computed, ref } from "vue";
import { $fetch, useFetch } from "@/app/composables/use-fetch";
import { NotificationsGetApiResponse } from "@/modules/user/notifications/notifications-get.api";
import useSWRV from "swrv";
import { GET_REQUEST_DATA_LIMIT } from "@/utils/constants";
import { useDateFormat } from "@vueuse/core";
import { Notification } from "@/prisma-gen";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { DeleteNotificationsApiResponse } from "@/modules/user/notifications/notifications-delete.api";

const toast = useToast();
const confirm = useConfirm();

const page = ref(0);
const LIMIT = GET_REQUEST_DATA_LIMIT;

const searchParams = computed(() => {
  const params = new URLSearchParams();
  params.set("take", LIMIT.toString());
  params.set("skip", (page.value * LIMIT).toString());
  params.set("sort", "createdAt,desc");
  return params.toString();
});

const { isLoading, data, error, mutate } = useSWRV<NotificationsGetApiResponse>(
  () => `/api/users/me/notifications?${searchParams.value}`,
  $fetch
);

const dataLength = computed(() => data.value?.notifications.length || 0);

const allLoaded = computed(() => {
  return !!data.value?.notifications && data.value.notifications.length < LIMIT;
});

const selectedNotificationIds = ref<string[]>([]);

const api = computed(() => {
  const base = "/api/users/me/notifications";
  if (!selectedNotificationIds.value.length) {
    return `${base}/${"ALL"}`;
  }
  const ids = selectedNotificationIds.value.toString();
  return `${base}/${ids}`;
});

const {
  isFetching: isDeleting,
  error: errorDeleting,
  data: deleteData,
  execute
} = useFetch(api, { immediate: false }).delete().json<DeleteNotificationsApiResponse>();

const deleteNotifications = async () => {
  if (!data.value) return;

  if (selectedNotificationIds.value.length) {
    data.value.notifications
      .filter((n) => selectedNotificationIds.value.includes(n.id))
      /* @ts-expect-error */
      .forEach((n) => (n.isLoading = isDeleting.value));
  }

  await execute();
  if (errorDeleting.value || !deleteData.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: errorDeleting.value.message
    });
    return;
  }
  const { deleteCount } = deleteData.value;

  const updatedNotifications = selectedNotificationIds.value.length
    ? data.value.notifications.filter((n) => {
        return !selectedNotificationIds.value.includes(n.id);
      })
    : [];

  await mutate(() =>
    Promise.resolve({
      success: true,
      message: "Notifications updated successfully.",
      notifications: updatedNotifications
    })
  );

  toast.add({
    severity: "success",
    detail: `${deleteCount} ${deleteCount === 0 || deleteCount > 1 ? "notifications" : "notification"} deleted.`
  });
};

const deleteAll = () => {
  selectedNotificationIds.value = [];
  confirmDelete();
};

const deleteSingleNotification = (n: Notification) => {
  selectedNotificationIds.value = [n.id];
  confirmDelete();
};

function confirmDelete() {
  confirm.require({
    message: "Are you sure you want to proceed?",
    header: "Delete notification",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Proceed",
      severity: "danger"
    },
    accept: () => {
      deleteNotifications();
    }
  });
}
</script>

<template>
  <VueLayout name="user">
    <div>
      <VNavbar>
        <template #right>
          <Button
            @click="deleteAll"
            :disabled="!data?.notifications.length"
            :loading="isDeleting"
            label="Clear All"
            severity="danger"
            icon="pi pi-trash"
            size="small"
          />
        </template>
      </VNavbar>

      <div
        v-if="api.endsWith('ALL') && isDeleting"
        class="left-0 top-0 z-[100] fixed w-dvw h-dvh flex items-center justify-center bg-black/60 backdrop-blur-lg"
      >
        <VCard header="Updating" class="w-60 shadow-lg">
          <div class="mt-2 flex flex-col w-full items-center justify-center gap-4">
            <ProgressSpinner
              style="width: 50px; height: 50px"
              strokeWidth="8"
              fill="transparent"
              animationDuration=".5s"
              aria-label="Custom ProgressSpinner"
            />
            <p class="text-mute font-semibold text-sm">Please wait...</p>
          </div>
        </VCard>
      </div>

      <VPageLoader v-if="isLoading" />

      <div class="w-full mt-2" v-else-if="error">
        <VErrorMessage :error should-retry @retry="mutate()" />
      </div>

      <div
        v-else-if="data"
        class="mt-2 py-2 flex flex-col gap-2 *:flex-shrink-0 md:h-[calc(100dvh-8.5rem)] overflow-y-auto items-center"
      >
        <VCard v-for="n in data.notifications" :key="n.id" class="w-full max-w-[32rem]">
          <template #header>
            <div class="flex items-center gap-1">
              <span class="pi pi-info-circle" />
              <p class="font-semibold">{{ n.title }}</p>
            </div>
          </template>
          <p class="text-sm whitespace-pre-wrap">
            {{ n.description }}
          </p>
          <Divider class="py-1" />
          <div class="flex items-center gap-1 justify-between">
            <small>{{ useDateFormat(n.createdAt, "MMM DD, YYYY hh:mm AA") }}</small>
            <div class="flex items-center gap-2">
              <Tag v-show="!n.isRead" value="new" severity="warn" class="text-xs" />
              <!-- @vue-expect-error -->
              <Button
                @click="deleteSingleNotification(n)"
                :loading="n.isLoading"
                size="small"
                severity="danger"
                rounded
                text
                icon="pi pi-trash"
              />
            </div>
          </div>
        </VCard>
        <VPaginator :length="dataLength" :allLoaded :rows="LIMIT" v-model:page="page" />
      </div>
    </div>
  </VueLayout>
</template>
