<script setup lang="ts">
import { ref } from "vue";
import { IFile } from "../ui/VFileUploader.vue";
import { useFetch } from "@/app/composables/use-fetch";
import { Account } from "@/prisma-gen";
import { APP_NAME } from "@/app/data/constants";

const emit = defineEmits<{
  update: [data: Partial<Account>];
}>();

const visible = defineModel<boolean>("visible", { default: false });

const idTypes = ref([
  "International Passport",
  "Driver's License",
  "Voter's Card",
  "National ID Card"
]);

const selectedIdType = ref<string>();

const data = ref<Partial<Account>>({
  kycIdType: selectedIdType.value,
  kycDocument: undefined,
  kycDocumentExt: undefined,
  kycStatus: "PENDING",
  kycSubmittedAt: undefined,
  kycVerifiedAt: undefined
});

const { isFetching, error, execute } = useFetch(() => "/api/users/me/account", { immediate: false })
  .put(data)
  .json();

const handleUpload = async (files: IFile[]) => {
  const file = files[0];
  data.value = {
    kycIdType: selectedIdType.value,
    kycDocument: file.dataUrl,
    kycDocumentExt: file.name.split(".").pop(),
    kycStatus: "PENDING",
    kycSubmittedAt: new Date(),
    kycVerifiedAt: undefined
  };

  await execute().then(() => {
    if (error.value) return;
    visible.value = false;
    emit("update", data.value);
  });
};
</script>

<template>
  <Dialog v-model:visible="visible" header="KYC Verification" modal class="w-full max-w-96">
    <div class="grid gap-4">
      <Message size="small" class="mt-2">
        For a quicker verification process, please make sure the name on your ID matches your name
        on {{ APP_NAME }}.
      </Message>

      <VErrorMessage :error="error" class="my-3" />

      <div class="grid gap-2">
        <label for="id-type" class="text-mute text-sm font-medium">ID Type</label>
        <Select label-id="id-type" v-model="selectedIdType" :options="idTypes" />
      </div>

      <div class="grid gap-2">
        <label for="kyc-document" class="text-mute text-sm font-medium">Upload Document</label>
        <small class="text-primary-500">Uploaded file must be 2 MB or less</small>
        <VFileUploader
          input-id="kyc-document"
          :max-file-size="2 * 1024 * 1024"
          :disabled="isFetching || !selectedIdType"
          @upload="handleUpload"
          :loading="isFetching"
        />
      </div>
    </div>
  </Dialog>
</template>
