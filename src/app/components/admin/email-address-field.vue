<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { zodResolver } from "@primeuix/forms/resolvers/zod";
import { FormSubmitEvent } from "@primevue/forms";
import { Address } from "@/shared/schemas/email-data";

const addresses = defineModel<Address[]>("addresses", { default: () => [] });

const current = ref<Address>({ address: "" });
const visible = ref<boolean>(false);

const Schema = z.object({
  name: z.string().min(1, { message: "Name is too short" }).optional(),
  address: z
    .string()
    .email({ message: "Enter a valid email" })
    .refine((val) => !addresses.value.some((address) => val === address.address), {
      message: "Email already exists"
    })
});
const resolver = ref(zodResolver(Schema));
const onFormSubmit = ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return;
  const address = values as z.infer<typeof Schema>;
  addresses.value.push(address);
  visible.value = false;
  current.value.name = "";
  current.value.address = "";
};

const removeAddress = (email: string) => {
  addresses.value = addresses.value.filter((value) => value.address !== email);
};
</script>

<template>
  <div class="w-full">
    <div
      class="bg-white border border-slate-200 px-1 py-1.5 rounded-lg w-full flex items-center gap-1 flex-wrap"
    >
      <div class="flex items-center flex-wrap gap-1">
        <div
          v-for="address in addresses"
          class="flex items-center text-sm font-medium py-1 px-2 w-fit bg-slate-200 rounded-full"
        >
          <div>
            <span v-if="address.name">{{ address.name.split(" ")[0] }}: </span>
            <span>{{ address.address }}</span>
          </div>
          <button
            @click="removeAddress(address.address)"
            class="cursor-pointer grid place-content-center"
          >
            <span class="pi pi-times-circle ml-1"></span>
          </button>
        </div>

        <Button
          class="float-left ml-1"
          @click="visible = true"
          style="width: 1.85rem; height: 1.85rem"
          icon="pi pi-plus"
          rounded
          size="small"
          outlined
        />
      </div>
    </div>

    <Dialog v-model:visible="visible" header="Enter email address" class="w-80">
      <Form
        v-slot="$form"
        :initialValues="current"
        :resolver="resolver"
        @submit="onFormSubmit"
        class="flex flex-col gap-4 w-full"
      >
        <div class="flex flex-col gap-1">
          <span class="text-sm text-mute font-medium">
            Name <span class="text-primary-500 text-xs font-medium">(optional)</span>
          </span>
          <InputText name="name" type="text" placeholder="John Doe" fluid />
          <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
            {{ $form.name.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-sm text-mute font-medium">
            Email <span class="text-red-500 text-xs font-medium">(required)</span>
          </span>

          <InputText name="address" type="email" placeholder="user@example.com" fluid />
          <Message v-if="$form.address?.invalid" severity="error" size="small" variant="simple">
            {{ $form.address.error?.message }}
          </Message>
        </div>

        <Button type="submit" label="Submit" icon="pi pi-check-circle" />
      </Form>
    </Dialog>
  </div>
</template>

<style scoped></style>
