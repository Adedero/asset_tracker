<script setup lang="ts">
import { AccountGroupPageApiResponse } from "@/modules/admin/account-groups/account-group-page.api";
import { useFetch } from "@/app/composables/use-fetch";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { CurrenciesGetApiResponse } from "#src/modules/user/currencies/currencies-get.api";
import { SelectChangeEvent, useToast } from "primevue";

const router = useRouter();
const toast = useToast();
const visible = ref<boolean>(false);

const account_group_id = router.currentRoute.value.params.account_group_id
  ? router.currentRoute.value.params.account_group_id
  : undefined;

const { isFetching, data, error, execute } = useFetch(
  () => `/api/admins/me/pages/account-groups/${account_group_id}`,
  { immediate: false }
)
  .get()
  .json<AccountGroupPageApiResponse>();

const {
  isFetching: loadingCurrencies,
  data: currenciesData,
  error: currenciesError,
  execute: getCurrencies
} = useFetch("/api/admins/me/currencies", { immediate: false })
  .get()
  .json<CurrenciesGetApiResponse>();

const accountGroup = ref<Partial<AccountGroupPageApiResponse["accountGroup"]>>({});
const currentAccountGroupCurrency = ref<
  AccountGroupPageApiResponse["accountGroup"]["currencies"][number] | null
>(null);

const currencies = computed({
  get() {
    return (data.value?.currencies || currenciesData.value?.currencies || []).filter((currency) => {
      return !accountGroup.value?.currencies?.find((c) => c.id === currency.id);
    });
  },

  set(value) {
    return value;
  }
});

const onCurrencySelect = (event: SelectChangeEvent) => {
  const selected = event.value as AccountGroupPageApiResponse["currencies"][number] | null;
  if (selected && currentAccountGroupCurrency.value) {
    currentAccountGroupCurrency.value.id = selected.id;
    currentAccountGroupCurrency.value.name = selected.name;
  }
  visible.value = false;
  currentAccountGroupCurrency.value = null;
};

function setCurrentCurrency(
  currency: AccountGroupPageApiResponse["accountGroup"]["currencies"][number]
) {
  currentAccountGroupCurrency.value = currency;
  visible.value = true;
}

function addCurrency() {
  accountGroup.value.currencies = [
    ...(accountGroup.value.currencies || []),
    {
      id: "",
      name: "",
      walletAddress: "",
      walletAddressNetwork: ""
    }
  ];
}

function removeCurrency(id: string) {
  accountGroup.value.currencies = accountGroup.value.currencies?.filter(
    (currency) => currency.id !== id
  );
}

//Creating or saving
const disabled = computed(() => {
  return (
    !accountGroup.value.name ||
    !accountGroup.value.currencies?.length ||
    accountGroup.value.currencies?.some((currency) => !currency.id || !currency.walletAddress)
  );
});

const {
  isFetching: isSaving,
  data: saveData,
  error: saveError,
  execute: saveAccountGroup
} = useFetch(
  () =>
    account_group_id
      ? `/api/admins/me/account-groups/${account_group_id}`
      : `/api/admins/me/account-groups`,
  { immediate: false }
)
  [account_group_id ? "put" : "post"](accountGroup)
  .json();

const save = async () => {
  const { valid, message } = validate();
  if (!valid) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: message
    });
    return;
  }

  await saveAccountGroup();
  if (saveError.value || !saveData.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: saveError.value?.message || "Failed to complete action. Try again later"
    });
    return;
  }
  toast.add({
    severity: "success",
    summary: "Success",
    detail: account_group_id
      ? "Account group updated successfully"
      : "Account group created successfully",
    life: 2000
  });
  setTimeout(() => {
    router.push({ name: "admin-account-groups" });
  }, 2000);
};

function validate() {
  if (!accountGroup.value.name) {
    return { valid: false, message: "Group name is required" };
  }

  if (!accountGroup.value.currencies?.length) {
    return { valid: false, message: "At least one currency is required" };
  }

  if (
    accountGroup.value.currencies?.some((currency) => {
      return !currency.id || !currency.walletAddress;
    })
  ) {
    return { valid: false, message: "All currencies must have a name and wallet address" };
  }

  return { valid: true, message: "Validation successful" };
}

onMounted(async () => {
  if (!account_group_id) {
    await getCurrencies();
    if (currenciesError.value || !currenciesData.value) return;
    currencies.value = currenciesData.value.currencies;
    return;
  }
  await execute();
  if (error.value || !data.value) return;
  accountGroup.value = {
    ...data.value.accountGroup,
    currencies: data.value.accountGroup.currencies.map((currency) => {
      return {
        ...currency,
        name: data.value!.currencies.find((c) => c.id === currency.id)?.name
      };
    })
  };
  currencies.value = [...data.value.currencies];
});
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar>
        <template #right>
          <Button
            @click="save"
            size="small"
            :label="account_group_id ? 'Save' : 'Create'"
            :icon="account_group_id ? 'pi pi-check' : 'pi pi-plus'"
            :loading="isSaving"
            :disabled="isSaving || disabled"
          />
        </template>
      </VNavbar>

      <div class="mt-2 md:h-[calc(100dvh-9rem)]">
        <VPageLoader v-if="isFetching" />
        <VErrorMessage v-else-if="error" :error should-retry @retry="execute()" />

        <div v-else-if="(account_group_id && data) || accountGroup" class="h-full w-full">
          <div class="h-full grid gap-2 items-start md:grid-cols-7 lg:grid-cols-5">
            <div class="max-h-full pb-5 overflow-y-auto grid gap-2 md:col-span-3 lg:col-span-2">
              <VCard header="Account Group">
                <div class="grid gap-2">
                  <div class="grid gap-1">
                    <span class="text-sm font-medium text-slate-500">
                      Group Name <span class="text-xs font-medium text-red-500">(required)</span>
                    </span>
                    <InputText v-model="accountGroup.name" fluid />
                  </div>

                  <div class="grid gap-1">
                    <span class="text-sm font-medium text-slate-500">
                      Group Description
                      <span class="text-xs font-medium text-primary-500">(optional)</span>
                    </span>
                    <Textarea v-model="accountGroup.description" rows="5" auto-resize fluid />
                  </div>
                </div>
              </VCard>
            </div>

            <div class="h-full pb-5 md:overflow-y-auto md:col-span-4 lg:col-span-3">
              <div class="mt-2 grid gap-2">
                <VCard
                  v-for="currency in accountGroup.currencies"
                  :header="currency.name"
                  class="border"
                >
                  <template #header>
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <p class="text-mute font-semibold">
                        {{ currency.name }}
                      </p>

                      <Button
                        @click="removeCurrency(currency.id)"
                        text
                        size="small"
                        icon="pi pi-trash"
                        severity="danger"
                      />
                    </div>
                  </template>
                  <div class="grid gap-2">
                    <div>
                      <span class="text-sm font-medium text-slate-500">
                        Currency <span class="text-xs font-medium text-red-500">(required)</span>
                      </span>
                      <InputText
                        @click="setCurrentCurrency(currency)"
                        v-model="currency.name"
                        fluid
                        readonly
                      />
                    </div>

                    <div>
                      <span class="text-sm font-medium text-slate-500">
                        Wallet Address
                        <span class="text-xs font-medium text-red-500">(required)</span>
                      </span>
                      <InputText v-model="currency.walletAddress" fluid />
                    </div>

                    <div>
                      <span class="text-sm font-medium text-slate-500">
                        Wallet Address Network<span class="text-xs font-medium text-primary-500"
                          >(optional)</span
                        >
                      </span>
                      <InputText v-model="currency.walletAddressNetwork" fluid />
                    </div>
                  </div>
                </VCard>

                <button @click="addCurrency" type="button" class="cursor-pointer">
                  <div
                    class="border-2 border-slate-300 rounded-lg border-dashed bg-slate-200 hover:bg-slate-50 transition-colors grid gap-1 place-content-center p-2 h-40"
                  >
                    <span class="pi pi-plus-circle text-slate-500" style="font-size: 3rem" />
                    <p class="text-center font-semibold text-slate-500">Add Currency</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <Dialog v-model:visible="visible" class="min-w-80 max-w-80" header="Select Currency">
          <div class="mt-2">
            <div v-if="loadingCurrencies" class="w-full grid place-content-center gap-2">
              <ProgressSpinner
                style="width: 50px; height: 50px"
                strokeWidth="8"
                fill="transparent"
                animationDuration=".5s"
                aria-label="Custom ProgressSpinner"
              />

              <p class="text-mute font-semibold text-sm">Loading currencies...</p>
            </div>

            <VErrorMessage
              v-else-if="currenciesError"
              :error
              should-retry
              @retry="getCurrencies()"
            />

            <div v-else>
              <div class="grid gap-2">
                <span class="text-sm font-medium text-slate-500"> Currencies </span>
                <Select
                  placeholder="Select currency"
                  @change="onCurrencySelect"
                  :options="currencies"
                  option-label="name"
                  checkmark
                  filter
                />
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  </VueLayout>
</template>
