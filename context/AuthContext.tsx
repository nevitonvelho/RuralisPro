"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, app } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore(app);

type PlanType = 'free' | 'pro' | 'corp';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  plan: PlanType;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  plan: 'free',
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Fetch Plan
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPlan(userData.plan || 'free');
          } else {
            console.log("Usuário sem documento, assumindo Free");
            setPlan('free');
          }
        } catch (error) {
          console.error("Erro ao buscar plano do usuário:", error);
          setPlan('free');
        }
      } else {
        setPlan('free');
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, plan }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);