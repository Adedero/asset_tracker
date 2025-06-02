<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import useAuth from "@/app/composables/use-auth";
import { computed, ref } from "vue";

const { logout } = useAuth();

interface Props {
  role: "USER" | "ADMIN";
}
const { role } = defineProps<Props>();

const emit = defineEmits(["change"]);

const passwords = ref({
  oldPassword: "",
  newPassword: "",
  newPasswordConfirm: ""
});

const { isFetching, error, data, execute } = useFetch(
  () => `/api/${role.toLowerCase()}s/me/password/change`,
  { immediate: false }
)
  .put(passwords)
  .json();

const success = computed(() => {
  if (data.value) {
    return data.value.success;
  }
  return false;
});

const changePassword = async () => {
  await execute().then(() => {
    if (error.value) return;
    setTimeout(() => {
      logout();
    }, 3000);
  });
};
</script>

<template>
  <div class="v-card h-full w-full flex items-center justify-center">
    <Stepper
      value="1"
      linear
      class="shadow-md border dark:border-slate-600 rounded-xl p-3 bg-white dark:bg-slate-900 md:w-96"
    >
      <StepList>
        <Step value="1"></Step>
        <Step value="2"></Step>
        <Step value="3"></Step>
      </StepList>

      <VErrorMessage :error class="my-2" />

      <div v-if="success" class="my-2 flex-col-center gap-3">
        <Message severity="success">
          Your password has been changed. Please, log in to continue
        </Message>
        <RouterLink :to="{ name: 'login' }" class="w-full">
          <Button label="Log in" fluid icon="pi pi-sign-in" icon-pos="right" />
        </RouterLink>
      </div>

      <StepPanels>
        <StepPanel v-slot="{ activateCallback }" value="1" class="dark:bg-slate-900">
          <div class="flex flex-col">
            <div class="grid gap-1">
              <label for="oldPassword" class="text-mute font-semibold text-sm"
                >Enter your old password</label
              >
              <Password
                v-model.trim="passwords.oldPassword"
                fluid
                toggle-mask
                :feedback="false"
                input-class="dark:bg-slate-800"
              />
            </div>
          </div>
          <div class="flex pt-6 justify-end">
            <Button
              :disabled="!passwords.oldPassword"
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="activateCallback('2')"
            />
          </div>
        </StepPanel>

        <StepPanel v-slot="{ activateCallback }" value="2" class="dark:bg-slate-900">
          <div class="flex flex-col">
            <div class="grid gap-1">
              <label for="oldPassword" class="text-mute font-semibold text-sm"
                >Enter your new password</label
              >
              <small class="text-primary-500">Password must have at least 8 characters</small>
              <Password
                v-model.trim="passwords.newPassword"
                fluid
                toggle-mask
                :feedback="false"
                input-class="dark:bg-slate-800"
              />
            </div>
          </div>
          <div class="flex pt-6 justify-between">
            <Button
              label="Back"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="activateCallback('1')"
            />
            <Button
              :disabled="!passwords.newPassword || passwords.newPassword.length < 8"
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="activateCallback('3')"
            />
          </div>
        </StepPanel>

        <StepPanel v-slot="{ activateCallback }" value="3" class="dark:bg-slate-900">
          <div class="flex flex-col">
            <div class="grid gap-1">
              <label for="oldPassword" class="text-mute font-semibold text-sm"
                >Confirm your new password</label
              >
              <Password
                v-model.trim="passwords.newPasswordConfirm"
                fluid
                toggle-mask
                :feedback="false"
                input-class="dark:bg-slate-800"
              />
              <small
                v-show="
                  passwords.newPasswordConfirm &&
                  passwords.newPasswordConfirm !== passwords.newPassword
                "
                class="text-red-500"
              >
                Password does not match your new password
              </small>
            </div>
          </div>
          <div class="flex pt-6 justify-between">
            <Button
              label="Back"
              severity="secondary"
              icon="pi pi-arrow-left"
              @click="activateCallback('2')"
            />
            <Button
              :loading="isFetching"
              :disabled="
                isFetching ||
                !passwords.oldPassword ||
                passwords.newPassword.length < 8 ||
                passwords.newPasswordConfirm !== passwords.newPassword
              "
              label="Submit"
              icon="pi pi-check"
              icon-pos="right"
              @click="changePassword"
            />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>
