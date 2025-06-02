<script setup lang="ts">
import { options, sharesOffers, tradeReasons } from "@/app/data/info";
import { APP_NAME } from "@/app/data/constants";
import { useHead } from "@unhead/vue";
import { Icon } from "@iconify/vue";

useHead({
  title: `Market - ${APP_NAME}`
});
</script>

<template>
  <VueLayout name="main">
    <main>
      <header class="bg-slate-200 dark:bg-slate-800 px-4 py-6 flex-col-center gap-4 text-center">
        <p class="text-primary-500 dark:text-white text-3xl md:text-4xl lg:text-5xl font-semibold">
          Market
        </p>
        <VShapes />
      </header>

      <div class="px-4 md:px-28 xl:px-32">
        <section class="py-10">
          <h2 class="text-xl md:text-2xl lg:text-3xl font-semibold dark:text-primary-400">
            A relationship on your terms.
          </h2>
          <p class="text-lg text-mute mt-1">Work with us the way you want.</p>
          <p class="mt-4">
            Some believe you must choose between an online broker and a wealth management firm. At
            {{ APP_NAME }}, you don&apos;t need to compromise. Whether you invest on your own, with
            an advisor, or a little of both — we can support you.
          </p>

          <div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="option in options"
              :key="option.name"
              :class="`text-white rounded-lg px-4 py-6 grid gap-4 ${option.className}`"
            >
              <div
                class="bg-white/30 dark:bg-white/20 rounded-full flex-center p-2 w-fit aspect-square"
              >
                <Icon
                  :icon="`ic:baseline-${option.icon}`"
                  style="font-size: 24px"
                  class="text-white"
                />
              </div>
              <header class="text-lg font-semibold">{{ option.name }}</header>
              <hr class="border-white/20" />
              <p class="text-white/90 dark:text-slate-400 text-sm">{{ option.desc }}</p>
            </div>
          </div>
        </section>

        <section class="py-10">
          <div class="grid gap-x-4 gap-y-8 lg:grid-cols-3">
            <div class="lg:flex items-start gap-4 lg:col-span-2">
              <div
                class="hidden mb-2 lg:flex items-center bg-green-400 dark:bg-green-500/20 rounded-full p-2 w-fit"
              >
                <Icon icon="ic:baseline-payments" style="font-size: 24px" class="text-white" />
              </div>
              <div>
                <header class="flex items-center gap-2">
                  <div
                    class="lg:hidden mb-2 flex items-center bg-green-400 dark:bg-green-500/20 rounded-full p-2 w-fit"
                  >
                    <Icon icon="ic:baseline-payments" style="font-size: 24px" class="text-white" />
                  </div>
                  <p class="text-xl md:text-2xl font-semibold">Why trade with {{ APP_NAME }}?</p>
                </header>

                <div class="mt-5 grid md:grid-cols-2 gap-4">
                  <div v-for="reason in tradeReasons" :key="reason" class="flex items-center gap-2">
                    <span class="pi pi-check-circle w-[24px] h-[24px] text-green-500/80" />
                    <p class="text-mute">{{ reason }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="shares-offer">
              <header class="text-lg font-semibold">Our Shares Offer</header>
              <div id="table" class="mt-3">
                <header
                  class="grid grid-cols-2 *:flex *:justify-center *:items-center py-4 bg-primary-100 text-primary-500 dark:bg-primary-800 font-semibold text-sm"
                >
                  <p>Name</p>
                  <p>Initial Deposit</p>
                </header>

                <div>
                  <div
                    v-for="offer in sharesOffers"
                    :key="offer.name"
                    class="grid grid-cols-2 py-2 *:flex *:items-center *:justify-center *:text-center *:text-mute even:bg-slate-200 even:dark:bg-slate-900"
                  >
                    <p>{{ offer.name }}</p>
                    <p>{{ offer.value }}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="flex-center py-12">
          <MainCtaBanner
            message="Open and account and get up to $600 plus 60 days of commission-free stocks"
          />
        </section>
      </div>
    </main>
  </VueLayout>
</template>
