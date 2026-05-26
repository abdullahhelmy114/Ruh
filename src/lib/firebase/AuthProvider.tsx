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

  // تخزين الدور في localStorage واسترجاعه
  const setStoredRole = (newRole: "teacher" | "student") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", newRole);
    }
    setRole(newRole);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // لو البريد هو abdullahhelmy114@gmail.com نعتبره admin
        if (currentUser.email === "abdullahhelmy114@gmail.com") {
          setRole("admin");
        } else {
          // وإلا نبحث عن دور مخزّن محلياً
          const stored = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
          if (stored === "teacher" || stored === "student") {
            setRole(stored);
          } else {
            setRole("student"); // افتراضي
          }
        }

        // إنشاء الملف الشخصي في Neon إذا لم يكن موجودًا
        try {
          await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebase_uid: currentUser.uid,
              email: currentUser.email,
              full_name: currentUser.displayName || currentUser.email?.split('@')[0] || '',
              role: currentUser.email === "abdullahhelmy114@gmail.com" ? "admin" : 
                    (typeof window !== "undefined" ? localStorage.getItem("userRole") : null) || "student",
            }),
          });
        } catch (error) {
          console.error('Failed to sync profile with Neon:', error);
        }
      } else {
        setRole(null);
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