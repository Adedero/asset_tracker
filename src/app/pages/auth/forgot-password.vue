<script setup lang="ts">
import useAuth from "@/app/composables/use-auth";
import { zodResolver } from "@primeuix/forms/resolvers/zod";
import { FormSubmitEvent } from "@primevue/forms";
import { reactive, ref } from "vue";
import { z } from "zod";
import { useHead } from "@unhead/vue";
import { APP_NAME } from "@/app/data/constants";

useHead({
  title: `Forgot Password - ${APP_NAME}`
});

const Schema = z.object({
  email: z.string({ message: "Email is required" }).email({ message: "Invalid email" })
});
const credentials = reactive({ email: "" });
const resolver = ref(zodResolver(Schema));

const { isLoading, error, execute: confirmEmail } = useAuth().confirmEmail();

const onFormSubmit = ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isLoading.value) return;
  confirmEmail(0, values as z.infer<typeof Schema>);
};
</script>

<template>
  <VueLayout name="auth">
    <div class="w-full md:w-[26rem] h-full md:p-10 md:bg-white dark:bg-transparent">
      <Logo size="24" />

      <header class="mt-8">
        <h1 class="text-3xl md:text-4xl font-semibold">Forgot Password</h1>
        <p class="mt-2 text-sm text-mute">
          Go back to
          <RouterLink
            :to="{ name: 'login' }"
            class="text-primary-500 font-semibold hover:underline"
          >
            Log in </RouterLink
          >.
        </p>
      </header>

      <VErrorMessage :error class="mt-3" />

      <Form
        v-slot="$form"
        :initialValues="credentials"
        :resolver="resolver"
        :validateOnValueUpdate="true"
        :validateOnBlur="true"
        @submit="onFormSubmit"
        class="mt-1 flex flex-col gap-6 w-full"
      >
        <div class="flex flex-col gap-1">
          <label for="email" class="text-mute text-sm">Enter for email address</label>
          <InputText id="email" name="email" type="email" fluid />
          <small v-if="$form.email?.invalid" class="font-medium text-red-500">
            {{ $form.email?.error?.message }}
          </small>
        </div>

        <Button :loading="isLoading" type="submit" label="Submit" fluid />
      </Form>
    </div>
  </VueLayout>
</template>
