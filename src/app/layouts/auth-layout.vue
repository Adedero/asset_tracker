<template>
  <div>
    <MainHeader />
    <div class="flex-center px-4 py-20">
      <div
        class="w-full md:w-fit md:rounded-xl md:border md:border-slate-200 md:dark:border-slate-500 md:overflow-hidden md:shadow-lg dark:shadow-primary"
      >
        <slot />
      </div>
    </div>
    <MainFooter />
  </div>
</template>
