<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import { dollar, toTitleCase } from "@/app/utils/helpers";
import useSWRV from "swrv";
import { useRoute } from "vue-router";
import { useDateFormat } from "@vueuse/core";
import { TransactionStatus } from "@/prisma-gen";
import { toPng } from "html-to-image";
import { TransactionGetApiResponse } from "@/modules/user/transactions/transactions-get.api";
import { useToast } from "primevue/usetoast";
import { APP_NAME } from "@/app/data/constants";

const route = useRoute();
const toast = useToast();

const transaction_id = route.params.transaction_id.toString();

const { isLoading, data, error, mutate } = useSWRV<TransactionGetApiResponse>(
  () => `/api/users/me/transactions/${transaction_id}`,
  $fetch
);

const statusSeverity: Record<TransactionStatus, { value: string; icon: string }> = {
  PENDING: { value: "warn", icon: "pi pi-clock" },
  SUCCESSFUL: { value: "success", icon: "pi pi-check" },
  FAILED: { value: "danger", icon: "pi pi-times" }
};

const el = useTemplateRef("el");
const hideFooter = ref(false);

async function saveTransactionReceipt() {
  if (!el.value) {
    toast.add({ severity: "error", summary: "Error", detail: "Element is undefined" });
    return;
  }
  hideFooter.value = true;
  toast.add({ severity: "info", detail: "Saving", life: 3000 });
  try {
    const dataUrl = await toPng(el.value);
    const link = document.createElement("a");
    link.download = `transaction-${data.value?.transaction?.id}`;
    link.href = dataUrl;
    link.click();
    toast.add({ severity: "success", detail: "Saved", life: 3000 });
  } catch (error) {
    toast.add({ severity: "error", summary: "Error", detail: (error as Error).message });
  } finally {
    hideFooter.value = false;
  }
}
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar>
        <template #right>
          <Button
            @click="$router.back()"
            severity="secondary"
            label="Back"
            size="small"
            icon="pi pi-arrow-left"
          />
        </template>
      </VNavbar>
      <div class="flex items-center justify-center py-4">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error" class="w-full max-w-[28rem]">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div ref="el" v-else-if="data">
          <VCard class="w-full max-w-[28rem] md:!p-6 !rounded-none">
            <div class="flex-col-center gap-2 text-center">
              <Logo />
              <p class="font-medium">
                {{
                  `${data.transaction.currency} ${toTitleCase(data.transaction.transactionType)}`
                }}
              </p>
              <Tag v-if="data.transaction.isWireTransfer" value="Wire Transfer" icon="pi pi-bolt" />
              <Tag v-if="data.transaction.isGiftCard" value="Gift Card" icon="pi pi-credit-card" />
              <p class="text-2xl font-semibold">
                {{ dollar.format(data.transaction.amountInUSD) }}
              </p>
              <Tag
                :value="toTitleCase(data.transaction.transactionStatus)"
                :severity="statusSeverity[data.transaction.transactionStatus].value"
                :icon="statusSeverity[data.transaction.transactionStatus].icon"
              />
            </div>

            <Divider />

            <p class="font-semibold">Transaction Details</p>

            <div class="mt-2 grid gap-2 text-sm">
              <div
                v-if="
                  data.transaction.transactionStatus === 'SUCCESSFUL' && data.transaction.isGiftCard
                "
                class="flex items-center justify-between gap-2"
              >
                <p class="text-mute">Requested Amount (USD)</p>
                <p class="text-right">
                  {{ dollar.format(data.transaction.giftCardData?.totalInUSD ?? 0) }}
                </p>
              </div>

              <div
                v-if="
                  data.transaction.transactionStatus === 'SUCCESSFUL' && data.transaction.isGiftCard
                "
                class="flex items-center justify-between gap-2"
              >
                <p class="text-mute">Actual Amount Deposited (USD)</p>
                <p class="text-right">{{ dollar.format(data.transaction.amountInUSD) }}</p>
              </div>

              <div
                v-if="data.transaction.transactionType === 'WITHDRAWAL'"
                class="flex items-center justify-between gap-2"
              >
                <p class="text-mute">Charge (USD)</p>
                <p class="text-right">{{ dollar.format(data.transaction.charge) }}</p>
              </div>

              <div
                v-if="data.transaction.transactionType === 'WITHDRAWAL'"
                class="flex items-center justify-between gap-2"
              >
                <p class="text-mute">Actual Amount (USD)</p>
                <p class="text-right">{{ dollar.format(data.transaction.actualAmountInUSD) }}</p>
              </div>

              <div class="flex items-center justify-between gap-2">
                <p class="text-mute">Currency</p>
                <p class="text-right">{{ data.transaction.currency }}</p>
              </div>

              <div
                v-if="!data.transaction.isWireTransfer && !data.transaction.isGiftCard"
                class="flex items-center justify-between gap-2"
              >
                <p class="text-mute">Rate</p>
                <p class="text-right">{{ data.transaction.rate }}</p>
              </div>

              <div
                v-if="!data.transaction.isWireTransfer && !data.transaction.isGiftCard"
                class="flex items-center justify-between gap-2"
              >
                <p class="text-mute">Amount ({{ data.transaction.currency }})</p>
                <p class="text-right">{{ data.transaction.amountInCurrency }}</p>
              </div>

              <div v-if="data.transaction.transactionType === 'WITHDRAWAL'" class="contents">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-mute">Credited to</p>
                  <div class="text-right">
                    <p>Wallet Address:</p>
                    <p>{{ data.transaction.withdrawalWalletAddress }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between gap-2">
                  <p class="text-mute">Network</p>
                  <p class="text-right">{{ data.transaction.withdrawalWalletAddressNetwork }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between gap-2">
                <p class="text-mute">Transaction ID</p>
                <p class="text-right">{{ data.transaction.id }}</p>
              </div>

              <div class="flex items-center justify-between gap-2">
                <p class="text-mute">Transaction Date</p>
                <p class="text-right">
                  {{
                    useDateFormat(data.transaction.createdAt, "MMM DD, YYYY hh:mm:ss aa", {
                      locales: "en-us"
                    })
                  }}
                </p>
              </div>

              <div class="flex items-center justify-between gap-2">
                <p class="text-mute">Approval Date</p>
                <p class="text-right">
                  {{
                    data.transaction.approvedAt
                      ? useDateFormat(data.transaction.createdAt, "MMM DD, YYYY hh:mm:ss aa", {
                          locales: "en-us"
                        })
                      : "Not Available"
                  }}
                </p>
              </div>

              <div
                v-if="data.transaction.transactionStatus === 'FAILED'"
                class="flex items-center justify-between gap-3 flex-wrap"
              >
                <p class="text-mute">Failure Reason</p>
                <p class="text-right">
                  {{ data.transaction.failReason }}
                </p>
              </div>
            </div>

            <div v-if="data.transaction.description">
              <Divider />
              <p class="font-semibold">Description</p>
              <p class="whitespace-pre-wrap text-sm">{{ data.transaction.description }}</p>
            </div>

            <div v-if="!hideFooter">
              <Divider />

              <p class="font-semibold">More Actions</p>

              <div
                v-if="
                  data.transaction.transactionStatus === 'SUCCESSFUL' && data.transaction.isGiftCard
                "
                class="mt-2 grid gap-2 text-sm"
              >
                <Message size="small">
                  <p>
                    This deposit was made using one or more gift cards and the actual amount
                    deposited to your account may differ from the requested amount. To see what
                    changed, you can view the validation report
                  </p>
                </Message>
                <Button
                  @click="
                    $router.push({
                      name: 'user-gift-card-validation-report',
                      params: { transaction_id: data.transaction.id }
                    })
                  "
                  label="Gift Card Validation Report"
                  icon="pi pi-file"
                  severity="secondary"
                  fluid
                  size="small"
                />
              </div>

              <div class="mt-2 grid gap-2 text-sm">
                <p>
                  Got any problems?
                  <RouterLink
                    :to="{ name: 'user-contact' }"
                    class="text-primary-500 hover:underline font-semibold"
                  >
                    Contact us</RouterLink
                  >
                </p>

                <Button
                  @click="saveTransactionReceipt"
                  label="Download"
                  icon="pi pi-download"
                  fluid
                />
              </div>
            </div>

            <div v-else>
              <Divider />

              <p class="font-semibold">{{ APP_NAME }}</p>

              <p class="mt-2 grid gap-2 text-xs text-mute">
                Track your investments like a pro with {{ APP_NAME }}! Our platform helps you
                effortlessly manage portfolios, monitor growth, and stay informed with real-time
                updates—all in one intuitive dashboard. Take control of your financial future today!
              </p>
            </div>
          </VCard>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
