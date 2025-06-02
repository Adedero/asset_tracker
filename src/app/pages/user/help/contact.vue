<script setup lang="ts">
import { SUPPORT_EMAIL } from "@/app/data/constants";
import { useFetch } from "@/app/composables/use-fetch";
import { ref } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const data = ref({
  subject: "",
  message: ""
});

const { isFetching, error, execute } = useFetch("/api/users/me/contact", { immediate: false }).post(
  data
);

const sendMessage = async () => {
  await execute().then(() => {
    if (error.value) return;
    data.value.subject = "";
    data.value.message = "";
    toast.add({
      severity: "success",
      detail: "Your message has been sent."
    });
  });
};
</script>

<template>
  <VueLayout name="user">
    <div>
      <VNavbar />

      <div class="mt-2 py-2 flex gap-2 h-[calc(100dvh-8.5rem)] overflow-y-auto justify-center">
        <div class="v-card w-full h-fit max-w-[28rem] grid gap-4">
          <VErrorMessage :error />

          <div class="grid gap-1">
            <label class="text-sm font-semibold text-mute">Subject</label>
            <InputText v-model="data.subject" fluid />
          </div>

          <div class="grid gap-1">
            <label class="text-sm font-semibold text-mute"
              >Message <span class="text-red-500">*</span></label
            >
            <Textarea v-model="data.message" rows="8" fluid class="resize-none" />
          </div>

          <div class="grid gap-4">
            <Button
              @click="sendMessage"
              :loading="isFetching"
              :disabled="isFetching || !data.message"
              label="Submit"
              icon="pi pi-send"
              icon-pos="right"
              fluid
            />
          </div>

          <small class="text-center">
            Reach out to us at
            <a
              :href="`mailto:${SUPPORT_EMAIL}`"
              class="font-semibold text-primary-500 hover:underline"
            >
              {{ SUPPORT_EMAIL }}
            </a>
          </small>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
