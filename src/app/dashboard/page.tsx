"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // انتظر حتى ينتهي تحميل بيانات المستخدم

    if (!user) {
      router.push("/login");
      return;
    }

    // توجيه الأدمن
    if (user.email === "abdullahhelmy114@gmail.com") {
      router.push("/dashboard/admin");
      return;
    }

    // توجيه حسب الدور المخزن
    if (role === "teacher") {
      router.push("/dashboard/teacher");
    } else {
      router.push("/dashboard/student");
    }
  }, [user, isLoading, role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}