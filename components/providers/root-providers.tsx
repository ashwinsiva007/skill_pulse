"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "@/lib/firebase/auth-context";

export const RootProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
