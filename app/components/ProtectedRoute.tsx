"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redireciona se não estiver logado
    }
  }, [user, loading, router]);

  if (loading || !user) return <p>Carregando...</p>;

  return <>{children}</>;
}