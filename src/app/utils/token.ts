import { jwtDecode } from "jwt-decode";
import { useFetch } from "@vueuse/core";
import { FETCH_TIMEOUT } from "../data/constants";

export async function getAccessToken(options: {
  accessToken: string;
  refreshToken: string;
}): Promise<string | null> {
  const { accessToken, refreshToken } = options;

  if (!accessToken || !refreshToken) return null;

  const accessTokenExp = await getTokenExpirationDate(accessToken);
  if (!isTokenExpired(accessTokenExp)) {
    console.log("Access token not expired: forwarding request...");
    return accessToken;
  }

  const refreshTokenExp = await getTokenExpirationDate(refreshToken);
  if (isTokenExpired(refreshTokenExp)) {
    console.log("Refresh token expired!");
    return null;
  }

  console.log("Access token expired: getting new access token...");
  const { data, error } = await useFetch(`/api/auth/refresh/${refreshToken}`, {
    timeout: FETCH_TIMEOUT,
    updateDataOnError: true,
    onFetchError: async (ctx) => {
      if (ctx.response) {
        const payload = await ctx.response.json();
        ctx.data = payload;
      }
      return ctx;
    }
  })
    .get()
    .json<{ success: boolean; accessToken: string }>();

  if (error?.value || !data?.value?.success || !data?.value?.accessToken) {
    console.log("Failed to get new access token!");
    return null;
  }

  console.log("New access token retrieved");
  return data.value.accessToken;
}

async function getTokenExpirationDate(token: string): Promise<number | null> {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    return exp ? exp * 1000 : null; // Convert to ms
  } catch {
    return null;
  }
}

function isTokenExpired(expiry: number | null | undefined): boolean {
  return expiry == null || Date.now() >= expiry;
}
