<template>
  <div>
    <Toast class="md:hidden left-1/2 translate-x-[-50%] w-full max-w-96" />
    <Toast class="hidden md:block max-w-96" />
    <ConfirmDialog class="max-w-96" />
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <Suspense>
          <template #default>
            <component :is="Component"></component>
          </template>
          <!-- main content -->

          <!-- loading state -->
          <template #fallback>
            <VPageLoader />
          </template>
        </Suspense>
      </template>
    </RouterView>
  </div>
</template>
<script setup></script>
