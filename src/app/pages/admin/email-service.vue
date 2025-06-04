<script setup lang="ts">
import { onMounted, ref } from "vue";
import { IFile } from "@/app/components/admin/email-attachment-adder.vue";
import { ALL_EMAILS, APP_NAME } from "@/app/data/constants";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { useFetch } from "@/app/composables/use-fetch";
import { Address, EmailData } from "@/shared/schemas/email-data";
import "suneditor/dist/css/suneditor.min.css";
import suneditor from "suneditor";
import SunEditor from "suneditor/src/lib/core";
import plugins from "suneditor/src/plugins";
import { useRoute } from "vue-router";

const route = useRoute();
const toast = useToast();
const primeConfirm = useConfirm();

const to_name = route.query.to_name?.toString();
const to_address = route.query.to_address?.toString();

const initialTo: Address[] = to_address
  ? [{ address: to_address, ...(to_name && { name: to_name }) }]
  : [];

const emailData = ref<EmailData>({
  from: ALL_EMAILS[0],
  to: initialTo,
  cc: [],
  bcc: [],
  attachments: [],
  html: "",
  subject: ""
});

const editor = ref<SunEditor>();

const { isFetching, error, data, execute } = useFetch("/api/admins/me/send-mail", {
  immediate: false
})
  .post(emailData)
  .json();
async function sendMail() {
  const { valid, message } = validate();
  if (!valid) {
    toast.add({ severity: "warn", detail: message, life: 8000 });
    return;
  }

  if (!(await ask("Are you sure you want to proceed?"))) return;

  emailData.value.from.name = `${APP_NAME} ${emailData.value.from.name}`;
  emailData.value.html = editor.value?.getContents(true) || "";

  await execute();

  if (error.value || !data.value) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.value.message || "Could not send email. Try again later."
    });
    return;
  }
  toast.add({
    severity: "success",
    detail: data.value.message || "Email sent successfully",
    life: 3000
  });

  reset();
}

function validate() {
  if (!emailData.value.from) {
    return { valid: false, message: "Please select a 'from' address" };
  }
  if (!emailData.value.to.length) {
    return { valid: false, message: "No email recipient(s) selected" };
  }
  const data = editor.value?.getContents(true);

  if (!data || data.startsWith("<p><br></p>") || data.startsWith("<p>Enter your message...</p>")) {
    return { valid: false, message: "Please enter your message" };
  }
  return { valid: true, message: "Validation successful" };
}

function reset() {
  emailData.value = {
    from: ALL_EMAILS[0],
    to: [],
    cc: [],
    bcc: [],
    attachments: [],
    html: "",
    subject: ""
  };
  editor.value?.setContents("Enter your message...");
}

const handleSelect = (files: IFile[]) => {
  const attachments = files.map(({ id, name, dataUrl }) => ({ id, filename: name, path: dataUrl }));
  emailData.value.attachments = [...attachments, ...emailData.value.attachments];
};

const removeAttachment = (id: string) => {
  emailData.value.attachments = emailData.value.attachments.filter((att) => att.id !== id);
};

const ask = async (question: string): Promise<boolean> => {
  return await new Promise<boolean>((resolve) => {
    primeConfirm.require({
      header: "Confirmation",
      message: question,
      icon: "pi pi-exclamation-triangle",
      rejectProps: {
        label: "Cancel",
        severity: "secondary",
        outlined: true
      },
      acceptProps: {
        label: "Proceed"
      },
      accept: () => {
        resolve(true);
      },
      reject: () => {
        resolve(false);
      }
    });
  });
};

onMounted(() => {
  editor.value = suneditor.create("editor", {
    plugins: plugins,
    buttonList: [
      ["undo", "redo"],
      ["font", "fontSize", "formatBlock"],
      ["bold", "underline", "italic", "strike"],
      ["fontColor", "hiliteColor", "textStyle"],
      ["removeFormat"],
      ["outdent", "indent"],
      ["align", "horizontalRule", "list", "lineHeight"],
      ["table", "link" /**'image', 'video', 'audio'*/],
      ["fullScreen", "showBlocks", "codeView"],
      ["preview", "print"],
      ["save"]
    ],
    value: "Enter your message...",
    width: "100%",
    maxWidth: "100%",
    minWidth: "16rem",
    minHeight: "18rem"
  });
});
</script>

<template>
  <VueLayout name="admin">
    <div>
      <VNavbar />

      <div class="mt-4">
        <header class="grid gap-1">
          <div class="grid items-center md:grid-cols-12">
            <span class="text-sm font-semibold text-mute">To: </span>
            <EmailAddressField class="col-span-11" v-model:addresses="emailData.to" />
          </div>

          <div class="grid items-center md:grid-cols-12">
            <span class="text-sm font-semibold text-mute">Cc: </span>
            <EmailAddressField class="col-span-11" v-model:addresses="emailData.cc" />
          </div>

          <div class="grid items-center md:grid-cols-12">
            <span class="text-sm font-semibold text-mute">Bcc: </span>
            <EmailAddressField class="col-span-11" v-model:addresses="emailData.bcc" />
          </div>

          <div class="grid items-center md:grid-cols-12">
            <span class="text-sm font-semibold text-mute">Subject: </span>
            <InputText size="small" class="col-span-11" v-model="emailData.subject" fluid />
          </div>
        </header>

        <Divider />

        <div>
          <textarea id="editor"></textarea>

          <div class="mt-2 flex items-start gap-1 flex-wrap justify-between">
            <div class="grid gap-1">
              <div v-for="att in emailData.attachments">
                <div
                  class="w-60 bg-slate-200 border px-2 py-1 flex gap-1 items-center justify-between"
                >
                  <p class="text-xs font-medium truncate w-[90%]">{{ att.filename }}</p>
                  <button
                    @click="removeAttachment(att.id)"
                    class="cursor-pointer grid place-content-center"
                  >
                    <span class="pi pi-times-circle" style="font-size: 18px"></span>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Select
                v-model="emailData.from"
                :options="ALL_EMAILS"
                option-label="name"
                size="small"
              >
                <template #option="{ option }"> {{ option.name }}<{{ option.address }}> </template>
              </Select>
              <EmailAttachmentAdder @select="handleSelect" />
              <Button
                :loading="isFetching"
                @click="sendMail"
                :label="isFetching ? 'Sending...' : 'Send'"
                icon="pi pi-send"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueLayout>
</template>
