"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ADMIN_EMAILS } from "@/lib/firebase/AuthProvider";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // الأدمن
    if (ADMIN_EMAILS.includes(user.email || "")) {
      router.replace("/dashboard/admin");
      return;
    }

    // جلب الدور من الخادم (مرة واحدة فقط)
    fetch(`/api/user?uid=${user.uid}`)
      .then(r => r.json())
      .then(d => {
        const serverRole = d?.profile?.role || d?.role;
        if (serverRole === "teacher") {
          router.replace("/dashboard/teacher");
        } else {
          router.replace("/dashboard/student");
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setRoleChecked(true));
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}