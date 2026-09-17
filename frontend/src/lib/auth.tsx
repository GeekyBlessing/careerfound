"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, clearTokens, getToken, setTokens } from "@/lib/api";
import { track } from "@/lib/analytics";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<User>("/users/me");
      setUser(me);
    } catch (err) {
      // `api.get` already retries a 401 once after a silent token refresh
      // (see lib/api.ts), so a 401 that still reaches here means the
      // session really is over — clear it and sign the user out. Any other
      // error (network blip, a transient 500) is not proof the session is
      // invalid, so don't punish the user with a forced logout for it;
      // leave their existing auth state alone and just stop loading.
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.post<{ access_token: string; refresh_token: string }>(
      "/auth/login",
      { email, password },
      { auth: false }
    );
    setTokens(tokens.access_token, tokens.refresh_token);
    const me = await api.get<User>("/users/me");
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const tokens = await api.post<{ access_token: string; refresh_token: string }>(
      "/auth/register",
      { email, password, full_name: fullName },
      { auth: false }
    );
    setTokens(tokens.access_token, tokens.refresh_token);
    const me = await api.get<User>("/users/me");
    setUser(me);
    track("signup_completed");
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
