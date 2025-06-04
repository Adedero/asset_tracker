<script setup lang="ts">
import { computed, ref } from "vue";
import { $fetch } from "@/app/composables/use-fetch";
import { UsersGetApiResponse } from "#src/modules/admin/users/users-get.api";
import useSWRV from "swrv";
import { GET_REQUEST_DATA_LIMIT } from "@/utils/constants";
import { User } from "@/prisma-gen";
import { Icon } from "@iconify/vue";

const page = ref(0);
const LIMIT = GET_REQUEST_DATA_LIMIT;
const skip = computed(() => page.value * LIMIT);

const filters = ref(["All", "Users", "Admins", "Banned"]);

const selectedFilter = ref("Users");

const searchParams = computed(() => {
  const params = new URLSearchParams();
  params.set("take", LIMIT.toString());
  params.set("skip", skip.value.toString());
  params.set("sort", "name,asc");
  if (selectedFilter.value && selectedFilter.value !== "All") {
    if (selectedFilter.value === "Users") {
      params.set("where", "role,USER");
    }
    if (selectedFilter.value === "Admins") {
      params.set("where", "role,ADMIN");
    }
    if (selectedFilter.value === "Banned") {
      params.set("where", "isBanned,true");
    }
  }
  return params.toString();
});

const { isLoading, data, error, mutate } = useSWRV<UsersGetApiResponse>(
  () => `/api/admins/me/users?${searchParams.value}`,
  $fetch
);

const dataLength = computed(() => data.value?.users.length || 0);

const allLoaded = computed(() => {
  return !!data.value?.users && data.value.users.length < LIMIT;
});

const onDone = async (payload: User) => {
  if (!data.value) return;
  const updatedUsers = [...data.value.users];

  const index = data.value.users.findIndex((u) => u.id === payload.id);
  if (index === -1) {
    updatedUsers.unshift({
      ...payload,
      accountGroup: null
    });
  } else {
    const updatedUser = { ...data.value.users[index], ...payload };
    updatedUsers.splice(index, 1, updatedUser);
  }

  await mutate(() => {
    return Promise.resolve({
      success: true,
      message: "User updated successfully",
      users: updatedUsers
    });
  });
};
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VCard class="py-2 rounded-xl">
        <div class="flex items-center gap-2 justify-between">
          <div class="flex items-center gap-2 text-lg font-semibold text-primary-500">
            <h1>Users</h1>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-1">
            <div>
              <Select v-model="selectedFilter" size="small" :options="filters" />
            </div>
            <UserManager @done="onDone">
              <Button label="New" icon="pi pi-plus" size="small" />
            </UserManager>
          </div>
        </div>
      </VCard>

      <div class="mt-2">
        <VPageLoader v-if="isLoading" />

        <VErrorMessage v-else-if="error" :error should-retry @retry="mutate()" />

        <div v-else-if="data && data.users" class="w-full md:h-[calc(100dvh-9rem)] overflow-y-auto">
          <div class="h-full w-full">
            <div class="w-full overflow-auto md:max-h-[calc(100dvh-15rem)]">
              <DataTable :loading="isLoading" :value="data.users" size="small" class="text-sm">
                <Column header="S/N">
                  <template #body="{ index }"> {{ index + 1 + skip }}&rpar; </template>
                </Column>

                <Column>
                  <template #body="{ data }">
                    <div v-if="data.image" class="w-8 aspect-square overflow-hidden rounded-full">
                      <img :src="data.image" :alt="data.name" class="w-full h-full object-cover" />
                    </div>
                    <Icon
                      v-else
                      icon="ic:baseline-account-circle"
                      style="font-size: 2rem"
                      class="text-primary-500"
                    />
                  </template>
                </Column>

                <Column field="name" header="Name">
                  <template #body="{ data }">
                    {{ data.name }}
                    <sup v-if="data.role === 'ADMIN'" class="text-blue-500 font-medium text-xs">
                      admin
                    </sup>

                    <sup v-if="data.isBanned" class="text-red-500 font-medium text-xs">
                      banned
                    </sup>
                  </template>
                </Column>

                <Column field="email" header="Email" />

                <Column field="phoneNumber" header="Phone" />

                <Column header="Location">
                  <template #body="{ data }">
                    <p>
                      <span>{{ data.region }}</span>
                      <span>, </span>
                      <span>{{ data.country }}</span>
                    </p>
                  </template>
                </Column>

                <Column header="Account Group">
                  <template #body="{ data }">
                    {{ data.accountGroup?.name }}
                  </template>
                </Column>

                <Column>
                  <template #body="{ data }">
                    <div v-if="data.role !== 'ADMIN'" class="flex items-center gap-2">
                      <Button
                        @click="
                          $router.push({
                            name: 'admin-user-item',
                            params: { user_id: data.id }
                          })
                        "
                        size="small"
                        icon="pi pi-user"
                        rounded
                      />
                      <UserManager :user="data" @done="onDone">
                        <Button size="small" icon="pi pi-user-edit" rounded severity="secondary" />
                      </UserManager>
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>

            <VPaginator :allLoaded :length="dataLength" :rows="LIMIT" v-model:page="page" />
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
