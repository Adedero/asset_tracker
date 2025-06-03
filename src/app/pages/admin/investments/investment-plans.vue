<script setup lang="ts">
import { InvestmentPlansGetApiResponse } from "@/modules/admin/investment-plans/investment-plans-get.api";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { useRouter } from "vue-router";

const router = useRouter();

const { isLoading, error, data, mutate } = useSWRV<InvestmentPlansGetApiResponse>(
  "/api/admins/me/investment-plans",
  $fetch
);

const onInvestmentPlanDelete = async (id: string) => {
  if (!data.value) return;
  const { investmentPlans: plans } = data.value;
  await mutate(() =>
    Promise.resolve({
      success: true,
      message: "Investment plan deleted",
      investmentPlans: plans.filter((plan) => plan.id !== id)
    })
  );
};
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #right>
          <div class="flex items-center gap-3">
            <p class="text-primary-500 font-semibold">{{ data?.investmentPlans.length }}</p>
            <RouterLink :to="{ name: 'admin-investment-plan-editor' }">
              <Button label="New" icon="pi pi-plus" size="small" />
            </RouterLink>
          </div>
        </template>
      </VNavbar>

      <div class="mt-2 md:h-[calc(100dvh-9rem)]">
        <VPageLoader v-if="isLoading" />
        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data?.investmentPlans" class="h-full w-full overflow-y-auto">
          <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            <VCard v-for="plan in data?.investmentPlans" :key="plan.id" :header="plan.name">
              <div class="grid">
                <div class="h-36 w-full overflow-hidden rounded-lg">
                  <img :src="plan.image || ''" class="w-full h-full object-cover" />
                </div>

                <div class="mt-2 flex items-center gap-1 justify-center flex-wrap">
                  <p
                    v-for="(tier, index) in plan.tiers"
                    :key="tier.name"
                    class="text-sm flex items-center gap-1"
                  >
                    <span class="font-medium">{{ tier.name }}</span>
                    <span
                      v-if="index < (plan.tiers?.length || 0) - 1"
                      class="w-1 aspect-square bg-black rounded-full"
                    />
                  </p>
                </div>

                <div class="mt-2 grid grid-cols-2 gap-2 w-full">
                  <Button
                    @click="
                      router.push({
                        name: 'admin-investment-plan-editor',
                        params: { investment_plan_id: plan.id }
                      })
                    "
                    label="Edit"
                    icon="pi pi-file-edit"
                    size="small"
                    fluid
                  />
                  <InvestmentPlanDeleter :id="plan.id" @delete="onInvestmentPlanDelete" />
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
