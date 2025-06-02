<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { adminLinks } from "@/app/data/links";
import { useLocalStorage } from "@vueuse/core";
import { ref } from "vue";
import { APP_NAME } from "../data/constants";
import useStore from "../stores/store";
import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";
import { toTitleCase } from "../utils/helpers";

const route = useRoute();

useHead({
  title() {
    if (!route.name) return APP_NAME;
    const [user, ...parts] = route.name
      .toString()
      .split("-")
      .map((part) => part.trim().toLowerCase());
    if (user === "user") return toTitleCase(parts.join("-"));
    return toTitleCase([user, ...parts].join("-"));
  }
});

const store = useStore();

const isOpen = useLocalStorage("nav-state", false);

const links = ref(adminLinks);
</script>

<template>
  <div class="relative lg:flex">
    <div
      @click.self="isOpen = false"
      id="overlay"
      :class="[
        'h-dvh bg-black/40 backdrop-blur-lg fixed top-0 left-0 z-[100] overflow-hidden transition-all lg:relative lg:flex-shrink-0',
        isOpen ? 'w-dvw lg:w-[16rem]' : 'w-0'
      ]"
    >
      <nav
        class="flex flex-col bg-white dark:bg-slate-950 border-r border-r-slate-200 dark:border-r-slate-800 w-[16rem] h-dvh overflow-y-auto"
      >
        <header>
          <div class="p-4 flex items-center gap-3">
            <Logo size="24" />
            <p class="text-2xl font-semibold">
              <span class="text-primary-500">
                {{ APP_NAME.split(" ")[0] }}
              </span>
              <span>{{ APP_NAME.split(" ")[1] }}</span>
            </p>
          </div>
        </header>

        <div class="flex-grow overflow-y-auto flex flex-col gap-2 px-2 py-4">
          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.route"
            @click="isOpen = false"
            class="lg:hidden flex-shrink-0 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div class="flex items-center gap-3 py-3 px-4 font-medium rounded-lg">
              <span :class="link.icon"></span>
              <p>{{ link.label }}</p>
            </div>
          </RouterLink>

          <RouterLink
            v-for="link in links"
            :key="link.label"
            :to="link.route"
            class="hidden lg:block flex-shrink-0 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div class="flex items-center gap-3 py-3 px-4 font-medium rounded-lg">
              <span :class="link.icon"></span>
              <p>{{ link.label }}</p>
            </div>
          </RouterLink>
        </div>

        <div class="p-2">
          <VLogout>
            <Button label="Log Out" fluid icon="pi pi-sign-out" class="bg-gradient-x" />
          </VLogout>
        </div>
      </nav>
    </div>

    <div class="lg:flex-grow min-w-0 w-dvw lg:w-auto dark:bg-slate-950 h-dvh">
      <div>
        <header class="px-3 py-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Button size="small" @click="isOpen = !isOpen" outlined icon="pi pi-bars" />
            <h1 class="text-xl md:text-2xl font-medium">
              Hi,
              <span class="text-primary-500 dark:text-primary-400">
                {{ store.user.name.split(" ")[0] }}
              </span>
            </h1>
          </div>

          <div class="flex items-center gap-1">
            <div class="text-right text-xs hidden md:block">
              <p class="font-semibold">{{ store.user.name }}</p>
              <p class="text-slate-500 dark:text-slate-300">{{ store.user.email }}</p>
            </div>
            <VAvatar :image="store.user.image" />

            <div class="ml-1">
              <VDarkModeToggler />
            </div>
          </div>
        </header>
        <Divider class="my-0 border-white opacity-50" />
      </div>

      <div class="bg-slate-100 dark:bg-slate-950 h-[calc(100dvh-4rem)]">
        <div class="w-full h-full px-3 py-2 overflow-y-auto">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
a.router-link-exact-active {
  background-color: var(--color-primary-500);
  color: #fff;

  &:hover {
    background-color: var(--color-primary-600);
  }
}
</style>
