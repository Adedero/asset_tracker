import { jwtDecode } from "jwt-decode";
import { useFetch } from "@vueuse/core";
import { FETCH_TIMEOUT } from "../data/constants";

export async function getAccessToken(options: {
  accessToken: string;
  refreshToken: string;
}): Promise<string | null> {
  const { accessToken, refreshToken } = options;

  if (!accessToken || !refreshToken) return null;

  const accessTokenExp = getTokenExpirationDate(accessToken);
  if (!isTokenExpired(accessTokenExp)) {
    // console.log("Access token not expired: forwarding request...");
    return accessToken;
  }

  const refreshTokenExp = getTokenExpirationDate(refreshToken);
  if (isTokenExpired(refreshTokenExp)) {
    // console.log("Refresh token expired!");
    return null;
  }

  // console.log("Access token expired: getting new access token...");
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
    // console.log("Failed to get new access token!");
    return null;
  }

  // console.log("New access token retrieved");
  return data.value.accessToken;
}

function getTokenExpirationDate(token: string): number | null {
  try {
    const result = jwtDecode(token);
    const exp = result.exp ? result.exp * 1000 : null;
    return exp;
  } catch (err) {
    console.error("Error decoding jwt", err);
    return null;
  }
}

function isTokenExpired(expiry: number | null | undefined): boolean {
  return expiry == null || Date.now() >= expiry;
}
