<script setup lang="ts">
import { useFetch } from "@/app/composables/use-fetch";
import { computed, ref, watch } from "vue";
import { AccountGroup, type User } from "@/prisma-gen";
import { useToast } from "primevue";
import countries from "country-json/src/country-by-name.json";
import { type SafeParseReturnType, z } from "zod";
import { IFile } from "../ui/VFileUploader.vue";
import { Icon } from "@iconify/vue";
import LoginSchema from "@/shared/schemas/login.schema";
import { v4 as uuid } from "uuid";
import { AccountGroupsGetApiResponse } from "@/modules/admin/account-groups/account-groups-get.api";

const { user, role = "USER" } = defineProps<{
  user?: Partial<User>;
  role?: "USER" | "ADMIN";
}>();

const emit = defineEmits<{
  done: [user: User];
}>();

const visible = ref<boolean>(false);
const toast = useToast();

export type UserUpdateData = Pick<
  User,
  | "id"
  | "name"
  | "email"
  | "image"
  | "password"
  | "verified"
  | "role"
  | "phoneNumber"
  | "address"
  | "country"
  | "region"
  | "accountGroupId"
>;

const updatedUser = ref<UserUpdateData>({
  id: user?.id || uuid(),
  name: user?.name || "",
  email: user?.email || "",
  password: user?.password || "00000000",
  image: user?.image || "",
  phoneNumber: user?.phoneNumber || "",
  address: user?.address || "",
  country: user?.country || "",
  region: user?.region || "",
  verified: user?.verified || false,
  role: user?.role || role || "USER",
  accountGroupId: user?.accountGroupId || null
});

const result =
  ref<
    SafeParseReturnType<{ email: string; password: string }, { email: string; password: string }>
  >();

const url = ref("/api/admins/me/users");

const {
  isFetching: isUpdating,
  error: errorUpdating,
  data: updatedData,
  execute: updateUser
} = useFetch(() => `${url.value}/${user?.id}`, { immediate: false })
  .put(updatedUser)
  .json();

const {
  isFetching: isCreating,
  error: errorCreating,
  data: newData,
  execute: createUser
} = useFetch(url, { immediate: false }).post(updatedUser).json();

async function manageUser() {
  result.value = undefined;

  if (!user) {
    result.value = LoginSchema.safeParse({
      email: updatedUser.value.email,
      password: updatedUser.value.password
    });

    if (!result.value.success) {
      return;
    }

    await createUser();
  } else {
    await updateUser();
  }

  if (errorUpdating.value || errorCreating.value) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: (errorUpdating.value || errorCreating.value).message,
      life: 6000
    });
    return;
  }

  toast.add({
    severity: "success",
    summary: "Done",
    detail: user ? "User updated successfully" : "New user created",
    life: 3000
  });

  visible.value = false;
  const payload = user ? updatedData.value.user : newData.value.user;
  emit("done", payload as unknown as User);
}

const disabled = computed(
  () =>
    !updatedUser.value.name ||
    !updatedUser.value.email ||
    !updatedUser.value.role ||
    (!user && (!updatedUser.value.password || updatedUser.value.password.length < 8))
);

const cancel = () => {
  updatedUser.value = {
    id: user?.id || uuid(),
    name: user?.name || "",
    email: user?.email || "",
    password: user?.password || "00000000",
    image: user?.image || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    country: user?.country || "",
    region: user?.region || "",
    verified: user?.verified || false,
    role: user?.role || role || "USER",
    accountGroupId: user?.accountGroupId || null
  };
};

const verificationInfo = computed(() => {
  if (user) {
    return user.verified
      ? "User's account is already verified. If set as 'not verified', the user will need to verify their account again to log in."
      : "User's account is not verified. If set as 'verified', the user will not receive an email to verify their account.";
  }
  return "If set as 'verified', the user will not receive an email to verify their account.";
});

const accountGroups = ref<AccountGroupsGetApiResponse["accountGroups"]>();
const selectedGroup = ref<AccountGroupsGetApiResponse["accountGroups"][number]>();

watch(selectedGroup, (value) => {
  if (value) {
    updatedUser.value.accountGroupId = value.id;
  } else {
    //@ts-expect-error assigning undefined
    updatedUser.value.accountGroupId = undefined;
  }
});
//Getting account groups
const {
  isFetching: loadingGroups,
  data: groupData,
  error: groupError,
  execute: getGroups
} = useFetch("/api/admins/me/account-groups", { immediate: false })
  .get()
  .json<AccountGroupsGetApiResponse>();

const onShow = async () => {
  await getGroups();
  if (groupError.value || !groupData.value) return;
  accountGroups.value = groupData.value.accountGroups;
  selectedGroup.value = accountGroups.value.find(
    (group) => user?.accountGroupId && user.accountGroupId === group.id
  );
};
</script>

<template>
  <div>
    <div @click="visible = true" class="cursor-pointer">
      <slot>
        <Button label="Edit Info" icon="pi pi-user-edit" size="small" />
      </slot>
    </div>

    <Dialog
      v-model:visible="visible"
      modal
      :header="user ? 'Edit User' : 'New User'"
      class="w-80 md:w-96"
      @hide="cancel"
      @show="onShow"
    >
      <div class="grid gap-4">
        <div class="flex flex-col items-center justify-center gap-1">
          <div class="w-24 aspect-square overflow-hidden rounded-full">
            <img
              v-if="updatedUser.image"
              :src="updatedUser.image"
              class="w-full h-full object-cover"
            />
            <Icon
              v-else
              icon="ic:baseline-account-circle"
              style="font-size: 6rem"
              class="text-primary-500"
            />
          </div>

          <div class="flex items-start gap-1">
            <Button
              v-if="user?.image"
              @click="updatedUser.image = ''"
              label="Remove"
              icon="pi pi-times-circle"
              outlined
              severity="danger"
              size="small"
              class="flex-shrink-0"
            />

            <VFileUploader
              size="small"
              accept="image/*"
              :max-file-size="1 * 1024 * 1024"
              @select="(files: IFile[]) => (updatedUser.image = files[0].dataUrl || '')"
              @upload="manageUser"
              @cancel="updatedUser.image = user?.image || ''"
              class="w-full"
              :loading="isUpdating || isCreating"
              :disabled="isUpdating || isCreating || disabled"
            />
          </div>
        </div>

        <Divider />

        <div class="grid">
          <label class="text-mute text-sm font-medium">
            Name <span class="text-red-500">*</span>
          </label>
          <InputText v-model.trim="updatedUser.name" fluid />
        </div>

        <div v-if="!user" class="grid">
          <label class="text-mute text-sm font-medium">
            Email <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model.trim="updatedUser.email"
            fluid
            :invalid="!!result?.error?.flatten()?.fieldErrors.email?.[0]"
          />
          <p class="text-xs text-red-500">
            {{ result?.error?.flatten()?.fieldErrors.email?.[0] }}
          </p>
        </div>

        <div v-if="!user" class="grid">
          <label class="text-mute text-sm font-medium">
            Password <span class="text-red-500">*</span>
          </label>
          <Password
            v-model.trim="updatedUser.password"
            fluid
            toggle-mask
            :invalid="!!result?.error?.flatten()?.fieldErrors.password?.[0]"
          />
          <p class="text-xs text-red-500">
            {{ result?.error?.flatten()?.fieldErrors.password?.[0] }}
          </p>
          <p class="text-xs text-mute">Password is automatically set to '00000000' (8 zeros)</p>
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium">
            Account Verification Status <span class="text-red-500">*</span>
          </label>
          <ToggleButton v-model="updatedUser.verified" onLabel="Verified" offLabel="Not Verified" />
          <p v-if="user" class="text-xs text-mute">
            {{ verificationInfo }}
          </p>
          <p v-else class="text-xs text-mute">
            If set as 'verified', the user will not receive an email to verify their account.
          </p>
        </div>

        <div>
          <label class="text-mute text-sm font-medium">
            Account Group <span class="text-red-500">*</span>
          </label>
          <Select
            :loading="loadingGroups"
            v-model="selectedGroup"
            :options="accountGroups"
            option-label="name"
            placeholder="Select a group"
            class="w-full"
          />
          <p class="mt-1 text-mute text-xs">Assign this user to a defined group.</p>
        </div>

        <div>
          <label class="text-mute text-sm font-medium">
            Role <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="updatedUser.role"
            :options="['USER', 'ADMIN']"
            placeholder="Select a role"
            class="w-full"
          />
          <p v-if="user && user.role !== updatedUser.role" class="mt-1 text-red-500 text-xs">
            Role changed from {{ user.role }} to {{ updatedUser.role }}. Be sure of this action
            before proceeding.
          </p>
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium">Phone Number </label>
          <InputText v-model.trim="updatedUser.phoneNumber" fluid />
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium">Address</label>
          <InputText v-model.trim="updatedUser.address" fluid />
        </div>
        <div>
          <label class="text-mute text-sm font-medium">Country</label>
          <Select
            :default-value="updatedUser.country ? { country: updatedUser.country } : undefined"
            :options="countries"
            editable
            option-label="country"
            fluid
            show-clear
            @value-change="(value) => (updatedUser.country = value?.country ?? '')"
          />
        </div>

        <div class="grid">
          <label class="text-mute text-sm font-medium">State/Region</label>
          <InputText v-model.trim="updatedUser.region" fluid />
        </div>

        <div class="grid mt-3">
          <Button
            @click="manageUser"
            :loading="isUpdating || isCreating"
            :disabled="isUpdating || isCreating || disabled"
            label="Submit"
            icon="pi pi-check-circle"
            fluid
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
