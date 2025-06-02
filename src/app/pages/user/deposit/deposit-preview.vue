<script setup lang="ts">
import useStore from "@/app/stores/store";
import { useRouter } from "vue-router";
import { ref, Ref, onMounted, onUnmounted } from "vue";
import qrcode from "qrcode-generator";
import { useFetch } from "@/app/composables/use-fetch";
import { Transaction } from "@/prisma-gen";
import { dollar } from "@/app/utils/helpers";

const router = useRouter();
const store = useStore();
const visible = ref(false);

const transaction = ref<Partial<Transaction>>({});

const { isFetching, error, data, execute } = useFetch("/api/users/me/transactions/deposit", {
  immediate: false
})
  .post(transaction)
  .json();

const submitDepositRequest = async () => {
  transaction.value = {
    userId: store.user.id,
    transactionType: "DEPOSIT",
    transactionStatus: "PENDING",
    amountInUSD: store.depositInitData!.request.amount,
    charge: 0,
    actualAmountInUSD: store.depositInitData!.request.amount,
    rate: store.depositInitData!.currency?.rate,
    currency: store.depositInitData!.currency?.name,
    amountInCurrency: store.depositInitData!.result,
    isWireTransfer: false,
    depositWalletAddress: store.depositInitData!.depositAccountData?.walletAddress,
    depositWalletAddressNetwork: store.depositInitData!.depositAccountData?.walletAddressNetwork
  };
  await execute();
  if (error.value || !data.value.success) {
    return;
  }
  store.depositInitData = null;
  store.depositRequest = null;
  visible.value = true;
};

function generateQRCode() {
  const typeNumber = 4;
  const errorCorrectionLevel = "L";
  const qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(store.depositInitData!.depositAccountData?.walletAddress || "");
  qr.make();
  const container = document.getElementById("qr-container");
  if (container) {
    container.innerHTML = qr.createImgTag();
  }
}

const loader_1 = ref<boolean>(false);
const loader_2 = ref<boolean>(false);

const copyText = async (text: string, loader: Ref<boolean>) => {
  if (loader.value) return;
  await navigator.clipboard.writeText(text);
  loader.value = true;
  setTimeout(() => {
    loader.value = false;
  }, 3000);
};

const copyWalletAddress = () => {
  copyText(store.depositInitData?.depositAccountData?.walletAddress || "", loader_1);
};
const copyWalletAddressNetwork = () => {
  copyText(store.depositInitData?.depositAccountData?.walletAddressNetwork ?? "", loader_2);
};

onMounted(async () => {
  if (!store.depositInitData) {
    await router.push({ name: "user-deposit-currencies" });
    return;
  }
  generateQRCode();
});
</script>

<template>
  <VueLayout name="user">
    <div>
      <VNavbar />
      <Dialog
        v-model:visible="visible"
        modal
        header="Deposit Request"
        class="max-w-[90dvw] md:w-96 dark:bg-slate-900"
        :closable="false"
      >
        <div class="flex flex-col items-center justify-center text-center">
          <span class="pi pi-check-circle text-emerald-500" style="font-size: 40px" />
          <p class="mt-4">Your deposit request has been received.</p>
          <p>Once confirmed, your account will be credited<!--  within 15 minutes -->.</p>
        </div>

        <div class="mt-4">
          <Button @click="$router.push({ name: 'user-transactions' })" label="Continue" fluid />
        </div>
      </Dialog>

      <div v-if="store.depositInitData" class="flex items-center justify-center py-4">
        <VCard class="w-full max-w-[28rem] md:!p-6">
          <div class="text-center">
            <p class="text-2xl font-semibold">
              {{ dollar.format(store.depositInitData.user.walletBalance) }}
            </p>
            <p>Account Balance</p>
          </div>

          <Divider />

          <div class="flex flex-col items-center justify-center gap-1">
            <img :src="store.depositInitData.currency?.image || ''" width="40" />
            <p class="text-center font-semibold">
              {{ store.depositInitData.currency?.name }} Deposit
            </p>

            <p class="text-2xl font-medium">
              {{ dollar.format(store.depositInitData.request.amount) }}
            </p>

            <Message>
              <p class="font-normal text-center">
                Send exactly
                <span class="font-semibold text-lg">
                  {{ store.depositInitData.currency?.abbr }} {{ store.depositInitData.result }}
                </span>
                to the wallet address below.
              </p>
            </Message>

            <InputGroup class="w-full mt-2">
              <InputText
                :value="store.depositInitData.depositAccountData?.walletAddress"
                fluid
                disabled
                class="dark:bg-slate-800"
              />
              <InputGroupAddon>
                <Button
                  @click="copyWalletAddress"
                  :icon="loader_1 ? 'pi pi-check-circle' : 'pi pi-copy'"
                  severity="secondary"
                  variant="text"
                  class="dark:bg-slate-800"
                />
              </InputGroupAddon>
            </InputGroup>

            <div
              v-if="store.depositInitData.depositAccountData?.walletAddressNetwork"
              class="w-full mt-2 grid gap-1"
            >
              <label for="network">Network</label>
              <InputGroup class="w-full">
                <InputText
                  :value="store.depositInitData.depositAccountData?.walletAddressNetwork"
                  fluid
                  disabled
                  class="dark:bg-slate-800"
                />
                <InputGroupAddon>
                  <Button
                    @click="copyWalletAddressNetwork"
                    :icon="loader_2 ? 'pi pi-check-circle' : 'pi pi-copy'"
                    severity="secondary"
                    variant="text"
                    class="dark:bg-slate-800"
                  />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div
              id="qr-container"
              class="mt-2 w-56 h-56 bg-slate-200 dark:bg-slate-800 *:w-full *:h-full *:object-cover"
            ></div>
            <p class="font-semibold text-mute">Scan to send</p>

            <Message severity="warn" class="mt-2">
              <p class="text-sm font-normal text-center">
                Your account will be credited upon confirmation of your deposit.
                <!-- This will take less than 15 minutes. -->
              </p>
            </Message>

            <div class="mt-3 text-sm">
              <p>
                Need help?
                <RouterLink
                  :to="{ name: 'user-contact' }"
                  class="text-primary-500 hover:underline font-semibold"
                >
                  Contact us
                </RouterLink>
              </p>
            </div>

            <div class="mt-3 w-full grid gap-2">
              <VErrorMessage :error />

              <Button
                @click="submitDepositRequest"
                :loading="isFetching"
                label=" I have made the payment"
                fluid
              />
            </div>
          </div>
        </VCard>
      </div>
    </div>
  </VueLayout>
</template>
