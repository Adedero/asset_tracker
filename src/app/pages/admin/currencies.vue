<script setup lang="ts">
import { CurrenciesGetApiResponse } from '@/modules/user/currencies/currencies-get.api';
import { $fetch } from '@/app/composables/use-fetch';
import type { Currency } from '@/prisma-gen';
import useSWRV from 'swrv';
import { useRouter } from 'vue-router';

const {
  isLoading,
  error,
  data,
  mutate
} = useSWRV<CurrenciesGetApiResponse>("/api/admins/me/currencies", $fetch);


const onCurrencyCreate = async (c: Currency) => {
  if (!data.value?.currencies) return;

  await mutate(() => Promise.resolve({
    success: true,
    message: "Currency deleted",
    currencies: [c, ...data.value!.currencies]
  }));
}

const onCurrencyUpdate = async (c: Currency) => {
  if (!data.value?.currencies) return;
  const updatedCurrencies = data.value.currencies.map((curr) => {
    if (curr.id === c.id) return c;
    return curr;
  });
  await mutate(() => Promise.resolve({
    success: true,
    message: "Currency updated",
    currencies: updatedCurrencies
  }));
}

const onCurrencyDelete = async (id: string) => {
  if (!data.value?.currencies) return;
  const updatedCurrencies = data.value.currencies.filter((c) => c.id !== id);

  await mutate(() => Promise.resolve({
    success: true,
    message: "Currency deleted",
    currencies: updatedCurrencies
  }));
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #right>
          <div class="flex items-center gap-3">
            <p class="text-primary-500 font-semibold">{{ data?.currencies.length }}</p>
            <CurrencyManager @done="onCurrencyCreate" button-label="New" button-icon="pi pi-plus" />
          </div>
        </template>
      </VNavbar>

      <div class="mt-2 md:h-[calc(100dvh-8.5rem)]">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate" />

        <div v-else-if="data?.currencies" class="h-full w-full overflow-y-auto rounded-lg">
          <DataTable :value="data.currencies" size="small" paginator :rows="10" tableStyle="min-width: 50rem">
            <Column>
              <template #body="{ data }">
                <div class="w-8 aspect-square rounded-full overflow-hidden">
                  <img :src="data.image" class="w-full h-full object-cover" />
                </div>
              </template>
            </Column>

            <Column field="name" header="Name"></Column>

            <Column field="walletAddress" header="Wallet Address"></Column>

            <Column header="Exchange Rate">
              <template #body="{ data }">
                ${{ data.rate }}
              </template>
            </Column>

            <Column header="Actions">
              <template #body="{ data }">
                <div class="flex gap-4">
                  <CurrencyManager :currency="data" @done="onCurrencyUpdate" rounded />
                  <CurrencyDeleter :id="data.id" @delete="onCurrencyDelete" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
