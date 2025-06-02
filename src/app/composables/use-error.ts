import { useRouter } from "vue-router";
import { computed } from "vue";
import useStore from "../stores/store";

interface UseErrorPageOptions {
  status?: 404 | 500;
  message?: string;
}
export function useErrorPage(options?: UseErrorPageOptions) {
  const router = useRouter();

  const { status = 500, message = "Internal Server Error" } = options || {};

  const errorPage = computed(() => {
    return status === 404 ? "error-404" : "error-500";
  });

  const store = useStore();

  store.settings.error = {
    status,
    message
  };

  router.push({ name: errorPage.value });
}
