<script setup lang="ts">
import { APP_NAME } from "@/app/data/constants";
import { values, leaders } from "@/app/data/info";
import { useHead } from "@unhead/vue";

useHead({
  title: `About Us - ${APP_NAME}`
});
</script>

<template>
  <VueLayout name="main">
    <main>
      <header class="bg-slate-200 dark:bg-slate-800 px-4 py-6 flex-col-center gap-4 text-center">
        <p class="text-primary-500 dark:text-white text-3xl md:text-4xl lg:text-5xl font-semibold">
          About Us
        </p>
        <VShapes />
      </header>

      <div class="px-4 md:px-12 lg:px-28 xl:px-32">
        <section class="py-10">
          <h2 class="text-xl md:text-2xl lg:text-3xl font-semibold dark:text-primary-400">
            Putting our clients first.
          </h2>
          <p class="text-lg text-mute mt-1">
            For long, we've been empowering clients by helping them take control of their financial
            lives.
          </p>
          <p class="mt-4">
            {{ APP_NAME }} is one of the world&apos;s largest online brokers. We offer CFDs and
            other derivatives on forex, stocks & indices, cryptocurrencies, commodities, and derived
            to millions of registered users across the globe. <br /><br />
            From inception, our goal was to break free of the high commissions and clunky products
            offered by traditional brokers. Also, we aim to deliver a first-class experience to
            digitally inclined traders, regardless of the size of their accounts.
            <br /><br />
            In our journey, we have grown to over 2.5 million customers worldwide. But our mission
            has remained the same.
          </p>
        </section>

        <section class="pt-5 pb-10">
          <div class="grid gap-4 md:grid-cols-3">
            <div
              v-for="value in values"
              :key="value.title"
              class="rounded-lg bg-white shadow dark:bg-slate-800 dark:shadow-none px-4 py-5"
            >
              <h2 class="font-semibold text-lg">{{ value.title }}</h2>
              <p class="mt-2 text-mute text-sm lg:text-base">{{ value.desc }}</p>
            </div>
          </div>
        </section>

        <section class="py-10">
          <header>
            <h2 class="text-xl md:text-2xl lg:text-3xl font-semibold dark:text-primary-400">
              Our Leaders.
            </h2>
            <p class="mt-2 text-mute">
              We are a group of passionate, independent thinkers who never stop exploring new ways
              to improve trading for the self-directed investor.
            </p>
          </header>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div v-for="leader in leaders" :key="leader.name" class="flex-col-center">
              <div class="rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                <img
                  :src="leader.image"
                  :alt="leader.name"
                  width="200"
                  height="200"
                  class="rounded-full"
                />
              </div>
              <div class="mt-3 grid gap-3 text-center">
                <h2 class="text-lg font-semibold">{{ leader.name }}</h2>
                <p class="px-4 py-2 text-xs font-semibold text-white bg-gradient-x rounded-full">
                  {{ leader.position }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="flex-center py-12">
          <MainCtaBanner :message="'We\'re always ready for a challenge.\nJoin us now!'" />
        </section>
      </div>
    </main>
  </VueLayout>
</template>
