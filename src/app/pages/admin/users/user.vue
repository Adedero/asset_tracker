<script setup lang="ts">
import { $fetch } from "@/app/composables/use-fetch";
import { UserGetApiResponse } from "#src/modules/admin/users/users-get.api";
import { toTitleCase } from "@/app/utils/helpers";
import useSWRV from "swrv";
import { useDateFormat } from "@vueuse/core";
import { User } from "@/prisma-gen";
import { Icon } from "@iconify/vue";
import { useRouter } from "vue-router";

const router = useRouter();

const { user_id } = router.currentRoute.value.params as { user_id: string };

const { isLoading, data, error, mutate } = useSWRV<UserGetApiResponse>(
  () => `/api/admins/me/users/${user_id}`,
  $fetch
);

const onDone = async (payload: User) => {
  if (!data.value) return;

  await mutate(() => {
    return Promise.resolve({
      success: true,
      message: "User updated successfully",
      user: { ...data.value!.user, ...payload }
    });
  });
};

const updateWalletBalance = async (balance: number) => {
  if (!data.value?.user?.account) return;

  await mutate(() => {
    return Promise.resolve({
      success: true,
      message: "Wallet balance updated successfully",
      user: {
        ...data.value!.user,
        account: { ...data.value!.user.account!, walletBalance: balance }
      }
    });
  });
};

const updateEmail = async (email: string, verified: boolean) => {
  if (!data.value) return;
  await mutate(() => {
    return Promise.resolve({
      success: true,
      message: "Email updated successfully",
      user: {
        ...data.value!.user,
        email,
        verified
      }
    });
  });
};

const updateUserBan = async (status: boolean) => {
  if (!data.value) return;
  await mutate(() => {
    return Promise.resolve({
      success: true,
      message: "Email updated successfully",
      user: {
        ...data.value!.user,
        isBanned: status
      }
    });
  });
};

const onDeleteUser = () => {
  router.back();
};
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VCard class="!py-2">
        <div class="flex items-center gap-1 justify-between flex-wrap whitespace-pre-wrap">
          <h1 class="text-lg font-semibold text-primary">{{ data?.user?.name || "User" }}</h1>
          <UserManager v-if="data?.user" :user="data.user" @done="onDone" />
        </div>
      </VCard>

      <div class="mt-2 md:h-[calc(100dvh-9rem)]">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data?.user" class="h-full grid md:grid-cols-5 gap-2">
          <div class="md:h-full md:overflow-y-auto md:col-span-3">
            <VCard class="bg-gradient-x text-white">
              <div class="flex items-center gap-4 flex-wrap">
                <div class="w-32 aspect-square overflow-hidden rounded-full">
                  <img v-if="data.user.image" :src="data.user.image" :alt="data.user.name" />
                  <Icon
                    v-else
                    icon="ic:baseline-account-circle"
                    style="font-size: 8rem"
                    class="text-white"
                  />
                </div>

                <div>
                  <h1 class="text-3xl font-semibold text-white">{{ data.user.name }}</h1>
                  <p class="text text-white font-medium">{{ data.user.email }}</p>
                  <p v-if="data.user.region || data.user.country" class="text-sm">
                    <span>{{ data.user.region ?? "-" }}</span>
                    <span>, </span>
                    <span>{{ data.user.country ?? "-" }}</span>
                  </p>
                </div>
              </div>
            </VCard>

            <div class="mt-2">
              <VCard class="grid gap-2" header="Profile">
                <div
                  v-if="data.user.isBanned && data.user.ban?.active"
                  class="v-card !p-2 bg-red-100 text-red-500 border dark:border-white/30 dark:bg-slate-800"
                >
                  <div class="flex items-center">
                    <span class="pi pi-ban text-red-400 p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-red-400 text-sm font-semibold">Ban Status</p>
                  </div>
                  <p class="text-right font-semibold">User Banned</p>
                  <p class="text-right text-sm text-red-400">
                    {{ data.user.ban.reason }}
                  </p>

                  <p v-if="data.user.ban.expiresAt" class="text-right text-sm text-red-400">
                    Banned until
                    {{ useDateFormat(data.user.ban.expiresAt, "MMMM DD, YYYY | HH:mm aa") }}
                  </p>
                </div>

                <div class="flex flex-col gap-2 *:flex-shrink-0">
                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-phone text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
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

                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-check-circle text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Account Verification</p>
                    </div>
                    <p class="text-right font-semibold">
                      {{ data.user.verified ? "Verified" : "Not Verified" }}
                    </p>
                  </div>

                  <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                    <div class="flex items-center">
                      <span
                        class="pi pi-calendar text-mute p-1 rounded-full"
                        style="font-size: 12px"
                      />
                      <p class="text-mute text-sm font-semibold">Account Creation Date</p>
                    </div>
                    <p class="text-right font-semibold">
                      {{ useDateFormat(new Date(data.user.createdAt), "MMMM DD, YYYY | HH:mm aa") }}
                    </p>
                  </div>
                </div>
              </VCard>
            </div>
          </div>

          <div class="md:h-full md:overflow-y-auto md:col-span-2">
            <VCard
              v-if="data.user.account"
              header="Account Balance"
              class="bg-emerald-500 dark:bg-emerald-500/50 text-white"
              header-class="text-white"
            >
              <div class="flex items-end justify-between gap-2 flex-wrap">
                <div class="font-semibold">
                  <span>$</span>
                  <span class="text-2xl font-semibold">
                    {{ data.user.account?.walletBalance.toLocaleString().split(".")[0] }}
                  </span>
                  <span
                    >.
                    {{ data.user.account?.walletBalance.toLocaleString().split(".")[1] || "00" }}
                  </span>
                </div>

                <UserAccountBalanceEditor
                  :account="data.user.account"
                  @update="updateWalletBalance"
                />
              </div>
            </VCard>

            <VCard header="Account" class="mt-2">
              <div class="flex flex-col gap-2 *:flex-shrink-0">
                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span class="pi pi-shield text-mute p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-mute text-sm font-semibold">KYC Verification</p>
                  </div>

                  <div class="text-sm grid mt-2 gap-1">
                    <div class="flex flex-wrap gap-2 justify-between">
                      <p>Status</p>
                      <p class="font-semibold">{{ toTitleCase(data.user.account?.kycStatus) }}</p>
                    </div>

                    <div
                      v-if="data.user.account?.kycSubmittedAt"
                      class="flex flex-wrap gap-2 justify-between"
                    >
                      <p>Submitted On</p>
                      <p class="font-semibold">
                        {{
                          useDateFormat(new Date(data.user.account.kycSubmittedAt), "MMM DD, YYYY")
                        }}
                      </p>
                    </div>

                    <Button
                      @click="
                        $router.push({
                          name: 'admin-kyc-review',
                          params: { user_id: data.user.id }
                        })
                      "
                      label="View Details"
                      icon="pi pi-chevron-right"
                      icon-pos="right"
                      size="small"
                      class="mt-2"
                      fluid
                      outlined
                    />
                  </div>
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-chart-line text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Investments</p>
                  </div>
                  <Button
                    @click="
                      $router.push({ name: 'admin-investments', query: { user_id: data.user.id } })
                    "
                    label="View Investments"
                    icon="pi pi-chevron-right"
                    icon-pos="right"
                    size="small"
                    class="mt-2"
                    fluid
                    outlined
                  />
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span class="pi pi-wallet text-mute p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-mute text-sm font-semibold">Transactions</p>
                  </div>
                  <Button
                    @click="
                      $router.push({ name: 'admin-transactions', query: { user_id: data.user.id } })
                    "
                    label="View Transactions"
                    icon="pi pi-chevron-right"
                    icon-pos="right"
                    size="small"
                    class="mt-2"
                    fluid
                    outlined
                  />
                </div>
              </div>
            </VCard>

            <VCard header="Settings" class="mt-2">
              <div class="grid gap-2">
                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-envelope text-mute p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-mute text-sm font-semibold">Change Email</p>
                  </div>
                  <div>
                    <p class="text-xs text-mute">Modify this user's email address</p>
                  </div>

                  <UserEmailEditor class="mt-2" :user="data.user" @update="updateEmail" />
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span class="pi pi-lock text-mute p-1 rounded-full" style="font-size: 12px" />
                    <p class="text-mute-500 text-sm font-semibold">Reset Password</p>
                  </div>
                  <div>
                    <p class="text-xs text-mute">
                      Reset this user's password to the default '00000000' (8 zeros)
                    </p>
                  </div>
                  <UserPasswordResetter class="mt-2" :user="data.user" />
                </div>

                <div
                  v-if="!data.user.isBanned"
                  class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800"
                >
                  <div class="flex items-center">
                    <span
                      class="pi pi-lock text-amber-500 p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-amber-500 text-sm font-semibold">User Ban</p>
                  </div>
                  <div>
                    <p class="text-xs text-amber-500">Ban the user</p>
                  </div>
                  <UserBanEditor class="mt-2" :user="data.user" @ban="updateUserBan(true)" />
                </div>

                <div v-else class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-lock text-amber-500 p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-amber-500 text-sm font-semibold">User Ban</p>
                  </div>
                  <div>
                    <p class="text-xs text-amber-500">Unban the user</p>
                  </div>
                  <UserUnbanEditor class="mt-2" :user="data.user" @unban="updateUserBan(false)" />
                </div>

                <div class="v-card !p-2 border dark:border-white/30 dark:bg-slate-800">
                  <div class="flex items-center">
                    <span
                      class="pi pi-trash text-red-500 p-1 rounded-full"
                      style="font-size: 12px"
                    />
                    <p class="text-red-500 text-sm font-semibold">Delete Account</p>
                  </div>
                  <div>
                    <p class="text-xs text-red-500">
                      Delete this user and all related details from the database.
                    </p>
                  </div>
                  <UserDeleter :user-id="data.user.id" @remove="onDeleteUser" />
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
