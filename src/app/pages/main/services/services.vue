<script setup lang="ts">
import services from "@/app/data/services";
import { APP_NAME } from "@/app/data/constants";
import { useHead } from "@unhead/vue";

useHead({
  title: `Services - ${APP_NAME}`
});
</script>

<template>
  <VueLayout name="main">
    <main>
      <header class="bg-slate-200 dark:bg-slate-800 px-4 py-6 flex-col-center gap-4 text-center">
        <p class="text-primary-500 dark:text-white text-3xl md:text-4xl lg:text-5xl font-semibold">
          Services
        </p>
        <VShapes />
      </header>

      <div class="px-4 md:px-28 xl:px-32">
        <section class="py-10">
          <h2 class="text-xl md:text-2xl lg:text-3xl font-semibold dark:text-primary-400">
            Our services all on a platter
          </h2>
          <p class="text-lg text-mute mt-1">We want what&apos;s best for you.</p>
          <p class="mt-4">
            {{ APP_NAME }} is an exchange with abundance of working strategies and creative like
            minds who with their expertise in their various fields, create room for diversity. With
            our team of experienced traders, swift support systems and standby portfolio managers,
            we have a spreadsheet of various working strategies outlined to serve you best.
          </p>

          <div class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="service in services"
              :key="service.title"
              class="bg-white dark:bg-slate-800 shadow dark:shadow-none rounded-lg p-4 flex flex-col gap-3"
            >
              <div class="relative overflow-hidden rounded-lg w-full md:h-60">
                <img :src="service.image" :alt="service.title" class="h-full w-full object-cover" />
              </div>

              <RouterLink
                :to="{ name: 'service-item', params: { service: service.slug } }"
                class="text-lg font-semibold text-primary-500 dark:text-white hover:underline"
              >
                <p>{{ service.title }}</p>
              </RouterLink>
              <hr class="border-slate-500/20 dark:border-slate-500/50" />
              <p class="text-mute text-sm">{{ service.overview }}</p>
              <RouterLink
                :to="{ name: 'service-item', params: { service: service.slug } }"
                class="text-sm text-primary-400 underline hover:text-primary-300"
              >
                Read more
              </RouterLink>
            </div>
          </div>
        </section>

        <section class="flex-center py-12">
          <MainCtaBanner message="Join us today!" />
        </section>
      </div>
    </main>
  </VueLayout>
</template>
