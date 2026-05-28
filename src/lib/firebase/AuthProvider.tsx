"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./client";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  role: "admin" | "teacher" | "student" | null;
  setStoredRole: (role: "teacher" | "student") => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  role: null,
  setStoredRole: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "teacher" | "student" | null>(null);

  const setStoredRole = (newRole: "teacher" | "student") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", newRole);
    }
    setRole(newRole);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      // تحديد الدور
      if (currentUser.email === "abdullahhelmy114@gmail.com") {
        setRole("admin");
      } else {
        const stored = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
        setRole(stored === "teacher" || stored === "student" ? stored : "student");
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, role, setStoredRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}