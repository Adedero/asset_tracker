<script setup lang="ts">
import { AccountGetApiResponse } from '@/modules/admin/users/accounts-get.api'
import { $fetch, useFetch } from '@/app/composables/use-fetch'
import { toTitleCase } from '@/app/utils/helpers'
import { useDateFormat } from '@vueuse/core'
import { useConfirm, useToast } from 'primevue'
import useSWRV from 'swrv'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AccountUpdateApiResponse } from '@/modules/admin/users/accounts-put.api'
import { Account } from '@/prisma-gen'
import { Icon } from '@iconify/vue'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

const account_id = router.currentRoute.value.params.account_id?.toString()

const { 
  isLoading,
  error,
  data,
  mutate
} = useSWRV<AccountGetApiResponse>(() => `/api/admins/me/accounts/${account_id}`, $fetch)

const account = ref<Partial<Account>>({})

const {
  isFetching: isUpdating,
  error: updatingError,
  data: updateData,
  execute: updateAccount
} = useFetch(`/api/admins/me/accounts/${account_id}`).put(account).json<AccountUpdateApiResponse>()

async function updateKycStatus() {
  if (!data.value?.account) return;
  if (data.value.account.kycStatus === 'UNVERIFIED') return;
  
  const isVerifying = data.value.account.kycStatus === 'PENDING';

  account.value = {
    kycIdType: isVerifying ? account.value.kycIdType : null,
    kycDocument: isVerifying ? account.value.kycDocument : null,
    kycDocumentExt: isVerifying ? account.value.kycDocumentExt : null,
    kycStatus: isVerifying ? 'VERIFIED' : 'UNVERIFIED',
    kycSubmittedAt: isVerifying ? account.value.kycSubmittedAt : null,
    kycVerifiedAt: isVerifying ? new Date() : null,
  }

  await updateAccount();

  if (updatingError.value || !updateData.value?.account) {
    toast.add({
      severity: 'error',
      summary: 'Failed',
      detail: updatingError.value.message,
    })
    return
  } 

  toast.add({ 
    severity: 'success', 
    summary: 'Done', 
    detail: 'KYC Status updated', 
    life: 3000 
  });

  await mutate(() => Promise.resolve({
    success: true,
    message: 'KYC Status updated',
    account: {
      ...data.value!.account,
      ...updateData.value!.account,
    }
  }))
}

const confirmUpdate = () => {
  confirm.require({
    header: 'Update KYC Status',
    message: 'Are you sure you want to proceed?',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      icon: 'pi pi-times',
    },
    acceptProps: {
      label: 'Proceed',
      icon: 'pi pi-check',
    },
    accept: () => {
      updateKycStatus()
    },
  })
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VCard class="py-2 px-4">
        <div class="text-lg text-primary-500 font-semibold">KYC Verification Status</div>
      </VCard>
      <div class="mt-2">
        <VPageLoader v-if="isLoading" />
        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data" class="md:h-[calc(100dvh-8.5rem)] grid md:grid-cols-3 gap-2">
          <div class="md:col-span-2 md:h-full md:overflow-y-auto">
            <VCard header="KYC Details">
              <template #header>
                <div class="flex items-center gap-5 justify-between">
                  <p class="font-semibold text-mute">KYC Details</p>

                  <Button v-if="data.account.kycStatus !== 'UNVERIFIED'"
                    :label="data.account.kycStatus === 'PENDING' ? 'Verify' : 'Discard'" @click="confirmUpdate"
                    :loading="isUpdating" :icon="data.account.kycStatus === 'PENDING' ? 'pi pi-check-circle' : 'pi pi-times-circle'
                      " />
                </div>
              </template>
              <div class="mt-4 grid gap-2">
                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span class="pi pi-check-circle text-mute p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-mute text-sm font-semibold">KYC Status</p>
                  </div>
                  <p class="text-right font-semibold">
                    {{ toTitleCase(data.account.kycStatus) }}
                  </p>
                </div>

                <div v-if="data.account.kycStatus !== 'UNVERIFIED'" class="contents">
                  <div v-if="data.account.kycIdType" class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span class="pi pi-id-card text-mute p-1 rounded-full" style="font-size: 12px" />
                      <p class="text-mute text-sm font-semibold">ID Type</p>
                    </div>
                    <p class="text-right font-semibold">
                      {{ data.account.kycIdType }}
                    </p>
                  </div>

                  <div v-if="data.account.kycDocument"
                    class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span class="pi pi-file text-mute p-1 rounded-full" style="font-size: 12px" />
                      <p class="text-mute text-sm font-semibold">Submitted Document</p>
                    </div>
                    <div class="flex justify-end">
                      <a :href="data.account.kycDocument"
                        :download="`${data.account.id}.${data.account.kycDocumentExt}`">
                        <Button label="Download" icon="pi pi-download" size="small" outlined />
                      </a>
                    </div>
                  </div>

                  <div v-if="data.account.kycSubmittedAt"
                    class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span class="pi pi-calendar-clock text-mute p-1 rounded-full" style="font-size: 12px" />
                      <p class="text-mute text-sm font-semibold">Submission Date</p>
                    </div>
                    <p class="text-right font-semibold">
                      {{
                      useDateFormat(new Date(data.account.kycSubmittedAt), 'ddd, MMMM DD, YYYY HH:mm aa')
                      }}
                    </p>
                  </div>

                  <div v-if="data.account.kycVerifiedAt"
                    class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span class="pi pi-calendar-clock text-mute p-1 rounded-full" style="font-size: 12px" />
                      <p class="text-mute text-sm font-semibold">Verified Date</p>
                    </div>
                    <p class="text-right font-semibold">
                      {{
                      useDateFormat(new Date(data.account.kycVerifiedAt), 'ddd, MMMM DD, YYYY HH:mm aa')
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </VCard>
          </div>

          <div class="md:h-full md:overflow-y-auto">
            <VCard v-if="data.account.user" header="User">
              <div class="flex flex-col items-center justify-center gap-2 text-center">
                <div class="w-32 aspect-square rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img v-if="data.account.user.image" :src="data.account.user.image"
                    class="w-full h-full object-cover" />
                  <Icon icon="ic:baseline-account-circle" style="font-size: 8rem" class="text-primary-500" />
                </div>

                <div>
                  <p class="font-semibold md:text-lg">{{ data.account.user.name }}</p>
                  <p class="text-sm text-mute">{{ data.account.user.email }}</p>
                </div>

                <Button @click="router.push({ name: 'admin-user-item', params: { user_id: data.account.user.id } })"
                  label="Profile" icon="pi pi-user" outlined />
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
