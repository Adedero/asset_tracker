<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import BackupsGetApi from "@/modules/admin/backup/backups-get.api";
import { useDateFormat } from "@vueuse/core";
import { useToast } from "primevue/usetoast";
import { computed, ref, watchEffect } from "vue";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();

const {
  isFetching: loadingBackups,
  error: getBackupsError,
  data: getBackupsData,
  execute: getBackups
} = await useFetch("/api/admins/me/database/backups").get().json<BackupsGetApi>();

type BackupFile = BackupsGetApi["files"][number] & { downloading?: boolean; deleting?: boolean };
const files = ref<BackupFile[] | undefined>(undefined);

// When backup data loads initially, update files
watchEffect(() => {
  if (getBackupsData.value?.files) {
    files.value = getBackupsData.value.files;
  }
});

const {
  isFetching: creatingBackup,
  error: createError,
  data: createData,
  execute: createBackup
} = useFetch("/api/admins/me/database/backups", { immediate: false }).post().json();
async function createNewBackup() {
  if (creatingBackup.value || !(await ask("Do you want to create a backup?"))) {
    return;
  }
  await createBackup();
  if (createError.value || !createData.value) {
    return toast.add({ severity: "error", summary: "Error", detail: createError.value.message });
  }
  if (files.value) {
    files.value = [createData.value.file, ...files.value];
  } else {
    files.value = [createData.value.file];
  }
  toast.add({ severity: "success", summary: createData.value.message, life: 3000 });
}

const selectedFile = ref<string | null>(null);

const {
  isFetching: downloading,
  error: downloadError,
  data: downloadData,
  execute: download
} = useFetch(() => `/api/admins/me/database/backups/${selectedFile.value}`, { immediate: false })
  .get()
  .blob();
async function onDownload(file: BackupFile) {
  if (downloading.value) return;
  selectedFile.value = file.filename;
  file.downloading = true;
  await download().finally(() => (file.downloading = false));
  if (downloadError.value || !downloadData.value) {
    return toast.add({ severity: "error", summary: "Error", detail: downloadError.value.message });
  }
  const url = window.URL.createObjectURL(downloadData.value);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  selectedFile.value = null;
  //toast.add({ severity: "success", summary: `${file.filename} downloaded`, life: 3000 });
}

const {
  isFetching: deleting,
  error: deleteError,
  data: deleteData,
  execute: deleteFile
} = useFetch(() => `/api/admins/me/database/backups/${selectedFile.value}`, { immediate: false })
  .delete()
  .json();
async function onDelete(file: BackupFile) {
  if (!files.value) return;
  if (deleting.value || !(await ask("Do you want to delete this backup?"))) return;
  selectedFile.value = file.filename;
  file.deleting = true;
  await deleteFile().finally(() => (file.deleting = false));
  if (deleteError.value || !deleteData.value) {
    return toast.add({ severity: "error", summary: "Error", detail: deleteError.value.message });
  }
  files.value = files.value.filter((f) => f.filename !== file.filename);
  toast.add({ severity: "success", summary: deleteData.value.message, life: 3000 });
  selectedFile.value = null;
}

const ask = async (question: string): Promise<boolean> => {
  return await new Promise<boolean>((resolve) => {
    confirm.require({
      header: "Confirmation",
      message: question,
      icon: "pi pi-exclamation-triangle",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true
      },
      acceptProps: {
        label: "Proceed"
      },
      accept: () => {
        resolve(true);
      },
      reject: () => {
        resolve(false);
      }
    });
  });
};
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #right>
          <Button
            :loading="creatingBackup"
            @click="createNewBackup"
            size="small"
            label="Create backup"
            icon="pi pi-cloud-upload"
          />
        </template>
      </VNavbar>

      <div class="mt-2">
        <VPageLoader v-if="loadingBackups" />
        <VErrorMessage
          v-else-if="getBackupsError"
          :error="getBackupsError"
          should-retry
          @retry="getBackups()"
        />

        <VCard v-else-if="getBackupsData && files" header="Database Backups">
          <div class="grid gap-2">
            <VCard
              v-for="file in files"
              :key="file.filename"
              class="border border-slate-300 dark:border-slate-500"
            >
              <template #header>
                <p class="text-primary-500 font-medium text-xs">
                  Created: {{ useDateFormat(file.createdAt, "ddd, DD MMM, YYYY hh:mm aa") }}
                  <span
                    v-if="Date.now() - new Date(file.createdAt).getTime() < 5000"
                    class="ml-2 text-xs font-semibold p-1 rounded-md bg-emerald-200 text-emerald-600"
                  >
                    new
                  </span>
                </p>
              </template>

              <div class="flex items-center justify-between gap-2">
                <p class="truncate">
                  <span class="pi pi-database bg-amber-200 text-amber-600 p-1.5 rounded-md" />
                  <span class="ml-2 text-sm font-semibold">{{ file.filename }}</span>
                </p>

                <div class="flex items-center gap-1">
                  <Button
                    :loading="file.downloading"
                    @click="onDownload(file)"
                    icon="pi pi-download"
                    outlined
                    size="small"
                  />
                  <Button
                    :loading="file.deleting"
                    @click="onDelete(file)"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    size="small"
                  />
                </div>
              </div>
            </VCard>
          </div>
        </VCard>
      </div>
    </div>
  </VueLayout>
</template>
