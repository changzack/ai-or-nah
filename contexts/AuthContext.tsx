"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type AuthState = {
  isAuthenticated: boolean;
  email: string | null;
  credits: number;
  isLoading: boolean;
};

type AuthContextType = AuthState & {
  login: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
    credits: 0,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    try {
      console.log("[AuthContext] Refreshing auth state...");
      const response = await fetch("/api/credits/balance");
      const data = await response.json();

      if (data.status === "success" && data.authenticated) {
        console.log("[AuthContext] Authenticated:", data.email, "Credits:", data.credits);
        setState({
          isAuthenticated: true,
          email: data.email,
          credits: data.credits,
          isLoading: false,
        });
      } else {
        console.log("[AuthContext] Not authenticated");
        setState({
          isAuthenticated: false,
          email: null,
          credits: 0,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("[AuthContext] Error fetching balance:", error);
      setState({
        isAuthenticated: false,
        email: null,
        credits: 0,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback(
    async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        });

        const data = await response.json();

        if (data.status === "success") {
          await refresh();
          return { success: true };
        } else {
          return { success: false, error: data.message || "Verification failed" };
        }
      } catch (error) {
        return { success: false, error: "Network error. Please try again." };
      }
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      setState({
        isAuthenticated: false,
        email: null,
        credits: 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("[AuthContext] Error logging out:", error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        email: state.email,
        credits: state.credits,
        isLoading: state.isLoading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
