<script setup lang="ts">
import { AccountGetApiResponse } from "@/modules/user/profile/account-get.api";
import { $fetch } from "@/app/composables/use-fetch";
import useSWRV from "swrv";
import { computed, ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import { Icon } from "@iconify/vue";
import { useDateFormat } from "@vueuse/core";
import { toTitleCase } from "@/app/utils/helpers";
import { Account, KycStatus } from "@/prisma-gen";
import { UserUpdateData } from "@/app/components/user/user-profile-editor.vue";

const { isLoading, data, error, mutate } = useSWRV<AccountGetApiResponse>(
  () => "/api/users/me/account",
  $fetch
);

const handleUserUpdate = async (d: UserUpdateData) => {
  /* @ts-ignore */
  await mutate(() =>
    Promise.resolve({
      success: true,
      message: "User updated successfully.",
      user: {
        ...data.value?.user,
        ...d
      }
    })
  );
};

const router = useRouter();
const route = useRoute();

const editProfile = ref<boolean>(route.query["edit-profile"] === "true");
const verifyKyc = ref<boolean>(false);
const editEmail = ref<boolean>(false);

const email = ref<string>("");
const isEmailTheSame = computed(() => !!email.value && email.value === data.value?.user.email);
const errorMessage = ref<string>("");

const menu = useTemplateRef("menu");
const items = ref([
  {
    label: "Edit email address",
    icon: "pi pi-at",
    command: () => (editEmail.value = true)
  },
  {
    label: "Edit other details",
    icon: "pi pi-user-edit",
    command: () => (editProfile.value = true)
  }
]);

const handleEmailChange = () => {
  errorMessage.value = "";
  if (!data.value?.user || !email.value) return;
  if (isEmailTheSame.value) return;

  const Schema = z.object({
    email: z.string({ message: "Email is required" }).email({ message: "Enter a valid email" })
  });
  const result = Schema.safeParse({ email: email.value });
  if (!result.success) {
    errorMessage.value = result.error.errors[0].message;
    return;
  }
  router.push({
    name: "email-verification",
    query: {
      e: btoa(data.value.user.email),
      ev: btoa(email.value),
      i: data.value.user.id
    }
  });
};

const kycStatus: Record<KycStatus, string> = {
  UNVERIFIED: "danger",
  PENDING: "warn",
  VERIFIED: "success"
};

const handleKycUpdate = async (d: Partial<Account>) => {
  /* @ts-ignore */
  await mutate(() =>
    Promise.resolve({
      success: true,
      message: "User updated successfully.",
      user: {
        account: {
          ...data.value?.user.account,
          ...d
        }
      }
    })
  );
};
</script>

<template>
  <VueLayout name="user">
    <div class="h-full">
      <VNavbar />

      <div class="mt-2 overflow-y-auto md:h-[calc(100dvh-8rem)]">
        <VPageLoader v-if="isLoading" />

        <div v-else-if="error">
          <VErrorMessage :error should-retry @retry="mutate()" />
        </div>

        <div v-else-if="data" class="w-full h-full grid gap-2 md:grid-cols-7">
          <div class="md:col-span-4 grid gap-2">
            <VCard class="bg-gradient-y text-white">
              <template #header>
                <div class="flex items-center justify-end gap-2">
                  <Button
                    @click="(event) => menu?.toggle(event)"
                    size="small"
                    label="Edit"
                    icon="pi pi-user-edit"
                    class="border-white bg-white text-primary-500"
                  />
                  <Menu ref="menu" :model="items" :popup="true" />

                  <Dialog v-model:visible="editEmail" header="Change Email" modal class="w-80">
                    <div>
                      <div class="grid gap-1">
                        <label for="email" class="text-mute font-medium text-sm">
                          Enter your new email address
                        </label>
                        <small class="text-primary-500"
                          >You will be asked to verify this email address.</small
                        >
                        <InputText v-model="email" fluid />
                        <small v-if="isEmailTheSame || errorMessage" class="text-red-500">
                          {{ errorMessage || "Your new email is the same as your current email." }}
                        </small>
                      </div>

                      <Button
                        @click="handleEmailChange"
                        :disabled="!email || isEmailTheSame"
                        label="Proceed"
                        icon="pi pi-arrow-right"
                        icon-pos="right"
                        fluid
                        class="mt-4"
                      />
                    </div>
                  </Dialog>

                  <UserProfileEditor
                    v-model:visible="editProfile"
                    :user="data.user"
                    @update="handleUserUpdate"
                  />
                </div>
              </template>

              <div
                class="mt-2 flex items-center flex-col md:flex-row justify-center md:justify-normal gap-5 flex-wrap"
              >
                <div
                  v-if="data.user.image"
                  class="bg-white rounded-full w-36 md:w-28 aspect-square overflow-hidden"
                >
                  <img
                    :src="data.user.image"
                    :alt="data.user.name"
                    class="w-full h-full object-cover"
                  />
                </div>

                <Icon v-else icon="ic:baseline-account-circle" style="font-size: 120px" />

                <div>
                  <h1 class="font-semibold text-4xl md:5xl">{{ data.user.name }}</h1>
                  <p>{{ data.user.email }}</p>
                </div>
              </div>
            </VCard>

            <VCard class="grid gap-2" header="Profile">
              <div class="flex flex-col gap-2 *:flex-shrink-0">
                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span class="pi pi-phone text-mute p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-mute text-sm font-semibold">Phone Number</p>
                  </div>
                  <p class="text-right font-semibold">
                    {{ data.user.phoneNumber || "----------" }}
                  </p>
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span class="pi pi-map text-mute p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-mute text-sm font-semibold">Address</p>
                  </div>
                  <p class="text-right font-semibold">
                    {{ data.user.address || "----------" }}
                  </p>
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-map-marker text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Location</p>
                  </div>
                  <p class="text-right font-semibold">
                    {{ data.user.region || "_____" }}, {{ data.user.country || "_____" }}
                  </p>
                </div>

                <Divider />

                <div>
                  <RouterLink :to="{ name: 'user-change-password' }">
                    <Button fluid label="Change Password" icon="pi pi-key" />
                  </RouterLink>
                </div>
              </div>
            </VCard>
          </div>

          <div class="md:col-span-3 md:row-span-6 flex flex-col gap-2 *:flex-shrink-0">
            <VCard header="Wallet Balance">
              <template #header>
                <div class="flex items-center gap-1">
                  <Icon
                    icon="ic:baseline-attach-money"
                    style="font-size: 28px"
                    class="bg-primary-500 text-white p-1 rounded-full aspect-square"
                  />
                  <p class="font-semibold">Wallet Balance</p>
                </div>
              </template>
              <div class="mt-2">
                <p class="text-3xl md:text-34xl font-semibold">
                  ${{ data.user.account.walletBalance.toLocaleString().split(".")[0] ?? "00" }}
                </p>
                <p class="text-xl">
                  .{{ data.user.account.walletBalance.toLocaleString().split(".")[1] ?? "00" }}
                </p>
              </div>
              <div class="mt-3 flex items-center justify-end gap-2">
                <RouterLink :to="{ name: 'user-deposit-currencies' }">
                  <Button size="small" label="Deposit" class="bg-gradient-x" />
                </RouterLink>
                <RouterLink :to="{ name: 'user-withdrawal-initialize' }">
                  <Button
                    severity="secondary"
                    size="small"
                    label="Withdraw"
                    class="dark:bg-slate-800 dark:border-slate-800"
                  />
                </RouterLink>
              </div>
            </VCard>

            <VCard header="KYC Verification">
              <div class="p-2 border rounded-lg dark:border-white/30 dark:bg-slate-800">
                <div class="flex items-center">
                  <span class="pi pi-user text-mute p-1 rounded-full" style="font-size: 12px" />
                  <p class="text-mute text-sm font-semibold">KYC Verification Status</p>
                </div>

                <div class="mt-3 flex items-center gap-2 justify-between">
                  <Tag
                    :severity="kycStatus[data.user.account.kycStatus]"
                    :value="toTitleCase(data.user.account.kycStatus)"
                  />
                  <Button
                    v-if="data.user.account.kycStatus === 'UNVERIFIED'"
                    @click="verifyKyc = true"
                    size="small"
                    class="text-sm py-1"
                    label="Start Verification"
                  />
                  <KycVerifier
                    :account-id="data.user.account.id"
                    v-model:visible="verifyKyc"
                    @update="handleKycUpdate"
                  />
                </div>
              </div>

              <div v-if="data.user.account.kycStatus !== 'UNVERIFIED'" class="mt-4">
                <div class="p-2 border rounded-lg dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span class="pi pi-user text-mute p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-mute text-sm font-semibold">KYC Document</p>
                  </div>

                  <div class="mt-3 grid gap-2">
                    <div class="flex items-center justify-between gap-3 flex-wrap">
                      <p>ID Type</p>
                      <p>{{ data.user.account.kycIdType }}</p>
                    </div>

                    <div
                      v-if="data.user.account.kycVerifiedAt"
                      class="flex items-center justify-between gap-3 flex-wrap"
                    >
                      <p>Verified On</p>
                      <p>
                        {{ useDateFormat(data.user.account.kycVerifiedAt, "ddd, MMM DD, YYYY") }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap justify-between">
                      <Button
                        @click="verifyKyc = true"
                        label="Update"
                        icon="pi pi-file-edit"
                        size="small"
                      />

                      <a
                        :href="data.user.account.kycDocument || ''"
                        :download="`${data.user.account.id}.${data.user.account.kycDocumentExt}`"
                      >
                        <Button label="Download" icon="pi pi-download" size="small" outlined />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </VCard>

            <VCard header="Log Out">
              <VLogout>
                <Button
                  fluid
                  label="Log out"
                  outlined
                  icon="pi pi-sign-out outlined"
                  severity="danger"
                />
              </VLogout>
            </VCard>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
