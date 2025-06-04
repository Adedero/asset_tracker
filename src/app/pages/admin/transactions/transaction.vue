<script setup lang="ts">
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import type { TransactionType, TransactionStatus, Transaction } from "@/prisma-gen";
import { useDateFormat } from "@vueuse/core";
import { useRouter } from "vue-router";
import { toTitleCase } from "@/app/utils/helpers";
import type { TransactionGetApiResponse } from "@/modules/admin/transactions/transactions-get.api";
import { Icon } from "@iconify/vue";

const router = useRouter();

const { transaction_id } = router.currentRoute.value.params;

const { isLoading, data, error, mutate } = useSWRV<TransactionGetApiResponse>(
  () => `/api/admins/me/transactions/${transaction_id}`,
  $fetch
);

const onTransactionUpdate = async (updatedTransaction: Transaction) => {
  if (!data.value) return;

  await mutate(() =>
    Promise.resolve({
      success: true,
      message: "Transaction updated successfully",
      transaction: {
        ...data.value!.transaction,
        ...updatedTransaction
      }
    })
  );
};

function getTypeData(type: TransactionType) {
  if (type === "DEPOSIT") return { icon: "arrow-circle-down", color: "text-primary-500" };
  if (type === "WITHDRAWAL") return { icon: "arrow-circle-up", color: "text-red-500" };
  if (type === "INVESTMENT") return { icon: "spa", color: "text-green-500" };
  return { icon: "payments", color: "text-green-500" };
}

function getSeverity(status: TransactionStatus) {
  if (status === "SUCCESSFUL") return "success";
  if (status === "PENDING") return "warn";
  return "danger";
}
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VCard class="p-2">
        <div class="text-lg font-semibold text-primary-500">
          <span>Transaction </span>
          <span class="text-sm">ID: {{ data?.transaction.id }}</span>
        </div>
      </VCard>

      <div class="mt-2">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data">
          <div class="md:h-[calc(100dvh-8.5rem)] grid md:grid-cols-3 gap-2">
            <div class="md:h-full md:overflow-y-auto md:col-span-2">
              <div class="grid gap-2 md:grid-cols-3">
                <VCard header="Amount">
                  <div class="text-xl font-semibold">
                    <span>
                      ${{ data.transaction.amountInUSD.toLocaleString().split(".")[0] }}.</span
                    >
                    <span class="text-sm">
                      {{ data.transaction.amountInUSD.toLocaleString().split(".")[1] ?? "00" }}
                    </span>
                  </div>
                </VCard>

                <VCard header="Type">
                  <div
                    :class="[
                      'flex items-center gap-1 font-semibold text-lg',
                      getTypeData(data.transaction.transactionType).color
                    ]"
                  >
                    <Icon
                      size="20"
                      :icon="`ic:baseline-${getTypeData(data.transaction.transactionType).icon}`"
                    />
                    <p>{{ toTitleCase(data.transaction.transactionType) }}</p>
                  </div>
                </VCard>

                <VCard header="Status">
                  <Tag
                    class="font-semibold"
                    :severity="getSeverity(data.transaction.transactionStatus)"
                    :value="toTitleCase(data.transaction.transactionStatus)"
                  />
                </VCard>
              </div>

              <div class="mt-2">
                <VCard v-if="data.transaction.isWireTransfer">
                  <template #header>
                    <Tag value="Wire Transfer" severity="info" icon="pi pi-bolt" />
                  </template>

                  <div v-if="data.transaction.transactionStatus === 'PENDING'" class="mt-2">
                    <p class="text-sm text-mute">
                      This is a <span class="font-medium">Wire Transfer</span> deposit request. You
                      need to send the details of the transfer to the user's email.
                    </p>

                    <RouterLink
                      :to="{
                        name: 'admin-email-service',
                        query: {
                          to_name: data.transaction.user.name,
                          to_address: data.transaction.user.email
                        }
                      }"
                    >
                      <Button size="small" label="Send mail" icon="pi pi-envelope" />
                    </RouterLink>
                  </div>

                  <div v-else class="mt-2">
                    This is a <span class="font-medium">Wire Transfer</span> deposit request. The
                    transfer details have been sent to the client's email
                  </div>
                </VCard>

                <VCard v-if="data.transaction.isGiftCard">
                  <template #header>
                    <Tag value="Gift Card Deposit" severity="info" icon="pi pi-credit-card" />
                  </template>

                  <div v-if="data.transaction.transactionStatus === 'PENDING'" class="mt-2">
                    <p class="text-sm text-mute">
                      This is a <span class="font-medium">Gift Card</span> deposit request. You need
                      to validate the gift cards and credit the user's account.
                    </p>
                    <RouterLink
                      :to="{
                        name: 'admin-gift-card-validate',
                        params: { transaction_id: data.transaction.id }
                      }"
                    >
                      <Button label="Validate Gift Cards" size="small" />
                    </RouterLink>
                  </div>

                  <div v-else class="mt-2">
                    <p>Gift cards have been validated.</p>
                    <RouterLink
                      :to="{
                        name: 'admin-gift-card-validation-report',
                        params: { transaction_id: data.transaction.id }
                      }"
                    >
                      <Button label="View Gift Card Validation Report" size="small" />
                    </RouterLink>
                  </div>
                </VCard>
              </div>

              <!-- <div v-if="data.transaction.isWireTransfer" class="mt-2">
                <VCard>
                  <template #header>
                    <Tag value="Wire Transfer" severity="info" icon="pi pi-bolt" />
                  </template>
                  <div v-if="data.transaction.transactionStatus !== 'PENDING'" class="mt-2">
                    <p class="text-sm text-mute">
                      This is a <span class="font-medium">Wire Transfer</span> deposit request.
                      {{
                        data.transaction.wireTransferEmail
                          ? "The transfer details have been sent to the client's email"
                          : ''
                      }}
                    </p>
                  </div>

                  <div v-else class="mt-2">
                    <p v-if="data.transaction.wireTransferEmail" class="text-sm text-mute">
                      The wire transfer details have been sent to the client's email.
                    </p>
                    <p v-else class="text-sm text-mute">
                      This is a <span class="font-medium">Wire Transfer</span> deposit request. You
                      need to send the details of the transfer to the user's email.
                    </p>
                  </div>

                  <div v-if="data.transaction && data.transaction.user" class="flex justify-end mt-1">
                    <WireTransferDetailMailer :transaction="data.transaction" :user="data.transaction.user"
                      @done="(val: string) => data.transaction && (data.transaction.wireTransferEmail = val)" />
                  </div>
                </VCard>
              </div> -->

              <div class="mt-2">
                <VCard header="Details">
                  <div class="grid gap-2">
                    <!-- Specific for investment or profit tansactions -->
                    <div
                      v-if="
                        data.transaction.transactionType === 'INVESTMENT' ||
                        data.transaction.transactionType === 'PROFIT'
                      "
                      class="contents"
                    >
                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-dollar text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Amount</p>
                        </div>
                        <p class="text-right font-semibold">
                          ${{ data.transaction.amountInUSD.toLocaleString() }}
                        </p>
                      </div>

                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-info-circle text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Investment ID</p>
                        </div>
                        <p class="text-right font-semibold">
                          {{ data.transaction.investmentId }}
                        </p>
                      </div>
                    </div>

                    <!-- DEPOSIT TRANSACTIONS -->
                    <div v-if="data.transaction.transactionType === 'DEPOSIT'" class="contents">
                      <!-- Amount to deposit -->
                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-dollar text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Deposit Amount</p>
                        </div>
                        <p class="text-right font-semibold">
                          ${{ data.transaction.amountInUSD.toLocaleString() }}
                        </p>
                      </div>

                      <div v-if="!data.transaction.isWireTransfer" class="contents">
                        <!-- Selected withdrawal currency -->
                        <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                          <div class="flex items-center">
                            <span
                              class="pi pi-bitcoin text-mute p-1 rounded-full"
                              style="font-size: 12px"
                            />
                            <p class="text-mute text-sm font-semibold">Selected Currency</p>
                          </div>
                          <p class="text-right font-semibold">
                            {{ data.transaction.currency }}
                          </p>
                        </div>

                        <!-- Rate -->
                        <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                          <div class="flex items-center">
                            <span
                              class="pi pi-arrow-right-arrow-left text-mute p-1 rounded-full"
                              style="font-size: 12px"
                            />
                            <p class="text-mute text-sm font-semibold">Exchange Rate</p>
                          </div>
                          <p class="text-xs text-mute">
                            {{ `1 ${data.transaction.currency} in USD` }}
                          </p>
                          <p class="text-right font-semibold">${{ data.transaction.rate }}</p>
                        </div>

                        <!-- Amount in cryptocurrency -->
                        <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                          <div class="flex items-center">
                            <span
                              class="pi pi-money-bill text-mute p-1 rounded-full"
                              style="font-size: 12px"
                            />
                            <p class="text-mute text-sm font-semibold">
                              Amount in selected currency
                            </p>
                          </div>
                          <p class="text-xs text-mute">
                            {{ data.transaction.currency }}
                          </p>
                          <p class="text-right font-semibold">
                            {{ data.transaction.amountInCurrency }}
                          </p>
                        </div>

                        <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                          <div class="flex items-center">
                            <span
                              class="pi pi-wallet text-mute p-1 rounded-full"
                              style="font-size: 12px"
                            />
                            <p class="text-mute text-sm font-semibold">Your Wallet Address</p>
                          </div>
                          <p class="text-xs text-mute">
                            Wallet address provided by you for
                            {{ data.transaction.currency ?? "crypto" }} deposits.
                          </p>
                          <p class="text-right font-semibold break-all">
                            {{ data.transaction.depositWalletAddress ?? "No address provided" }}
                          </p>
                        </div>

                        <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                          <div class="flex items-center">
                            <span
                              class="pi pi-sitemap text-mute p-1 rounded-full"
                              style="font-size: 12px"
                            />
                            <p class="text-mute text-sm font-semibold">Wallet Address Network</p>
                          </div>
                          <p class="text-right font-semibold">
                            {{
                              data.transaction.depositWalletAddressNetwork ??
                              "No wallet address network provided"
                            }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- WITHDRAWAL TRANSACTIONS -->
                    <div v-if="data.transaction.transactionType === 'WITHDRAWAL'" class="contents">
                      <!-- Amount Requested -->
                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-dollar text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Amount Requested</p>
                        </div>
                        <p class="text-right font-semibold">
                          ${{ data.transaction.amountInUSD.toLocaleString() }}
                        </p>
                      </div>

                      <!-- Witrhdrawal charge -->
                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-dollar text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Withdrawal Charge</p>
                        </div>
                        <p class="text-right font-semibold">
                          ${{ data.transaction.charge.toLocaleString() }}
                        </p>
                      </div>

                      <!-- Actual Amount -->
                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-dollar text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Actual Amount</p>
                        </div>
                        <p class="text-right font-semibold">
                          ${{ data.transaction.actualAmountInUSD.toLocaleString() }}
                        </p>
                      </div>

                      <!-- Selected withdrawal currency -->
                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-bitcoin text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Selected Currency</p>
                        </div>
                        <p class="text-right font-semibold">
                          {{ data.transaction.currency }}
                        </p>
                      </div>

                      <!-- Rate -->
                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-arrow-right-arrow-left text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Exchange Rate</p>
                        </div>
                        <p class="text-xs text-mute">
                          {{ `1 ${data.transaction.currency} in USD` }}
                        </p>
                        <p class="text-right font-semibold">${{ data.transaction.rate }}</p>
                      </div>

                      <!-- Amount in cryptocurrency -->
                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-money-bill text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Amount in selected currency</p>
                        </div>
                        <p class="text-xs text-mute">
                          {{ data.transaction.currency }}
                        </p>
                        <p class="text-right font-semibold">
                          {{ data.transaction.amountInCurrency }}
                        </p>
                      </div>

                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-wallet text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Client's Wallet Address</p>
                        </div>
                        <p class="text-xs text-mute">
                          Wallet address provided by client for withdrawal.
                        </p>
                        <p class="text-right font-semibold">
                          {{ data.transaction.withdrawalWalletAddress ?? "No address provided" }}
                        </p>
                      </div>

                      <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                        <div class="flex items-center">
                          <span
                            class="pi pi-sitemap text-mute p-1 rounded-full"
                            style="font-size: 12px"
                          />
                          <p class="text-mute text-sm font-semibold">Wallet Address Network</p>
                        </div>
                        <p class="text-right font-semibold">
                          {{
                            data.transaction.withdrawalWalletAddressNetwork ??
                            "No wallet address network provided"
                          }}
                        </p>
                      </div>
                    </div>

                    <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                      <div class="flex items-center">
                        <span
                          class="pi pi-calendar text-mute p-1 rounded-full"
                          style="font-size: 12px"
                        />
                        <p class="text-mute text-sm font-semibold">Created Date</p>
                      </div>
                      <p class="text-right font-semibold">
                        {{
                          useDateFormat(
                            new Date(data.transaction.createdAt),
                            "ddd, DD MMM, YYYY hh:mm aa"
                          )
                        }}
                      </p>
                    </div>

                    <div
                      v-if="
                        data.transaction.transactionType === 'DEPOSIT' ||
                        data.transaction.transactionType === 'WITHDRAWAL'
                      "
                      class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800"
                    >
                      <div class="flex items-center">
                        <span
                          class="pi pi-calendar-clock text-mute p-1 rounded-full"
                          style="font-size: 12px"
                        />
                        <p class="text-mute text-sm font-semibold">Approval Date</p>
                      </div>
                      <p class="text-right font-semibold">
                        <span v-if="data.transaction.approvedAt">
                          {{
                            useDateFormat(
                              new Date(data.transaction.approvedAt),
                              "ddd, DD MMM, YYYY hh:mm aa"
                            )
                          }}
                        </span>
                        <span v-else>Not approved</span>
                      </p>
                    </div>

                    <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                      <div class="flex items-center">
                        <span
                          class="pi pi-info-circle text-mute p-1 rounded-full"
                          style="font-size: 12px"
                        />
                        <p class="text-mute text-sm font-semibold">Description</p>
                      </div>
                      <p class="text-right font-semibold">
                        {{ data.transaction.description || "No description provided" }}
                      </p>
                    </div>

                    <div
                      v-if="data.transaction.transactionStatus === 'FAILED'"
                      class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800"
                    >
                      <div class="flex items-center">
                        <span
                          class="pi pi-question-circle text-mute p-1 rounded-full"
                          style="font-size: 12px"
                        />
                        <p class="text-mute text-sm font-semibold">Reason for Failure</p>
                      </div>
                      <p class="text-right font-semibold">
                        {{ data.transaction.failReason || "No reason provided" }}
                      </p>
                    </div>
                  </div>
                </VCard>
              </div>
            </div>

            <div class="md:h-full md:overflow-y-auto">
              <VCard v-if="data.transaction.user" header="User" class="w-full">
                <div class="flex flex-col items-center justify-center gap-2 text-center">
                  <div
                    class="w-32 aspect-square rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800"
                  >
                    <img
                      v-if="data.transaction.user.image"
                      :src="data.transaction.user.image"
                      class="w-full h-full object-cover"
                    />
                    <Icon
                      icon="ic:baseline-account-circle"
                      class="font-size: 8rem text-primary-500"
                    />
                  </div>

                  <div>
                    <p class="font-semibold md:text-lg">{{ data.transaction.user.name }}</p>
                    <p class="text-sm text-mute">{{ data.transaction.user.email }}</p>
                  </div>

                  <Button
                    @click="
                      router.push({
                        name: 'admin-user-item',
                        params: { user_id: data.transaction.user.id }
                      })
                    "
                    label="Profile"
                    icon="pi pi-user"
                    outlined
                  />
                </div>
              </VCard>

              <VCard header="Actions" class="w-full mt-2 grid gap-2">
                <div
                  v-if="
                    data.transaction.transactionType === 'INVESTMENT' ||
                    data.transaction.transactionType === 'PROFIT'
                  "
                  class="v-card w-full !p-2 border dark:border-white/30 dark:bg-slate-800"
                >
                  <div class="flex items-center">
                    <span
                      class="pi pi-info-circle text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Investment ID</p>
                  </div>
                  <p class="text-sm break-all">{{ data.transaction.investmentId }}</p>
                  <Button
                    @click="
                      router.push({
                        name: 'admin-investment-item',
                        params: { investment_id: data.transaction.investmentId }
                      })
                    "
                    label="View Investment"
                    icon="pi pi-chevron-right"
                    icon-pos="right"
                    size="small"
                    class="mt-2"
                    fluid
                    outlined
                  />
                </div>

                <div v-else-if="data.transaction.transactionStatus === 'PENDING'" class="contents">
                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-check-circle text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Approve Transaction</p>
                    </div>
                    <div class="my-1">
                      <Message
                        v-if="data.transaction.transactionType === 'WITHDRAWAL'"
                        size="small"
                      >
                        <p class="text-xs">
                          Make sure you have transfered the required amount into the client's wallet
                          address before approving this transaction.
                        </p>
                      </Message>

                      <Message v-if="data.transaction.transactionType === 'DEPOSIT'" size="small">
                        <p class="text-xs">
                          Make sure the client has completed the transfer before approving this
                          transaction.
                        </p>
                      </Message>
                    </div>
                    <TransactionStatusManager
                      @update="onTransactionUpdate"
                      :transaction="data.transaction"
                      action="approve"
                      class="mt-2"
                    />
                  </div>

                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-times-circle text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Fail Transaction</p>
                    </div>
                    <div class="my-1">
                      <Message
                        v-if="data.transaction.transactionType === 'WITHDRAWAL'"
                        size="small"
                        severity="error"
                      >
                        <p class="text-xs">
                          The withdrawal amount will be refunded to the client's in-app wallet
                        </p>
                      </Message>
                    </div>
                    <TransactionStatusManager
                      @update="onTransactionUpdate"
                      :transaction="data.transaction"
                      action="fail"
                      class="mt-2"
                    />
                  </div>
                </div>

                <div v-else class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-times-circle text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">No Actions</p>
                  </div>
                  <p class="mt-2 text-sm text-primary-500 font-medium">
                    There are no actions to perform on this transaction.
                  </p>
                </div>
              </VCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
