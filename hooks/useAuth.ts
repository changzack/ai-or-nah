"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Authentication hook
 * Provides auth state and methods
 */

type AuthState = {
  isAuthenticated: boolean;
  email: string | null;
  credits: number;
  isLoading: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
    credits: 0,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/credits/balance");
      const data = await response.json();

      if (data.status === "success" && data.authenticated) {
        setState({
          isAuthenticated: true,
          email: data.email,
          credits: data.credits,
          isLoading: false,
        });
      } else {
        setState({
          isAuthenticated: false,
          email: null,
          credits: 0,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("[useAuth] Error fetching balance:", error);
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
      console.error("[useAuth] Error logging out:", error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    isAuthenticated: state.isAuthenticated,
    email: state.email,
    credits: state.credits,
    isLoading: state.isLoading,
    login,
    logout,
    refresh,
  };
}
