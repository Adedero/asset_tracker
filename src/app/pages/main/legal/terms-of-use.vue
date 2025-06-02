<script setup lang="ts">
import { tou } from "@/app/data/legal";
import { APP_NAME, SUPPORT_EMAIL } from "@/app/data/constants";
import { useHead } from "@unhead/vue";

useHead({
  title: `Terms of Use - ${APP_NAME}`
});
</script>

<template>
  <VueLayout name="main">
    <main>
      <header class="bg-slate-200 dark:bg-slate-800 px-4 py-6 flex-col-center gap-4 text-center">
        <p class="text-primary-500 dark:text-white text-3xl md:text-4xl lg:text-5xl font-semibold">
          Legal
        </p>
        <VShapes />
      </header>

      <div class="px-4 md:px-28 xl:px-32">
        <section id="terms-of-use" class="py-10">
          <div>
            <header class="grid gap-2">
              <p class="text-lg md:text-3xl lg:text-4xl font-semibold">Terms of Use</p>
              <Message class="mt-2">
                <div class="flex items-start gap-2">
                  <span class="pi pi-info-circle text-xl translate-y-1" />
                  <p>
                    These Terms of Use govern your access to and use of {{ APP_NAME }}'s services.
                    By accessing or using our platform, you agree to comply with these terms and all
                    applicable laws. Please read these terms carefully before using our services.
                  </p>
                </div>
              </Message>
            </header>

            <div class="mt-6 grid gap-5">
              <div v-for="item in tou" :key="item.title" class="grid gap-1">
                <h4 class="text-mute text-lg font-semibold">{{ item.title }}</h4>
                <p class="whitespace-pre-wrap">
                  {{ item.content }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-us" class="py-10">
          <p class="text-lg md:text-3xl lg:text-4xl font-semibold">Contact Us</p>
          <p class="mt-2">
            If you have any questions or concerns about our Terms of Use, Privacy Policy or our data
            practices, please contact us at:
          </p>
          <div>
            <p>{{ APP_NAME }} Support Team</p>
            <p>
              Email: <span class="font-semibold">{{ SUPPORT_EMAIL }}</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  </VueLayout>
</template>
