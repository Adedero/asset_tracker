<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import { dollar } from "@/app/utils/helpers";
import { computed, reactive, ref, useTemplateRef } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { Investment } from "@/prisma-gen";
import useStore from "@/app/stores/store";
import investment_success from "@/app/assets/img/investment-success.jpg";
import { InvestmentCreateApiResponse } from "@/modules/user/investments/investments-create.api";

interface Props {
  investmentName: string;
  investmentTier: PrismaJson.InvestmentTier;
  walletBalance: number;
}

const store = useStore();
const confirm = useConfirm();
const op = useTemplateRef("op");
const visible = ref(false);

const { investmentName, investmentTier, walletBalance } = defineProps<Props>();

const data = reactive({
  amount: 0,
  autocompounded: false
});

const averageDailyReturnRate = computed(() => {
  if (!investmentTier) return "0";
  const { duration, expectedReturnRate } = investmentTier;
  const totalReturnRate = expectedReturnRate / 100;
  const dailyReturnRate = totalReturnRate / duration;
  if (data.autocompounded) {
    return `${(((1 + dailyReturnRate) ** duration - 1) * 100).toFixed(1)}%`;
  }
  return `${expectedReturnRate}%`;
});

//Creating a new investment
const investment = ref<Partial<Investment>>({});

const {
  isFetching,
  error,
  data: response,
  execute
} = useFetch("/api/users/me/investments", { immediate: false })
  .post(investment)
  .json<InvestmentCreateApiResponse>();

async function createInvestment() {
  const autocompoundedReturnRate = Number(averageDailyReturnRate.value.split("%")[0]);

  const expectedTotalReturns = Number(
    (
      data.amount *
      (1 +
        (data.autocompounded ? autocompoundedReturnRate : investmentTier.expectedReturnRate) / 100)
    ).toFixed(2)
  );

  investment.value = {
    userId: store.user.id,
    autocompounded: data.autocompounded,
    investmentStatus: "OPEN",
    initialDeposit: data.amount,
    expectedReturnRate: investmentTier.expectedReturnRate,
    autocompoundedReturnRate: data.autocompounded ? autocompoundedReturnRate : undefined,
    expectedTotalReturns,
    currentTotalReturns: 0,
    currentCompoundedAmount: data.autocompounded ? data.amount : undefined,
    investmentName: investmentName,
    investmentTier: investmentTier.name,
    minimumDeposit: investmentTier.minimumDeposit,
    duration: investmentTier.duration,
    terminationFee: investmentTier.terminationFee,
    daysCompleted: 0
  };

  await execute();

  if (!response.value?.success) {
    return;
  }
  investment.value = response.value.investment;
  visible.value = true;
}

const disabled = computed(() => {
  return (
    isFetching.value ||
    !data.amount ||
    !walletBalance ||
    !investmentTier ||
    walletBalance < investmentTier.minimumDeposit
  );
});

const onFormSubmit = async () => {
  confirm.require({
    message: "Proceed with this investment?",
    header: "Confirmation",
    icon: "pi pi-exclamation-circle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true
    },
    acceptProps: {
      label: "Proceed"
    },
    accept: () => {
      createInvestment();
    }
  });
};
</script>

<template>
  <div>
    <Dialog
      v-model:visible="visible"
      modal
      header="Done!"
      :closable="false"
      class="dark:bg-slate-900"
      :style="{ width: '22rem' }"
    >
      <div v-if="response" class="w-full flex flex-col gap-3">
        <div class="rounded-xl overflow-hidden h-60">
          <img :src="investment_success" class="w-full h-full object-contain" />
        </div>
        <p class="text-center">
          Congratulations! <br />
          You can now expect daily returns on your new investment.
        </p>
        <Button
          @click="
            $router.push({
              name: 'user-investment-item',
              params: { investment_id: investment.id }
            })
          "
          fluid
          label="Continue"
        />
      </div>
    </Dialog>

    <VErrorMessage :error />

    <form @submit.prevent="onFormSubmit" class="grid gap-2">
      <div class="grid gap-2">
        <label class="text-sm text-mute font-semibold">Enter amount</label>
        <InputGroup class="w-full *:dark:bg-slate-800">
          <InputGroupAddon>$</InputGroupAddon>
          <InputNumber
            v-model="data.amount"
            :min="investmentTier.minimumDeposit"
            :max="walletBalance"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            placeholder="00.00"
            class="w-full *:dark:bg-slate-800"
          />
        </InputGroup>

        <small
          >Minimum deposit
          <span class="font-semibold">{{ dollar.format(investmentTier.minimumDeposit) }}</span>
        </small>
        <Message v-if="walletBalance < investmentTier.minimumDeposit" severity="error" size="small">
          You do not have enough funds to complete this investment.
        </Message>
      </div>

      <div class="mt-2 grid gap-1">
        <label class="text-mute text-sm font-semibold">Expected Return Rate</label>
        <InputGroup v-if="investmentTier" class="w-full *:dark:bg-slate-800">
          <InputGroupAddon>
            <span class="pi pi-percentage" />
          </InputGroupAddon>
          <InputText :value="averageDailyReturnRate" readOnly class="w-full *:dark:bg-slate-800" />
        </InputGroup>
      </div>

      <div class="flex items-center justify-between gap-1">
        <div class="flex items-center">
          <label class="text-mute text-sm font-semibold">Autocompound Investment</label>
          <Button
            @click="
              (event) => {
                op?.toggle(event);
              }
            "
            size="small"
            text
            icon="pi pi-question-circle"
            rounded
          />
          <Popover ref="op" class="max-w-60">
            <div class="text-sm">
              <p class="text-mute font-medium">Autocompounded Investments</p>
              <div class="mt-2 text-xs">
                <p>
                  Autocompounded investments promise higher returns but profits are not withdrawable
                  until the end of the investment term or when the investment is terminated.
                </p>
                <RouterLink
                  :to="{ name: 'user-faq-item', params: { faq_item_slug: 'auto-compounding' } }"
                  target="_blank"
                >
                  <Button
                    size="small"
                    class="mt-2 text-sm"
                    icon="pi pi-external-link"
                    icon-pos="right"
                    label="See More"
                    fluid
                  />
                </RouterLink>
              </div>
            </div>
          </Popover>
        </div>

        <ToggleSwitch v-model="data.autocompounded" />
      </div>

      <Divider />
      <!-- @vue-ignore -->
      <Button
        :loading="isFetching"
        type="submit"
        fluid
        label="Proceed"
        icon="pi pi-check-circle"
        :disabled="disabled"
      />
    </form>
  </div>
</template>
