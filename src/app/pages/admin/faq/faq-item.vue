<script setup lang="ts">
import { useFetch } from '@/app/composables/use-fetch'
import type { Faq } from '@/prisma-gen'
import { slugify } from '@/app/utils/helpers'
import { useToast } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FaqGetApiResponse } from '@/modules/admin/faqs/faqs-get.api'

const router = useRouter()
const toast = useToast()

const faq_id = router.currentRoute.value.params.faq_id ? 
  router.currentRoute.value.params.faq_id.toString() :
  undefined

const {
  isFetching,
  error,
  data,
  execute: getFaqItem
} = useFetch(
  () => `/api/admins/me/faqs/${faq_id}`, { immediate: false }
).get().json<FaqGetApiResponse>()

const faq = ref<Partial<Faq>>({})

onMounted(async () => {
  if (!faq_id) return;
  await getFaqItem();
  if (error.value || !data.value) return;
  faq.value = data.value.faq;
});

watch(
  () => faq.value.title,
  (value) => {
    faq.value.slug = slugify(value)
  },
);

const disabled = computed(() => {
  const { title, slug, description } = faq.value
  return !title || !slug || !description
});

const {
  isFetching: isUpdating,
  error: updateError,
  data: updateData,
  execute: updateFaq
} = useFetch(
  () => faq_id ? `/api/admins/me/faqs/${faq_id}` : '/api/admins/me/faqs',
  { immediate: false }
)[faq_id ? 'put' : 'post'](faq).json();

const save = async () => {
  await updateFaq();

  if (updateError.value || !updateData.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: updateError.value.message,
      life: 6000,
    })
    return
  }

  if (!faq_id) {
    router.push({ name: 'admin-faq' })
    return
  }
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: updateData.value.message || 'FAQ item updated successfully',
    life: 3000,
  });
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VCard class="py-2">
        <div class="flex items-center gap-2 justify-between">
          <p class="font-semibold text-primary-500 text-lg">
            {{ faq.title ?? 'New FAQ' }}
          </p>

          <Button 
            @click="save" 
            label="Save" 
            icon="pi pi-save" 
            size="small" 
            :loading="isUpdating"
            :disabled="isUpdating || disabled" 
          />
        </div>
      </VCard>

      <div class="mt-2 md:h-[calc(100dvh-9rem)]">
        <VPageLoader v-if="isFetching" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="getFaqItem()" />

        <div v-else-if="(faq_id && data?.faq) || (!faq_id && faq)" class="h-full w-full overflow-y-auto">
          <div class="grid md:grid-cols-2 gap-4">
            <div class="grid">
              <label class="text-mute text-sm font-semibold">
                Title
                <span class="text-red-500">*</span>
              </label>
              <InputText v-model="faq.title" fluid />
            </div>

            <div class="grid">
              <label class="text-mute text-sm font-semibold">
                Slug
                <span class="text-red-500">*</span>
              </label>
              <InputText v-model="faq.slug" fluid />
            </div>

            <div class="md:col-span-2">
              <label class="text-mute text-sm font-semibold">
                Description
                <span class="text-red-500">*</span>
              </label>
              <Textarea v-model="faq.description" fluid rows="14" auto-resize />
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>