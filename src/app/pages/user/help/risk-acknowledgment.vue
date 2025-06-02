<script setup lang="ts">
import { APP_NAME, SUPPORT_EMAIL } from "@/app/data/constants";
import risk from "@/app/assets/img/risk-management.avif";
</script>

<template>
  <VueLayout name="user">
    <VNavbar>
      <template #right>
        <RouterLink :to="{ name: 'user-help-center' }">
          <Button severity="secondary" label="Help Center" size="small" icon="pi pi-arrow-left" />
        </RouterLink>
      </template>
    </VNavbar>

    <div
      class="md:h-[calc(100dvh-8.5rem)] py-2 flex gap-2 *:flex-shrink-0 h-full overflow-y-auto justify-center"
    >
      <div
        class="w-full h-fit max-w-[48rem] dark:text-slate-300 bg-slate-200 dark:bg-slate-800 rounded-xl px-2 py-8 md:px-6 text-justify"
      >
        <Message class="mb-5 flex-center">
          <h2 class="flex-center text-center text-lg md:text-xl font-semibold">
            Risk Acknowledgment
          </h2>
        </Message>

        <div class="flex-center bg-white rounded-lg px-12 mb-6">
          <div class="h-60 w-full rounded-lg">
            <img :src="risk" class="w-full h-full object-contain" />
          </div>
        </div>

        <p>
          At <strong>{{ APP_NAME }}</strong
          >, we prioritize transparency and aim to provide you with the tools and information to
          make informed investment decisions. However, it is important to acknowledge the inherent
          risks involved in investing. By using our platform and services, you accept and understand
          the following:
        </p>
        <ul style="margin-left: 20px" class="mt-5 grid gap-3">
          <li>
            <strong>Market Risks:</strong> All investments, including those facilitated by
            {{ APP_NAME }}, are subject to market fluctuations. Past performance is not indicative
            of future results, and the value of your investments may go up or down.
          </li>
          <li>
            <strong>Investment Decisions:</strong> You are solely responsible for all investment
            decisions made on this platform. {{ APP_NAME }} does not guarantee profitability, and
            losses are possible.
          </li>
          <li>
            <strong>Third-Party Services:</strong> Some features, such as copy trading, algorithmic
            trading, or bot investments, rely on third-party services. {{ APP_NAME }} does not
            control these third-party providers and cannot be held liable for their performance or
            actions.
          </li>
          <li>
            <strong>Cryptocurrency Volatility:</strong> Investments in cryptocurrencies are highly
            volatile and speculative. The value of digital assets can change drastically within a
            short period.
          </li>
          <li>
            <strong>No Financial Advice:</strong> The information and tools provided by
            {{ APP_NAME }} are for informational purposes only. We do not offer financial, legal, or
            tax advice. Always consult a qualified professional before making any investment
            decisions.
          </li>
          <li>
            <strong>Loss of Capital:</strong> There is a risk of losing all or part of your invested
            capital. Only invest funds that you can afford to lose without jeopardizing your
            financial stability or future.
          </li>
          <li>
            <strong>Regulatory Changes:</strong> Investments may be impacted by changes in
            regulations or government policies in your region or globally.
          </li>
        </ul>
        <p class="mt-5">
          By proceeding with any investment through {{ APP_NAME }}, you confirm that you have read,
          understood, and agreed to this risk acknowledgment. Please invest responsibly.
        </p>
        <p class="mt-10 text-center text-sm text-mute">
          For further questions, please contact our support team at
          <a :href="`mailto:${SUPPORT_EMAIL}`" class="text-primary-500">{{ SUPPORT_EMAIL }}</a
          >.
        </p>
      </div>
    </div>
  </VueLayout>
</template>
