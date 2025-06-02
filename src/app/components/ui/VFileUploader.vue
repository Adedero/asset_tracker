<script setup lang="ts">
import { computed, onBeforeUnmount, /* onUnmounted, */ ref } from "vue";

interface Props {
  accept?: string;
  invalidFileSizeMessage?: string;
  invalidFileTypeMessage?: string;
  maxFileSize?: number;
  maxFileNumber?: string | number;
  buttonType?: string;
  chooseLabel?: string;
  uploadLabel?: string;
  multiple?: boolean;
  loading?: boolean;
  inputId?: string;
  disabled?: boolean;
  size?: "small" | "large";
}

const {
  accept,
  invalidFileSizeMessage,
  invalidFileTypeMessage,
  maxFileSize,
  maxFileNumber,
  buttonType = "primary",
  chooseLabel = "Choose",
  uploadLabel = "Upload",
  multiple = false,
  loading = false,
  inputId = "v-file-uploader",
  disabled = false,
  size
} = defineProps<Props>();

const emit = defineEmits(["cancel", "select", "upload"]);

export interface IFile extends File {
  dataUrl?: string;
}

const files = ref<IFile[] | null>(null);

const uploadError = ref<{ error?: boolean; message?: string }>({});

const handleSelect = async (event: Event) => {
  uploadError.value = {};
  const target = event.target as unknown as Record<string, unknown>;
  const uploadedFiles = target?.files as File[];
  if (!uploadedFiles) {
    uploadError.value = {
      error: true,
      message: `No files selected.`
    };
    return;
  }
  files.value = Array.from(uploadedFiles);
  if (maxFileNumber) {
    const number = parseInt(maxFileNumber.toString(), 10);
    if (files.value.length > number) {
      //files.value = files.value.slice(0, number)
      files.value = null;
      uploadError.value = {
        error: true,
        message: `Only ${number} files can be uploaded.`
      };
      return;
    }
  }
  if (accept) {
    const isFormatValid = files.value.every((file) => {
      const fileType = file.type;
      const fileFormat = file?.name?.split(".")?.pop()?.toLowerCase();
      return fileType.match(accept) || accept.includes(fileFormat ?? "");
    });

    if (!isFormatValid) {
      files.value = null;
      uploadError.value = {
        error: true,
        message: invalidFileTypeMessage || "File format is not allowed."
      };
      return;
    }
  }

  if (maxFileSize) {
    const formattedSize = formatFileSize(maxFileSize);
    const isSizeValid = files.value.every((file) => file.size <= maxFileSize);

    if (!isSizeValid) {
      files.value = null;
      uploadError.value = {
        error: true,
        message: invalidFileSizeMessage || `File size exceeds the ${formattedSize} limit.`
      };
      return;
    }
  }
  uploadError.value = {
    error: false,
    message: ""
  };

  for await (const file of files.value) {
    const reader = new FileReader();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.readAsDataURL(file);
      reader.onload = (event: ProgressEvent<FileReader>) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error("File reading failed"));
      };
    });

    file.dataUrl = dataUrl;
  }
  emit("select", files.value);
};

const handleUpload = () => {
  if (files.value) {
    const emittedFiles = files.value;
    emit("upload", emittedFiles);
    files.value = null;
  }
};

const handleCancel = () => {
  files.value = null;
  uploadError.value = {
    error: false,
    message: ""
  };
  emit("cancel");
};

const uploadText = computed(() => {
  if (files.value) {
    if (files.value.length > 1) {
      return `${files.value.length} files selected`;
    } else {
      return files.value[0].name;
    }
  }
  return "No files selected";
});

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

onBeforeUnmount(() => {
  handleCancel();
});
</script>

<template>
  <div class="flex flex-col items-center justify-center *:flex-shrink-0">
    <Message v-show="uploadError.error" severity="error" closable class="w-full mb-2">
      {{ uploadError.message }}
    </Message>

    <Button
      v-if="!files"
      icon="pi pi-upload"
      :severity="buttonType"
      fluid
      style="padding: 0; width: 100%"
      :loading
      :size
    >
      <template #default>
        <label
          :for="inputId"
          class="font-semibold flex items-center justify-center gap-2 cursor-pointer w-full p-2"
        >
          <span class="pi pi-upload"></span>
          <span>{{ chooseLabel }}</span>
        </label>
      </template>
    </Button>

    <div v-else class="grid grid-cols-2 gap-2 w-full">
      <Button
        @click="handleCancel"
        :size
        severity="secondary"
        label="Cancel"
        icon="pi pi-times-circle"
      />

      <Button
        @click="handleUpload"
        icon="pi pi-upload"
        :severity="buttonType"
        style="padding: 0; width: 100%"
        :loading
        :disabled="loading || disabled"
        :size
      >
        <template #default>
          <div
            class="font-semibold flex items-center justify-center gap-2 cursor-pointer w-full p-2"
            :class="{ 'cursor-context-menu': disabled, '!p-1': size === 'small' }"
          >
            <span :class="loading ? 'pi pi-spinner pi-spin' : 'pi pi-plus'"></span>
            <span>{{ uploadLabel }}</span>
          </div>
        </template>
      </Button>
    </div>

    <p
      :class="{ 'text-slate-500': !files }"
      class="mt-2 max-w-60 text-center font-medium font-600 text-sm truncate"
    >
      {{ uploadText }}
    </p>
    <input
      :id="inputId"
      @input="handleSelect"
      @cancel="handleCancel"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
    />
  </div>
</template>
