<script setup lang="ts">
import { useErrorPage } from "@/app/composables/use-error";
import { APP_NAME } from "@/app/data/constants";
import { MIN_PASSWORD_LENGTH } from "@/utils/constants";
import { zodResolver } from "@primeuix/forms/resolvers/zod";
import { FormSubmitEvent } from "@primevue/forms";
import { useHead } from "@unhead/vue";
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { z } from "zod";
import { useInterval } from "@vueuse/core";
import useAuth from "@/app/composables/use-auth";

useHead({
  title: `Password Reset - ${APP_NAME}`
});

const route = useRoute();
const Schema = z.object({
  password: z.string({ message: "Password is required" }).min(MIN_PASSWORD_LENGTH, {
    message: `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`
  })
});

const email = ref(atob(route.query.e?.toString() || ""));
const userId = ref(route.query.i?.toString());

const OTP = ref<string>("");
const visible = ref<boolean>(false);
const credentials = reactive<z.infer<typeof Schema>>({ password: "" });
const resolver = ref(zodResolver(Schema));

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

//Sending the otp
const {
  isLoading: isSending,
  error: sendError,
  execute: sendOTP
} = useAuth().sendOTP({
  mailOptions: {
    subject: "Password Recovery",
    buttonLabel: "Verify",
    mailReason:
      "You received this email because you initiated a password reset. " +
      "If you did not make the request, please log in and change your password immediately"
  },
  onSuccess: () => {
    resendCount.value++;
    seconds.value =
      resendCount.value > 1
        ? Math.min(BASE_WAIT_TIME + (resendCount.value - 1) * INCREMENT, MAX_WAIT_TIME)
        : BASE_WAIT_TIME;
    resume();
  }
});

const {
  isLoading: isResetting,
  error: resetError,
  execute: resetPassword
} = useAuth().resetPassword();

const onFormSubmit = ({ valid, values }: FormSubmitEvent) => {
  if (!valid || isResetting.value) return;

  resetPassword(0, {
    id: userId.value,
    email: email.value,
    password: (values as z.infer<typeof Schema>).password,
    otp: OTP.value
  }).then((data) => {
    if (data?.success) {
      visible.value = true;
    }
  });
};

onMounted(() => {
  if (email.value && userId.value) {
    //sendOTP(0, { id: userId.value, email: email.value })
    return;
  }
  useErrorPage({
    status: 500,
    message: "Password reset failed. Please start the process again."
  });
});
</script>

<template>
  <VueLayout name="auth">
    <div class="w-full md:w-[26rem] h-full md:p-10 md:bg-white dark:bg-transparent">
      <Logo size="24" />

      <Stepper value="1" linear class="dark:bg-transparent">
        <StepList>
          <Step value="1"></Step>
          <Step value="2"></Step>
        </StepList>

        <StepPanels>
          <StepPanel v-slot="{ activateCallback }" value="1" class="dark:bg-transparent">
            <div v-if="userId && email">
              <VErrorMessage
                v-if="sendError"
                :error="sendError"
                should-retry
                @retry="sendOTP(0, { id: userId, email })"
              />

              <div v-else-if="isSending" class="grid gap-3">
                <div class="grid grid-cols-6 gap-2">
                  <Skeleton
                    v-for="i in 6"
                    :key="i"
                    width="100%"
                    height="3rem"
                    border-radius="0.5rem"
                  />
                </div>
                <Skeleton width="100%" height="3rem" border-radius="0.5rem" />
              </div>

              <div v-else>
                <div class="flex flex-col gap-6 w-full">
                  <div class="flex flex-col gap-1">
                    <label for="otp" class="text-mute text-sm font-semibold"
                      >Enter the OTP sent to your email</label
                    >
                    <InputOTP
                      v-model="OTP"
                      id="otp"
                      name="otp"
                      mask
                      :length="6"
                      fluid
                      class="*:w-full"
                    />
                  </div>

                  <div class="flex justify-end">
                    <Button
                      :disabled="!OTP || OTP.length !== 6"
                      label="Next"
                      icon="pi pi-arrow-right"
                      icon-pos="right"
                      @click="activateCallback('2')"
                    />
                  </div>
                </div>

                <div class="mt-3">
                  <span>Didn't get the email? </span>
                  <Button
                    @click="sendOTP(0, { id: userId, email })"
                    :disabled="seconds > 0"
                    :label="`Resend ${seconds > 0 ? `in ${seconds}${seconds > 1 ? 's' : ''}` : ''}`"
                    text
                  />
                </div>
              </div>
            </div>
          </StepPanel>

          <StepPanel v-slot="{ activateCallback }" value="2" class="dark:bg-transparent">
            <VErrorMessage :error="resetError" class="mb-3" />

            <Form
              v-slot="$form"
              :initialValues="credentials"
              :resolver
              :validateOnValueUpdate="true"
              :validateOnBlur="true"
              @submit="onFormSubmit"
            >
              <div>
                <div class="grid gap-1">
                  <label for="password" class="text-mute text-sm font-semibold">
                    Enter your new password
                  </label>
                  <Password
                    id="password"
                    name="password"
                    toggle-mask
                    fluid
                    input-class="dark:bg-slate-800"
                  />
                  <small v-if="$form.password?.invalid" class="font-medium text-red-500">
                    {{ $form.password?.error?.message }}
                  </small>
                </div>
              </div>

              <div class="flex pt-6 justify-between">
                <Button
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  @click="activateCallback('1')"
                />
                <Button type="submit" label="Submit" :loading="isResetting" />
              </div>
            </Form>
          </StepPanel>
        </StepPanels>
      </Stepper>

      <Dialog
        v-model:visible="visible"
        header="Password Reset"
        modal
        :closable="false"
        class="w-80"
      >
        <div class="mt-2 flex flex-col items-center justify-center gap-2">
          <span class="pi pi-check-circle text-green-500" style="font-size: 35px" />
          <Message>
            <div class="text-center">
              <p>Your password has been successfully reset.</p>
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
