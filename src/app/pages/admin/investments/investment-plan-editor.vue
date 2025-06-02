<script setup lang="ts">
import type { IFile } from '@/app/components/ui/VFileUploader.vue'
import { $fetch, useFetch } from '@/app/composables/use-fetch'
import type { InvestmentPlan } from '@/prisma-gen'
import { removeNullsRecursively, slugify } from '@/app/utils/helpers'
import { useToast, type SelectChangeEvent } from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import tiers from '@/app/data/investment-tier'
import useSWRV from 'swrv'
import { InvestmentPlanGetApiResponse } from '@/modules/admin/investment-plans/investment-plans-get.api'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const investment_plan_id = route.params.investment_plan_id.toString()

const {
  isLoading,
  error,
  data, 
  mutate
} = useSWRV<InvestmentPlanGetApiResponse>(
  () => investment_plan_id ? `/api/admins/me/investment-plans/${investment_plan_id}` : null, 
  $fetch
);

const plan = ref<Partial<InvestmentPlan>>({})

watch(
  () => plan.value.name,
  (value) => {
    plan.value.slug = slugify(value)
  }
)

onMounted(async () => {
  if (data.value) {
    plan.value = data.value.investmentPlan;
    initialImage.value = plan.value.image || ''
    sortPlans()
    return
  }
})

function sortPlans() {
  plan.value.tiers = plan.value.tiers?.sort((a, b) => a.minimumDeposit - b.minimumDeposit)
}

const initialImage = ref<string>('')
const options = ref([...tiers])


const disabled = computed(() => {
  const { name, slug, image, tiers } = plan.value
  return (
    !name ||
    !slug ||
    !image ||
    !tiers?.length ||
    tiers.some(
      ({ name, minimumDeposit, expectedReturnRate, duration, terminationFee }) =>
        !name ||
        !minimumDeposit ||
        !expectedReturnRate ||
        !duration ||
        terminationFee === undefined ||
        terminationFee === null,
    )
  )
});


//Editing and saving plans
const duplicateError = ref(false)
const duplicateTierName = ref<string>('')
const handleChange = (value: string, index: number) => {
  if (plan.value?.tiers?.some((t, i) => t.name === value && i !== index)) {
    duplicateError.value = true
    duplicateTierName.value = value
  } else {
    duplicateError.value = false
    duplicateTierName.value = ''
  }
}

const {
  isFetching,
  error: errorFetching,
  data: fetchData,
  execute
} = useFetch(
  () => investment_plan_id ? 
    `/api/admins/me/investment-plans/${investment_plan_id}` : 
    "/api/admins/me/investment-plans",
  { immediate: false }
)[investment_plan_id ? "put" : "post"](plan).json()

const savePlan = async () => {
  if (duplicateError.value) {
    toast.add({
      severity: 'warn',
      summary: 'Duplicate name found',
      detail: `A ${duplicateTierName.value} tier already exists.`,
      life: 5000,
    })
    return
  }
  plan.value = removeNullsRecursively<InvestmentPlan>(plan.value)
  sortPlans()

  await execute()

  if (errorFetching.value || !fetchData.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorFetching.value.message,
    })
    return
  }

  if (!investment_plan_id) {
    await router.push({ name: 'admin-investment-plans' })
    return
  }
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Investment plan updated successfully',
    life: 3000,
  });

  await mutate(() => Promise.resolve({
    success: true,
    message: "Investment plan updated",
    investmentPlan: fetchData.value.investmentPlan
  }));
}

const cancel = () => {
  if (!plan.value || !data.value?.investmentPlan) return
  plan.value = structuredClone(data.value?.investmentPlan)
}

const addTier = () => {
  plan.value = {
    ...plan.value,
    tiers: [
      {
        name: `Tier ${(plan.value?.tiers?.length ?? 0) + 1}`,
        minimumDeposit: 0,
        duration: 0,
        expectedReturnRate: 0,
        terminationFee: 0,
      },
      ...(plan.value?.tiers ?? []),
    ],
  }
}

const removeTier = (tier: NonNullable<InvestmentPlan['tiers']>[number]) => {
  if (!plan.value || !plan.value.tiers) return
  plan.value = {
    ...plan.value,
    tiers: plan.value.tiers.filter((t) => t !== tier),
  }
}

</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #left>
          <p class="font-semibold text-primary-500 text-lg">
            {{ plan.name ?? 'New Investment Plan' }}
          </p>
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <Button @click="addTier" label="Add Tier" icon="pi pi-plus" outlined size="small" />
            <Button @click="savePlan" label="Save" icon="pi pi-save" size="small" :loading="saving"
              :disabled="saving || disabled" />
            <Button label="Cancel" icon="pi pi-times" severity="secondary" size="small" @click="cancel" />
          </div>
        </template>
      </VNavbar>

      <div class="mt-2 md:h-[calc(100dvh-9rem)]">
        <PageLoader v-if="loading" />

        <ErrorMessage v-else-if="error" :error request="GET" @retry="getInvestmentPlan" closable />

        <div v-else-if="plan" class="h-full w-full">
          <div class="grid md:grid-cols-3 gap-4 h-full">
            <div class="md:col-span-1">
              <div class="grid gap-2">
                <div class="bg-slate-200 dark:bg-slate-700 rounded-md h-60 overflow-hidden">
                  <img :src="plan.image" class="w-full h-full object-cover" />
                </div>

                <VFileUploader size="small" accept="image/*" :max-file-size="1 * 1024 * 1024"
                  @select="(files: IFile[]) => (plan.image = files[0].dataUrl ?? '')" @upload="savePlan"
                  @cancel="plan.image = initialImage ?? ''" class="w-full" :loading="saving"
                  :disabled="saving || disabled" />
              </div>

              <div class="mt-2">
                <div class="grid gap-4">
                  <div class="grid">
                    <label class="text-mute text-sm font-semibold">
                      Name
                      <span class="text-red-500">*</span>
                    </label>
                    <InputText v-model.trim="plan.name" fluid />
                  </div>

                  <div class="grid">
                    <label class="text-mute text-sm font-semibold">
                      Slug
                      <span class="text-red-500">*</span>
                    </label>
                    <InputText v-model.trim="plan.slug" fluid />
                  </div>
                </div>
              </div>
            </div>

            <div class="md:col-span-2 h-full overflow-y-auto">
              <div v-if="plan.tiers" class="grid gap-4">
                <VCard v-for="(tier, index) in plan.tiers" :key="tier.name" :header="tier.name">
                  <template #header>
                    <div class="flex items-center justify-between gap-3">
                      <p class="text-mute font-semibold">{{ tier.name }}</p>
                      <Button @click="removeTier(tier)" icon="pi pi-trash" text severity="danger" rounded
                        size="small" />
                    </div>
                  </template>

                  <div class="mt-2 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-6">
                    <div class="grid relative">
                      <label class="text-mute text-sm font-semibold">
                        Name
                        <span class="text-red-500">*</span>
                      </label>
                      <Select :options v-model="tier.name"
                        @change="(event: SelectChangeEvent) => handleChange(event.value, index)" fluid />
                      <small v-if="plan?.tiers?.some((t, i) => t.name === tier.name && i !== index)"
                        class="text-red-500 absolute -bottom-5">
                        Duplicate name found
                      </small>
                    </div>

                    <div class="grid">
                      <label class="text-mute text-sm font-semibold">
                        Minimum Deposit
                        <span class="text-red-500">*</span>
                      </label>
                      <InputNumber v-model="tier.minimumDeposit" prefix="$" :max-fraction-digits="2" fluid />
                    </div>

                    <div class="grid">
                      <label class="text-mute text-sm font-semibold">
                        Duration (days)
                        <span class="text-red-500">*</span>
                      </label>
                      <InputNumber v-model="tier.duration" fluid />
                    </div>

                    <div class="grid">
                      <label class="text-mute text-sm font-semibold">
                        Expected Return Rate
                        <span class="text-red-500">*</span>
                      </label>
                      <InputNumber v-model="tier.expectedReturnRate" suffix="%" :max-fraction-digits="2" fluid />
                    </div>

                    <div class="grid">
                      <label class="text-mute text-sm font-semibold">
                        Termination Fee
                        <span class="text-red-500">*</span>
                      </label>
                      <InputNumber v-model="tier.terminationFee" prefix="$" :max-fraction-digits="2" fluid />
                    </div>
                  </div>
                </VCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>