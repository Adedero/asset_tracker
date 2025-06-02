<script setup lang="ts">
import { APP_NAME, SUPPORT_EMAIL } from "@/app/data/constants";
import { useHead } from "@unhead/vue";

useHead({
  title: `Contact Us - ${APP_NAME}`
});
</script>

<template>
  <VueLayout name="main">
    <main>
      <header class="bg-slate-200 dark:bg-slate-800 px-4 py-6 flex-col-center gap-4 text-center">
        <p class="text-primary-500 dark:text-white text-3xl md:text-4xl lg:text-5xl font-semibold">
          Contact Us
        </p>
        <VShapes />
      </header>

      <div class="px-4 md:px-28 xl:px-32">
        <section id="contact-us" class="py-10">
          <p class="text-lg md:text-3xl lg:text-4xl font-semibold">Contact Us</p>
          <p class="mt-2">You can reach out to us at anytime via our personalized support email.</p>
          <div class="mt-5">
            <p>{{ APP_NAME }} Support Team</p>
            <p>
              Email:
              <a
                :href="`mailto:${SUPPORT_EMAIL}`"
                class="text-primary-500 hover:underline font-semibold"
              >
                {{ SUPPORT_EMAIL }}
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  </VueLayout>
</template>
