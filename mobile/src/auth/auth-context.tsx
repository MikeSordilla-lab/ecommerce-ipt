import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, jsonBody, setApiToken } from "@/api/client";
import type { User } from "@/api/types";

const TOKEN_KEY = "shop_mobile_token";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  register: (input: {
    username: string;
    email: string;
    password: string;
    role: "customer" | "seller";
  }) => Promise<string>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const storeToken = useCallback(async (nextToken: string | null) => {
    setToken(nextToken);
    setApiToken(nextToken);

    if (nextToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    const data = await apiFetch<{ user: User }>("/api/mobile/me.php");
    setUser(data.user);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      setApiToken(savedToken);

      if (!savedToken) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiFetch<{ user: User }>("/api/mobile/me.php");
        if (mounted) {
          setToken(savedToken);
          setUser(data.user);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setApiToken(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(
    async (username: string, password: string) => {
      const data = await apiFetch<{ token: string; user: User }>("/api/mobile/auth/login.php", {
        method: "POST",
        body: jsonBody({ username, password }),
      });
      await storeToken(data.token);
      setUser(data.user);
    },
    [storeToken],
  );

  const register = useCallback(
    async (input: { username: string; email: string; password: string; role: "customer" | "seller" }) => {
      const data = await apiFetch<{ token?: string; user?: User }>("/api/mobile/auth/register.php", {
        method: "POST",
        body: jsonBody(input),
      });

      if (data.token && data.user) {
        await storeToken(data.token);
        setUser(data.user);
        return "Registered";
      }

      return "Seller account created and pending approval";
    },
    [storeToken],
  );

  const signOut = useCallback(async () => {
    await apiFetch<null>("/api/mobile/auth/logout.php", { method: "POST" }).catch(() => null);
    await storeToken(null);
    setUser(null);
  }, [storeToken]);

  const value = useMemo(
    () => ({ user, token, loading, signIn, register, signOut, refreshMe }),
    [user, token, loading, signIn, register, signOut, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
