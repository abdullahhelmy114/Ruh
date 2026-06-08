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

const ADMIN_EMAILS = ["abdullahhelmy114@gmail.com", "info@ruhulqudus.com"];

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

  // الاستماع لحالة المستخدم
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      // تحديد الدور
      if (ADMIN_EMAILS.includes(currentUser.email || "")) {
        setRole("admin");
      } else {
        const stored =
          typeof window !== "undefined"
            ? localStorage.getItem("userRole")
            : null;
        setRole(
          stored === "teacher" || stored === "student" ? stored : "student"
        );
      }

      // طلب إذن الإشعارات (اختياري)
      if (typeof window !== "undefined" && "Notification" in window) {
        requestNotificationPermission(currentUser);
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

// دالة طلب إذن الإشعارات
async function requestNotificationPermission(currentUser: User) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // استيراد ديناميكي لتجنب مشاكل الـ SSR
      const { getMessaging, getToken } = await import("firebase/messaging");
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!, // استبدله بمفتاحك الحقيقي
      });
      console.log("Notification token:", token);
      // هنا يمكنك حفظ التوكن في قاعدة البيانات لإرسال إشعارات لاحقًا
    }
  } catch (error) {
    console.error("Failed to get notification permission:", error);
  }
}