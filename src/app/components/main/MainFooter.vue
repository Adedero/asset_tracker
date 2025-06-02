<script setup lang="ts">
import { ref } from "vue";
import { APP_NAME, COPYRIGHT_YEAR } from "@/app/data/constants";

const sections = ref([
  {
    header: "Overview",
    links: [
      { label: "Home", name: "home" },
      { label: "Market", name: "market" }
    ]
  },
  {
    header: "Our Company",
    links: [
      { label: "About", name: "about" },
      { label: "Services", name: "services" }
    ]
  },
  {
    header: "Legal",
    links: [
      { label: "Terms of Use", name: "terms-of-use" },
      { label: "Privacy Policy", name: "privacy-policy" }
    ]
  }
]);
</script>

<template>
  <div class="text-[0.78rem] bg-slate-200 dark:bg-primary-800">
    <div class="pt-12 pb-4 px-4 lg:px-12 grid items-start md:grid-cols-4 md:justify-evenly gap-5">
      <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2">
        <img src="@/app/assets/img/logo.png" width="32" />
        <div className="w-[1px] bg-slate-400 h-[28px]"></div>
        <div className="text-[0.75rem] font-semibold leading-tight">
          <p>{{ APP_NAME.split(" ")?.[0]?.toUpperCase() || "ASSET" }}</p>
          <p>{{ APP_NAME.split(" ")?.[1]?.toUpperCase() || "TRACKER" }}</p>
        </div>
      </RouterLink>

      <section v-for="section in sections" :key="section.header">
        <header class="font-semibold uppercase">{{ section.header }}</header>
        <ul v-for="link in section.links" :key="link.label" class="mt-2 grid gap-1">
          <li>
            <RouterLink :to="{ name: link.name }" class="hover:underline">{{
              link.label
            }}</RouterLink>
          </li>
        </ul>
      </section>
    </div>
    <div class="w-full flex item-center justify-center py-4 px-4 mb-4">
      <Message>
        <div class="flex items-center gap-2">
          <span class="pi pi-exclamation-triangle" />
          <p class="text-center">Risk Warning!</p>
        </div>

        <p class="text-sm font-normal">
          The price of securities fluctuate, sometimes dramatically. This price may move up or down,
          and may become valueless. It is very likely that losses will be incurred, rather than
          profit, as a result of buying and selling securities.
        </p>
      </Message>
    </div>
    <Divider />
    <div
      class="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between py-4 px-4 lg:px-12"
    >
      <p>
        Copyright © {{ COPYRIGHT_YEAR }} - {{ new Date().getFullYear() }} {{ APP_NAME }}. All
        rights reserved.
      </p>
      <div class="flex items-center gap-2">
        <RouterLink :to="{ name: 'login' }" class="hover:underline">Login</RouterLink>
        <RouterLink :to="{ name: 'register' }" class="hover:underline">Register</RouterLink>
      </div>
    </div>
  </div>
</template>
