import useStore from "../stores/store";
import createError from "../utils/create-error";
import { getAccessToken } from "../utils/token";
import { FETCH_TIMEOUT } from "../data/constants";
import { createFetch } from "@vueuse/core";

const store = useStore();

export const $fetch = async <T extends Record<string, any>>(url: string, auth: boolean = true) => {
  const headers: HeadersInit = {};

  if (auth) {
    const { accessToken, refreshToken } = store.user;

    const token = await getAccessToken({ accessToken, refreshToken });

    if (!token) {
      console.log("Failed to get token: redirecting to login");
      localStorage.removeItem("user");
      const currentRoute = window.location.pathname;
      window.location.href = `/login?redirect=${currentRoute}`;
      throw new Error("Unauthenticated");
    }
    store.user = {
      ...store.user,
      accessToken: token
    };
    headers.Authorization = `Bearer ${token}`;
  }

  const abortController = new AbortController();
  const abort = () => abortController.abort();
  const timer = setTimeout(abort, FETCH_TIMEOUT);

  try {
    const res = await fetch(url, { headers, signal: abortController.signal });
    const data = await res.json();
    if (!data.success) {
      throw createError(data);
    }
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          "The request took too long. " + "Check your internet connection and try again."
        );
      }
      throw new Error(error.message || "Server error");
    } else {
      throw new Error(String(error));
    }
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export const useFetch = createFetch({
  options: {
    timeout: FETCH_TIMEOUT,

    updateDataOnError: true,

    beforeFetch: async (ctx) => {
      const store = useStore();
      const { accessToken, refreshToken } = store.user;
      const token = await getAccessToken({ accessToken, refreshToken });
      if (!token) {
        ctx.cancel();
        console.log("Failed to get token: redirecting to login");
        localStorage.removeItem("user");
        const currentRoute = window.location.pathname;
        window.location.href = `/login?redirect=${currentRoute}`;
        return ctx;
      }
      store.user = {
        ...store.user,
        accessToken: token
      };
      ctx.options.headers = {
        ...ctx.options.headers,
        Authorization: `Bearer ${token}`
      };
      return ctx;
    },

    onFetchError: async (ctx) => {
      if (ctx.response) {
        const payload = await ctx.response.json();
        ctx.error = createError(payload);
        ctx.data = null;
      }
      return ctx;
    }
  }
});
