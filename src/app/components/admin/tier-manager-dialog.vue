<script setup lang="ts">
import { zodResolver } from "@primeuix/forms/resolvers/zod";
import { computed, ref, watch } from "vue";
import { TierSchema, tierSchema } from "@/shared/schemas/tier.schema";
import { FormSubmitEvent } from "@primevue/forms";
import { useFetch } from "../../composables/use-fetch";
import { TierCreateApiResponse } from "@/modules/admin/tiers/tiers-post.api";
import { TierUpdateApiResponse } from "@/modules/admin/tiers/update-tier.api";
import { useToast } from "primevue";
import { UserTier } from "@/prisma-gen";

const { tier = null } = defineProps<{ tier: UserTier | null }>();

const visible = defineModel<boolean>("visible", { default: false });

const emit = defineEmits<{
  create: [payload: TierCreateApiResponse];
  update: [payload: TierUpdateApiResponse];
}>();

const toast = useToast();

const isEditing = computed(() => tier !== null);

const resolver = ref(zodResolver(tierSchema));
const state = ref<TierSchema>({ name: "", description: "" });

function initState(value: UserTier | null) {
  return {
    name: isEditing.value ? (value?.name ?? "") : "",
    description: isEditing.value ? (value?.description ?? "") : ""
  };
}

watch(
  () => tier,
  (newValue) => {
    state.value = initState(newValue);
  },
  {
    immediate: true
  }
);

const {
  data: createData,
  error: createError,
  isFetching: isCreating,
  execute: createTier
} = useFetch("/api/admins/me/tiers", {
  immediate: false
})
  .post(() => state.value)
  .json<TierCreateApiResponse>();

const {
  data: updateData,
  error: updateError,
  isFetching: isUpdating,
  execute: updateTier
} = useFetch(() => `/api/admins/me/tiers/${tier?.id}`, {
  immediate: false
})
  .put(() => state.value)
  .json<TierUpdateApiResponse>();

const onFormSubmit = async (event: FormSubmitEvent) => {
  if (!event.valid) {
    return;
  }
  const payload = event.values as TierSchema;
  state.value = { ...payload };

  let err: any = null;
  let response: TierUpdateApiResponse | TierCreateApiResponse | null = null;

  if (isEditing.value) {
    await updateTier();
    err = updateError.value;
    response = updateData.value;
  } else {
    await createTier();
    err = createError.value;
    response = createData.value;
  }

  if (err || !response) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        err?.message ||
        `Failed to ${isEditing.value ? "update" : "create"} tier`,
      life: 3000
    });
    return;
  }

  toast.add({
    severity: "success",
    summary: "Success",
    detail: `Tier ${isEditing.value ? "updated" : "created"} successfully`,
    life: 3000
  });

  if (isEditing.value) {
    emit("update", response as TierUpdateApiResponse);
  } else {
    emit("create", response as TierCreateApiResponse);
  }
  visible.value = false;
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Create New Tier"
    :closable="!isCreating || isUpdating"
    style="width: 25rem"
  >
    <Form
      v-slot="$form"
      :initialValues="state"
      :resolver="resolver"
      :validateOnValueUpdate="true"
      :validateOnBlur="true"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full"
    >
      <div class="flex flex-col gap-1">
        <label for="tier-name" class="text-mute text-sm">
          Name <span class="text-red-500">*</span>
        </label>
        <InputText id="tier-name" name="name" type="text" fluid />
        <small v-if="$form.name?.invalid" class="font-medium text-red-500">
          {{ $form.name?.error?.message }}
        </small>
      </div>

      <div class="flex flex-col gap-1">
        <label for="tier-description" class="text-mute text-sm">
          Description
        </label>
        <Textarea id="tier-description" name="description" fluid />
        <small
          v-if="$form.description?.invalid"
          class="font-medium text-red-500"
        >
          {{ $form.description?.error?.message }}
        </small>
      </div>

      <Button type="submit" :loading="isCreating || isUpdating">
        Create
      </Button>
    </Form>
  </Dialog>
</template>
