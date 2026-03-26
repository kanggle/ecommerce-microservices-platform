'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SignupRequest, LoginRequest } from '@repo/types';
import {
  getUserFromToken,
  saveTokens,
  clearTokens,
  getStoredRefreshToken,
  type AuthState,
} from '@repo/api-client';
import * as authActions from '../api/auth-actions';

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const user = getUserFromToken();
    setState({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authActions.login(data);
    saveTokens(response.accessToken, response.refreshToken);

    const user = getUserFromToken();
    setState({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
    });
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    await authActions.signup(data);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        await authActions.logout({ refreshToken });
      } catch {
        // 로그아웃 API 실패해도 로컬 토큰은 제거
      }
    }
    clearTokens();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, signup, logout }),
    [state, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
