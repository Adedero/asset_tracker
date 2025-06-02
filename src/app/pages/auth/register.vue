<script setup lang="ts">
import { ref, reactive } from "vue";
import { APP_NAME } from "@/app/data/constants";
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import RegisterSchema from "@/shared/schemas/register.schema";
import { useHead } from "@unhead/vue";
import { FormSubmitEvent } from "@primevue/forms";
import useAuth from "@/app/composables/use-auth";

useHead({
  title: `Register - ${APP_NAME}`
});

const resolver = ref(zodResolver(RegisterSchema));

const credentials = reactive({ name: "", email: "", password: "", passwordConfirm: "" });

const { isLoading, error, execute: register } = useAuth().register();

const onFormSubmit = ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isLoading.value) return;

  register(0, values as z.infer<typeof RegisterSchema>);
};
</script>

<template>
  <VueLayout name="auth">
    <div class="w-full md:w-[26rem] h-full md:p-10 md:bg-white dark:bg-transparent">
      <Logo />

      <header class="mt-8">
        <h1 class="text-3xl md:text-4xl font-semibold">Sign Up</h1>
        <p class="mt-2 text-sm text-mute">
          Already got an account?
          <RouterLink
            :to="{ name: 'login' }"
            class="text-primary-400 font-semibold hover:underline"
          >
            Log in </RouterLink
          >.
        </p>
      </header>

      <VErrorMessage :error class="mt-3" />

      <div class="mt-5 w-full">
        <!-- Register Form -->
        <Form
          v-slot="$form"
          :initialValues="credentials"
          :resolver
          :validateOnValueUpdate="true"
          :validateOnBlur="true"
          @submit="onFormSubmit"
          class="flex flex-col gap-4 w-full"
        >
          <div class="flex flex-col gap-1">
            <label for="name" class="text-mute text-sm">Full Name</label>
            <InputText id="name" name="name" fluid />
            <small v-if="$form.name?.invalid" class="font-medium text-red-500">
              {{ $form.name?.error?.message }}
            </small>
          </div>

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

          <div class="flex flex-col gap-1">
            <label for="passwordConfirm" class="text-mute text-sm">Confirm Password</label>
            <Password
              input-id="passwordConfirm"
              name="passwordConfirm"
              fluid
              toggle-mask
              :feedback="false"
            />
            <small v-if="$form.passwordConfirm?.invalid" class="font-medium text-red-500">
              {{ $form.passwordConfirm?.error?.message }}
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

          <div>
            <p class="text-sm text-mute">
              By signing up, you agree to our
              <RouterLink
                :to="{ name: 'terms-of-use' }"
                class="text-primary-400 font-semibold hover:underline"
              >
                terms of use
              </RouterLink>
              and
              <RouterLink
                :to="{ name: 'privacy-policy' }"
                class="text-primary-400 font-semibold hover:underline"
              >
                privacy policy.
              </RouterLink>
            </p>
          </div>

          <Button :loading="isLoading" type="submit" label="Submit" icon="pi pi-user-plus" />
        </Form>
      </div>
    </div>
  </VueLayout>
</template>
