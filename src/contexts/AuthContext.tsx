"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [demoMode, setDemoMode] = useState(true);

  // Sync demo mode with authentication status
  useEffect(() => {
    if (session) {
      setDemoMode(false);
    }
  }, [session]);

  const logout = async () => {
    await signOut({ callbackUrl: window.location.href });
    // Re-enable demo mode after logout
    setDemoMode(true);
  };

  const value = {
    isAuthenticated: !!session,
    isLoading: status === "loading",
    demoMode,
    setDemoMode,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
