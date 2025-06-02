import { RegisterApiResponse } from "@/modules/auth/register.api";
import { useAsyncState } from "@vueuse/core";
import { useRouter } from "vue-router";
import createError from "../utils/create-error";
import { LoginApiRespone } from "@/modules/auth/login.api";
import { SendVerificationEmailApiResponse } from "@/modules/auth/verification-send-email.api";
import { VerifyEmailApiResponse } from "@/modules/auth/verification-verify-email.api";
import { ConfirmEmailApiResponse } from "@/modules/auth/recovery-confirm-email.api";
import { SendOTPApiResponse } from "@/modules/auth/send-otp.api";
import { PasswordResetApiResponse } from "@/modules/auth/recovery-reset-password.api";
import useStore from "../stores/store";

interface SendVerificationEmailOptions<T = any> {
  onSuccess?: (data: T) => void | Promise<void>;
}

interface SendOTPOptions<T = any> {
  verification?: {
    useLink?: boolean;
    path: string;
  };
  immediate?: boolean;
  onSuccess?: (data: T) => void | Promise<void>;
  mailOptions: {
    buttonLabel: string;
    mailReason: string;
    subject: string;
  };
}

export default function useAuth() {
  const router = useRouter();
  const store = useStore();

  return {
    login() {
      const fetcher = async (credentials: { email: string; password: string }) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials)
        });

        const data: LoginApiRespone = await res.json();
        if (!data.success) {
          throw createError(data);
        }
        return data;
      };

      return useAsyncState(fetcher, null, {
        immediate: false,
        onSuccess: async (data) => {
          if (!data) return;

          if (!data.user.verified) {
            const email = btoa(data.user.email);
            await router.push({ name: "email-verification", query: { i: data.user.id, e: email } });
            return;
          }
          store.user = data.user;

          const { redirect } = router.currentRoute.value.query;

          switch (data.user.role) {
            case "ADMIN":
              if (redirect && typeof redirect === "string" && redirect.includes("admin")) {
                await router.push(redirect);
                return;
              }
              await router.push({ name: "admin-dashboard" });
              break;

            case "USER":
              if (redirect && typeof redirect === "string") {
                await router.push(redirect);
                return;
              }
              await router.push({ name: "user-dashboard" });
              break;

            default:
              await router.push({ name: "login" });
              break;
          }
        }
      });
    },

    logout() {
      localStorage.removeItem("user");
      window.location.href = "/login";
    },

    register() {
      const fetcher = async (credentials: {
        name: string;
        email: string;
        password: string;
        passwordConfirm: string;
      }) => {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials)
        });

        const data: RegisterApiResponse = await res.json();
        if (!data.success) {
          throw createError(data);
        }
        return data;
      };

      return useAsyncState(fetcher, null, {
        immediate: false,
        onSuccess: async (data) => {
          if (!data) return;

          const email = btoa(data.user.email);

          await router.push({ name: "email-verification", query: { e: email, i: data.user.id } });
        }
      });
    },

    sendOTP(options: SendOTPOptions) {
      const { verification, immediate = false, onSuccess, mailOptions } = options;

      const fetcher = async (credentials: { id: string; email?: string }) => {
        const { id, email } = credentials;
        const res = await fetch("/api/auth/otp/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id, email, verification, mailOptions })
        });

        const data: SendOTPApiResponse = await res.json();
        if (!data.success) {
          throw createError(data);
        }
        return data;
      };
      return useAsyncState(fetcher, null, {
        immediate,
        onSuccess: async (data) => {
          onSuccess?.(data);
        }
      });
    },

    sendVerificationEmail(options: SendVerificationEmailOptions = {}) {
      const { onSuccess } = options;

      const fetcher = async ({
        email,
        emailToVerify,
        userId
      }: {
        email: string;
        emailToVerify?: string;
        userId?: string;
      }) => {
        const body = {
          email,
          emailToVerify,
          userId
        };
        if (!body.emailToVerify) delete body.emailToVerify;
        if (!body.userId) delete body.userId;

        const res = await fetch("/api/auth/verification/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });

        const data: SendVerificationEmailApiResponse = await res.json();
        if (!data.success) {
          throw createError(data);
        }
        return data;
      };

      return useAsyncState(fetcher, null, {
        immediate: false,
        onSuccess: async (data) => {
          onSuccess?.(data);
        }
      });
    },

    verifyEmail() {
      const fetcher = async (credentials: {
        otp?: string;
        id?: string;
        token?: string;
        email?: string;
        emailToVerify?: string;
      }) => {
        const body = credentials;

        Object.keys(body).forEach((key) => {
          //@ts-ignore
          if (!body[key]) delete body[key];
        });

        const res = await fetch("/api/auth/verification/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials)
        });

        const data: VerifyEmailApiResponse = await res.json();

        if (!data.success) {
          throw createError(data);
        }
        return data;
      };

      return useAsyncState(fetcher, null, {
        immediate: false,

        onSuccess: async (data) => {
          if (!data) return;

          localStorage.removeItem("user");
          setTimeout(() => {
            router.push({ name: "login" });
          }, 3000);
        }
      });
    },

    confirmEmail() {
      const fetcher = async (credentials: { email: string }) => {
        const res = await fetch("/api/auth/recovery/confirm-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials)
        });

        const data: ConfirmEmailApiResponse = await res.json();

        if (!data.success) {
          throw createError(data);
        }
        return data;
      };

      return useAsyncState(fetcher, null, {
        immediate: false,

        onSuccess: (data) => {
          if (!data) return;
          const email = btoa(data.user.email);
          const userId = data.user.id;
          router.push({ name: "password-reset", query: { i: userId, e: email } });
        }
      });
    },

    resetPassword() {
      const fetcher = async (credentials: {
        id?: string;
        email?: string;
        password: string;
        otp: string;
      }) => {
        const res = await fetch("/api/auth/recovery/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(credentials)
        });

        const data: PasswordResetApiResponse = await res.json();
        if (!data.success) {
          throw createError(data);
        }
        return data;
      };

      return useAsyncState(fetcher, null, {
        immediate: false,
        onSuccess: () => {
          localStorage.removeItem("user");
          setTimeout(() => {
            router.push({ name: "login" });
          }, 3000);
        }
      });
    }
  };
}
