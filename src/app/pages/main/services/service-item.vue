<script setup lang="ts">
import { useRoute } from "vue-router";
import services from "@/app/data/services";
import { APP_NAME } from "@/app/data/constants";
import { useHead } from "@unhead/vue";
import { useErrorPage } from "@/app/composables/use-error";
import { Icon } from "@iconify/vue";

const route = useRoute();

const service = services.find((service) => service.slug === route.params.service);

if (!service) {
  useErrorPage({ status: 404, message: "Service not found" });
}

useHead({
  title: `${service?.title} - ${APP_NAME}`
});
</script>

<template>
  <VueLayout name="main">
    <main v-if="service">
      <header class="bg-slate-200 dark:bg-slate-800 px-4 py-6 flex-col-center gap-4 text-center">
        <p class="text-primary-500 dark:text-white text-3xl md:text-4xl lg:text-5xl font-semibold">
          {{ service.title }}
        </p>
        <div class="text-center flex-center gap text-sm">
          <RouterLink
            :to="{ name: 'services' }"
            class="font-semibold text-primary-500 dark:text-primary-400 hover:underline"
          >
            Services
          </RouterLink>
          <Icon icon="ic:baseline-chevron-right" style="font-size: 20px" class="text-mute" />
          <p class="cursor-context-menu font-semibold text-mute">{{ service.title }}</p>
        </div>
      </header>

      <div class="px-4 py-10 md:px-40 lg:px-60 xl:px-80">
        <div>
          <div class="w-full">
            <img :src="service.image" :alt="service.title" />
          </div>
          <p class="mt-4 text-lg md:text-center text-mute">{{ service.overview }}</p>

          <div class="mt-6 grid gap-10">
            <section v-for="desc in service.desc" :key="desc.title" :id="desc.title.toLowerCase()">
              <header class="text-lg text-mute font-semibold">{{ desc.title }}</header>
              <p class="mt-1 whitespace-pre-wrap">{{ desc.content }}</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  </VueLayout>
</template>
