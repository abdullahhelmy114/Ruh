"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { StudentProfile } from "@/components/profile/StudentProfile";
import { Loader2 } from "lucide-react";
import { T } from "@/components/TranslatedText";

export default function StudentProfilePage() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (role !== "student" && role !== "admin") {
        router.push("/profile/teacher");
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

  if (role !== "student" && role !== "admin") return null;

  return <StudentProfile />;
}