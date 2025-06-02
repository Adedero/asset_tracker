<script setup lang="ts">
import { ref } from "vue";
import { mainLinks } from "@/app/data/links";
import { APP_NAME } from "@/app/data/constants";

const links = ref([
  ...mainLinks,
  {
    label: "User",
    items: [
      { label: "Sign in", route: { name: "login" } },
      { label: "Register", route: { name: "register" } }
    ]
  }
]);

const menu = ref();
const toggle = (event: Event) => {
  menu.value?.toggle(event);
};
</script>

<template>
  <header class="sticky top-0 z-50">
    <div
      class="flex items-center justify-between py-2 px-4 lg:px-12 bg-background bg-opacity-10 backdrop-blur-lg"
    >
      <div class="flex items-center gap-4 xl:gap-8">
        <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2">
          <img src="@/app/assets/img/logo.png" width="32" />
          <div className="w-[1px] bg-slate-300 h-[28px]"></div>
          <div className="text-[0.75rem] font-semibold leading-tight">
            <p>{{ APP_NAME.split(" ")?.[0]?.toUpperCase() || "ASSET" }}</p>
            <p>{{ APP_NAME.split(" ")?.[1]?.toUpperCase() || "TRACKER" }}</p>
          </div>
        </RouterLink>

        <nav class="hidden lg:block">
          <Menubar
            :model="links.filter((link) => link.label !== 'User')"
            class="text-[0.95em] border-none bg-transparent z-50"
          >
            <template #item="{ item, props, hasSubmenu }">
              <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                  <span :class="item.icon" />
                  <span>{{ item.label }}</span>
                </a>
              </RouterLink>
              <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                <span :class="item.icon" />
                <span>{{ item.label }}</span>
                <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
              </a>
            </template>
          </Menubar>
        </nav>
      </div>

      <div class="flex items-center gap-2">
        <div class="hidden md:flex items-center gap-2">
          <RouterLink :to="{ name: 'login' }">
            <Button severity="secondary" size="small" label="Sign In" />
          </RouterLink>

          <RouterLink :to="{ name: 'register' }">
            <Button class="bg-gradient-x" size="small" label="Get Started" />
          </RouterLink>
        </div>

        <VDarkModeToggler />

        <div class="lg:hidden">
          <Button
            severity="secondary"
            size="small"
            outlined
            type="button"
            icon="pi pi-ellipsis-v"
            @click="toggle"
            aria-haspopup="true"
            aria-controls="overlay_menu"
          />
          <Menu ref="menu" id="overlay_menu" :model="links" :popup="true">
            <template #item="{ item, props }">
              <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                  <span :class="item.icon" />
                  <span>{{ item.label }}</span>
                </a>
              </RouterLink>
              <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                <span :class="item.icon" />
                <span>{{ item.label }}</span>
              </a>
            </template>
          </Menu>
        </div>
      </div>
    </div>

    <Divider class="my-0" />
  </header>
</template>

<style scoped>
a.router-link-exact-active {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
