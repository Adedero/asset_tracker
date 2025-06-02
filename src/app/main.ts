import "./assets/main.css";
import "primeicons/primeicons.css";

import router from "./router";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createHead } from "@unhead/vue/client";
import PrimeVue from "primevue/config";
import primeVueConfig from "./config/primevue.config";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import App from "./App.vue";

const app = createApp(App);

app.use(router);
app.use(createPinia());
app.use(createHead());
app.use(PrimeVue, primeVueConfig());
app.use(ConfirmationService);
app.use(ToastService);
app.directive("tooltip", Tooltip);

app.mount("#app");
