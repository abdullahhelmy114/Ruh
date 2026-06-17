"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ADMIN_EMAILS } from "@/lib/firebase/AuthProvider";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // الأدمن يذهب مباشرة
    if (ADMIN_EMAILS.includes(user.email || "")) {
      router.replace("/dashboard/admin");
      return;
    }

    // جلب الدور من الخادم فقط
    fetch(`/api/user?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => {
        const serverRole = d?.profile?.role;
        if (serverRole === "teacher") {
          router.replace("/dashboard/teacher");
        } else {
          router.replace("/dashboard/student");
        }
      })
      .catch(() => {
        // في حالة الفشل، نعتمد على localStorage كملاذ أخير
        const fallbackRole = localStorage.getItem("userRole");
        if (fallbackRole === "teacher") {
          router.replace("/dashboard/teacher");
        } else {
          router.replace("/dashboard/student");
        }
      });
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}