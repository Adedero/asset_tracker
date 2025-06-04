<script setup lang="ts">
import { v4 as uuid } from "uuid";
import {
  EMAIL_ATTACHMENT_ACCEPT,
  EMAIL_FILES_ALLOWED_EXTENSIONS,
  EMAIL_MAX_FILE_SIZE,
  EMAIL_MAX_FILES
} from "@/app/data/constants";
import { onUnmounted, ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import { useToast } from "primevue/usetoast";
export interface IFile extends File {
  id?: string;
  dataUrl?: string;
}
const toast = useToast();
const emit = defineEmits<{
  select: [files: IFile[]];
  cancel: [];
}>();

const id = uuid();
const files = ref<IFile[] | null>(null);

const { error, execute, state } = useAsyncState(uploadPromise, null, { immediate: false });

async function uploadPromise(event: Event): Promise<IFile[] | null> {
  const target = event.target as HTMLInputElement;
  const uploadedFiles = target?.files as File[];
  if (!uploadedFiles) {
    throw new Error("No files selected.");
  }

  files.value = Array.from(uploadedFiles);

  if (files.value.length > EMAIL_MAX_FILES) {
    throw new Error(`Only a amaximum of ${EMAIL_MAX_FILES} files can be uploaded.`);
  }

  const isFormatValid = files.value.every((file) => {
    const accept = EMAIL_ATTACHMENT_ACCEPT.replace(/\s+/g, "").split(",");
    const fileType = file.type;
    const fileExtension = file.name?.split(".")?.pop()?.toLowerCase() ?? "";
    return accept.includes(fileType) || EMAIL_FILES_ALLOWED_EXTENSIONS.includes(fileExtension);
  });

  if (!isFormatValid) {
    files.value = null;
    throw new Error("File format is not allowed.");
  }

  const formattedSize = formatFileSize(EMAIL_MAX_FILE_SIZE);
  const isSizeValid = files.value.every((file) => file.size <= EMAIL_MAX_FILE_SIZE);

  if (!isSizeValid) {
    files.value = null;
    throw new Error(`File size exceeds the ${formattedSize} limit.`);
  }

  for await (const file of files.value) {
    file.id = uuid();

    const reader = new FileReader();

    file.dataUrl = await new Promise<string>((resolve, reject) => {
      reader.readAsDataURL(file);
      reader.onload = (event: ProgressEvent<FileReader>) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error("File reading failed"));
      };
    });
  }

  return files.value;
}

async function handleSelect(event: Event) {
  await execute(0, event);
  if (error.value || !state.value) {
    toast.add({ severity: "error", summary: "Error", detail: error.value.message });
    return;
  }
  emit("select", state.value!);
}

function formatFileSize(bytes: number): string {
  const units = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  let unitIndex = 0;
  let fileSize = bytes;

  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024;
    unitIndex++;
  }

  return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
}

function handleCancel() {
  files.value = null;
  emit("cancel");
}

onUnmounted(() => {
  handleCancel();
});
</script>

<template>
  <div>
    <input
      @input="handleSelect"
      @cancel="handleCancel"
      type="file"
      :accept="EMAIL_ATTACHMENT_ACCEPT"
      multiple
      :id="id"
      style="display: none"
    />
    <label :for="id" class="cursor-pointer *:pointer-events-none">
      <slot>
        <Button icon="pi pi-paperclip" size="small" outlined />
      </slot>
    </label>
  </div>
</template>
`
