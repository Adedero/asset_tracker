<script setup lang="ts">
import { AccountGetApiResponse } from "@/modules/admin/self/account-get.api";
import useStore from "@/app/stores/store";
import { ref } from "vue";
import countries from "country-json/src/country-by-name.json";
import { useFetch } from "@/app/composables/use-fetch";
import { Icon } from "@iconify/vue";
import { MAX_PROFILE_IMG_SIZE } from "@/app/data/constants";

const store = useStore();

const visible = defineModel<boolean>("visible", { default: false });

const emit = defineEmits<{
  update: [data: UserUpdateData];
}>();

interface Props {
  user: AccountGetApiResponse["user"];
}

const { user } = defineProps<Props>();

export interface UserUpdateData {
  name: string;
  address: string;
  phoneNumber: string;
  country: string;
  region: string;
  image: string;
}

const data = ref<UserUpdateData>({
  name: user.name,
  address: user.address || "",
  phoneNumber: user.phoneNumber || "",
  country: user.country || "",
  region: user.region || "",
  image: user.image || ""
});

const selectedCountry = ref<{ country: string } | null>(
  data.value.country ? { country: data.value.country } : null
);

interface IFile extends File {
  dataUrl?: string;
}

const handleSelect = (files: IFile[]) => {
  data.value.image = files[0].dataUrl || "";
};

const { isFetching, error, execute } = useFetch(() => "/api/admins/me", { immediate: false })
  .put(data)
  .json();

const updateData = async () => {
  if (!data.value.name) return;
  if (selectedCountry.value?.country) {
    data.value.country = selectedCountry.value.country;
  }

  await execute().then(() => {
    if (error.value) return;
    store.user.name = data.value.name;
    store.user.image = data.value.image || "";
    visible.value = false;
    emit("update", data.value);
  });
};

const removeImage = () => {
  data.value = {
    ...data.value,
    image: ""
  };
  updateData();
};
</script>

<template>
  <div>
    <Dialog v-model:visible="visible" header="Edit Details" modal class="w-full max-w-96">
      <div v-if="user">
        <div class="grid gap-4">
          <div class="flex flex-col gap-2 items-center">
            <div
              class="w-24 aspect-square rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
            >
              <img
                v-if="data.image"
                :src="data.image"
                :alt="data.name"
                class="w-full h-full object-cover"
              />
              <Icon icon="ic:baseline-account-circle" style="font-size: 96px" />
            </div>

            <Button v-if="user.image" label="Remove image" @click="removeImage" />

            <VFileUploader
              v-else
              size="small"
              accept="image/*"
              :max-file-size="MAX_PROFILE_IMG_SIZE"
              @select="handleSelect"
              @cancel="data.image = ''"
              @upload="updateData"
              :loading="isFetching"
            />
          </div>

          <div class="my-2 w-full">
            <VErrorMessage v-if="error" :error />
          </div>

          <div class="grid gap-2">
            <label for="name" class="text-mute text-sm font- medium">Name</label>
            <InputText id="name" v-model="data.name" />
          </div>

          <div class="grid gap-2">
            <label for="phone-number" class="text-mute text-sm font- medium">Phone Number</label>
            <InputText id="phone-number" v-model="data.phoneNumber" />
          </div>

          <div class="grid gap-2">
            <label for="name" class="text-mute text-sm font- medium">House Address</label>
            <InputText id="address" v-model="data.address" />
          </div>

          <div class="grid gap-2">
            <label for="country" class="text-mute text-sm font- medium">Country</label>
            <Select
              v-model="selectedCountry"
              :options="countries"
              editable
              option-label="country"
              fluid
              show-clear
            />
          </div>

          <div class="grid gap-2">
            <label for="region" class="text-mute text-sm font- medium">State/Region</label>
            <InputText id="name" v-model="data.region" />
          </div>

          <div>
            <Button
              @click="updateData"
              label="Submit"
              fluid
              icon="pi pi-check"
              :disabled="isFetching || !data.name"
            />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
