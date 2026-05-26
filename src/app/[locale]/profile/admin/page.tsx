"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { AdminProfile } from "@/components/profile/AdminProfile";
import { Loader2 } from "lucide-react";

export default function AdminProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.email !== "abdullahhelmy114@gmail.com") {
        // ليس أدمن؟ نرجعه إلى صفحته المناسبة
        const storedRole = localStorage.getItem("userRole");
        if (storedRole === "teacher") {
          router.push("/profile/teacher");
        } else {
          router.push("/profile/student");
        }
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  // إذا وصل إلى هنا، فهو الأدمن
  return <AdminProfile />;
}