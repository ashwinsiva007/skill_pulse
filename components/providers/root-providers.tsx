"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { ThemeProvider } from "@/lib/theme/theme-context";

export const RootProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};
