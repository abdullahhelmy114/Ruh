"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { TeacherProfile } from "@/components/profile/TeacherProfile";
import { Loader2 } from "lucide-react";
import { T } from "@/components/TranslatedText";

export default function TeacherProfilePage() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "teacher" && role !== "admin") {
        router.push("/profile/student");
      }
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (role !== "teacher" && role !== "admin") return null;

  return <TeacherProfile />;
}