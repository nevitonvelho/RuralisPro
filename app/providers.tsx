"use client";

import { AuthProvider } from "@/context/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Aqui você pode adicionar outros provedores futuramente, como QueryClient ou Temas */}
      {children}
    </AuthProvider>
  );
}