<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useHead } from "@unhead/vue";
import { maskEmail } from "@/app/utils/helpers";
import { APP_NAME } from "@/app/data/constants";
import { useRoute } from "vue-router";
import useAuth from "@/app/composables/use-auth";
import { useInterval } from "@vueuse/core";
import { useErrorPage } from "@/app/composables/use-error";

useHead({
  title: `Email Verification - ${APP_NAME}`
});

const route = useRoute();

const email = ref(atob(route.query.e?.toString() || ""));
const emailToVerify = ref(atob(route.query.ev?.toString() || ""));
const token = ref(route.query.v?.toString() || "");
const userId = ref(route.query.i?.toString() || "");

const visible = ref<boolean>(false);
const OTP = ref<string>("");

const seconds = ref<number>(0);
const resendCount = ref<number>(0);
const BASE_WAIT_TIME = 30;
const INCREMENT = 10;
const MAX_WAIT_TIME = 120;

const { pause, resume } = useInterval(1000, {
  controls: true,
  immediate: false,
  callback: () => {
    if (seconds.value === 0) {
      pause();
      return;
    }
    seconds.value -= 1;
  }
});

const {
  state,
  isLoading,
  error,
  execute: sendEmail
} = useAuth().sendVerificationEmail({
  onSuccess: async (data) => {
    resendCount.value++;
    seconds.value =
      resendCount.value > 1
        ? Math.min(BASE_WAIT_TIME + (resendCount.value - 1) * INCREMENT, MAX_WAIT_TIME)
        : BASE_WAIT_TIME;
    resume();
  }
});

const {
  isLoading: isVerifying,
  error: verifyError,
  execute: verifyEmail
} = useAuth().verifyEmail();

const onFormSubmit = () => {
  if (isLoading.value) return;
  if (!OTP.value || OTP.value.length !== 6) return;
  verifyEmail(0, {
    email: email.value,
    emailToVerify: emailToVerify.value,
    otp: OTP.value,
    token: token.value,
    id: userId.value
  }).then((data) => {
    if (data) {
      visible.value = true;
    }
  });
};

onMounted(() => {
  if (token.value && userId.value) {
    verifyEmail(0, {
      token: token.value,
      id: userId.value
    }).then((data) => {
      if (data) {
        visible.value = true;
      }
    });
    return;
  }
  if (email.value) {
    sendEmail(0, {
      email: email.value,
      emailToVerify: emailToVerify.value
    });
    return;
  }

  useErrorPage({
    status: 500,
    message: "Verification failed. Please log in to verify your email."
  });
});
</script>

<template>
  <VueLayout name="auth">
    <div class="w-full md:w-[26rem] h-full md:p-10 md:bg-white dark:bg-transparent">
      <Logo size="24" />

      <header>
        <h1 class="text-3xl md:text-4xl font-semibold">Email Verification</h1>
        <div v-if="!isLoading && !error">
          <p class="text-mute">Enter the OTP that has been sent to your email address.</p>
          <p v-if="email" class="font-semibold">{{ maskEmail(emailToVerify || email) }}</p>
          <p class="mt-1 text-xs text-primary-500 font-semibold">
            Don't forget to check your spam folder too.
          </p>
        </div>
      </header>

      <div class="mt-8">
        <VErrorMessage v-if="!isVerifying && verifyError" :error="verifyError" />

        <div v-if="isLoading" class="grid gap-3">
          <div class="grid grid-cols-6 gap-2">
            <Skeleton v-for="i in 6" :key="i" width="100%" height="3rem" border-radius="0.5rem" />
          </div>
          <Skeleton width="100%" height="3rem" border-radius="0.5rem" />
        </div>

        <VErrorMessage
          v-else-if="error"
          :error
          should-retry
          @retry="sendEmail(0, { email, emailToVerify })"
          class="mt-3"
        />

        <form v-else-if="state" @submit.prevent="onFormSubmit" class="flex flex-col gap-4 w-full">
          <div class="flex flex-col gap-1">
            <label for="otp" class="text-mute text-sm">Enter your OTP</label>
            <InputOTP v-model="OTP" id="otp" name="otp" mask :length="6" fluid class="*:w-full" />
          </div>

          <Button
            :disabled="isVerifying || !OTP || OTP.length !== 6"
            :loading="isVerifying"
            type="submit"
            :label="isVerifying ? 'Verifying' : 'Submit'"
            icon-pos="right"
            icon="pi pi-check-circle"
            fluid
          />
        </form>

        <div v-if="!isLoading && !error" class="mt-3">
          <span>Didn't get the email? </span>
          <Button
            @click="sendEmail(0, { email, emailToVerify })"
            :disabled="seconds > 0"
            :label="`Resend ${seconds > 0 ? `in ${seconds}${seconds > 1 ? 's' : ''}` : ''}`"
            text
          />
        </div>
      </div>

      <Dialog
        v-model:visible="visible"
        header="Email Verified"
        modal
        :closable="false"
        class="w-80"
      >
        <div class="mt-2 flex flex-col items-center justify-center gap-2">
          <span class="pi pi-check-circle text-green-500" style="font-size: 35px" />
          <Message>
            <div class="text-center">
              <p>Your email has been verified and you are being redirected.</p>
              <p class="flex items-center justify-center gap-2">
                <span>Please, wait...</span>
                <span class="pi pi-spin pi-spinner" style="font-size: 24px" />
              </p>
            </div>
          </Message>
        </div>
      </Dialog>
    </div>
  </VueLayout>
</template>
