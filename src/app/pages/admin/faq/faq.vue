<script setup lang="ts">
import { ref } from 'vue'
import { $fetch, useFetch } from '@/app/composables/use-fetch'
import useSWRV from 'swrv'
import { FaqsGetApiResponse } from '@/modules/admin/faqs/faqs-get.api'
import { useConfirm, useToast } from 'primevue'
import { Faq } from '@/prisma-gen'
import { FaqDeleteApiResponse } from '@/modules/admin/faqs/faqs-delete.api'

const confirm = useConfirm();
const toast = useToast();

//Getting faqs
const {
  isLoading,
  error,
  data,
  mutate
} = useSWRV<FaqsGetApiResponse>("/api/admins/me/faqs",$fetch)


const selectedFaq = ref<Faq | null>(null);

const {
  isFetching: isDeleting,
  error: deleteError,
  data: deleteData,
  execute: deleteFaq
} = useFetch(
  () => `/api/admins/me/faqs/${selectedFaq.value?.id}`,
  { immediate: false }
).delete().json<FaqDeleteApiResponse>()


async function deleteFaqItem() {
  if (!data.value?.faqs) return;

  if (!selectedFaq.value) {
    toast.add({ severity: "error", summary: "Error", detail: "No FAQ selected" })
    return;
  }
  await deleteFaq();

  if (deleteError.value || !deleteData.value?.faq) {
    toast.add({ severity: "error", summary: "Error", detail: deleteError.value.message })
    return;
  }

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: deleteData.value?.message || 'FAQ item deleted',
    life: 3000,
  });

  await mutate(() => Promise.resolve({
    success: true,
    message: deleteData.value?.message || 'FAQ item deleted',
    faqs: data.value!.faqs.filter((faq) => faq.id !== selectedFaq.value?.id)
  }));

  selectedFaq.value = null;
}

//Deleting faq
const confirmDelete = () => {
  if (!selectedFaq.value) return;

  confirm.require({
    message: 'Are you sure you want to proceed?',
    header: 'Delete FAQ item',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: () => {
      deleteFaqItem()
    },
  })
}

const onDeleteFaq = (faq: Faq) => {
  selectedFaq.value = faq;
  confirmDelete();
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #left>
          <p class="font-semibold text-primary-500 text-lg">FAQs</p>
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <p class="text-primary-500 font-semibold">{{ data?.faqs.length }}</p>
            <Button @click="$router.push({ name: 'admin-faq-item' })" label="New" icon="pi pi-plus" size="small" />
          </div>
        </template>
      </VNavbar>

      <div class="mt-2 md:h-[calc(100dvh-9rem)]">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data" class="h-full w-full overflow-y-auto">
          <div class="grid gap-4">
            <VCard v-for="faq in data.faqs" :key="faq.id" :header="faq.title">
              <div class="line-clamp-2">
                {{ faq.description }}
              </div>

              <div class="mt-2">
                <div class="flex items-center gap-2 justify-end">
                  <Button @click="$router.push({ name: 'admin-faq-item', params: { faq_id: faq.id } })" label="Edit"
                    icon="pi pi-file-edit" severity="secondary" size="small" />

                  <Button @click="onDeleteFaq(faq)" :loading="isDeleting" label="Delete" icon="pi pi-trash" severity="danger"
                    size="small" />
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
