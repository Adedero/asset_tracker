<script setup lang="ts">
import { reactive, ref } from "vue";
import { APP_NAME } from "@/app/data/constants";
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import LoginSchema from "@/shared/schemas/login.schema";
import { useHead } from "@unhead/vue";
import useAuth from "@/app/composables/use-auth";
import { FormSubmitEvent } from "@primevue/forms";

useHead({
  title: `Log In - ${APP_NAME}`
});

const resolver = ref(zodResolver(LoginSchema));

const credentials = reactive({ email: "", password: "" });

const { isLoading, error, execute: login } = useAuth().login();

const onFormSubmit = ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isLoading.value) return;

  login(0, values as z.infer<typeof LoginSchema>);
};
</script>

<template>
  <VueLayout name="auth">
    <div class="w-full md:w-[26rem] h-full md:p-10 md:bg-white dark:bg-transparent">
      <Logo />

      <header class="mt-8">
        <h1 class="text-3xl md:text-4xl font-semibold">Log In</h1>
        <p class="mt-2 text-sm text-mute">
          Don&apos;t have an account yet?
          <RouterLink
            :to="{ name: 'register' }"
            class="text-primary-400 font-semibold hover:underline"
          >
            Register</RouterLink
          >.
        </p>
      </header>

      <VErrorMessage :error class="mt-3" />

      <div class="mt-5 w-full">
        <!-- Login Form -->
        <Form
          v-slot="$form"
          :initialValues="credentials"
          :resolver="resolver"
          :validateOnValueUpdate="true"
          :validateOnBlur="true"
          @submit="onFormSubmit"
          class="flex flex-col gap-4 w-full"
        >
          <div class="flex flex-col gap-1">
            <label for="email" class="text-mute text-sm">Email Address</label>
            <InputText id="email" name="email" type="email" fluid />
            <small v-if="$form.email?.invalid" class="font-medium text-red-500">
              {{ $form.email?.error?.message }}
            </small>
          </div>

          <div class="flex flex-col gap-1">
            <label for="password" class="text-mute text-sm">Password</label>
            <Password input-id="password" name="password" fluid toggle-mask :feedback="false" />
            <small v-if="$form.password?.invalid" class="font-medium text-red-500">
              {{ $form.password?.error?.message }}
            </small>
          </div>

          <div class="flex justify-end">
            <RouterLink
              :to="{ name: 'forgot-password' }"
              class="text-sm text-primary-400 font-semibold hover:underline"
            >
              Forgot password?
            </RouterLink>
          </div>

          <Button :loading="isLoading" type="submit" label="Submit" icon="pi pi-sign-in" />
        </Form>
      </div>
    </div>
  </VueLayout>
</template>
