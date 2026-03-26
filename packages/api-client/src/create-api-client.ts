import { ApiClient } from './client';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  saveTokens,
  clearTokens,
} from './auth';

export interface CreateApiClientOptions {
  baseURL: string;
  loginPath: string;
}

export function createApiClient({ baseURL, loginPath }: CreateApiClientOptions): ApiClient {
  return new ApiClient({
    baseURL,
    getAccessToken: () => getStoredAccessToken(),
    getRefreshToken: () => getStoredRefreshToken(),
    onTokenRefreshed: (accessToken, refreshToken) => {
      saveTokens(accessToken, refreshToken);
    },
    onAuthError: () => {
      if (typeof window !== 'undefined') {
        clearTokens();
        window.location.href = loginPath;
      }
    },
  });
}
