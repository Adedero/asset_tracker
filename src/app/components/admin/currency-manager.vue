<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import type { Currency } from "@/prisma-gen";
import { computed, ref } from "vue";
import VFileUploader, { type IFile } from "../ui/VFileUploader.vue";
import { useToast } from "primevue/usetoast";
import { CurrencyCreateApiResponse } from "@/modules/admin/currencies/currencies-post.api";
import { MAX_CURRENCY_IMG_SIZE } from "@/app/data/constants";

const {
  currency,
  buttonLabel,
  buttonIcon = "pi pi-pencil",
  rounded
} = defineProps<{
  currency?: Currency;
  buttonLabel?: string;
  buttonIcon?: string;
  rounded?: boolean;
}>();

const emit = defineEmits<{
  done: [currency: Currency];
}>();

const visible = ref<boolean>(false);

const toast = useToast();

const updatedCurrency = ref<Partial<Currency>>(
  currency ? JSON.parse(JSON.stringify(currency)) : {}
);

const {
  isFetching: isCreating,
  error: errorCreating,
  data: createData,
  execute: create
} = useFetch("/api/admins/me/currencies", { immediate: false })
  .post(updatedCurrency)
  .json<CurrencyCreateApiResponse>();

const {
  isFetching: isUpdating,
  error: errorUpdating,
  data: updateData,
  execute: update
} = useFetch(() => `/api/admins/me/currencies/${currency?.id}`, { immediate: false })
  .put(updatedCurrency)
  .json<CurrencyCreateApiResponse>();

const manageCurrency = async () => {
  if (currency) {
    if (updatedCurrency.value.rate !== currency.rate) {
      updatedCurrency.value.rateUpdatedAt = new Date();
    }

    updatedCurrency.value = Object.fromEntries(
      Object.entries(updatedCurrency.value).filter(([, v]) => v !== null)
    );

    await update();
    if (errorUpdating.value || !updateData.value) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: errorUpdating.value.message || "Something went wrong"
      });
      return;
    }
    toast.add({
      severity: "success",
      summary: "Done",
      detail: updateData.value.message || "Currency updated successfully",
      life: 3000
    });

    emit("done", updateData.value.currency);
    visible.value = false;
  } else {
    if (!updatedCurrency.value.image) {
      try {
        const res = await fetch("/assets/default-crypto-icon.txt");
        const text = await res.text();
        updatedCurrency.value.image = text;
      } catch (error) {
        console.error(error);
      }
    }
    await create();
    if (errorCreating.value || !createData.value) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: errorCreating.value.message || "Something went wrong"
      });
      return;
    }

    toast.add({
      severity: "success",
      summary: "Done",
      detail: createData.value.message || "Currency created successfully",
      life: 3000
    });

    emit("done", createData.value.currency);
    visible.value = false;
  }
};

const disabled = computed(() => {
  return (
    !updatedCurrency.value.name ||
    !updatedCurrency.value.abbr ||
    !updatedCurrency.value.symbol ||
    //!updatedCurrency.value.image ||
    !updatedCurrency.value.rate ||
    !updatedCurrency.value.walletAddress ||
    (updatedCurrency.value.isAvailableForWithdrawal &&
      (updatedCurrency.value.withdrawalCharge === undefined ||
        updatedCurrency.value.withdrawalCharge === null))
  );
});
</script>

<template>
  <div>
    <div @click="visible = true" class="cursor-pointer">
      <slot>
        <Button size="small" :icon="buttonIcon" :rounded :label="buttonLabel" />
      </slot>
    </div>

    <Dialog
      v-model:visible="visible"
      modal
      :header="currency ? 'Edit Currency' : 'New Currency'"
      class="w-80 md:w-96"
    >
      <div class="grid gap-4">
        <div class="flex flex-col items-center justify-center gap-1">
          <div class="w-20 aspect-square overflow-hidden rounded-full">
            <img :src="updatedCurrency.image || undefined" class="w-full h-full object-cover" />
          </div>
          <VFileUploader
            size="small"
            accept="image/*"
            :max-file-size="MAX_CURRENCY_IMG_SIZE"
            @select="(files: IFile[]) => (updatedCurrency.image = files[0].dataUrl ?? '')"
            @upload="manageCurrency"
            @cancel="updatedCurrency.image = currency?.image ?? ''"
            class="w-full"
            :loading="isCreating || isUpdating"
            :disabled="isCreating || isUpdating || disabled"
          />
        </div>

        <Divider />

        <div class="grid">
          <label class="text-mute text-sm font-medium">
            Name <span class="text-red-500">*</span>
          </label>
          <InputText v-model.trim="updatedCurrency.name" fluid />
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium">
            Abbreviation <span class="text-red-500">*</span>
          </label>
          <InputText v-model.trim="updatedCurrency.abbr" fluid />
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium">
            Symbol <span class="text-red-500">*</span>
          </label>
          <InputText v-model.trim="updatedCurrency.symbol" fluid />
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium">
            Exchange Rate (USD) <span class="text-red-500">*</span>
          </label>
          <small class="text-mute">1 {{ updatedCurrency.abbr }} equals</small>
          <InputNumber v-model="updatedCurrency.rate" prefix="$" :max-fraction-digits="10" fluid />
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium">
            Wallet Address <span class="text-red-500">*</span>
          </label>
          <small class="text-mute">Wallet address for this currency for users to deposit</small>
          <InputText v-model.trim="updatedCurrency.walletAddress" fluid />
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium"> Wallet Address Network </label>
          <InputText v-model.trim="updatedCurrency.walletAddressNetwork" fluid />
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium"> Withdrawable</label>
          <small class="text-mute">
            Choose whether users can withdraw funds with this currency
          </small>
          <ToggleButton
            v-model="updatedCurrency.isAvailableForWithdrawal"
            onLabel="Yes"
            offLabel="No"
          />
        </div>

        <div v-if="updatedCurrency.isAvailableForWithdrawal" class="grid">
          <label class="text-mute text-sm font-medium">
            Withdrawal Charge (USD) <span class="text-red-500">*</span>
          </label>
          <InputNumber
            v-model="updatedCurrency.withdrawalCharge"
            prefix="$"
            :max-fraction-digits="2"
            fluid
          />
        </div>

        <div class="grid mt-3">
          <Button
            @click="manageCurrency"
            :loading="isCreating || isUpdating"
            :disabled="isCreating || isUpdating || disabled"
            label="Submit"
            fluid
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
